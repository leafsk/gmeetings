<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🔴 Go Live Now</h1>
      <p class="text-gray-600 mb-6">
        Quick setup to start streaming to your community immediately
      </p>
      
      <!-- Channel Info -->
      <div v-if="userProfile" class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center gap-4">
          <img 
            :src="userProfile.photoURL || '/default-avatar.png'"
            :alt="userProfile.displayName"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div class="text-center">
            <h3 class="font-semibold text-gray-900">
              {{ userProfile.channelName || userProfile.displayName }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ userProfile.followerCount }} followers will be notified
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing Live Stream Warning -->
    <div v-if="showExistingLiveWarning && userLiveEvent" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <h3 class="text-lg font-semibold text-red-800">You're Already Live!</h3>
      </div>
      <p class="text-red-700 mb-4">
        You currently have a live stream running: "<strong>{{ userLiveEvent.title }}</strong>"
      </p>
      <p class="text-red-600 mb-4">
        You must end your current stream before starting a new one.
      </p>
      <div class="flex gap-3">
        <NuxtLink 
          :to="`/events/${userLiveEvent.id}`"
          class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Go to Current Stream
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Setup Form -->
    <form v-if="!showExistingLiveWarning" @submit.prevent="goLive" class="space-y-6">
      <!-- Stream Title -->
      <div>
        <label for="title" class="block text-lg font-medium text-gray-900 mb-2">
          What's your stream about?
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="e.g., Live Coding Session, Q&A with the Community"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Stream URL -->
      <div>
        <label for="streamUrl" class="block text-lg font-medium text-gray-900 mb-2">
          Your stream URL
        </label>
        <input
          id="streamUrl"
          v-model="form.streamUrl"
          type="url"
          required
          placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p class="text-sm text-gray-500 mt-2">
          👆 Copy your YouTube Live or Twitch stream URL here
        </p>
      </div>

      <!-- Quick Description -->
      <div>
        <label for="description" class="block text-lg font-medium text-gray-900 mb-2">
          Quick description (optional)
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Tell your audience what to expect..."
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-lg font-medium text-gray-900 mb-2">
          Tags (optional)
        </label>
        <TagInput
          v-model="tags"
          placeholder="coding, tech, community, discussion"
          help-text="Add tags to help people discover your stream"
          :suggestions="['coding', 'tech', 'community', 'discussion', 'gaming', 'music', 'education', 'business', 'art', 'entertainment']"
          :max-tags="5"
        />
      </div>

      <!-- Go Live Button -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="loading || !form.title || !form.streamUrl"
          class="w-full bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          <span v-if="loading">Creating Your Live Event...</span>
          <span v-else class="flex items-center justify-center gap-3">
            🔴 Go Live Now!
          </span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="text-red-700">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>
    </form>

    <!-- Help Section -->
    <div class="mt-12 bg-gray-50 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        📚 Need help getting your stream URL?
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="font-semibold text-red-600 mb-2">📺 YouTube Live</h3>
          <ol class="text-sm text-gray-700 space-y-1">
            <li>1. Go to YouTube Studio</li>
            <li>2. Click "Create" → "Go Live"</li>
            <li>3. Start your stream</li>
            <li>4. Copy the watch URL</li>
          </ol>
        </div>
        
        <div class="bg-white p-4 rounded-lg border">
          <h3 class="font-semibold text-purple-600 mb-2">🎮 Twitch</h3>
          <ol class="text-sm text-gray-700 space-y-1">
            <li>1. Open your streaming software</li>
            <li>2. Start streaming to Twitch</li>
            <li>3. Go to twitch.tv/yourusername</li>
            <li>4. Copy your channel URL</li>
          </ol>
        </div>
      </div>
      
      <div class="mt-4 text-center">
        <NuxtLink 
          to="/guide/hosting"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          📖 View Full Hosting Guide
        </NuxtLink>
      </div>
    </div>

    <!-- Alternative Options -->
    <div class="mt-8 text-center text-gray-500">
      <p class="mb-4">Need more options?</p>
      <NuxtLink 
        to="/events/create"
        class="text-blue-600 hover:text-blue-700 font-medium"
      >
        Use Advanced Event Creator
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateEventData } from '~/types/event'

