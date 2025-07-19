<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Demo Data Management</h1>
      
      <div class="space-y-8">
        <!-- Demo Mode Status -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Demo Mode Status</h2>
              <p class="text-gray-600 mt-1">
                Generate realistic event data for development and presentation
              </p>
            </div>
            <div :class="[
              'px-4 py-2 rounded-full text-sm font-medium',
              isDemoMode() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]">
              {{ isDemoMode() ? 'ENABLED' : 'DISABLED' }}
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="enableDemo"
              :disabled="loading || isDemoMode()"
              class="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading && action === 'enable' ? 'Enabling...' : 'Enable Demo Mode' }}
            </button>
            
            <button
              @click="disableDemo"
              :disabled="loading || !isDemoMode()"
              class="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading && action === 'disable' ? 'Disabling...' : 'Disable Demo Mode' }}
            </button>

            <button
              @click="refreshDemo"
              :disabled="loading || !isDemoMode()"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading && action === 'refresh' ? 'Refreshing...' : 'Refresh Demo Data' }}
            </button>
          </div>

          <div v-if="status" :class="[
            'mt-4 px-4 py-3 rounded-lg text-sm',
            status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          ]">
            {{ status.message }}
          </div>
        </div>

        <!-- Demo Statistics -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Demo Data Statistics</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
              <div class="text-sm text-blue-800">Total Demo Events</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ stats.live }}</div>
              <div class="text-sm text-red-800">Live Events</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ stats.upcoming }}</div>
              <div class="text-sm text-green-800">Upcoming Events</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-gray-600">{{ stats.ended }}</div>
              <div class="text-sm text-gray-800">Past Events</div>
            </div>
          </div>

          <button
            @click="loadStats"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Refresh Statistics
          </button>
        </div>

        <!-- Demo Configuration -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Demo Configuration</h2>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Live Events</label>
                <input
                  v-model.number="localConfig.eventCount.live"
                  type="number"
                  min="0"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Upcoming Events</label>
                <input
                  v-model.number="localConfig.eventCount.upcoming"
                  type="number"
                  min="0"
                  max="20"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Past Events</label>
                <input
                  v-model.number="localConfig.eventCount.ended"
                  type="number"
                  min="0"
                  max="20"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div class="text-sm text-gray-600">
              <strong>Note:</strong> Configuration changes will take effect when you refresh demo data or re-enable demo mode.
            </div>
          </div>
        </div>

        <!-- Demo Event Samples -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Sample Demo Events</h2>
          <p class="text-gray-600 mb-4">
            Preview of the types of events that will be generated in demo mode.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="sample in sampleEvents" :key="sample.title" class="border border-gray-200 rounded-lg p-4">
              <div class="aspect-video bg-gray-200 rounded mb-3 overflow-hidden">
                <img 
                  :src="sample.thumbnailUrl" 
                  :alt="sample.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <h3 class="font-semibold text-sm mb-2 line-clamp-2">{{ sample.title }}</h3>
              <p class="text-xs text-gray-600 mb-2 line-clamp-2">{{ sample.description }}</p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="tag in sample.tags.slice(0, 3)" 
                  :key="tag"
                  class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-yellow-900 mb-4">📋 Instructions</h2>
          <div class="text-yellow-800 space-y-2 text-sm">
            <p><strong>1. Enable Demo Mode:</strong> Click "Enable Demo Mode" to generate realistic events with dynamic dates</p>
            <p><strong>2. Live Events:</strong> Events that appear to be happening right now with active viewer counts</p>
            <p><strong>3. Upcoming Events:</strong> Events scheduled for the next few hours to days</p>
            <p><strong>4. Past Events:</strong> Events that "happened" in the recent past</p>
            <p><strong>5. TypeSense Sync:</strong> All demo events are automatically indexed for search functionality</p>
            <p><strong>6. Dynamic Dates:</strong> Event dates are calculated relative to current time, so they always appear current</p>
            <p><strong>7. Clean Up:</strong> Disable demo mode to remove all demo events from the database</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Demo Data Management - Slovakia Community',
  meta: [
    { name: 'description', content: 'Manage demo data for development and presentation' }
  ]
})

// Composables
const { 
  isDemoMode, 
  toggleDemoMode, 
  generateDemoData, 
  clearDemoData,
  getDemoStats,
  demoConfig
} = useDemoData()

// State
const loading = ref(false)
const action = ref<'enable' | 'disable' | 'refresh' | null>(null)
const status = ref<{ type: 'success' | 'error', message: string } | null>(null)
const stats = ref({
  total: 0,
  live: 0,
  upcoming: 0,
  ended: 0
})

// Local config for editing
const localConfig = ref({
  eventCount: { ...demoConfig.eventCount }
})

// Sample events for preview
const sampleEvents = [
  {
    title: "Slovakia Tech Meetup - Building the Future",
    description: "Join us for an exciting discussion about emerging technologies in Slovakia.",
    tags: ["technology", "startup", "AI"],
    thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop"
  },
  {
    title: "Bratislava Startup Pitch Night", 
    description: "Local entrepreneurs present their innovative ideas to investors.",
    tags: ["startup", "entrepreneurship", "investment"],
    thumbnailUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=225&fit=crop"
  },
  {
    title: "Digital Nomad Slovakia - Remote Work Paradise",
    description: "Discover why Slovakia is becoming perfect for digital nomads.",
    tags: ["remote-work", "digital-nomad", "lifestyle"],
    thumbnailUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=225&fit=crop"
  }
]

// Methods
const enableDemo = async () => {
  loading.value = true
  action.value = 'enable'
  status.value = null

  try {
    // Update config if changed
    Object.assign(demoConfig.eventCount, localConfig.value.eventCount)
    
    await toggleDemoMode(true)
    status.value = {
      type: 'success',
      message: `Demo mode enabled successfully! Generated ${demoConfig.eventCount.live + demoConfig.eventCount.upcoming + demoConfig.eventCount.ended} events.`
    }
    await loadStats()
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: error.message || 'Failed to enable demo mode'
    }
  } finally {
    loading.value = false
    action.value = null
  }
}

const disableDemo = async () => {
  loading.value = true
  action.value = 'disable'
  status.value = null

  try {
    const deletedCount = await clearDemoData()
    await toggleDemoMode(false)
    status.value = {
      type: 'success',
      message: `Demo mode disabled. Removed ${deletedCount} demo events.`
    }
    await loadStats()
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: error.message || 'Failed to disable demo mode'
    }
  } finally {
    loading.value = false
    action.value = null
  }
}

const refreshDemo = async () => {
  loading.value = true
  action.value = 'refresh'
  status.value = null

  try {
    // Update config if changed
    Object.assign(demoConfig.eventCount, localConfig.value.eventCount)
    
    // Clear existing demo data
    const deletedCount = await clearDemoData()
    
    // Generate new demo data
    await generateDemoData()
    
    status.value = {
      type: 'success',
      message: `Demo data refreshed! Removed ${deletedCount} old events and generated ${demoConfig.eventCount.live + demoConfig.eventCount.upcoming + demoConfig.eventCount.ended} new events.`
    }
    await loadStats()
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: error.message || 'Failed to refresh demo data'
    }
  } finally {
    loading.value = false
    action.value = null
  }
}

const loadStats = async () => {
  try {
    stats.value = await getDemoStats()
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase connection...')
    const { getEvents } = useEvents()
    const events = await getEvents()
    console.log('✅ Firebase connected successfully. Found', events.length, 'events')
    return true
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return false
  }
}

// Load initial stats
onMounted(async () => {
  await testFirebaseConnection()
  loadStats()
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