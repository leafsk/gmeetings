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
      </div>

      <!-- Main Content Area (Video + Chat) -->
      <div class="flex flex-col lg:flex-row relative">
        <!-- Video Player -->
        <div :class="[showChatPanel ? 'lg:w-[calc(100%-320px)]' : 'lg:w-full', 'w-full', 'px-4 sm:px-6 lg:px-8']">
          <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden w-full h-[60vh]">
            <iframe
              v-if="event.embedUrl"
              :src="event.embedUrl"
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
          <div class="mt-6 space-y-3 max-w-7xl mx-auto">
            <a 
              v-if="event.stageUrl"
              :href="event.stageUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              Join the Stage
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
            <button class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Share Event
            </button>
            <button 
              @click="showChatPanel = !showChatPanel"
              class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {{ showChatPanel ? 'Hide Chat' : 'Show Chat' }}
            </button>
          </div>
        </div>

        <!-- Chat Sidebar -->
        <div v-if="showChatPanel" class="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-20">
          <div class="p-4 h-full flex flex-col">
            <h3 class="font-semibold text-gray-900 mb-3">Live Chat</h3>
            <div class="flex-grow bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                v-if="chatEmbedUrl"
                :src="chatEmbedUrl"
                frameborder="0"
                class="w-full h-full"
              ></iframe>
              <div v-else class="flex items-center justify-center h-full text-gray-500 text-center p-4">
                Chat not available for this platform or custom chat coming soon!
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

          <!-- Event Thumbnail (if no live stream) -->
          <div v-if="event.thumbnailUrl" class="mb-8">
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

              <button class="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
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
</template>