// Meta tags
useHead({
  title: 'Go Live Now - Slovakia Community',
  meta: [
    { name: 'description', content: 'Start streaming live to your community in seconds' }
  ]
})

// State
const { createEvent: createEventApi, getLiveEvents, loading, error } = useEvents()
const { user, userProfile, isAuthenticated } = useAuth()
const router = useRouter()
const userLiveEvent = ref(null)
const showExistingLiveWarning = ref(false)

// Wait for auth to initialize, then redirect if not authenticated
const authInitialized = ref(false)

// Check for user's existing live events
const checkExistingLiveEvent = async () => {
  if (!user.value) return
  
  try {
    const liveEvents = await getLiveEvents()
    userLiveEvent.value = liveEvents.find(event => event.organizerId === user.value?.uid) || null
    showExistingLiveWarning.value = !!userLiveEvent.value
  } catch (error) {
    console.error('Failed to check live events:', error)
  }
}

onMounted(async () => {
  // Wait a moment for auth to initialize
  await nextTick()
  authInitialized.value = true
  
  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }
  
  // Check for existing live events
  await checkExistingLiveEvent()
})

// Watch for auth changes
watchEffect(() => {
  if (authInitialized.value && !isAuthenticated.value && !loading.value) {
    navigateTo('/auth/login')
  }
})

// Form data - simplified for quick live streaming
const form = ref({
  title: '',
  description: '',
  streamUrl: ''
})

// Tags are managed directly as an array
const tags = ref<string[]>([])

// Auto-detect stream platform
const detectedPlatform = computed(() => {
  const url = form.value.streamUrl.toLowerCase()
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  } else if (url.includes('twitch.tv')) {
    return 'twitch'
  }
  return 'other'
})

// Go live function
const goLive = async () => {
  try {
    // Check authentication
    if (!user.value) {
      alert('Please log in to go live')
      await navigateTo('/auth/login')
      return
    }

    // Check for existing live stream
    await checkExistingLiveEvent()
    if (userLiveEvent.value) {
      alert('You already have a live stream running. Please end it before starting a new one.')
      await navigateTo(`/events/${userLiveEvent.value.id}`)
      return
    }

    // Basic validation
    if (!form.value.title.trim()) {
      alert('Please enter a title for your stream')
      return
    }

    if (!form.value.streamUrl.trim()) {
      alert('Please enter your stream URL')
      return
    }

    // Create the event data
    const now = new Date()
    const eventData: CreateEventData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || `Live stream from ${userProfile.value?.channelName || userProfile.value?.displayName}`,
      startDate: now,
      endDate: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours default
      category: 'internal',
      type: detectedPlatform.value as 'youtube' | 'twitch' | 'other',
      streamUrl: form.value.streamUrl.trim(),
      tags: tags.value,
      maxAttendees: undefined,
      maxParticipants: undefined
    }

    // Create the event
    const eventId = await createEventApi(eventData)
    
    // Success! Redirect to the live event
    await router.push(`/events/${eventId}`)
    
  } catch (err: any) {
    console.error('Failed to go live:', err)
  }
}

// Auto-fill some helpful defaults
onMounted(() => {
  if (userProfile.value) {
    // Suggest a default title based on time of day
    const hour = new Date().getHours()
    let timeOfDay = 'Live Stream'
    
    if (hour < 12) {
      timeOfDay = 'Morning Live Stream'
    } else if (hour < 17) {
      timeOfDay = 'Afternoon Live Stream'
    } else {
      timeOfDay = 'Evening Live Stream'
    }
    
    if (!form.value.title) {
      form.value.title = `${timeOfDay} with ${userProfile.value.channelName || userProfile.value.displayName}`
    }
  }
})
</script>