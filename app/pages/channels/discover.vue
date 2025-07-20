<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Discover Channels</h1>
      <p class="text-gray-600 mb-6">
        Follow currently active streamers and creators with upcoming events.
      </p>
      
      <!-- Search Bar -->
      <div class="relative max-w-md">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search channels..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button 
        v-for="filter in filters" 
        :key="filter.key"
        @click="activeFilter = filter.key"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          activeFilter === filter.key
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        ]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading channels...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">⚠️ Error loading channels</div>
      <p class="text-gray-600">{{ error }}</p>
      <button 
        @click="loadChannels"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Channels Grid -->
    <div v-else>
      <div v-if="filteredChannels.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="channel in filteredChannels" 
          :key="channel.id"
          class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Channel Banner/Avatar -->
          <div class="relative">
            <div 
              class="h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-cover bg-center"
              :style="channel.channelBanner ? `background-image: url(${channel.channelBanner})` : ''"
            ></div>
            
            <!-- Avatar -->
            <div class="absolute -bottom-6 left-4">
              <div class="relative">
                <img 
                  :src="channel.photoURL || '/default-avatar.png'"
                  :alt="channel.displayName"
                  class="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
                />
                <div 
                  v-if="channel.isLive"
                  class="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"
                ></div>
              </div>
            </div>

            <!-- Status Indicators -->
            <div class="absolute top-2 right-2 flex flex-col gap-1">
              <div 
                v-if="channel.isLive"
                class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
              >
                <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div 
                v-else-if="channel.hasUpcomingEvents"
                class="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
              >
                📅 SCHEDULED
              </div>
            </div>
          </div>

          <!-- Channel Info -->
          <div class="p-4 pt-8">
            <div class="mb-3">
              <h3 class="font-semibold text-lg text-gray-900 truncate">
                {{ channel.channelName || channel.displayName }}
              </h3>
              <p class="text-sm text-gray-600">{{ channel.displayName }}</p>
            </div>

            <p 
              v-if="channel.bio" 
              class="text-sm text-gray-600 mb-3 line-clamp-2"
            >
              {{ channel.bio }}
            </p>

            <!-- Categories -->
            <div v-if="channel.categories && channel.categories.length > 0" class="mb-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="category in channel.categories.slice(0, 3)"
                  :key="category"
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ category }}
                </span>
                <span
                  v-if="channel.categories.length > 3"
                  class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  +{{ channel.categories.length - 3 }}
                </span>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{{ formatNumber(channel.followerCount) }} followers</span>
              <span v-if="channel.lastLiveAt">
                {{ getLastSeenText(channel.lastLiveAt) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <NuxtLink 
                :to="`/channels/${channel.id}`"
                class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium text-center hover:bg-gray-200 transition-colors"
              >
                View Channel
              </NuxtLink>
              
              <button
                v-if="!isOwnChannel(channel.id)"
                @click="handleFollowToggle(channel.id)"
                :disabled="followLoading.has(channel.id)"
                :class="[
                  'px-4 py-2 rounded text-sm font-medium transition-colors',
                  isFollowing.get(channel.id)
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                ]"
              >
                {{ followLoading.has(channel.id) ? '...' : isFollowing.get(channel.id) ? 'Following' : 'Follow' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No channels found' : 'No channels available' }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{ searchQuery 
            ? 'Try adjusting your search terms or explore different categories'
            : 'Be the first to create content in the Slovakia community!'
          }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear Search
          </button>
          <NuxtLink 
            to="/events/create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Creating
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import type { UserProfile } from '~/composables/useAuth'

// Meta
useHead({
  title: 'Discover Channels - Slovakia Community',
  meta: [
    { name: 'description', content: 'Discover amazing content creators and channels in the Slovakia community' }
  ]
})

// State
const searchQuery = ref('')
const activeFilter = ref('active')
const channels = ref<UserProfile[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const followLoading = ref<Set<string>>(new Set())

// Composables
const { user } = useAuth()
const { 
  toggleFollow, 
  checkIsFollowing, 
  isFollowing,
  loadSuggestedChannels,
  suggestedChannels 
} = useFollowing()

// Filters
const filters = [
  { key: 'active', label: 'Active Streamers' },
  { key: 'live', label: 'Live Now' },
  { key: 'scheduled', label: 'Has Upcoming Events' },
  { key: 'popular', label: 'Most Followers' }
]

// Computed
const filteredChannels = computed(() => {
  let filtered = channels.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(channel => 
      (channel.channelName || channel.displayName).toLowerCase().includes(query) ||
      channel.bio?.toLowerCase().includes(query) ||
      channel.displayName.toLowerCase().includes(query) ||
      channel.categories?.some(cat => cat.toLowerCase().includes(query))
    )
  }

  // Apply category filter
  switch (activeFilter.value) {
    case 'live':
      filtered = filtered.filter(channel => channel.isLive)
      break
    case 'scheduled':
      filtered = filtered.filter(channel => channel.hasUpcomingEvents)
      break
    case 'popular':
      filtered = filtered.sort((a, b) => b.followerCount - a.followerCount)
      break
    case 'active':
    default:
      // Show only users who are live or have streamed recently or have upcoming events
      filtered = filtered.filter(channel => 
        channel.isLive || 
        channel.hasUpcomingEvents ||
        (channel.lastLiveAt && isRecentlyActive(channel.lastLiveAt))
      )
      // Sort by live status first, then by follower count
      filtered = filtered.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        return b.followerCount - a.followerCount
      })
  }

  return filtered
})

