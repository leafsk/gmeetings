import type { Event } from '~/types/event'

export const useChat = () => {
  // Global chat sidebar state
  const showChatSidebar = useState('showChatSidebar', () => false)
  const chatEmbedUrl = useState<string | null>('chatEmbedUrl', () => null)
  const chatType = useState<'external' | 'firebase'>('chatType', () => 'external')
  const viewerCount = useState('viewerCount', () => 0)
  const currentEventId = useState<string | null>('currentEventId', () => null)

  // Generate chat embed URL for different platforms
  const generateChatEmbedUrl = (event: Event): string | null => {
    if (!event.streamUrl) return null
    
    switch (event.type) {
      case 'youtube':
        if (event.streamUrl.includes('youtube.com')) {
          const videoId = event.streamUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
          if (videoId) {
            return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`
          }
        }
        break
      
      case 'twitch':
        if (event.streamUrl.includes('twitch.tv')) {
          const channel = event.streamUrl.match(/twitch\.tv\/(\w+)/)?.[1]
          if (channel) {
            // Get proper parent domain for Twitch embedding
            const parentDomain = process.client ? window.location.hostname : 'localhost'
            return `https://www.twitch.tv/embed/${channel}/chat?parent=${parentDomain}&darkpopout`
          }
        }
        break
      
      default:
        return null
    }
    
    return null
  }

  // Open chat for a specific event
  const openChatForEvent = (event: Event) => {
    currentEventId.value = event.id
    const externalChatUrl = generateChatEmbedUrl(event)
    
    if (externalChatUrl) {
      // Use external chat (YouTube/Twitch)
      chatEmbedUrl.value = externalChatUrl
      chatType.value = 'external'
    } else {
      // Fallback to Firebase chat
      chatEmbedUrl.value = null
      chatType.value = 'firebase'
    }
    
    viewerCount.value = event.attendeeCount || 0
    showChatSidebar.value = true
  }

  // Toggle chat sidebar
  const toggleChat = () => {
    showChatSidebar.value = !showChatSidebar.value
  }

  // Close chat
  const closeChat = () => {
    showChatSidebar.value = false
    chatEmbedUrl.value = null
    currentEventId.value = null
    chatType.value = 'external'
  }

  // Update viewer count
  const updateViewerCount = (count: number) => {
    viewerCount.value = count
  }

  return {
    // State
    showChatSidebar: readonly(showChatSidebar),
    chatEmbedUrl: readonly(chatEmbedUrl),
    chatType: readonly(chatType),
    viewerCount: readonly(viewerCount),
    currentEventId: readonly(currentEventId),
    
    // Methods
    openChatForEvent,
    toggleChat,
    closeChat,
    updateViewerCount,
    generateChatEmbedUrl
  }
}