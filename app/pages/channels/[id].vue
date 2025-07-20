<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !channelProfile" class="text-center py-20">
      <div class="text-red-500 mb-4">⚠️ Channel not found</div>
      <p class="text-gray-600 mb-6">{{ error || 'This channel does not exist or has been removed.' }}</p>
      <NuxtLink 
        to="/channels/discover"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Discover Other Channels
      </NuxtLink>
    </div>

    <!-- Channel Profile -->
    <div v-else>
      <!-- Channel Banner -->
      <div class="relative">
        <div 
          class="h-48 lg:h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-cover bg-center"
          :style="channelProfile.channelBanner ? `background-image: url(${channelProfile.channelBanner})` : ''"
        ></div>
        
        <!-- Channel Info Overlay -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-end space-x-6">
              <!-- Avatar -->
              <div class="relative">
                <img 
                  :src="channelProfile.photoURL || '/default-avatar.png'"
                  :alt="channelProfile.displayName"
                  class="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div 
                  v-if="channelProfile.isLive"
                  class="absolute -bottom-2 -right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                >
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>

              <!-- Channel Details -->
              <div class="flex-1 text-white pb-2">
                <h1 class="text-2xl lg:text-4xl font-bold mb-2">
                  {{ channelProfile.channelName || channelProfile.displayName }}
                </h1>
                <div class="flex items-center space-x-4 text-sm lg:text-base opacity-90">
                  <span>{{ channelProfile.followerCount }} followers</span>
                  <span v-if="channelProfile.lastLiveAt">
                    Last live {{ formatLastLive(channelProfile.lastLiveAt) }}
                  </span>
                </div>
              </div>

              <!-- Follow Button -->
              <div v-if="!isOwnChannel" class="pb-2">
                <button
                  @click="handleFollowToggle"
                  :disabled="followLoading"
                  :class="[
                    'px-6 py-3 rounded-lg font-medium transition-colors text-sm lg:text-base',
                    isFollowingChannel
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  ]"
                >
                  {{ followLoading ? 'Loading...' : isFollowingChannel ? 'Following' : 'Follow' }}
                </button>
              </div>

              <!-- Edit Channel Button (for own channel) -->
              <div v-else class="pb-2">
                <NuxtLink 
                  :to="`/channels/${channelId}/edit`"
                  class="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm lg:text-base"
                >
                  Edit Channel
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Channel Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2">
            <!-- About Section -->
            <div v-if="channelProfile.bio" class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ channelProfile.bio }}</p>
            </div>

            <!-- Current Live Stream -->
            <div v-if="currentLiveEvent" class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE NOW
                  </span>
                  <h2 class="text-xl font-semibold text-gray-900">{{ currentLiveEvent.title }}</h2>
                </div>
                
                <!-- Live Stream Embed -->
                <div class="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe 
                    v-if="currentLiveEvent.embedUrl"
                    :src="currentLiveEvent.embedUrl"
                    class="w-full h-full"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                  <div v-else class="w-full h-full flex items-center justify-center text-white">
                    <div class="text-center">
                      <div class="text-4xl mb-2">🔴</div>
                      <p>Live stream not embeddable</p>
                      <a 
                        v-if="currentLiveEvent.streamUrl"
                        :href="currentLiveEvent.streamUrl"
                        target="_blank"
                        class="mt-2 inline-block bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Watch on {{ getEventTypeLabel(currentLiveEvent.type) }}
                      </a>
                    </div>
                  </div>
                </div>
                
                <p class="text-gray-600 mb-4">{{ currentLiveEvent.description }}</p>
                
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span>👥 {{ currentLiveEvent.attendeeCount }} watching</span>
                  <span>📺 {{ getEventTypeLabel(currentLiveEvent.type) }}</span>
                </div>
              </div>
            </div>

            <!-- Recent Events -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
              
              <div v-if="channelEvents.length > 0" class="space-y-4">
                <div 
                  v-for="event in channelEvents" 
                  :key="event.id"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 mb-1">{{ event.title }}</h3>
                      <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ event.description }}</p>
                      <div class="flex items-center gap-4 text-xs text-gray-500">
                        <span 
                          :class="[
                            'px-2 py-1 rounded-full text-xs font-medium',
                            event.status === 'live' ? 'bg-red-100 text-red-800' :
                            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          ]"
                        >
                          {{ event.status.toUpperCase() }}
                        </span>
                        <span>{{ formatEventDate(event.startDate) }}</span>
                        <span>{{ getEventTypeLabel(event.type) }}</span>
                      </div>
                    </div>
                    <NuxtLink 
                      :to="`/events/${event.id}`"
                      class="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </NuxtLink>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-2">📅</div>
                <p class="text-gray-500">No events yet</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Social Links -->
            <div v-if="channelProfile.socialLinks" class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
              <div class="space-y-3">
                <a 
                  v-if="channelProfile.socialLinks.youtube"
                  :href="channelProfile.socialLinks.youtube"
                  target="_blank"
                  class="flex items-center text-red-600 hover:text-red-700"
                >
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
                
                <a 
                  v-if="channelProfile.socialLinks.twitch"
                  :href="channelProfile.socialLinks.twitch"
                  target="_blank"
                  class="flex items-center text-purple-600 hover:text-purple-700"
                >
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                  </svg>
                  Twitch
                </a>
                
                <a 
                  v-if="channelProfile.socialLinks.twitter"
                  :href="channelProfile.socialLinks.twitter"
                  target="_blank"
                  class="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
                
                <a 
                  v-if="channelProfile.website"
                  :href="channelProfile.website"
                  target="_blank"
                  class="flex items-center text-gray-600 hover:text-gray-700"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                  Website
                </a>
              </div>
            </div>

            <!-- Channel Stats -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Channel Stats</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Followers</span>
                  <span class="font-semibold">{{ formatNumber(channelProfile.followerCount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Events</span>
                  <span class="font-semibold">{{ channelEvents.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Joined</span>
                  <span class="font-semibold">{{ formatJoinDate(channelProfile.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, getDoc, getDocs, collection } from 'firebase/firestore'
import type { UserProfile } from '~/composables/useAuth'
import type { Event } from '~/types/event'

// Route params
const route = useRoute()
const channelId = route.params.id as string

// State
const channelProfile = ref<UserProfile | null>(null)
const channelEvents = ref<Event[]>([])
const currentLiveEvent = ref<Event | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const followLoading = ref(false)

// Composables
const { user } = useAuth()
const { getEvents } = useEvents()
const { toggleFollow, checkIsFollowing, isFollowing } = useFollowing()

// Computed
const isOwnChannel = computed(() => user.value?.uid === channelId)
const isFollowingChannel = computed(() => isFollowing.value.get(channelId) || false)

// Meta
useHead({
  title: computed(() => 
    channelProfile.value 
      ? `${channelProfile.value.channelName || channelProfile.value.displayName} - Slovakia Community`
      : 'Channel - Slovakia Community'
  ),
  meta: [
    { 
      name: 'description', 
      content: computed(() => 
        channelProfile.value?.bio || 'View this channel on Slovakia Community'
      )
    }
  ]
})

// Methods
const loadChannelProfile = async () => {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) throw new Error('Database not initialized')

    const userDoc = await getDoc(doc(nuxtApp.$db, 'users', channelId))
    if (!userDoc.exists()) {
      throw new Error('Channel not found')
    }

    const userData = userDoc.data()
    channelProfile.value = {
      id: channelId,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      bio: userData.bio,
      location: userData.location,
      website: userData.website,
      channelName: userData.channelName,
      channelBanner: userData.channelBanner,
      socialLinks: userData.socialLinks,
      followerCount: userData.followerCount || 0,
      followingCount: userData.followingCount || 0,
      isLive: userData.isLive || false,
      lastLiveAt: userData.lastLiveAt?.toDate(),
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate()
    }
  } catch (err: any) {
    error.value = err.message
    throw err
  }
}

const loadChannelEvents = async () => {
  try {
    const events = await getEvents()
    channelEvents.value = events.filter(event => event.organizerId === channelId)
    currentLiveEvent.value = channelEvents.value.find(event => event.status === 'live') || null
  } catch (err: any) {
    console.error('Failed to load channel events:', err)
  }
}

const handleFollowToggle = async () => {
  if (!user.value) {
    await navigateTo('/auth/login')
    return
  }

  try {
    followLoading.value = true
    await toggleFollow(channelId)
    
    // Refresh channel profile to get updated follower count
    await loadChannelProfile()
  } catch (err: any) {
    console.error('Failed to toggle follow:', err)
  } finally {
    followLoading.value = false
  }
}

const formatLastLive = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  } else {
    return 'recently'
  }
}

const formatEventDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatJoinDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long'
  }).format(date)
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getEventTypeLabel = (type: Event['type']): string => {
  const labels = {
    youtube: 'YouTube',
    twitch: 'Twitch',
    zoom: 'Zoom',
    meet: 'Google Meet',
    other: 'External'
  }
  return labels[type] || type
}

// Load data on mount
onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      loadChannelProfile(),
      loadChannelEvents()
    ])
    
    // Check follow status if user is logged in
    if (user.value && !isOwnChannel.value) {
      await checkIsFollowing(channelId)
    }
  } catch (err) {
    console.error('Failed to load channel:', err)
  } finally {
    loading.value = false
  }
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