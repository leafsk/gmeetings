#!/usr/bin/env node

/**
 * Script to update past events with missing cover images
 * Fetches thumbnails from YouTube/Twitch for events that don't have thumbnailUrl set
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'

// Firebase config - you'll need to set these environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Twitch API credentials
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// YouTube thumbnail fetching (same logic as in your API)
async function getYouTubeThumbnail(videoId) {
  const thumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/default.jpg`
  ]
  
  for (const url of thumbnailUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        return url
      }
    } catch {
      continue
    }
  }
  return null
}

// Twitch thumbnail fetching (same logic as in your API)
async function getTwitchThumbnail(channelName) {
  try {
    // Get access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    })
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    // Get user info to get user ID
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const userData = await userResponse.json()
    if (!userData.data || userData.data.length === 0) {
      return null
    }
    
    const userId = userData.data[0].id
    
    // Get videos for this user
    const videosResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${userId}&first=1`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const videosData = await videosResponse.json()
    if (videosData.data && videosData.data.length > 0) {
      return videosData.data[0].thumbnail_url
        .replace('%{width}', '640')
        .replace('%{height}', '360')
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching Twitch thumbnail for ${channelName}:`, error.message)
    return null
  }
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
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

// Extract Twitch channel name from URL
function extractTwitchChannelName(url) {
  const match = url.match(/twitch\.tv\/(\w+)/)
  return match ? match[1] : null
}

// Generate fallback image URL
function generateFallbackImage(title) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=3b82f6&color=fff&size=640x360&format=png`
}

// Main function to update past events
async function updatePastEventsImages() {
  try {
    console.log('🔍 Fetching events without thumbnails...')
    
    // Get all events that don't have thumbnailUrl set
    const eventsRef = collection(db, 'events')
    const eventsSnapshot = await getDocs(eventsRef)
    
    const eventsToUpdate = []
    eventsSnapshot.forEach((doc) => {
      const event = doc.data()
      if (!event.thumbnailUrl && (event.streamUrl || event.replayUrl)) {
        eventsToUpdate.push({ id: doc.id, ...event })
      }
    })
    
    console.log(`📊 Found ${eventsToUpdate.length} events to update`)
    
    if (eventsToUpdate.length === 0) {
      console.log('✅ No events need updating!')
      return
    }
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const event of eventsToUpdate) {
      console.log(`\n🔄 Processing: ${event.title}`)
      
      let thumbnailUrl = null
      const urlToCheck = event.streamUrl || event.replayUrl
      
      // Try to get thumbnail based on event type
      if (event.type === 'youtube' && urlToCheck) {
        const videoId = extractYouTubeVideoId(urlToCheck)
        if (videoId) {
          console.log(`  📺 Fetching YouTube thumbnail for video: ${videoId}`)
          thumbnailUrl = await getYouTubeThumbnail(videoId)
        }
      } else if (event.type === 'twitch' && urlToCheck) {
        const channelName = extractTwitchChannelName(urlToCheck)
        if (channelName) {
          console.log(`  🟣 Fetching Twitch thumbnail for channel: ${channelName}`)
          thumbnailUrl = await getTwitchThumbnail(channelName)
        }
      }
      
      // If no platform thumbnail found, use fallback
      if (!thumbnailUrl) {
        console.log(`  🎨 Using fallback image`)
        thumbnailUrl = generateFallbackImage(event.title)
      }
      
      // Update the event in Firestore
      try {
        const eventRef = doc(db, 'events', event.id)
        await updateDoc(eventRef, { thumbnailUrl })
        
        console.log(`  ✅ Updated: ${thumbnailUrl}`)
        updatedCount++
      } catch (error) {
        console.error(`  ❌ Failed to update event ${event.id}:`, error.message)
        skippedCount++
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log(`\n📈 Summary:`)
    console.log(`  ✅ Updated: ${updatedCount} events`)
    console.log(`  ❌ Skipped: ${skippedCount} events`)
    console.log(`  📊 Total processed: ${eventsToUpdate.length} events`)
    
  } catch (error) {
    console.error('❌ Error updating events:', error)
  }
}

// Run the script
console.log('🚀 Starting past events image update...')
updatePastEventsImages()
  .then(() => {
    console.log('🎉 Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })

export { updatePastEventsImages }