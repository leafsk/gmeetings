<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Admin Setup</h1>
      
      <div class="space-y-6">
        <!-- TypeSense Setup -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">TypeSense Search Setup</h2>
          <p class="text-gray-600 mb-4">
            Initialize the search index and sync all events from Firebase to TypeSense.
          </p>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <button
                @click="initializeSearch"
                :disabled="isInitializing"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isInitializing ? 'Initializing...' : 'Initialize Search Index' }}
              </button>
              
              <div v-if="initStatus" :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                initStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ initStatus.message }}
              </div>
            </div>
            
            <div v-if="syncProgress.total > 0" class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Syncing events to search index</span>
                <span>{{ syncProgress.current }} / {{ syncProgress.total }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Test -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Test Search</h2>
          <p class="text-gray-600 mb-4">
            Test the search functionality to ensure it's working correctly.
          </p>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <input
                v-model="testQuery"
                type="text"
                placeholder="Enter search query..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                @click="testSearch"
                :disabled="isSearching"
                class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSearching ? 'Searching...' : 'Test Search' }}
              </button>
            </div>
            
            <div v-if="searchResults" class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-2">
                Found {{ searchResults.totalHits }} results in {{ searchResults.searchTime }}ms
              </div>
              <div v-if="searchResults.events.length > 0" class="space-y-2">
                <div 
                  v-for="event in searchResults.events.slice(0, 3)" 
                  :key="event.id"
                  class="bg-white p-3 rounded border"
                >
                  <div class="font-medium">{{ event.title }}</div>
                  <div class="text-sm text-gray-600">{{ event.description }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ event.organizer }} • {{ event.status }} • {{ event.type }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 text-sm">
                No results found
              </div>
            </div>
          </div>
        </div>

        <!-- Collection Stats -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Collection Statistics</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ stats.firebase }}</div>
              <div class="text-sm text-blue-800">Events in Firebase</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ stats.typesense }}</div>
              <div class="text-sm text-green-800">Events in TypeSense</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ stats.tags }}</div>
              <div class="text-sm text-yellow-800">Unique Tags</div>
            </div>
          </div>
          
          <button
            @click="loadStats"
            class="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchResult } from '~/composables/useSearch'

// Meta tags
useHead({
  title: 'Admin Setup - Slovakia Community',
  meta: [
    { name: 'description', content: 'Admin setup page for search and data management' }
  ]
})

// Composables
const { initializeAndSync } = useTypesenseSync()
const { searchEvents, getPopularTags } = useSearch()
const { getEvents } = useEvents()

// State
const isInitializing = ref(false)
const isSearching = ref(false)
const initStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)
const syncProgress = ref({ current: 0, total: 0 })
const testQuery = ref('')
const searchResults = ref<SearchResult | null>(null)
const stats = ref({
  firebase: 0,
  typesense: 0,
  tags: 0
})

// Initialize search index
const initializeSearch = async () => {
  isInitializing.value = true
  initStatus.value = null
  syncProgress.value = { current: 0, total: 0 }
  
  try {
    // Get total count for progress tracking
    const events = await getEvents()
    syncProgress.value.total = events.length
    
    // Initialize and sync
    await initializeAndSync()
    
    syncProgress.value.current = syncProgress.value.total
    initStatus.value = {
      type: 'success',
      message: `Successfully initialized search index with ${events.length} events`
    }
    
    // Refresh stats
    await loadStats()
  } catch (error: any) {
    console.error('Setup failed:', error)
    initStatus.value = {
      type: 'error',
      message: error.message || 'Failed to initialize search index'
    }
  } finally {
    isInitializing.value = false
  }
}

// Test search functionality
const testSearch = async () => {
  if (!testQuery.value.trim()) return
  
  isSearching.value = true
  
  try {
    searchResults.value = await searchEvents(testQuery.value)
  } catch (error: any) {
    console.error('Search test failed:', error)
    searchResults.value = {
      events: [],
      totalHits: 0,
      searchTime: 0
    }
  } finally {
    isSearching.value = false
  }
}

// Load collection statistics
const loadStats = async () => {
  try {
    // Firebase count
    const firebaseEvents = await getEvents()
    stats.value.firebase = firebaseEvents.length
    
    // TypeSense count (via search)
    const allResults = await searchEvents('*')
    stats.value.typesense = allResults.totalHits
    
    // Unique tags count
    const popularTags = await getPopularTags(1000)
    stats.value.tags = popularTags.length
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// Load initial stats
onMounted(() => {
  loadStats()
})
</script>