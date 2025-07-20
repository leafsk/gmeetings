<template>
  <div v-if="event" class="w-full">
    <!-- Back Button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-6">
      <NuxtLink 
        to="/events" 
        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Events
      </NuxtLink>
    </div>

    <!-- Live Event Layout -->
    <div v-if="event.status === 'live'">
      <!-- Top Event Info Banner -->
      <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </span>
          <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {{ getEventTypeLabel(event.type) }}
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {{ event.title }}
        </h1>
        <p class="text-gray-600 text-lg mb-4">
          {{ event.description }}
        </p>
        <p class="text-gray-600 text-sm">
          Organized by <span class="font-medium">{{ event.organizer }}</span>
        </p>
        
        <!-- Owner Controls -->
        <div v-if="isEventOwner" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="font-medium text-blue-900 mb-3">{{ event.status === 'live' ? 'Stream Owner Controls' : 'Event Owner Controls' }}</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-if="event.status === 'live'"
              @click="checkStreamStatusManually"
              :disabled="streamStatusChecking"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ streamStatusChecking ? 'Checking...' : '🔍 Check Stream Status' }}
            </button>
            <button
              v-if="event.status === 'live'"
              @click="endEvent"
              :disabled="endingEvent"
              class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ endingEvent ? 'Ending...' : '🛑 End Event' }}
            </button>
            <button
              v-if="event.status === 'ended' && !event.replayUrl"
              @click="showAddReplayModal = true"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              🔄 Add Replay Link
            </button>
            <NuxtLink
              :to="`/events/${event.id}/edit`"
              class="border border-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              ✏️ Edit Event
            </NuxtLink>
          </div>
          <p v-if="lastStreamCheck" class="text-xs text-blue-600 mt-2">
            Last checked: {{ lastStreamCheck.toLocaleTimeString() }}
          </p>
        </div>
      </div>

      <!-- Main Content Area (Video + Chat) -->
      <div class="flex flex-col lg:flex-row relative">
        <!-- Video Player -->
        <div class="w-full px-4 sm:px-6 lg:px-8">
          <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden w-full h-[60vh]">
            <iframe
              v-if="event.embedUrl"
              :src="getAutoplayEmbedUrl(event.embedUrl)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="w-full h-full"
            ></iframe>
            <div v-else class="flex items-center justify-center h-full text-gray-500">
              Video not available or embeddable.
            </div>
          </div>

          <!-- Action Buttons for Live -->
          <div class="mt-6 max-w-7xl mx-auto">
            <a 
              v-if="event.stageUrl"
              :href="event.stageUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 mb-3"
            >
              Join the Stage
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
            
            <!-- Smaller action buttons -->
            <div class="flex gap-2">
              <button 
                @click="shareEvent"
                class="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Share
              </button>
            </div>
          </div>

          <!-- Channel Description Section -->
          <div class="mt-8 max-w-7xl mx-auto">
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="flex items-start gap-4">
                <img 
                  :src="organizerProfile?.photoURL || '/default-avatar.png'"
                  :alt="event.organizer"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ organizerProfile?.channelName || event.organizer }}
                    </h3>
                    <span class="text-sm text-gray-500">
                      {{ organizerProfile?.followerCount || 0 }} followers
                    </span>
                  </div>
                  
                  <div v-if="organizerProfile?.bio" class="text-gray-700 text-sm leading-relaxed mb-3">
                    {{ organizerProfile.bio }}
                  </div>
                  <div v-else class="text-gray-500 text-sm italic mb-3">
                    This creator hasn't added a channel description yet.
                  </div>
                  
                  <!-- Social Links -->
                  <div v-if="organizerProfile?.socialLinks" class="flex gap-3">
                    <a 
                      v-if="organizerProfile.socialLinks.youtube"
                      :href="organizerProfile.socialLinks.youtube"
                      target="_blank"
                      class="text-red-600 hover:text-red-700 text-sm"
                    >
                      YouTube
                    </a>
                    <a 
                      v-if="organizerProfile.socialLinks.twitch"
                      :href="organizerProfile.socialLinks.twitch"
                      target="_blank"
                      class="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Twitch
                    </a>
                    <a 
                      v-if="organizerProfile.socialLinks.twitter"
                      :href="organizerProfile.socialLinks.twitter"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Twitter
                    </a>
                    <a 
                      v-if="organizerProfile.socialLinks.instagram"
                      :href="organizerProfile.socialLinks.instagram"
                      target="_blank"
                      class="text-pink-600 hover:text-pink-700 text-sm"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Non-Live Event Layout -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Event Header -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
              <span v-if="event.status === 'upcoming'" class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Upcoming
              </span>
              <span v-else-if="event.status === 'ended'" class="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Ended
              </span>
              <span v-if="event.status === 'ended' && event.replayUrl" class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Replay Available
              </span>
              <span v-else-if="event.status === 'adhoc'" class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Ad-hoc
              </span>
              
              <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {{ getEventTypeLabel(event.type) }}
              </span>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {{ event.title }}
            </h1>
            
            <p class="text-lg text-gray-600">
              {{ event.description }}
            </p>
          </div>

          <!-- Replay Video (for ended events with replay) -->
          <div v-if="event.status === 'ended' && event.replayEmbedUrl" class="mb-8">
            <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden w-full h-[60vh]">
              <iframe
                :src="event.replayEmbedUrl"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full h-full"
              ></iframe>
            </div>
            <div class="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div class="flex items-center gap-2 text-purple-800">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16a6 6 0 100-12 6 6 0 000 12zM8 4a1 1 0 011 1v5.586l2.707 2.707a1 1 0 01-1.414 1.414L7.586 12H7a1 1 0 01-1-1V5a1 1 0 011-1z"/>
                </svg>
                <span class="font-medium">Event Replay</span>
              </div>
              <p class="text-purple-700 text-sm mt-1">
                This is a recording of the live event that took place on {{ formatEventDate(event.startDate) }}
              </p>
            </div>
          </div>

          <!-- Event Thumbnail (if no live stream or replay) -->
          <div v-else-if="event.thumbnailUrl" class="mb-8">
            <img 
              :src="event.thumbnailUrl" 
              :alt="event.title"
              class="w-full aspect-video object-cover rounded-lg"
            />
          </div>

          <!-- External Link (for non-embeddable streams) -->
          <div v-if="event.externalLink && !event.isEmbeddable" class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 class="font-semibold text-blue-900 mb-2">Join External Event</h3>
            <p class="text-blue-700 mb-4">This event is hosted on an external platform.</p>
            <a 
              :href="event.externalLink" 
              target="_blank" 
              rel="noopener noreferrer"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              {{ event.status === 'live' ? 'Join Now' : 'View Event' }}
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>

          <!-- Replay Link (for ended events with external replay) -->
          <div v-if="event.status === 'ended' && event.replayUrl && !event.replayEmbedUrl" class="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <h3 class="font-semibold text-purple-900 mb-2">Watch Event Replay</h3>
            <p class="text-purple-700 mb-4">Rewatch this event that took place on {{ formatEventDate(event.startDate) }}.</p>
            <a 
              :href="event.replayUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              🔄 Watch Replay
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>

          <!-- Tags -->
          <div v-if="event.tags.length > 0" class="mb-8">
            <h3 class="font-semibold text-gray-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in event.tags" :key="tag" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <!-- Event Details -->
            <h3 class="font-semibold text-gray-900 mb-4">Event Details</h3>
            
            <div class="space-y-4">
              <!-- Date & Time -->
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ formatEventDate(event.startDate) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatEventTime(event.startDate, event.endDate) }}
                  </div>
                </div>
              </div>

              <!-- Organizer -->
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">{{ event.organizer }}</div>
                  <div class="text-sm text-gray-500">Organizer</div>
                </div>
              </div>

              <!-- Attendees -->
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ event.attendeeCount }} attending
                  </div>
                  <div v-if="event.maxAttendees" class="text-sm text-gray-500">
                    of {{ event.maxAttendees }} max
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 space-y-3">
              <button 
                v-if="event.status === 'upcoming'"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Join Event
              </button>
              
              <button 
                v-else-if="event.status === 'live'"
                class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Join Live Now
              </button>

              <a 
                v-else-if="event.status === 'ended' && event.replayUrl"
                :href="event.replayUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                🔄 Watch Replay
              </a>

              <button 
                @click="shareEvent"
                class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Share Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-500">Loading event details...</p>
  </div>

  <!-- Error State -->
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <div class="text-gray-400 text-6xl mb-4">😕</div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
    <p class="text-gray-600 mb-6">This event doesn't exist or has been removed.</p>
    <NuxtLink 
      to="/events" 
      class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      Browse All Events
    </NuxtLink>
  </div>

  <!-- End Event Confirmation Modal -->
  <ConfirmModal
    :show="showEndEventModal"
    title="End Live Event"
    message="Are you sure you want to end this live event? This action cannot be undone and will immediately stop the event for all viewers."
    icon="🛑"
    confirm-text="End Event"
    cancel-text="Keep Live"
    confirm-type="danger"
    :loading="endingEvent"
    @confirm="confirmEndEvent"
    @cancel="showEndEventModal = false"
  />

  <!-- Add Replay URL Modal -->
  <div 
    v-if="showAddReplayModal" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showAddReplayModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="text-center mb-6">
        <div class="text-4xl mb-3">🔄</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          Add Replay Link
        </h2>
        <p class="text-gray-600">
          Add a link to the recording of this event so viewers can watch it later.
        </p>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Replay URL
        </label>
        <input
          v-model="replayUrlInput"
          type="url"
          :placeholder="event?.type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : event?.type === 'twitch' ? 'https://www.twitch.tv/videos/...' : 'https://...'"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{ event?.type === 'youtube' ? 'YouTube video URLs usually stay the same after live stream ends' : event?.type === 'twitch' ? 'Twitch VOD URLs are different from live stream URLs' : 'Paste the URL where people can watch the recording' }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="showAddReplayModal = false"
          class="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveReplayUrl"
          :disabled="!replayUrlInput || savingReplay"
          class="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {{ savingReplay ? 'Saving...' : 'Save Replay' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from '~/types/event'

