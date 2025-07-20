// Server API to check stream status (avoids CORS issues)
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { platform, url, videoId, channelName } = query

  try {
    switch (platform) {
      case 'youtube':
        if (!videoId) throw new Error('Video ID required for YouTube')
        return await checkYouTubeAPI(videoId as string)
        
      case 'twitch':
        if (!channelName) throw new Error('Channel name required for Twitch')
        return await checkTwitchAPI(channelName as string)
        
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

async function checkYouTubeAPI(videoId: string) {
  const config = useRuntimeConfig()
  const apiKey = config.youtubeApiKey || process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    console.warn('YouTube API key not configured')
    return { isLive: false, error: 'API key not configured' }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,liveStreamingDetails&key=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return { isLive: false, error: 'Video not found' }
    }
    
    const video = data.items[0]
    const isLive = video.snippet.liveBroadcastContent === 'live'
    
    return {
      isLive,
      isValid: true,
      broadcastStatus: video.snippet.liveBroadcastContent,
      title: video.snippet.title,
      scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
      actualStartTime: video.liveStreamingDetails?.actualStartTime,
      actualEndTime: video.liveStreamingDetails?.actualEndTime
    }
  } catch (error: any) {
    console.error('YouTube API error:', error)
    return { isLive: false, isValid: false, error: error.message }
  }
}

async function checkTwitchAPI(channelName: string) {
  const config = useRuntimeConfig()
  const clientId = config.twitchClientId || process.env.TWITCH_CLIENT_ID
  const clientSecret = config.twitchClientSecret || process.env.TWITCH_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.warn('Twitch API credentials not configured')
    return { isLive: false, error: 'API credentials not configured' }
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
    
    // Check stream status
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
    
    return {
      isLive,
      isValid: true,
      streamData: isLive ? streamData.data[0] : null,
      viewerCount: isLive ? streamData.data[0].viewer_count : 0,
      gameId: isLive ? streamData.data[0].game_id : null,
      title: isLive ? streamData.data[0].title : null
    }
  } catch (error: any) {
    console.error('Twitch API error:', error)
    return { isLive: false, isValid: false, error: error.message }
  }
}