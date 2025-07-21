<template>
  <NuxtLink :to="`/events/${event.id}`" class="block group">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
      <!-- Large Visual Thumbnail -->
      <div class="aspect-video bg-gray-200 relative cursor-pointer overflow-hidden">
        <img 
          :src="thumbnailUrl" 
          :alt="event.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError"
        />
        
        <!-- Live indicator -->
        <div v-if="event.status === 'live'" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
        
        <!-- Viewer count for live streams -->
        <div v-if="event.status === 'live' && event.attendeeCount > 0" class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          👥 {{ formatViewerCount(event.attendeeCount) }}
        </div>
        
        <!-- Platform badge -->
        <div class="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
          {{ getEventTypeLabel(event.type) }}
        </div>
        
        <!-- Duration badge for upcoming events -->
        <div v-if="event.status === 'upcoming'" class="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {{ formatTimeUntil(event.startDate) }}
        </div>
        
        <!-- Play overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-4">
            <svg class="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Compact Event Info -->
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{{ event.title }}</h3>
            <div class="flex items-center gap-2 mb-2">
              <img 
                :src="getChannelAvatar()"
                :alt="event.organizer"
                class="w-6 h-6 rounded-full object-cover"
              />
              <span class="text-gray-600 text-sm font-medium">{{ event.organizer }}</span>
              <button 
                @click.prevent="toggleFollow"
                :class="[
                  'text-xs px-2 py-1 rounded-full transition-colors',
                  isFollowing ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ isFollowing ? 'Following' : 'Follow' }}
              </button>
            </div>
            <p v-if="event.status !== 'live'" class="text-gray-500 text-sm">
              {{ formatEventTime(event.startDate) }}
            </p>
          </div>
          
          <!-- Status indicator -->
          <div :class="[
            'px-2 py-1 rounded-full text-xs font-medium',
            event.status === 'live' ? 'bg-red-100 text-red-700' : 
            event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          ]">
            {{ event.status === 'live' ? '🔴 Live' : event.status === 'upcoming' ? '📅 Soon' : '✓ Ended' }}
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

interface Props {
  event: Event
}

const props = defineProps<Props>()

// State
const thumbnailUrl = ref('')
const imageError = ref(false)
const isFollowing = ref(false)

// Load thumbnail on mount
onMounted(async () => {
  await loadThumbnail()
  checkIfFollowing()
})

// Load platform thumbnail
async function loadThumbnail() {
  try {
    if (props.event.thumbnailUrl) {
      thumbnailUrl.value = props.event.thumbnailUrl
      return
    }
    
    const url = props.event.streamUrl || props.event.externalLink || ''
    
    if (props.event.type === 'youtube' && url) {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'youtube', videoId }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'twitch' && url) {
      const channelName = extractTwitchChannelName(url)
      if (channelName) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'twitch', channelName }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'facebook-live' && url) {
      const fbInfo = extractFacebookLiveId(url)
      if (fbInfo) {
        const response = await $fetch('/api/thumbnail', {
          query: { 
            platform: 'facebook-live', 
            postId: fbInfo.postId, 
            username: fbInfo.username 
          }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'instagram-live' && url) {
      const username = extractInstagramUsername(url)
      if (username) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'instagram-live', username }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'tiktok-live' && url) {
      const username = extractTikTokUsername(url)
      if (username) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'tiktok-live', username }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'discord' && url) {
      const discordInfo = extractDiscordInfo(url)
      if (discordInfo) {
        const response = await $fetch('/api/thumbnail', {
          query: { 
            platform: 'discord', 
            serverId: discordInfo.serverId,
            channelId: discordInfo.channelId 
          }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'zoom' && url) {
      const meetingId = extractZoomMeetingId(url)
      if (meetingId) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'zoom', meetingId }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'teams' && url) {
      const meetingId = extractTeamsMeetingId(url)
      if (meetingId) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'teams', meetingId }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'meet' && url) {
      const meetingId = extractGoogleMeetId(url)
      if (meetingId) {
        const response = await $fetch('/api/thumbnail', {
          query: { platform: 'meet', meetingId }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    if (props.event.type === 'webex' && url) {
      const webexInfo = extractWebExInfo(url)
      if (webexInfo) {
        const response = await $fetch('/api/thumbnail', {
          query: { 
            platform: 'webex', 
            meetingId: webexInfo.meetingId,
            webinarId: webexInfo.webinarId 
          }
        })
        thumbnailUrl.value = response.thumbnailUrl
        return
      }
    }
    
    // Fallback to generated image
    thumbnailUrl.value = generateFallbackImage()
  } catch (error) {
    console.warn('Failed to load thumbnail:', error)
    thumbnailUrl.value = generateFallbackImage()
  }
}

// Import extraction functions from composable
const { 
  extractYouTubeVideoId,
  extractTwitchChannelName,
  extractFacebookLiveId,
  extractInstagramUsername,
  extractTikTokUsername,
  extractDiscordInfo,
  extractZoomMeetingId,
  extractTeamsMeetingId,
  extractGoogleMeetId,
  extractWebExInfo
} = useEventStatus()

function generateFallbackImage(): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.event.title)}&background=3b82f6&color=fff&size=640x360&format=png`
}

function handleImageError() {
  if (!imageError.value) {
    imageError.value = true
    thumbnailUrl.value = generateFallbackImage()
  }
}

function getChannelAvatar(): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.event.organizer)}&background=6b7280&color=fff&size=32`
}

function getEventTypeLabel(type: Event['type']): string {
  const labels = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    'facebook-live': 'Facebook Live',
    'instagram-live': 'Instagram Live',
    'tiktok-live': 'TikTok Live',
    discord: 'Discord',
    zoom: 'Zoom',
    teams: 'Teams',
    meet: 'Google Meet',
    webex: 'WebEx',
    other: 'Other'
  }
  return labels[type] || type
}

function formatEventTime(date: Date): string {
  const now = new Date()
  const eventDate = new Date(date)
  const diffMs = eventDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(eventDate)
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short'
    }).format(eventDate)
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(eventDate)
  }
}

function formatTimeUntil(date: Date): string {
  const now = new Date()
  const eventDate = new Date(date)
  const diffMs = eventDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays}d`
  } else if (diffHours > 0) {
    return `${diffHours}h`
  } else {
    return 'Soon'
  }
}

function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

async function checkIfFollowing() {
  const { checkIsFollowing } = useFollowing()
  isFollowing.value = await checkIsFollowing(props.event.organizerId)
}

async function toggleFollow(event: Event) {
  event.stopPropagation()
  const { toggleFollow } = useFollowing()
  try {
    await toggleFollow(props.event.organizerId)
    isFollowing.value = !isFollowing.value
  } catch (error) {
    console.error('Failed to toggle follow:', error)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>