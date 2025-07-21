import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// For cost control
setGlobalOptions({ maxInstances: 10 });

// Interface definitions
interface StreamStatus {
  isLive: boolean;
  isValid: boolean;
  error?: string;
  retryAfter?: number;
}

interface Event {
  id: string;
  title: string;
  organizerId: string;
  status: 'upcoming' | 'live' | 'ended' | 'adhoc';
  type: 'youtube' | 'twitch' | 'facebook-live' | 'instagram-live' | 'tiktok-live' | 'discord' | 'zoom' | 'teams' | 'meet' | 'webex' | 'other';
  streamUrl?: string;
  startDate: Date;
  endDate: Date;
  consecutiveFailures?: number;
  lastStatusCheck?: Date;
  manualOverride?: boolean;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};

// Stream monitoring configuration
const MONITORING_CONFIG = {
  checkInterval: 2 * 60 * 1000, // 2 minutes
  failureThreshold: 3, // Require 3 consecutive failures before ending
  maxConsecutiveFailures: 5, // Max failures before giving up temporarily
  gracePeriod: 10 * 60 * 1000, // 10 minutes grace period after scheduled end
};

/**
 * Sleep function for delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate exponential backoff delay
 */
const calculateBackoffDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Check stream status with retry logic and exponential backoff
 */
const checkStreamStatusWithRetry = async (streamUrl: string, eventType: string, attempt = 0): Promise<StreamStatus> => {
  try {
    const response = await fetch(`${process.env.NUXT_PUBLIC_SITE_URL}/api/stream-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ streamUrl, eventType })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: StreamStatus = await response.json();
    
    // If API call succeeded, return the result
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn(`Stream status check attempt ${attempt + 1} failed for ${streamUrl}:`, error);
    
    // If we haven't reached max retries, try again with exponential backoff
    if (attempt < RETRY_CONFIG.maxRetries) {
      const delay = calculateBackoffDelay(attempt);
      logger.info(`Retrying stream status check in ${delay}ms (attempt ${attempt + 2}/${RETRY_CONFIG.maxRetries + 1})`);
      
      await sleep(delay);
      return checkStreamStatusWithRetry(streamUrl, eventType, attempt + 1);
    }
    
    // All retries exhausted, return error status
    logger.error(`All retry attempts exhausted for stream status check: ${streamUrl}`, error);
    return {
      isLive: false,
      isValid: false,
      error: `Failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${errorMessage}`
    };
  }
};

/**
 * Safely end an event with proper error handling
 */
const endEventSafely = async (eventId: string, reason: string): Promise<boolean> => {
  try {
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      logger.warn(`Event ${eventId} not found when trying to end it`);
      return false;
    }
    
    const eventData = eventDoc.data() as Event;
    
    // Don't end if manual override is set
    if (eventData.manualOverride) {
      logger.info(`Event ${eventId} has manual override, skipping auto-end`);
      return false;
    }
    
    // Update event status to ended
    await eventRef.update({
      status: 'ended',
      endedAt: Timestamp.now(),
      autoEndedReason: reason,
      autoEndedAt: Timestamp.now()
    });
    
    // Update user profile to not live
    await db.collection('users').doc(eventData.organizerId).update({
      isLive: false,
      lastLiveAt: Timestamp.now()
    });
    
    logger.info(`Successfully ended event ${eventId}: ${reason}`);
    return true;
    
  } catch (error) {
    logger.error(`Failed to end event ${eventId}:`, error);
    return false;
  }
};

/**
 * Monitor a single event's stream status
 */
const monitorSingleEvent = async (eventDoc: FirebaseFirestore.QueryDocumentSnapshot): Promise<void> => {
  const eventData = eventDoc.data() as Event;
  const eventId = eventDoc.id;
  
  try {
    // Skip if no stream URL
    if (!eventData.streamUrl) {
      logger.debug(`Event ${eventId} has no stream URL, skipping`);
      return;
    }
    
    // Skip if manual override is set
    if (eventData.manualOverride) {
      logger.debug(`Event ${eventId} has manual override, skipping`);
      return;
    }
    
    // Skip if already ended
    if (eventData.status === 'ended') {
      logger.debug(`Event ${eventId} is already ended, skipping`);
      return;
    }
    
    // Check if event is past its grace period
    const now = new Date();
    const endTime = new Date(eventData.endDate);
    const gracePeriodEnd = new Date(endTime.getTime() + MONITORING_CONFIG.gracePeriod);
    
    if (now > gracePeriodEnd) {
      await endEventSafely(eventId, 'Event exceeded grace period');
      return;
    }
    
    logger.info(`Checking stream status for event ${eventId}: ${eventData.title}`);
    
    // Check stream status with retry logic
    const status = await checkStreamStatusWithRetry(eventData.streamUrl, eventData.type);
    
    const consecutiveFailures = eventData.consecutiveFailures || 0;
    
    if (status.isLive) {
      // Stream is live - reset failure counter
      if (consecutiveFailures > 0) {
        await eventDoc.ref.update({
          consecutiveFailures: 0,
          lastStatusCheck: Timestamp.now(),
          lastSuccessfulCheck: Timestamp.now()
        });
        logger.info(`Event ${eventId} stream is live, reset failure counter`);
      } else {
        await eventDoc.ref.update({
          lastStatusCheck: Timestamp.now(),
          lastSuccessfulCheck: Timestamp.now()
        });
      }
      
    } else if (status.isValid === false) {
      // API error - don't count as failure, just log and retry later
      logger.warn(`Event ${eventId} API check failed: ${status.error}`);
      await eventDoc.ref.update({
        lastStatusCheck: Timestamp.now(),
        lastApiError: status.error,
        lastApiErrorAt: Timestamp.now()
      });
      
    } else {
      // Stream appears to be offline - increment failure counter
      const newFailureCount = consecutiveFailures + 1;
      
      await eventDoc.ref.update({
        consecutiveFailures: newFailureCount,
        lastStatusCheck: Timestamp.now(),
        lastFailureAt: Timestamp.now()
      });
      
      logger.warn(`Event ${eventId} stream appears offline (failure ${newFailureCount}/${MONITORING_CONFIG.failureThreshold})`);
      
      // End event only after consecutive failures threshold
      if (newFailureCount >= MONITORING_CONFIG.failureThreshold) {
        await endEventSafely(
          eventId, 
          `Stream offline for ${newFailureCount} consecutive checks`
        );
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error monitoring event ${eventId}:`, error);
    
    // Update failure tracking even on unexpected errors
    const consecutiveFailures = eventData.consecutiveFailures || 0;
    await eventDoc.ref.update({
      consecutiveFailures: consecutiveFailures + 1,
      lastStatusCheck: Timestamp.now(),
      lastError: errorMessage,
      lastErrorAt: Timestamp.now()
    });
  }
};

