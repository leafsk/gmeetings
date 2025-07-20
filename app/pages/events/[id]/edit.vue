<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading event...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">⚠️ Error loading event</div>
      <p class="text-gray-600">{{ error }}</p>
      <NuxtLink 
        to="/events"
        class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Events
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <div v-else-if="event">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink 
          :to="`/events/${event.id}`"
          class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Back to Event
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
            <p class="text-gray-600">
              Make changes to your live event.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Edit Form -->
      <form @submit.prevent="updateEvent" class="space-y-6">
        <!-- Event Title -->
        <div>
          <label for="title" class="block text-lg font-medium text-gray-900 mb-2">
            Event Title
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-lg font-medium text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <!-- Stream URL -->
        <div v-if="event.status === 'live'">
          <label for="streamUrl" class="block text-lg font-medium text-gray-900 mb-2">
            Stream URL
          </label>
          <input
            id="streamUrl"
            v-model="form.streamUrl"
            type="url"
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-6">
          <button
            type="submit"
            :disabled="updating"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ updating ? 'Updating...' : 'Update Event' }}
          </button>
          
          <button
            v-if="event.status === 'live'"
            type="button"
            @click="endEvent"
            :disabled="updating"
            class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            🛑 End Stream
          </button>
          
          <NuxtLink 
            :to="`/events/${event.id}`"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-block text-center"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

// Meta tags
useHead({
  title: 'Edit Event - Slovakia Community',
  meta: [
    { name: 'description', content: 'Edit your live event details' }
  ]
})

// Get route params
const route = useRoute()
const eventId = route.params.id as string

// State
const { getEvent, updateEvent: updateEventApi, loading, error } = useEvents()
const { user, isAuthenticated } = useAuth()
const event = ref<Event | null>(null)
const updating = ref(false)

// Form data
const form = ref({
  title: '',
  description: '',
  streamUrl: ''
})

// Load event data
const loadEvent = async () => {
  try {
    const eventData = await getEvent(eventId)
    if (!eventData) {
      throw new Error('Event not found')
    }
    
    // Check if user owns this event
    if (eventData.organizerId !== user.value?.uid) {
      throw new Error('You do not have permission to edit this event')
    }
    
    event.value = eventData
    
    // Populate form
    form.value = {
      title: eventData.title,
      description: eventData.description,
      streamUrl: eventData.streamUrl || ''
    }
  } catch (err: any) {
    error.value = err.message
  }
}

// Update event
const updateEvent = async () => {
  if (!event.value) return
  
  try {
    updating.value = true
    
    await updateEventApi(event.value.id, {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      streamUrl: form.value.streamUrl.trim() || undefined
    })
    
    // Redirect back to event
    await navigateTo(`/events/${event.value.id}`)
  } catch (err: any) {
    alert('Failed to update event: ' + err.message)
  } finally {
    updating.value = false
  }
}

// End event
const endEvent = async () => {
  if (!event.value) return
  if (!confirm('Are you sure you want to end this live stream?')) return
  
  try {
    updating.value = true
    
    await updateEventApi(event.value.id, {
      status: 'ended',
      endedAt: new Date()
    })
    
    // Redirect to event
    await navigateTo(`/events/${event.value.id}`)
  } catch (err: any) {
    alert('Failed to end event: ' + err.message)
  } finally {
    updating.value = false
  }
}

// Auth check and load event
onMounted(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }
  
  await loadEvent()
})
</script>