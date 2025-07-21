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

// Facebook Live thumbnail fetching
async function getFacebookLiveThumbnail(postId, username) {
  try {
    // Facebook Live thumbnails are harder to access without API key
    // For now, return a branded placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Facebook Live')}&background=1877f2&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Facebook thumbnail for ${username}:`, error.message)
    return null
  }
}

// Instagram Live thumbnail fetching
async function getInstagramLiveThumbnail(username) {
  try {
    // Instagram Live is very limited for external access
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Instagram Live')}&background=E4405F&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Instagram thumbnail for ${username}:`, error.message)
    return null
  }
}

// TikTok Live thumbnail fetching
async function getTikTokLiveThumbnail(username) {
  try {
    // TikTok Live thumbnails are not easily accessible via public API
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('TikTok Live')}&background=000000&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching TikTok thumbnail for ${username}:`, error.message)
    return null
  }
}

// Discord thumbnail fetching
async function getDiscordThumbnail(serverId, channelId) {
  try {
    // Discord doesn't have public thumbnail APIs for servers
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Discord Event')}&background=5865F2&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Discord thumbnail for ${serverId}:`, error.message)
    return null
  }
}

// Zoom thumbnail fetching
async function getZoomThumbnail(meetingId) {
  try {
    // Zoom thumbnails would require Zoom API access
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Zoom Meeting')}&background=2D8CFF&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Zoom thumbnail for ${meetingId}:`, error.message)
    return null
  }
}

// Microsoft Teams thumbnail fetching
async function getTeamsThumbnail(meetingId) {
  try {
    // Teams thumbnails require Graph API access
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Teams Event')}&background=6264A7&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Teams thumbnail for ${meetingId}:`, error.message)
    return null
  }
}

