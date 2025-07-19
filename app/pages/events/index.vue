<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Community Events</h1>
      <p class="text-gray-600 mb-6">
        Discover live streams, meetings, and community gatherings that make Slovakia the best country to live in.
      </p>
      
      <!-- Search Bar -->
      <div class="mb-6">
        <SearchBar 
          @search="handleSearch"
          @clear="handleClearSearch"
          placeholder="Search events, organizers, tags..."
        />
      </div>

      <!-- Filters and Actions -->
      <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="status in statusFilters" 
            :key="status.value"
            @click="toggleFilter(status.value)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              activeFilters.status.includes(status.value)
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ status.icon }} {{ status.label }}
            <span v-if="getFilterCount(status.value) > 0" class="ml-1 text-xs opacity-75">
              ({{ getFilterCount(status.value) }})
            </span>
          </button>
        </div>
        
        <!-- Search Stats and Create Button -->
        <div class="flex items-center gap-4">
          <div v-if="isSearchMode" class="text-sm text-gray-500">
            {{ searchResults.totalHits }} results in {{ searchResults.searchTime }}ms
          </div>
          <NuxtLink 
            to="/events/create"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Event
          </NuxtLink>
        </div>
      </div>

      <!-- Search Facets -->
      <div v-if="isSearchMode && searchResults.facets" class="mb-6">
        <div class="flex flex-wrap gap-4">
          <!-- Type Facets -->
          <div v-if="searchResults.facets.type?.length > 0" class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-500">Type:</span>
            <button
              v-for="facet in searchResults.facets.type"
              :key="facet.value"
              @click="toggleTypeFilter(facet.value)"
              :class="[
                'text-xs px-2 py-1 rounded-full border transition-colors',
                activeFilters.type.includes(facet.value)
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ facet.value }} ({{ facet.count }})
            </button>
          </div>

          <!-- Tag Facets -->
          <div v-if="searchResults.facets.tags?.length > 0" class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-500">Tags:</span>
            <button
              v-for="facet in searchResults.facets.tags.slice(0, 8)"
              :key="facet.value"
              @click="toggleTagFilter(facet.value)"
              :class="[
                'text-xs px-2 py-1 rounded-full border transition-colors',
                activeFilters.tags.includes(facet.value)
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ facet.value }} ({{ facet.count }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading events...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">⚠️ Error loading events</div>
      <p class="text-gray-600">{{ error }}</p>
      <button 
        @click="loadEvents"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Events Grid -->
    <div v-else>
      <div v-if="displayEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard v-for="event in displayEvents" :key="event.id" :event="event" />
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📅</div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          {{ isSearchMode ? 'No search results found' : `No ${activeFilterName} events found` }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{ isSearchMode 
            ? 'Try adjusting your search terms or filters'
            : activeFilterName === 'live' 
            ? 'No live events right now. Check back soon!' 
            : activeFilterName === 'upcoming' 
            ? 'No upcoming events scheduled yet.'
            : 'Be the first to create an event for the community!'
          }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            v-if="isSearchMode"
            @click="handleClearSearch"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear Search
          </button>
          <NuxtLink 
            to="/events/create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Event
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'
import type { SearchFilters } from '~/composables/useSearch'

// Meta tags
useHead({
  title: 'Events - Slovakia Community',
  meta: [
    { name: 'description', content: 'Browse all community events, live streams, and meetings' }
  ]
})

// Composables
const { events, loading, error, getEvents } = useEvents()
const { searchEvents, searchResults, loading: searchLoading } = useSearch()

// State
const searchQuery = ref('')
const isSearchMode = ref(false)
const activeFilters = ref<{
  status: string[]
  type: string[]
  tags: string[]
}>({
  status: [],
  type: [],
  tags: []
})

// Filter options
const statusFilters = [
  { value: 'all', label: 'All Events', icon: '📅' },
  { value: 'live', label: 'Live Now', icon: '🔴' },
  { value: 'upcoming', label: 'Upcoming', icon: '⏰' },
  { value: 'ended', label: 'Past Events', icon: '📽️' }
]

// Computed
const displayEvents = computed(() => {
  if (isSearchMode.value) {
    return searchResults.value.events
  }
  
  if (activeFilters.value.status.length === 0) {
    return events.value
  }
  
  return events.value.filter(event => 
    activeFilters.value.status.includes(event.status)
  )
})

const activeFilterName = computed(() => {
  if (activeFilters.value.status.length === 1) {
    const filter = statusFilters.find(f => f.value === activeFilters.value.status[0])
    return filter?.label.toLowerCase() || ''
  }
  return ''
})

// Methods
const loadEvents = async () => {
  try {
    await getEvents()
  } catch (err) {
    console.error('Failed to load events:', err)
  }
}

const handleSearch = async (query: string) => {
  searchQuery.value = query
  isSearchMode.value = true
  
  try {
    const filters: SearchFilters = {}
    
    if (activeFilters.value.status.length > 0) {
      filters.status = activeFilters.value.status
    }
    if (activeFilters.value.type.length > 0) {
      filters.type = activeFilters.value.type
    }
    if (activeFilters.value.tags.length > 0) {
      filters.tags = activeFilters.value.tags
    }
    
    await searchEvents(query, filters)
  } catch (err) {
    console.error('Search failed:', err)
  }
}

const handleClearSearch = () => {
  searchQuery.value = ''
  isSearchMode.value = false
  activeFilters.value = { status: [], type: [], tags: [] }
}

const toggleFilter = (status: string) => {
  if (status === 'all') {
    activeFilters.value.status = []
  } else {
    const index = activeFilters.value.status.indexOf(status)
    if (index > -1) {
      activeFilters.value.status.splice(index, 1)
    } else {
      activeFilters.value.status.push(status)
    }
  }
  
  // Refresh search if in search mode
  if (isSearchMode.value && searchQuery.value) {
    handleSearch(searchQuery.value)
  }
}

const toggleTypeFilter = (type: string) => {
  const index = activeFilters.value.type.indexOf(type)
  if (index > -1) {
    activeFilters.value.type.splice(index, 1)
  } else {
    activeFilters.value.type.push(type)
  }
  
  if (isSearchMode.value && searchQuery.value) {
    handleSearch(searchQuery.value)
  }
}

const toggleTagFilter = (tag: string) => {
  const index = activeFilters.value.tags.indexOf(tag)
  if (index > -1) {
    activeFilters.value.tags.splice(index, 1)
  } else {
    activeFilters.value.tags.push(tag)
  }
  
  if (isSearchMode.value && searchQuery.value) {
    handleSearch(searchQuery.value)
  }
}

const getFilterCount = (status: string): number => {
  if (status === 'all') return events.value.length
  return events.value.filter(event => event.status === status).length
}

// Load events on mount
onMounted(() => {
  loadEvents()
})
</script>