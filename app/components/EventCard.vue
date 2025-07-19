<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Event Thumbnail -->
    <div class="aspect-video bg-gray-200 relative">
      <img 
        v-if="event.thumbnailUrl" 
        :src="event.thumbnailUrl" 
        :alt="event.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div class="text-white text-2xl">🎥</div>
      </div>
      
      <!-- Live indicator -->
      <div v-if="event.status === 'live'" class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        LIVE
      </div>
      
      <!-- Event type -->
      <div class="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {{ getEventTypeLabel(event.type) }}
      </div>
    </div>

    <!-- Event Content -->
    <div class="p-4">
      <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ event.title }}</h3>
      <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ event.description }}</p>
      
      <!-- Event Details -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          {{ formatEventDate(event.startDate) }}
        </div>
        
        <div class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          {{ event.organizer }}
        </div>
        
        <div v-if="event.attendeeCount > 0" class="flex items-center text-sm text-gray-500">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
          {{ event.attendeeCount }} attending
        </div>
      </div>

      <!-- Tags -->
      <div v-if="event.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
        <span v-for="tag in event.tags.slice(0, 3)" :key="tag" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {{ tag }}
        </span>
        <span v-if="event.tags.length > 3" class="text-gray-500 text-xs">
          +{{ event.tags.length - 3 }} more
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <NuxtLink 
          :to="`/events/${event.id}`"
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium text-center hover:bg-blue-700 transition-colors"
        >
          {{ event.status === 'live' ? 'Join Live' : 'View Details' }}
        </NuxtLink>
        
        <button 
          v-if="event.isEmbeddable && event.status === 'live'"
          @click="openStream"
          class="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          🎥
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

interface Props {
  event: Event
}

const props = defineProps<Props>()

function getEventTypeLabel(type: Event['type']): string {
  const labels = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    zoom: 'Zoom',
    meet: 'Google Meet',
    other: 'External'
  }
  return labels[type] || type
}

function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

function openStream() {
  if (props.event.streamUrl) {
    window.open(props.event.streamUrl, '_blank')
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