// Google Meet thumbnail fetching
async function getGoogleMeetThumbnail(meetingId) {
  try {
    // Google Meet has limited thumbnail support for live events
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('Google Meet')}&background=00897B&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching Google Meet thumbnail for ${meetingId}:`, error.message)
    return null
  }
}

// WebEx thumbnail fetching
async function getWebExThumbnail(meetingId, webinarId) {
  try {
    // WebEx thumbnails require WebEx API access
    return `https://ui-avatars.com/api/?name=${encodeURIComponent('WebEx Event')}&background=00BCF2&color=fff&size=640x360&format=png`
  } catch (error) {
    console.error(`Error fetching WebEx thumbnail for ${meetingId || webinarId}:`, error.message)
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

// Extract Facebook Live information from URL
function extractFacebookLiveId(url) {
  const videoMatch = url.match(/facebook\.com\/([^\/]+)\/videos\/([^\/\?&]+)/)
  if (videoMatch) return { username: videoMatch[1], postId: videoMatch[2] }
  
  const postMatch = url.match(/facebook\.com\/([^\/]+)\/posts\/([^\/\?&]+)/)
  if (postMatch) return { username: postMatch[1], postId: postMatch[2] }
  
  const profileMatch = url.match(/facebook\.com\/([^\/\?&]+)/)
  if (profileMatch) return { username: profileMatch[1] }
  
  return null
}

// Extract Instagram username from URL
function extractInstagramUsername(url) {
  const match = url.match(/instagram\.com\/([^\/\?&]+)/)
  return match ? match[1] : null
}

// Extract TikTok username from URL
function extractTikTokUsername(url) {
  const match = url.match(/tiktok\.com\/@([^\/\?&]+)/)
  return match ? match[1] : null
}

// Extract Discord information from URL
function extractDiscordInfo(url) {
  const inviteMatch = url.match(/discord\.(?:gg|com\/invite)\/([^\/\?&]+)/)
  if (inviteMatch) return { serverId: inviteMatch[1] }
  
  const channelMatch = url.match(/discord\.com\/channels\/([^\/]+)\/([^\/\?&]+)/)
  if (channelMatch) return { serverId: channelMatch[1], channelId: channelMatch[2] }
  
  return null
}

// Extract Zoom meeting ID from URL
function extractZoomMeetingId(url) {
  const patterns = [
    /zoom\.us\/j\/([^\/\?&]+)/,
    /zoom\.us\/webinar\/register\/([^\/\?&]+)/,
    /zoom\.us\/meeting\/([^\/\?&]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Extract Teams meeting ID from URL
function extractTeamsMeetingId(url) {
  const match = url.match(/teams\.microsoft\.com\/l\/meetup-join\/([^\/\?&]+)/)
  return match ? match[1] : null
}

// Extract Google Meet ID from URL
function extractGoogleMeetId(url) {
  const match = url.match(/meet\.google\.com\/([^\/\?&]+)/)
  return match ? match[1] : null
}

// Extract WebEx information from URL
function extractWebExInfo(url) {
  const meetingMatch = url.match(/webex\.com\/meet\/([^\/\?&]+)/)
  if (meetingMatch) return { meetingId: meetingMatch[1] }
  
  const webinarMatch = url.match(/webex\.com\/webinar\/([^\/\?&]+)/)
  if (webinarMatch) return { webinarId: webinarMatch[1] }
  
  const genericMatch = url.match(/\.webex\.com\/.*\/([^\/\?&]+)/)
  if (genericMatch) return { meetingId: genericMatch[1] }
  
  return null
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
      } else if (event.type === 'facebook-live' && urlToCheck) {
        const fbInfo = extractFacebookLiveId(urlToCheck)
        if (fbInfo) {
          console.log(`  📘 Fetching Facebook Live thumbnail for: ${fbInfo.username}`)
          thumbnailUrl = await getFacebookLiveThumbnail(fbInfo.postId, fbInfo.username)
        }
      } else if (event.type === 'instagram-live' && urlToCheck) {
        const username = extractInstagramUsername(urlToCheck)
        if (username) {
          console.log(`  📷 Fetching Instagram Live thumbnail for: ${username}`)
          thumbnailUrl = await getInstagramLiveThumbnail(username)
        }
      } else if (event.type === 'tiktok-live' && urlToCheck) {
        const username = extractTikTokUsername(urlToCheck)
        if (username) {
          console.log(`  🎵 Fetching TikTok Live thumbnail for: ${username}`)
          thumbnailUrl = await getTikTokLiveThumbnail(username)
        }
      } else if (event.type === 'discord' && urlToCheck) {
        const discordInfo = extractDiscordInfo(urlToCheck)
        if (discordInfo) {
          console.log(`  💬 Fetching Discord thumbnail for server: ${discordInfo.serverId}`)
          thumbnailUrl = await getDiscordThumbnail(discordInfo.serverId, discordInfo.channelId)
        }
      } else if (event.type === 'zoom' && urlToCheck) {
        const meetingId = extractZoomMeetingId(urlToCheck)
        if (meetingId) {
          console.log(`  🔵 Creating Zoom thumbnail for meeting: ${meetingId}`)
          thumbnailUrl = await getZoomThumbnail(meetingId)
        }
      } else if (event.type === 'teams' && urlToCheck) {
        const meetingId = extractTeamsMeetingId(urlToCheck)
        if (meetingId) {
          console.log(`  🟪 Creating Teams thumbnail for meeting: ${meetingId}`)
          thumbnailUrl = await getTeamsThumbnail(meetingId)
        }
      } else if (event.type === 'meet' && urlToCheck) {
        const meetingId = extractGoogleMeetId(urlToCheck)
        if (meetingId) {
          console.log(`  🟢 Creating Google Meet thumbnail for: ${meetingId}`)
          thumbnailUrl = await getGoogleMeetThumbnail(meetingId)
        }
      } else if (event.type === 'webex' && urlToCheck) {
        const webexInfo = extractWebExInfo(urlToCheck)
        if (webexInfo) {
          console.log(`  🔷 Creating WebEx thumbnail for: ${webexInfo.meetingId || webexInfo.webinarId}`)
          thumbnailUrl = await getWebExThumbnail(webexInfo.meetingId, webexInfo.webinarId)
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