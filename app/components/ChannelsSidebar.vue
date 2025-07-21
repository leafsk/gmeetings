<template>
  <aside 
    :class="[
      'bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out h-[calc(100vh-4rem)]',
      isCollapsed ? 'w-16' : 'w-60',
      'overflow-y-auto sticky top-16'
    ]"
  >
    <!-- Collapsed State: Avatar Bar -->
    <div v-if="isCollapsed" class="p-2">
      <!-- Collapse Toggle -->
      <button 
        @click="toggleSidebar"
        class="w-12 h-12 mb-4 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Expand sidebar"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <!-- Live Channel Avatars -->
      <div class="space-y-2">
        <NuxtLink
          v-for="channel in collapsedChannels"
          :key="channel.id"
          :to="channel.id === user?.uid && userLiveEvents.length > 0 ? `/events/${userLiveEvents[0].id}` : `/channels/${channel.id}`"
          class="block relative"
          :title="`${channel.channelName} - ${channel.id === user?.uid ? 'MY STREAM' : 'LIVE'}`"
        >
          <img 
            :src="channel.photoURL || '/default-avatar.png'"
            :alt="channel.displayName"
            :class="[
              'w-12 h-12 rounded-lg object-cover border-2',
              channel.id === user?.uid ? 'border-blue-500' : 'border-red-500'
            ]"
          />
          <div 
            :class="[
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full',
              channel.id === user?.uid ? 'bg-blue-500' : 'bg-red-500'
            ]"
          ></div>
        </NuxtLink>
      </div>
    </div>

    <!-- Expanded State: Full Sidebar -->
    <div v-else class="p-4">
      <!-- My Stream (if streaming) -->
      <div v-if="currentUserChannel" class="mb-6">
        <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">My Stream</div>
        <NuxtLink
          :to="userLiveEvents.length > 0 ? `/events/${userLiveEvents[0].id}` : '/dashboard'"
          class="flex items-center p-2 rounded hover:bg-blue-50 transition-colors group border border-blue-200"
        >
          <div class="relative">
            <img 
              :src="currentUserChannel.photoURL || '/default-avatar.png'"
              :alt="currentUserChannel.displayName"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="text-sm font-medium text-blue-900 truncate">
              {{ currentUserChannel.channelName }}
            </div>
            <div class="text-xs text-blue-600 font-medium">
              🔵 MY STREAM
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Channels Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-900 uppercase tracking-wide">Channels</h3>
          <div class="flex items-center gap-2">
            <button 
              @click="toggleCollapsed"
              class="text-gray-400 hover:text-gray-600"
              title="Collapse section"
            >
              <svg 
                :class="['w-4 h-4 transition-transform', { 'rotate-180': collapsed }]" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <button 
              @click="toggleSidebar"
              class="text-gray-400 hover:text-gray-600"
              title="Collapse sidebar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="!collapsed">
          <!-- Live Followed Channels -->
          <div v-if="liveChannels.length > 0" class="mb-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Live Now</div>
            <div class="space-y-1">
              <NuxtLink
                v-for="channel in liveChannels"
                :key="channel.id"
                :to="`/channels/${channel.id}`"
                class="flex items-center p-2 rounded hover:bg-gray-100 transition-colors group"
              >
                <div class="relative">
                  <img 
                    :src="channel.photoURL || '/default-avatar.png'"
                    :alt="channel.displayName"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ channel.channelName }}
                  </div>
                  <div class="text-xs text-red-600 font-medium">
                    🔴 LIVE
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Most Viewed Live Channels -->
          <div v-if="mostViewedChannels.length > 0" class="mb-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Most Viewed</div>
            <div class="space-y-1">
              <NuxtLink
                v-for="channel in mostViewedChannels"
                :key="channel.id"
                :to="`/channels/${channel.id}`"
                class="flex items-center p-2 rounded hover:bg-gray-100 transition-colors group"
              >
                <div class="relative">
                  <img 
                    :src="channel.photoURL || '/default-avatar.png'"
                    :alt="channel.displayName"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ channel.channelName }}
                  </div>
                  <div class="text-xs text-gray-600 flex items-center">
                    <span class="text-red-600 font-medium mr-2">🔴 LIVE</span>
                    <span>{{ channel.followerCount }} followers</span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Offline Followed Channels -->
          <div v-if="offlineChannels.length > 0">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Followed Offline</div>
            <div class="space-y-1">
              <NuxtLink
                v-for="channel in offlineChannels"
                :key="channel.id"
                :to="`/channels/${channel.id}`"
                class="flex items-center p-2 rounded hover:bg-gray-100 transition-colors group"
              >
                <img 
                  :src="channel.photoURL || '/default-avatar.png'"
                  :alt="channel.displayName"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-700 truncate">
                    {{ channel.channelName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getLastSeenText(channel.lastLiveAt) }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="followedChannels.length === 0 && mostViewedChannels.length === 0" class="text-center py-6">
            <div class="text-gray-400 text-3xl mb-2">👥</div>
            <p class="text-sm text-gray-500 mb-3">No channels to show</p>
            <NuxtLink 
              to="/channels/discover"
              class="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Discover Channels
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="border-t border-gray-200 pt-4">
        <NuxtLink 
          to="/channels/discover"
          class="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          Browse Channels
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ChannelInfo } from '~/composables/useFollowing'

