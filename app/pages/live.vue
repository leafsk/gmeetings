<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        🔴 Live Events
        <span v-if="liveEvents.length > 0" class="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
          {{ liveEvents.length }}
        </span>
      </h1>
      <p class="text-gray-600">
        Join live streams and community events happening right now!
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading live events...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">⚠️ Error loading live events</div>
      <p class="text-gray-600">{{ error }}</p>
      <button 
        @click="loadLiveEvents"
        class="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Live Events -->
    <div v-else>
      <div v-if="liveEvents.length > 0" class="space-y-8">
        <!-- Featured Live Event (if embeddable) -->
        <div v-if="featuredEvent" class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE NOW
              </span>
              <span class="text-sm text-gray-500">Featured Stream</span>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ featuredEvent.title }}</h2>
            <p class="text-gray-600 mb-4">{{ featuredEvent.description }}</p>
            
            <!-- Live Stream Embed -->
            <div class="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe 
                :src="featuredEvent.embedUrl"
                class="w-full h-full"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>👤 {{ featuredEvent.organizer }}</span>
                <span>👥 {{ featuredEvent.attendeeCount }} watching</span>
                <span>📺 {{ getEventTypeLabel(featuredEvent.type) }}</span>
              </div>
              
              <div class="flex gap-2">
                <NuxtLink 
                  :to="`/events/${featuredEvent.id}`"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details
                </NuxtLink>
                <button 
                  @click="shareEvent(featuredEvent)"
                  class="text-gray-500 hover:text-gray-700"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Live Events -->
        <div v-if="otherLiveEvents.length > 0">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Other Live Events</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="event in otherLiveEvents" 
              :key="event.id"
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <!-- Live Embed or Thumbnail -->
              <div class="aspect-video bg-gray-200 relative">
                <iframe 
                  v-if="event.isEmbeddable && event.embedUrl"
                  :src="event.embedUrl"
                  class="w-full h-full"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
                <img 
                  v-else-if="event.thumbnailUrl"
                  :src="event.thumbnailUrl" 
                  :alt="event.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <div class="text-white text-2xl">🔴</div>
                </div>
                
                <!-- Live indicator -->
                <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>

              <!-- Event Info -->
              <div class="p-4">
                <h4 class="font-semibold text-lg mb-2 line-clamp-2">{{ event.title }}</h4>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ event.description }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>👤 {{ event.organizer }}</span>
                  <span>👥 {{ event.attendeeCount }}</span>
                </div>
                
                <div class="flex gap-2">
                  <NuxtLink 
                    :to="`/events/${event.id}`"
                    class="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm font-medium text-center hover:bg-red-600 transition-colors"
                  >
                    Join Live
                  </NuxtLink>
                  
                  <button 
                    v-if="event.externalLink && !event.isEmbeddable"
                    @click="openExternalLink(event.externalLink)"
                    class="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    🔗
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">📺</div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">No Live Events Right Now</h3>
        <p class="text-gray-500 mb-6">
          No one is streaming live at the moment. Check back soon or create your own live event!
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/events/create"
            class="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Start Live Event
          </NuxtLink>
          <NuxtLink 
            to="/events"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Browse All Events
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div v-if="liveEvents.length > 0" class="mt-8 text-center text-sm text-gray-500">
      🔄 Auto-refreshing every 30 seconds
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

// Meta tags
useHead({
  title: 'Live Events - Slovakia Community',
  meta: [
    { name: 'description', content: 'Watch live streams and join community events happening right now' }
  ]
})

// State
const { loading, error, getLiveEvents } = useEvents()
const liveEvents = ref<Event[]>([])

// Computed
const featuredEvent = computed(() => {
  return liveEvents.value.find(event => event.isEmbeddable && event.embedUrl)
})

const otherLiveEvents = computed(() => {
  if (!featuredEvent.value) return liveEvents.value
  return liveEvents.value.filter(event => event.id !== featuredEvent.value?.id)
})

// Methods
const loadLiveEvents = async () => {
  try {
    liveEvents.value = await getLiveEvents()
  } catch (err) {
    console.error('Failed to load live events:', err)
  }
}

const getEventTypeLabel = (type: Event['type']): string => {
  const labels = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    zoom: 'Zoom',
    meet: 'Google Meet',
    other: 'External'
  }
  return labels[type] || type
}

const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareEvent = async (event: Event) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: event.title,
        text: `Join this live event: ${event.title}`,
        url: `${window.location.origin}/events/${event.id}`
      })
    } catch (err) {
      console.log('Share cancelled')
    }
  } else {
    // Fallback to copying to clipboard
    const url = `${window.location.origin}/events/${event.id}`
    await navigator.clipboard.writeText(url)
    alert('Event link copied to clipboard!')
  }
}

// Auto-refresh live events every 30 seconds
let refreshInterval: NodeJS.Timeout

onMounted(() => {
  loadLiveEvents()
  
  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    loadLiveEvents()
  }, 30000) // 30 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>