/**
 * Main scheduled function to monitor all live events
 */
export const monitorLiveEvents = onSchedule({
  schedule: 'every 2 minutes',
  timeZone: 'UTC',
  memory: '512MiB',
  timeoutSeconds: 540, // 9 minutes (leave 1 minute buffer)
}, async (event) => {
  logger.info('Starting scheduled live event monitoring');
  
  try {
    // Get all live events
    const liveEventsQuery = await db.collection('events')
      .where('status', '==', 'live')
      .get();
    
    if (liveEventsQuery.empty) {
      logger.info('No live events found');
      return;
    }
    
    logger.info(`Found ${liveEventsQuery.size} live events to monitor`);
    
    // Monitor all events in parallel with controlled concurrency
    const monitoringPromises = liveEventsQuery.docs.map(eventDoc => 
      monitorSingleEvent(eventDoc)
    );
    
    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled(monitoringPromises);
    
    // Log summary
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    logger.info(`Event monitoring completed: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      const failures = results
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason);
      logger.error('Some event monitoring failed:', failures);
    }
    
  } catch (error) {
    logger.error('Failed to monitor live events:', error);
    throw error;
  }
});

/**
 * Manual override function for event organizers
 */
export const setEventManualOverride = onRequest({
  cors: true,
  memory: '256MiB',
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    const { eventId, override, userId } = req.body;
    
    if (!eventId || typeof override !== 'boolean' || !userId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // Verify user is the event organizer
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    const eventData = eventDoc.data() as Event;
    
    if (eventData.organizerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Update manual override
    await eventDoc.ref.update({
      manualOverride: override,
      manualOverrideBy: userId,
      manualOverrideAt: Timestamp.now()
    });
    
    logger.info(`Manual override ${override ? 'enabled' : 'disabled'} for event ${eventId} by ${userId}`);
    
    res.json({ 
      success: true, 
      message: `Manual override ${override ? 'enabled' : 'disabled'}` 
    });
    
  } catch (error) {
    logger.error('Error setting manual override:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Force end event function for emergencies
 */
export const forceEndEvent = onRequest({
  cors: true,
  memory: '256MiB',
}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    const { eventId, userId, reason } = req.body;
    
    if (!eventId || !userId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    // Verify user is the event organizer
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    const eventData = eventDoc.data() as Event;
    
    if (eventData.organizerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Force end the event
    const success = await endEventSafely(eventId, reason || 'Manually ended by organizer');
    
    if (success) {
      res.json({ success: true, message: 'Event ended successfully' });
    } else {
      res.status(500).json({ error: 'Failed to end event' });
    }
    
  } catch (error) {
    logger.error('Error force ending event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});