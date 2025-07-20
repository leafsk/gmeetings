import type { Event } from '~/types/event'

export interface LiveStreamStatus {
  isLive: boolean
  isValid: boolean // URL works and is accessible
  lastChecked: Date
  platform: string
  error?: string
}

export const useEventStatus = () => {
  // Cache for platform API results to avoid excessive calls
  const statusCache = new Map<string, LiveStreamStatus>()
  const CACHE_DURATION = 60 * 1000 // 1 minute

  // Compute event status with platform detection
  const getEventStatus = async (event: Event): Promise<Event['status']> => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    // Handle adhoc events (manually controlled)
    if (event.category === 'external' || event.type === 'other') {
      return event.status === 'adhoc' ? 'adhoc' : getTimeBasedStatus(startDate, endDate, now)
    }

    // Time-based boundaries
    const GRACE_PERIOD_START = 15 * 60 * 1000 // 15 minutes before start
    const GRACE_PERIOD_END = 30 * 60 * 1000   // 30 minutes after scheduled end

    // If we're well before the event
    if (now.getTime() < startDate.getTime() - GRACE_PERIOD_START) {
      return 'upcoming'
    }

    // If we're well after the event
    if (now.getTime() > endDate.getTime() + GRACE_PERIOD_END) {
      return 'ended'
    }

    // In the "possible live" window - check platform status
    const platformStatus = await getPlatformStatus(event)
    
    if (platformStatus.isLive) {
      return 'live'
    }

    // If platform says not live, use time-based logic with grace periods
    if (now < startDate) {
      return 'upcoming'
    } else if (now > endDate) {
      return 'ended'
    } else {
      // Within scheduled time but platform says not live
      // Could be technical issues, so show as live but with warning
      return 'live'
    }
  }

  // Simple time-based status
  const getTimeBasedStatus = (startDate: Date, endDate: Date, now: Date): Event['status'] => {
    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'ended'
    return 'live'
  }

  // Get platform-specific live status
  const getPlatformStatus = async (event: Event): Promise<LiveStreamStatus> => {
    const cacheKey = `${event.id}-${event.type}-${event.streamUrl}`
    const cached = statusCache.get(cacheKey)

    // Return cached result if fresh
    if (cached && (Date.now() - cached.lastChecked.getTime()) < CACHE_DURATION) {
      return cached
    }

    const status: LiveStreamStatus = {
      isLive: false,
      isValid: false,
      lastChecked: new Date(),
      platform: event.type,
      error: undefined
    }

    try {
      switch (event.type) {
        case 'youtube':
          Object.assign(status, await checkYouTubeStatus(event))
          break
        case 'twitch':
          Object.assign(status, await checkTwitchStatus(event))
          break
        case 'zoom':
        case 'meet':
          // These are scheduled and hard to detect, assume valid during scheduled time
          status.isValid = true
          status.isLive = getTimeBasedStatus(
            new Date(event.startDate), 
            new Date(event.endDate), 
            new Date()
          ) === 'live'
          break
        default:
          // Unknown platform, fallback to time-based
          status.isValid = true
          status.isLive = getTimeBasedStatus(
            new Date(event.startDate), 
            new Date(event.endDate), 
            new Date()
          ) === 'live'
      }
    } catch (error: any) {
      status.error = error.message
      status.isValid = false
    }

    // Cache the result
    statusCache.set(cacheKey, status)
    return status
  }

  // YouTube API status check
  const checkYouTubeStatus = async (event: Event): Promise<Partial<LiveStreamStatus>> => {
    if (!event.streamUrl) {
      return { isValid: false, error: 'No stream URL provided' }
    }

    try {
      // Extract video ID from URL
      const videoId = extractYouTubeVideoId(event.streamUrl)
      if (!videoId) {
        return { isValid: false, error: 'Invalid YouTube URL' }
      }

      // Call server API to check YouTube status
      const response = await $fetch('/api/stream-status', {
        query: { platform: 'youtube', videoId }
      })
      
      return {
        isValid: response.isValid !== false,
        isLive: response.isLive,
        error: response.error
      }
    } catch (error: any) {
      console.warn('YouTube API check failed, falling back to time-based:', error.message)
      return {
        isValid: true,
        isLive: getTimeBasedStatus(
          new Date(event.startDate), 
          new Date(event.endDate), 
          new Date()
        ) === 'live',
        error: 'API check failed, using time-based fallback'
      }
    }
  }

  // Twitch API status check  
  const checkTwitchStatus = async (event: Event): Promise<Partial<LiveStreamStatus>> => {
    if (!event.streamUrl) {
      return { isValid: false, error: 'No stream URL provided' }
    }

    try {
      // Extract channel name from URL
      const channelName = extractTwitchChannelName(event.streamUrl)
      if (!channelName) {
        return { isValid: false, error: 'Invalid Twitch URL' }
      }

      // Call server API to check Twitch status
      const response = await $fetch('/api/stream-status', {
        query: { platform: 'twitch', channelName }
      })
      
      return {
        isValid: response.isValid !== false,
        isLive: response.isLive,
        error: response.error
      }
    } catch (error: any) {
      console.warn('Twitch API check failed, falling back to time-based:', error.message)
      return {
        isValid: true,
        isLive: getTimeBasedStatus(
          new Date(event.startDate), 
          new Date(event.endDate), 
          new Date()
        ) === 'live',
        error: 'API check failed, using time-based fallback'
      }
    }
  }

  // URL parsing helpers
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const extractTwitchChannelName = (url: string): string | null => {
    const match = url.match(/twitch\.tv\/(\w+)/)
    return match ? match[1] : null
  }

  // URL health check
  const checkUrlHealth = async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      new URL(url)
      
      // TODO: Implement actual health check
      // This could be done via a backend service to avoid CORS issues
      console.log('URL health check not implemented yet for:', url)
      return true
    } catch {
      return false
    }
  }

  // Clear cache (useful for testing or manual refresh)
  const clearStatusCache = () => {
    statusCache.clear()
  }

  return {
    getEventStatus,
    getPlatformStatus,
    checkUrlHealth,
    clearStatusCache,
    getTimeBasedStatus
  }
}