// Methods
const loadChannels = async () => {
  try {
    loading.value = true
    error.value = null

    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) throw new Error('Database not initialized')

    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(nuxtApp.$db, 'users'))
    const channelList: UserProfile[] = []

    // Get events to check for upcoming events per user
    const eventsSnapshot = await getDocs(collection(nuxtApp.$db, 'events'))
    const upcomingEventsByUser = new Map<string, boolean>()
    
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data()
      const eventDate = eventData.scheduledAt?.toDate()
      if (eventDate && eventDate > new Date()) {
        upcomingEventsByUser.set(eventData.organizerId, true)
      }
    })

    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      const userId = doc.id

      

      channelList.push({
        id: userId,
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
        hasUpcomingEvents: upcomingEventsByUser.get(userId) || false,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date()
      })
    })

    channels.value = channelList

    // Load follow status for all channels if user is logged in
    if (user.value) {
      for (const channel of channelList) {
        await checkIsFollowing(channel.id)
      }
    }
  } catch (err: any) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  // Search is handled by computed property
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
}

const isOwnChannel = (channelId: string): boolean => {
  return user.value?.uid === channelId
}

const handleFollowToggle = async (channelId: string) => {
  if (!user.value) {
    await navigateTo('/auth/login')
    return
  }

  try {
    followLoading.value.add(channelId)
    await toggleFollow(channelId)
    
    // Update the channel's follower count locally
    const channel = channels.value.find(c => c.id === channelId)
    if (channel) {
      const isNowFollowing = isFollowing.value.get(channelId)
      channel.followerCount += isNowFollowing ? 1 : -1
    }
  } catch (err: any) {
    console.error('Failed to toggle follow:', err)
  } finally {
    followLoading.value.delete(channelId)
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getLastSeenText = (lastLiveAt?: Date): string => {
  if (!lastLiveAt) return 'Never streamed'
  
  const now = new Date()
  const diffMs = now.getTime() - lastLiveAt.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ago`
  } else {
    return 'Recently'
  }
}

const isRecentlyActive = (lastLiveAt: Date): boolean => {
  const now = new Date()
  const diffMs = now.getTime() - lastLiveAt.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays <= 7 // Consider active if streamed within last 7 days
}

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Load channels on mount
onMounted(() => {
  loadChannels()
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