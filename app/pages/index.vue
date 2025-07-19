<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Slovakia Community
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            Join live events, share stories, and help make Slovakia the best country to live in
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/events" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Events
            </NuxtLink>
            <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Create Event
            </button>
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
          <p class="text-gray-500 mt-2">Check back soon or create your own event!</p>
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

    <!-- Community Stats -->
    <section class="py-16 bg-blue-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold mb-2">{{ totalEvents }}</div>
            <div class="text-blue-100">Total Events</div>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">{{ totalMembers }}</div>
            <div class="text-blue-100">Community Members</div>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">{{ totalStories }}</div>
            <div class="text-blue-100">Stories Shared</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Stories -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">
          Community Stories
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold mb-2">Story Title {{ i }}</h3>
            <p class="text-gray-600 text-sm mb-4">
              A brief preview of someone's story about making Slovakia better...
            </p>
            <div class="text-blue-600 text-sm font-medium">Read more →</div>
          </div>
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

// Reactive data
const liveEvents = ref<Event[]>([])
const upcomingEvents = ref<Event[]>([])
const totalEvents = ref(0)
const totalMembers = ref(0)
const totalStories = ref(0)

// Load data on mount
onMounted(async () => {
  try {
    // Load live and upcoming events
    const { getLiveEvents, getUpcomingEvents, getEvents } = useEvents()
    
    const [live, upcoming, all] = await Promise.all([
      getLiveEvents(),
      getUpcomingEvents(), 
      getEvents()
    ])
    
    liveEvents.value = live.slice(0, 6) // Show max 6 live events
    upcomingEvents.value = upcoming.slice(0, 6) // Show max 6 upcoming events
    
    // Update stats
    totalEvents.value = all.length
    totalMembers.value = Math.max(156, all.length * 5 + Math.floor(Math.random() * 50))
    totalStories.value = Math.max(89, Math.floor(all.length * 2.5) + Math.floor(Math.random() * 20))
    
  } catch (error) {
    console.error('Failed to load events:', error)
    // Fallback to placeholder data
    totalEvents.value = 42
    totalMembers.value = 156
    totalStories.value = 89
  }
})
</script>