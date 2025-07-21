// Server API to fetch platform thumbnails
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { platform, url, videoId, channelName, postId, username, serverId, channelId, meetingId, webinarId } = query

  try {
    switch (platform) {
      case 'youtube':
        if (!videoId) throw new Error('Video ID required for YouTube')
        return await getYouTubeThumbnail(videoId as string)
        
      case 'twitch':
        if (!channelName) throw new Error('Channel name required for Twitch')
        return await getTwitchThumbnail(channelName as string)
        
      case 'facebook-live':
        if (!postId && !username) throw new Error('Post ID or username required for Facebook Live')
        return await getFacebookLiveThumbnail(postId as string, username as string)
        
      case 'instagram-live':
        if (!username) throw new Error('Username required for Instagram Live')
        return await getInstagramLiveThumbnail(username as string)
        
      case 'tiktok-live':
        if (!username) throw new Error('Username required for TikTok Live')
        return await getTikTokLiveThumbnail(username as string)
        
      case 'discord':
        if (!serverId) throw new Error('Server ID required for Discord')
        return await getDiscordThumbnail(serverId as string, channelId as string)
        
      case 'zoom':
        if (!meetingId) throw new Error('Meeting ID required for Zoom')
        return await getZoomThumbnail(meetingId as string)
        
      case 'teams':
        if (!meetingId) throw new Error('Meeting ID required for Teams')
        return await getTeamsThumbnail(meetingId as string)
        
      case 'meet':
        if (!meetingId) throw new Error('Meeting ID required for Google Meet')
        return await getGoogleMeetThumbnail(meetingId as string)
        
      case 'webex':
        if (!meetingId && !webinarId) throw new Error('Meeting ID or Webinar ID required for WebEx')
        return await getWebExThumbnail(meetingId as string, webinarId as string)
        
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

async function getFacebookLiveThumbnail(postId: string, username: string) {
  try {
    // Facebook Live thumbnails are harder to access without API key
    // For public videos, we can try to construct URLs or use Open Graph
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Facebook Live')}&background=1877f2&color=fff&size=640x360&format=png`
    
    if (postId) {
      // Try to fetch Open Graph data
      const facebookUrl = `https://www.facebook.com/${username}/posts/${postId}`
      try {
        const response = await fetch(facebookUrl)
        const html = await response.text()
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
        if (ogImageMatch) {
          return {
            thumbnailUrl: ogImageMatch[1],
            platform: 'facebook-live',
            postId,
            username,
            isValid: true
          }
        }
      } catch {
        // Fallback if scraping fails
      }
    }
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'facebook-live',
      postId,
      username,
      isValid: false,
      note: 'Facebook Live thumbnails require API access or Open Graph data'
    }
  } catch (error: any) {
    throw new Error(`Facebook Live thumbnail error: ${error.message}`)
  }
}

async function getInstagramLiveThumbnail(username: string) {
  try {
    // Instagram Live is very limited for external access
    // Most live thumbnails require Instagram API access
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Instagram Live')}&background=E4405F&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'instagram-live',
      username,
      isValid: false,
      note: 'Instagram Live thumbnails require Instagram API access'
    }
  } catch (error: any) {
    throw new Error(`Instagram Live thumbnail error: ${error.message}`)
  }
}

async function getTikTokLiveThumbnail(username: string) {
  try {
    // TikTok Live thumbnails are not easily accessible via public API
    // Would need TikTok API access for live content
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('TikTok Live')}&background=000000&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'tiktok-live',
      username,
      isValid: false,
      note: 'TikTok Live thumbnails require TikTok API access'
    }
  } catch (error: any) {
    throw new Error(`TikTok Live thumbnail error: ${error.message}`)
  }
}

async function getDiscordThumbnail(serverId: string, channelId?: string) {
  try {
    // Discord doesn't have public thumbnail APIs for servers
    // We can create a branded placeholder
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Discord Event')}&background=5865F2&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'discord',
      serverId,
      channelId,
      isValid: false,
      note: 'Discord thumbnails require bot access or custom branding'
    }
  } catch (error: any) {
    throw new Error(`Discord thumbnail error: ${error.message}`)
  }
}

async function getZoomThumbnail(meetingId: string) {
  try {
    // Zoom thumbnails would require Zoom API access
    // For now, create a branded placeholder
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Zoom Meeting')}&background=2D8CFF&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'zoom',
      meetingId,
      isValid: false,
      note: 'Zoom thumbnails require Zoom API access for live webinar data'
    }
  } catch (error: any) {
    throw new Error(`Zoom thumbnail error: ${error.message}`)
  }
}

async function getTeamsThumbnail(meetingId: string) {
  try {
    // Microsoft Teams thumbnails require Graph API access
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Teams Event')}&background=6264A7&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'teams',
      meetingId,
      isValid: false,
      note: 'Teams thumbnails require Microsoft Graph API access'
    }
  } catch (error: any) {
    throw new Error(`Teams thumbnail error: ${error.message}`)
  }
}

async function getGoogleMeetThumbnail(meetingId: string) {
  try {
    // Google Meet has limited thumbnail support for live events
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('Google Meet')}&background=00897B&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'meet',
      meetingId,
      isValid: false,
      note: 'Google Meet thumbnails are limited, mainly for recorded sessions'
    }
  } catch (error: any) {
    throw new Error(`Google Meet thumbnail error: ${error.message}`)
  }
}

async function getWebExThumbnail(meetingId: string, webinarId?: string) {
  try {
    // WebEx thumbnails require WebEx API access
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent('WebEx Event')}&background=00BCF2&color=fff&size=640x360&format=png`
    
    return {
      thumbnailUrl: fallbackUrl,
      platform: 'webex',
      meetingId,
      webinarId,
      isValid: false,
      note: 'WebEx thumbnails require WebEx API access for webinar data'
    }
  } catch (error: any) {
    throw new Error(`WebEx thumbnail error: ${error.message}`)
  }
}