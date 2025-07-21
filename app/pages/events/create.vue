<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink 
        to="/events" 
        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        ← Back to Events
      </NuxtLink>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Start Your Stream</h1>
          <p class="text-gray-600">
            Create a live event or schedule a future stream for your channel.
          </p>
        </div>
        <NuxtLink 
          to="/guide/hosting"
          class="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Hosting Guide
        </NuxtLink>
      </div>
      
      <!-- Channel Info -->
      <div v-if="userProfile" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center gap-4">
          <img 
            :src="userProfile.photoURL || '/default-avatar.png'"
            :alt="userProfile.displayName"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 class="font-semibold text-blue-900">
              Creating event for {{ userProfile.channelName || userProfile.displayName }}
            </h3>
            <p class="text-sm text-blue-700">
              {{ userProfile.followerCount }} followers will be notified when you go live
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Supported Platforms Info -->
    <SupportedPlatforms class="mb-8" />

    <!-- Form -->
    <form @submit.prevent="createEvent" class="space-y-8">
      <!-- Basic Information -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div class="grid grid-cols-1 gap-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              placeholder="Enter a descriptive title for your event"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="4"
              placeholder="Describe what your event is about and what attendees can expect"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Event Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
              Event Category *
            </label>
            <select
              id="category"
              v-model="form.category"
              required
              @change="onCategoryChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select event category</option>
              <option value="internal">Internal (Stream/Watch Together)</option>
              <option value="external">External (Meeting/Interactive)</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              Internal: Viewers watch your stream. External: Participants join your meeting.
            </p>
          </div>

          <!-- Event Type -->
          <div v-if="form.category">
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Platform *
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select platform</option>
              <template v-if="form.category === 'internal'">
                <option value="youtube">YouTube Live</option>
                <option value="twitch">Twitch Stream</option>
                <option value="facebook-live">Facebook Live</option>
                <option value="instagram-live">Instagram Live</option>
                <option value="tiktok-live">TikTok Live</option>
                <option value="discord">Discord Event</option>
                <option value="other">Other Streaming Platform</option>
              </template>
              <template v-else-if="form.category === 'external'">
                <option value="zoom">Zoom Meeting</option>
                <option value="teams">Microsoft Teams</option>
                <option value="meet">Google Meet</option>
                <option value="webex">WebEx Meeting</option>
                <option value="other">Other Meeting Platform</option>
              </template>
            </select>
          </div>
        </div>
      </div>

      <!-- Timing & Scheduling -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">When are you going live?</h2>
        
        <!-- Ad-hoc Option -->
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="isAdhoc"
              type="checkbox"
              @change="onAdhocChange"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm font-medium text-gray-900">
              🚀 Start a simple live event now (ad-hoc)
            </span>
          </label>
          <p class="text-sm text-gray-500 mt-1 ml-6">
            No scheduling needed. The event will be live immediately.
          </p>
        </div>

        <!-- Scheduled Time (when not ad-hoc) -->
        <div v-if="!isAdhoc" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Start Date -->
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time *
            </label>
            <input
              id="startDate"
              v-model="form.startDate"
              type="datetime-local"
              :required="!isAdhoc"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- End Date -->
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time *
            </label>
            <input
              id="endDate"
              v-model="form.endDate"
              type="datetime-local"
              :required="!isAdhoc"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Platform Information -->
      <div v-if="form.category" class="bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ form.category === 'internal' ? 'Stream Information' : 'Meeting Information' }}
        </h2>
        
        <div class="space-y-6">
          <!-- Internal Event Fields (Streaming) -->
          <template v-if="form.category === 'internal'">
            <!-- Stream URL -->
            <div>
              <label for="streamUrl" class="block text-sm font-medium text-gray-700 mb-1">
                Stream URL *
              </label>
              <input
                id="streamUrl"
                v-model="form.streamUrl"
                type="url"
                required
                placeholder="https://youtube.com/watch?v=..., https://twitch.tv/..., https://facebook.com/..., etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-sm text-gray-500 mt-1">
                Your live stream URL that audience will watch on our platform.
              </p>
            </div>
          </template>

          <!-- External Event Fields (Meetings) -->
          <template v-else-if="form.category === 'external'">
            <!-- Meeting Link (Simplified) -->
            <div>
              <label for="participantLink" class="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link *
              </label>
              <input
                id="participantLink"
                v-model="form.participantLink"
                type="url"
                required
                placeholder="https://zoom.us/j/..., https://teams.microsoft.com/..., https://meet.google.com/..., etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-sm text-gray-500 mt-1">
                The meeting link that participants will use to join the event.
              </p>
            </div>

            <!-- Optional Stream URL for meetings -->
            <div>
              <label for="streamUrl" class="block text-sm font-medium text-gray-700 mb-1">
                Live Stream URL (Optional)
              </label>
              <input
                id="streamUrl"
                v-model="form.streamUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... (if streaming the meeting for viewers)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-sm text-gray-500 mt-1">
                If you're also streaming your meeting live for viewers, add the stream URL here.
              </p>
            </div>
          </template>

          <!-- Thumbnail URL (Optional for all) -->
          <div>
            <label for="thumbnailUrl" class="block text-sm font-medium text-gray-700 mb-1">
              Event Thumbnail URL (Optional)
            </label>
            <input
              id="thumbnailUrl"
              v-model="form.thumbnailUrl"
              type="url"
              placeholder="https://example.com/image.jpg (we'll auto-generate if not provided)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-sm text-gray-500 mt-1">
              Custom thumbnail for your event. We'll automatically fetch one from your platform if not provided.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Settings</h2>
        
        <div class="space-y-6">
          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagInput
              v-model="form.tags"
              placeholder="community, tech, startup, networking"
              help-text="Add tags to help people find your event"
              :suggestions="['community', 'tech', 'startup', 'networking', 'business', 'education', 'entertainment', 'gaming', 'music', 'art']"
              :max-tags="5"
            />
          </div>

          <!-- Capacity Settings -->
          <div v-if="form.category === 'external'">
            <label for="maxParticipants" class="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants
            </label>
            <input
              id="maxParticipants"
              v-model.number="form.maxParticipants"
              type="number"
              min="1"
              placeholder="How many people can actively join the meeting?"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-sm text-gray-500 mt-1">
              Limit for people who can actively participate (speak, share screen, etc.)
            </p>
          </div>

          <div v-if="form.category">
            <label for="maxAttendees" class="block text-sm font-medium text-gray-700 mb-1">
              {{ form.category === 'internal' ? 'Maximum Viewers' : 'Maximum Audience' }}
            </label>
            <input
              id="maxAttendees"
              v-model.number="form.maxAttendees"
              type="number"
              min="1"
              :placeholder="form.category === 'internal' ? 'Leave empty for unlimited viewers' : 'Leave empty for unlimited audience'"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-sm text-gray-500 mt-1">
              {{ form.category === 'internal' 
                ? 'Limit for people watching your stream' 
                : 'Limit for people watching (not participating) in your event'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Creating Event...' : 'Create Event' }}
        </button>
        
        <NuxtLink
          to="/events"
          class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </NuxtLink>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="text-red-700">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CreateEventData } from '~/types/event'

// Meta tags
useHead({
  title: 'Create Event - Slovakia Community',
  meta: [
    { name: 'description', content: 'Create a new community event or live stream' }
  ]
})

// State  
const { createEvent: createEventApi, loading, error } = useEvents()
const { user, userProfile, isAuthenticated } = useAuth()
const router = useRouter()

// Redirect if not authenticated
watchEffect(() => {
  if (!isAuthenticated.value && !loading.value) {
    navigateTo('/auth/login')
  }
})

// Form data
const form = ref<CreateEventData>({
  title: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(),
  category: 'internal',
  type: 'youtube',
  streamUrl: '',
  participantLink: '',
  thumbnailUrl: '',
  tags: [],
  maxAttendees: undefined,
  maxParticipants: undefined
})

// Tags are now handled directly by the TagInput component

const isAdhoc = ref(false)

// Methods
const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const onAdhocChange = () => {
  if (isAdhoc.value) {
    form.value.startDate = new Date()
    form.value.endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours
  } else {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    form.value.startDate = oneHourLater
    form.value.endDate = twoHoursLater
  }
}

const onCategoryChange = () => {
  // Reset type when category changes
  form.value.type = ''
  // Reset URLs when switching categories
  form.value.streamUrl = ''
  form.value.participantLink = ''
}

// Set default times
onMounted(() => {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  
  form.value.startDate = oneHourLater
  form.value.endDate = twoHoursLater
})

// Create event
const createEvent = async () => {
  try {
    // Check authentication first
    if (!user.value) {
      alert('Please log in to create events')
      await navigateTo('/auth/login')
      return
    }

    // Validate form
    if (!form.value.title || !form.value.description || !form.value.category || !form.value.type) {
      alert('Please fill in all required fields')
      return
    }

    // Category-specific validation
    if (form.value.category === 'internal') {
      if (!form.value.streamUrl) {
        alert('Stream URL is required for streaming events')
        return
      }
    } else if (form.value.category === 'external') {
      if (!form.value.participantLink) {
        alert('Meeting link is required for meeting events')
        return
      }
    }

    // Date validation for scheduled events
    if (!isAdhoc.value) {
      const startDate = new Date(form.value.startDate)
      const endDate = new Date(form.value.endDate)

      if (endDate <= startDate) {
        alert('End time must be after start time')
        return
      }
    }

    // Create event data with proper Date objects and field mapping
    const eventData = {
      ...form.value,
      // Map participantLink to stageUrl for backend compatibility
      stageUrl: form.value.participantLink,
      startDate: isAdhoc.value ? new Date() : new Date(form.value.startDate),
      endDate: isAdhoc.value ? new Date(new Date().getTime() + 24 * 60 * 60 * 1000) : new Date(form.value.endDate),
      status: isAdhoc.value ? 'adhoc' : 'upcoming'
    }

    const eventId = await createEventApi(eventData as CreateEventData)
    
    // Show success message
    if (isAdhoc.value) {
      alert('🎉 Your event is now live! Redirecting to event page...')
    } else {
      alert('✅ Event scheduled successfully! Your followers will be notified.')
    }
    
    // Redirect to the created event
    await router.push(`/events/${eventId}`)
  } catch (err: any) {
    console.error('Failed to create event:', err)
    alert(`Failed to create event: ${err.message || 'Unknown error'}`)
  }
}
</script>