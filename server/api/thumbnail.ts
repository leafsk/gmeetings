// Server API to fetch platform thumbnails
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { platform, url, videoId, channelName } = query

  try {
    switch (platform) {
      case 'youtube':
        if (!videoId) throw new Error('Video ID required for YouTube')
        return await getYouTubeThumbnail(videoId as string)
        
      case 'twitch':
        if (!channelName) throw new Error('Channel name required for Twitch')
        return await getTwitchThumbnail(channelName as string)
        
      default:
        throw new Error('Unsupported platform')
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})

async function getYouTubeThumbnail(videoId: string) {
  try {
    // YouTube provides thumbnails at predictable URLs
    const thumbnailUrls = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // Best quality
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // High quality
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // Medium quality
      `https://img.youtube.com/vi/${videoId}/default.jpg`        // Default quality
    ]
    
    // Try to get the best available thumbnail
    for (const url of thumbnailUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          return {
            thumbnailUrl: url,
            platform: 'youtube',
            videoId,
            isValid: true
          }
        }
      } catch {
        continue
      }
    }
    
    // If all fail, return default
    return {
      thumbnailUrl: thumbnailUrls[3], // Default quality as fallback
      platform: 'youtube',
      videoId,
      isValid: false
    }
  } catch (error: any) {
    throw new Error(`YouTube thumbnail error: ${error.message}`)
  }
}

async function getTwitchThumbnail(channelName: string) {
  const config = useRuntimeConfig()
  const clientId = config.twitchClientId || process.env.TWITCH_CLIENT_ID
  const clientSecret = config.twitchClientSecret || process.env.TWITCH_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    // Return placeholder if no API credentials
    return {
      thumbnailUrl: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName.toLowerCase()}-640x360.jpg`,
      platform: 'twitch',
      channelName,
      isValid: false,
      error: 'No API credentials'
    }
  }

  try {
    // Get access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Twitch token error: ${tokenResponse.status}`)
    }
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    // Get stream thumbnail
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    
    if (!streamResponse.ok) {
      throw new Error(`Twitch API error: ${streamResponse.status}`)
    }
    
    const streamData = await streamResponse.json()
    const isLive = streamData.data && streamData.data.length > 0
    
    let thumbnailUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName.toLowerCase()}-640x360.jpg`
    
    if (isLive && streamData.data[0].thumbnail_url) {
      // Replace template with actual dimensions
      thumbnailUrl = streamData.data[0].thumbnail_url
        .replace('{width}', '640')
        .replace('{height}', '360')
    }
    
    return {
      thumbnailUrl,
      platform: 'twitch',
      channelName,
      isValid: true,
      isLive,
      title: isLive ? streamData.data[0].title : null,
      viewerCount: isLive ? streamData.data[0].viewer_count : 0
    }
  } catch (error: any) {
    // Return placeholder thumbnail even on API error
    return {
      thumbnailUrl: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName.toLowerCase()}-640x360.jpg`,
      platform: 'twitch',
      channelName,
      isValid: false,
      error: error.message
    }
  }
}