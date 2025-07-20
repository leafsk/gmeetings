<template>
  <div 
    v-if="showWelcome" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeWelcome"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Welcome Header -->
      <div class="text-center mb-6">
        <div class="text-4xl mb-3">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Slovakia Community!
        </h2>
        <p class="text-gray-600">
          Your channel is ready! Here's how to get started:
        </p>
      </div>

      <!-- Steps -->
      <div class="space-y-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            1
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Go Live Instantly</h3>
            <p class="text-sm text-gray-600">Click "🔴 Go Live" to start streaming immediately with just your title and stream URL.</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            2
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Schedule Events</h3>
            <p class="text-sm text-gray-600">Use "Schedule Event" for planned streams, meetings, or workshops.</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            3
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Build Your Community</h3>
            <p class="text-sm text-gray-600">Follow other channels and get followers to grow your audience.</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-3">
        <button
          @click="startLiveStream"
          class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          🔴 Start Your First Live Stream
        </button>
        
        <button
          @click="exploreChannels"
          class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          🔍 Explore Other Channels
        </button>
      </div>

      <!-- Skip Option -->
      <div class="text-center mt-4">
        <button
          @click="closeWelcome"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Local state
const showWelcome = ref(props.show)

// Watch for prop changes
watch(() => props.show, (newValue) => {
  showWelcome.value = newValue
})

// Methods
const closeWelcome = () => {
  showWelcome.value = false
  emit('close')
}

const startLiveStream = () => {
  closeWelcome()
  navigateTo('/go-live')
}

const exploreChannels = () => {
  closeWelcome()
  navigateTo('/channels/discover')
}
</script>