// Props
interface Props {
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: true
})

// Emits
const emit = defineEmits<{
  toggleSidebar: []
}>()

// State
const collapsed = ref(false)
const isCollapsed = ref(false)
const { 
  followedChannels, 
  suggestedChannels,
  loadFollowedChannels, 
  loadSuggestedChannels,
  subscribeToFollowedChannels 
} = useFollowing()

const { getLiveEvents } = useEvents()

// Auth state to check if user is streaming
const { user, userProfile } = useAuth()

// Computed
const liveChannels = computed(() => 
  followedChannels.value.filter(channel => channel.isLive)
)

const offlineChannels = computed(() => 
  followedChannels.value.filter(channel => !channel.isLive)
)

// Check if current user has any live events
const userLiveEvents = ref([])

const checkUserLiveStatus = async () => {
  if (!user.value) {
    userLiveEvents.value = []
    return
  }
  
  try {
    const liveEvents = await getLiveEvents()
    userLiveEvents.value = liveEvents.filter(event => event.organizerId === user.value?.uid)
  } catch (error) {
    console.error('Failed to check user live events:', error)
    userLiveEvents.value = []
  }
}

// Current user's streaming status
const currentUserChannel = computed(() => {
  if (!user.value || userLiveEvents.value.length === 0) return null
  return {
    id: user.value.uid,
    channelName: userProfile.value?.channelName || userProfile.value?.displayName || user.value.displayName || 'My Channel',
    displayName: userProfile.value?.displayName || user.value.displayName || 'Me',
    photoURL: userProfile.value?.photoURL || user.value?.photoURL,
    isLive: true
  }
})

// Get most viewed channels (excluding followed and current user)
const mostViewedChannels = computed(() => {
  const followedIds = new Set(followedChannels.value.map(c => c.id))
  return suggestedChannels.value
    .filter(channel => 
      !followedIds.has(channel.id) && 
      channel.id !== user.value?.uid &&
      channel.isLive
    )
    .slice(0, 5) // Show top 5 most viewed live channels
})

// Channels to display in collapsed mode (avatars only)
const collapsedChannels = computed(() => {
  const channels = []
  
  // 1. Current user if streaming
  if (currentUserChannel.value) {
    channels.push(currentUserChannel.value)
  }
  
  // 2. Followed channels that are live
  channels.push(...liveChannels.value)
  
  // 3. Most viewed live channels
  channels.push(...mostViewedChannels.value)
  
  return channels.slice(0, 8) // Limit to 8 avatars in collapsed mode
})

// Methods
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggleSidebar')
}

const getLastSeenText = (lastLiveAt?: Date): string => {
  if (!lastLiveAt) return 'Never streamed'
  
  const now = new Date()
  const diffMs = now.getTime() - lastLiveAt.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`
  } else {
    return 'Just now'
  }
}

// Lifecycle
let unsubscribe: (() => void) | null = null
let liveCheckInterval: NodeJS.Timeout | null = null

onMounted(() => {
  loadFollowedChannels()
  loadSuggestedChannels(10) // Load top 10 most followed channels
  unsubscribe = subscribeToFollowedChannels()
  
  // Check user live status initially and periodically
  checkUserLiveStatus()
  liveCheckInterval = setInterval(checkUserLiveStatus, 30000) // Check every 30 seconds
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (liveCheckInterval) {
    clearInterval(liveCheckInterval)
  }
})

// Watch for user changes and check live status
watch(user, () => {
  checkUserLiveStatus()
}, { immediate: true })
</script>