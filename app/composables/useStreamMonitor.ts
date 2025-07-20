// Composable for monitoring live stream status and auto-ending events
export const useStreamMonitor = () => {
  const { updateEvent, getLiveEvents } = useEvents()
  
  // Monitor interval (2 minutes)
  const MONITOR_INTERVAL = 2 * 60 * 1000
  
  // Extract stream info from URL
  const extractStreamInfo = (streamUrl: string, type: string) => {
    const url = streamUrl.toLowerCase()
    
    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        if (youtubeMatch) {
          return {
            platform: 'youtube',
            videoId: youtubeMatch[1],
            channelName: null
          }
        }
        break
        
      case 'twitch':
        const twitchMatch = url.match(/twitch\.tv\/(\w+)/)
        if (twitchMatch) {
          return {
            platform: 'twitch',
            videoId: null,
            channelName: twitchMatch[1]
          }
        }
        break
    }
    
    return null
  }
  
  // Check stream status via API
  const checkStreamStatus = async (streamUrl: string, type: string) => {
    const streamInfo = extractStreamInfo(streamUrl, type)
    if (!streamInfo) {
      console.warn('Could not extract stream info from URL:', streamUrl)
      return { isLive: false, error: 'Invalid stream URL' }
    }
    
    try {
      const params = new URLSearchParams({
        platform: streamInfo.platform,
        ...(streamInfo.videoId && { videoId: streamInfo.videoId }),
        ...(streamInfo.channelName && { channelName: streamInfo.channelName })
      })
      
      const response = await $fetch(`/api/stream-status?${params}`)
      return response
    } catch (error: any) {
      console.error('Stream status check failed:', error)
      return { isLive: false, error: error.message }
    }
  }
  
  // Monitor a single event
  const monitorEvent = async (event: any) => {
    if (!event.streamUrl || event.status !== 'live') {
      return false // No monitoring needed
    }
    
    console.log(`Checking stream status for event: ${event.title}`)
    
    const status = await checkStreamStatus(event.streamUrl, event.type)
    
    if (!status.isLive && status.isValid !== false) {
      console.log(`Stream ended for event: ${event.title}, auto-ending event...`)
      
      try {
        await updateEvent(event.id, {
          status: 'ended',
          endedAt: new Date()
        })
        
        console.log(`Successfully ended event: ${event.title}`)
        return true // Event was ended
      } catch (error) {
        console.error(`Failed to auto-end event ${event.id}:`, error)
      }
    }
    
    return false // Event still live or monitoring failed
  }
  
  // Monitor all live events
  const monitorAllLiveEvents = async () => {
    try {
      const liveEvents = await getLiveEvents()
      
      if (liveEvents.length === 0) {
        return
      }
      
      console.log(`Monitoring ${liveEvents.length} live events...`)
      
      const results = await Promise.allSettled(
        liveEvents.map(event => monitorEvent(event))
      )
      
      const endedCount = results.filter(
        result => result.status === 'fulfilled' && result.value === true
      ).length
      
      if (endedCount > 0) {
        console.log(`Auto-ended ${endedCount} events that went offline`)
      }
      
    } catch (error) {
      console.error('Failed to monitor live events:', error)
    }
  }
  
  // Start monitoring (call this from a server-side job or client-side interval)
  const startMonitoring = () => {
    console.log('Starting stream monitoring...')
    
    // Initial check
    monitorAllLiveEvents()
    
    // Set up interval
    const interval = setInterval(monitorAllLiveEvents, MONITOR_INTERVAL)
    
    // Return cleanup function
    return () => {
      console.log('Stopping stream monitoring...')
      clearInterval(interval)
    }
  }
  
  // One-time check for a specific event
  const checkEventStatus = async (eventId: string) => {
    try {
      const liveEvents = await getLiveEvents()
      const event = liveEvents.find(e => e.id === eventId)
      
      if (!event) {
        throw new Error('Event not found or not live')
      }
      
      return await monitorEvent(event)
    } catch (error) {
      console.error('Failed to check event status:', error)
      return false
    }
  }
  
  return {
    monitorEvent,
    monitorAllLiveEvents,
    startMonitoring,
    checkEventStatus,
    checkStreamStatus
  }
}