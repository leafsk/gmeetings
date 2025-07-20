<template>
  <div>

    <!-- Featured Live Event Section -->
    <section v-if="featuredLiveEvent" class="bg-gradient-to-br from-red-50 to-pink-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          class="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          @click="$router.push(`/events/${featuredLiveEvent.id}`)"
        >
          <div class="p-6 lg:p-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE NOW
              </span>
              <span class="text-sm text-gray-500">Featured Stream</span>
            </div>
            
            <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{{ featuredLiveEvent.title }}</h1>
            <p class="text-gray-600 text-lg mb-6 max-w-3xl">{{ featuredLiveEvent.description }}</p>
            
            <!-- Live Stream Embed -->
            <div class="aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <iframe 
                v-if="featuredLiveEvent.isEmbeddable && featuredLiveEvent.embedUrl"
                :src="featuredLiveEvent.embedUrl"
                class="w-full h-full"
                frameborder="0"
                allowfullscreen
              ></iframe>
              <div v-else class="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <div class="text-center text-white">
                  <div class="text-6xl mb-4">🔴</div>
                  <h3 class="text-xl font-semibold mb-2">Live Stream</h3>
                  <p class="opacity-90">{{ featuredLiveEvent.title }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <span class="flex items-center gap-1">👤 {{ featuredLiveEvent.organizer }}</span>
                <span class="flex items-center gap-1">👥 {{ featuredLiveEvent.attendeeCount || 0 }} watching</span>
                <span class="flex items-center gap-1">📺 {{ getEventTypeLabel(featuredLiveEvent.type) }}</span>
              </div>
              
              <!-- Owner Controls -->
              <div v-if="isEventOwner(featuredLiveEvent)" class="flex gap-3">
                <button 
                  @click.stop="endEvent(featuredLiveEvent.id)"
                  class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  🛑 End Stream
                </button>
                <button 
                  @click.stop="editEvent(featuredLiveEvent.id)"
                  class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
              <!-- Click to join hint for viewers -->
              <div v-else class="text-sm text-gray-500 italic">
                👆 Click anywhere to join the stream
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Events Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900">🔴 Live Now</h2>
          <NuxtLink to="/live" class="text-blue-600 hover:text-blue-700 font-medium">
            View All Live →
          </NuxtLink>
        </div>
        
        <div v-if="liveEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard v-for="event in liveEvents" :key="event.id" :event="event" />
        </div>
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-lg">No live events right now</div>
          <p class="text-gray-500 mt-2 mb-4">Be the first to go live and start building community!</p>
          <NuxtLink 
            v-if="isAuthenticated"
            to="/go-live" 
            class="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            🔴 Go Live Now
          </NuxtLink>
          <NuxtLink 
            v-else
            to="/auth/login"
            class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Join to Go Live
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Upcoming Events Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900">📅 Upcoming Events</h2>
          <NuxtLink to="/events" class="text-blue-600 hover:text-blue-700 font-medium">
            View All Events →
          </NuxtLink>
        </div>
        
        <div v-if="upcomingEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard v-for="event in upcomingEvents" :key="event.id" :event="event" />
        </div>
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-lg">No upcoming events</div>
          <p class="text-gray-500 mt-2">Be the first to create an event!</p>
        </div>
      </div>
    </section>

    <!-- Recent Past Events Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900">📺 Recent Past Events</h2>
          <NuxtLink to="/events?filter=past" class="text-blue-600 hover:text-blue-700 font-medium">
            View All Past Events →
          </NuxtLink>
        </div>
        
        <div v-if="pastEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard v-for="event in pastEvents" :key="event.id" :event="event" />
        </div>
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-lg">No past events yet</div>
          <p class="text-gray-500 mt-2">Check back later to see recorded content!</p>
        </div>
      </div>
    </section>

    <!-- Popular Past Events Section -->
    <section class="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">🎆 Audience Favorites</h2>
            <p class="text-gray-600 mt-2">Most watched events - discover what the community loved</p>
          </div>
          <NuxtLink to="/events?filter=popular" class="text-purple-600 hover:text-purple-700 font-medium">
            View All Popular →
          </NuxtLink>
        </div>
        
        <div v-if="popularEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(event, index) in popularEvents" :key="event.id" class="relative">
            <!-- Popularity rank badge -->
            <div class="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
              {{ index + 1 }}
            </div>
            <EventCard :event="event" />
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-lg">No popular events yet</div>
          <p class="text-gray-500 mt-2">Create engaging content to appear here!</p>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

// Meta tags
useHead({
  title: 'Slovakia Community - The Best Country to Live In',
  meta: [
    { name: 'description', content: 'Join our community events and live streams to help make Slovakia the best country to live in' }
  ]
})

// Auth state
const { isAuthenticated, user } = useAuth()

// Stream monitoring
const { startMonitoring } = useStreamMonitor()
let stopMonitoring: (() => void) | null = null

// Reactive data
const liveEvents = ref<Event[]>([])
const upcomingEvents = ref<Event[]>([])
const pastEvents = ref<Event[]>([])
const popularEvents = ref<Event[]>([])

// Computed properties
const featuredLiveEvent = computed(() => {
  return liveEvents.value.find(event => event.isEmbeddable && event.embedUrl) || liveEvents.value[0]
})

// Helper functions
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

const isEventOwner = (event: Event): boolean => {
  return user.value?.uid === event.organizerId
}

const endEvent = async (eventId: string) => {
  if (!confirm('Are you sure you want to end this live stream?')) return
  
  try {
    const { updateEvent } = useEvents()
    await updateEvent(eventId, { 
      status: 'ended',
      endedAt: new Date()
    })
    
    // Refresh the events data
    await loadEvents()
  } catch (error) {
    console.error('Failed to end event:', error)
    alert('Failed to end the stream. Please try again.')
  }
}

const editEvent = (eventId: string) => {
  navigateTo(`/events/${eventId}/edit`)
}

const loadEvents = async () => {
  try {
    const { getLiveEvents, getUpcomingEvents, getPastEvents, getPopularPastEvents } = useEvents()
    
    const [live, upcoming, past, popular] = await Promise.all([
      getLiveEvents(),
      getUpcomingEvents(),
      getPastEvents(6),
      getPopularPastEvents(6)
    ])
    
    liveEvents.value = live.slice(0, 6)
    upcomingEvents.value = upcoming.slice(0, 6)
    pastEvents.value = past
    popularEvents.value = popular
  } catch (error) {
    console.error('Failed to load events:', error)
  }
}

// Load data on mount
onMounted(() => {
  loadEvents()
  
  // Start stream monitoring
  stopMonitoring = startMonitoring()
})

// Cleanup on unmount
onUnmounted(() => {
  if (stopMonitoring) {
    stopMonitoring()
  }
})
</script>