// Get route parameters
const route = useRoute()
const eventId = route.params.id as string

// State
const event = ref<Event | null>(null)
const loading = ref(true)
const organizerProfile = ref(null)

// Composables
const { getEvent, updateEvent } = useEvents()
const { user } = useAuth()
const { checkEventStatus, checkStreamStatus } = useStreamMonitor()

// Stream monitoring state
const streamStatusChecking = ref(false)
const lastStreamCheck = ref<Date | null>(null)
const endingEvent = ref(false)
const showEndEventModal = ref(false)
const showAddReplayModal = ref(false)
const replayUrlInput = ref('')
const savingReplay = ref(false)

// Meta
useHead({
  title: computed(() => 
    event.value 
      ? `${event.value.title} - Slovakia Community`
      : 'Event - Slovakia Community'
  ),
  meta: [
    { 
      name: 'description', 
      content: computed(() => 
        event.value?.description || 'View this event on Slovakia Community'
      )
    }
  ]
})

// Methods
const formatEventDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const formatEventTime = (startDate: Date, endDate: Date): string => {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`
}

const getEventTypeLabel = (type: Event['type']): string => {
  const labels = {
    youtube: 'YouTube Live',
    twitch: 'Twitch',
    zoom: 'Zoom Meeting',
    meet: 'Google Meet',
    other: 'External'
  }
  return labels[type] || type
}

const getAutoplayEmbedUrl = (embedUrl: string): string => {
  try {
    const url = new URL(embedUrl)
    
    // YouTube autoplay
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      url.searchParams.set('autoplay', '1')
      url.searchParams.set('mute', '1') // Required for autoplay in most browsers
    }
    
    // Twitch autoplay
    if (url.hostname.includes('twitch.tv')) {
      url.searchParams.set('autoplay', 'true')
      url.searchParams.set('muted', 'true')
    }
    
    return url.toString()
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to parse embed URL for autoplay:', error)
    return embedUrl
  }
}

// End event functions
const endEvent = () => {
  if (!event.value || !user.value) return
  showEndEventModal.value = true
}

const confirmEndEvent = async () => {
  if (!event.value) return
  
  try {
    endingEvent.value = true
    
    // Update event status to ended
    await updateEvent(event.value.id, {
      status: 'ended',
      endedAt: new Date()
    })
    
    // Reload the event to show updated status
    await loadEvent()
    
    showEndEventModal.value = false
  } catch (error) {
    console.error('Failed to end event:', error)
    // You could add a toast notification here instead of alert
  } finally {
    endingEvent.value = false
  }
}

const saveReplayUrl = async () => {
  if (!event.value || !replayUrlInput.value) return
  
  try {
    savingReplay.value = true
    
    await updateEvent(event.value.id, {
      replayUrl: replayUrlInput.value
    })
    
    // Reload the event to show the replay
    await loadEvent()
    
    showAddReplayModal.value = false
    replayUrlInput.value = ''
  } catch (error) {
    console.error('Failed to save replay URL:', error)
  } finally {
    savingReplay.value = false
  }
}

// Check if current user is the event owner
const isEventOwner = computed(() => {
  return event.value && user.value && event.value.organizerId === user.value.uid
})

// Manual stream status check for owners
const checkStreamStatusManually = async () => {
  if (!event.value || !event.value.streamUrl) return
  
  try {
    streamStatusChecking.value = true
    lastStreamCheck.value = new Date()
    
    const status = await checkStreamStatus(event.value.streamUrl, event.value.type)
    
    if (!status.isLive && status.isValid !== false) {
      const shouldEnd = confirm(
        'Your stream appears to be offline. Would you like to end this event?'
      )
      
      if (shouldEnd) {
        const wasEnded = await checkEventStatus(event.value.id)
        if (wasEnded) {
          // Reload the event to show updated status
          await loadEvent()
        }
      }
    } else if (status.isLive) {
      alert('Your stream is still live and running!')
    } else {
      alert('Could not verify stream status. Please check your stream manually.')
    }
  } catch (error) {
    console.error('Failed to check stream status:', error)
    alert('Failed to check stream status. Please try again.')
  } finally {
    streamStatusChecking.value = false
  }
}

// Load organizer profile
const loadOrganizerProfile = async (organizerId: string) => {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) return
    
    const { doc, getDoc } = await import('firebase/firestore')
    const userDoc = await getDoc(doc(nuxtApp.$db, 'users', organizerId))
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      organizerProfile.value = {
        id: organizerId,
        displayName: data.displayName,
        channelName: data.channelName,
        photoURL: data.photoURL,
        bio: data.bio,
        followerCount: data.followerCount || 0,
        socialLinks: data.socialLinks
      }
    }
  } catch (error) {
    console.error('Failed to load organizer profile:', error)
  }
}

// Share event function
const shareEvent = async () => {
  if (!event.value) return
  
  const shareData = {
    title: event.value.title,
    text: `Join this live event: ${event.value.title}`,
    url: `${window.location.origin}/events/${event.value.id}`
  }
  
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
        fallbackShare(shareData.url)
      }
    }
  } else {
    fallbackShare(shareData.url)
  }
}

// Fallback share function
const fallbackShare = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('Event link copied to clipboard!')
  } catch (err) {
    console.error('Clipboard write failed:', err)
    // Show a simple prompt with the URL
    prompt('Copy this link to share the event:', url)
  }
}

// Load event data
const loadEvent = async () => {
  try {
    loading.value = true
    const eventData = await getEvent(eventId)
    
    if (eventData) {
      event.value = eventData
      // Load organizer profile
      await loadOrganizerProfile(eventData.organizerId)
    } else {
      console.error('Event not found:', eventId)
      event.value = null
    }
  } catch (error) {
    console.error('Failed to load event:', error)
    event.value = null
  } finally {
    loading.value = false
  }
}

// Load event on mount
onMounted(() => {
  if (eventId) {
    loadEvent()
  }
})

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId && newId !== eventId) {
    loadEvent()
  }
})

</script>