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
          v-for="channel in liveChannels"
          :key="channel.id"
          :to="`/channels/${channel.id}`"
          class="block relative"
          :title="`${channel.channelName} - LIVE`"
        >
          <img 
            :src="channel.photoURL || '/default-avatar.png'"
            :alt="channel.displayName"
            class="w-12 h-12 rounded-lg object-cover border-2 border-red-500"
          />
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
        </NuxtLink>
      </div>
    </div>

    <!-- Expanded State: Full Sidebar -->
    <div v-else class="p-4">
      <!-- Followed Channels Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-900 uppercase tracking-wide">Followed Channels</h3>
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
          <!-- Live Channels -->
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

          <!-- Offline Channels -->
          <div v-if="offlineChannels.length > 0">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Offline</div>
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
          <div v-if="followedChannels.length === 0" class="text-center py-6">
            <div class="text-gray-400 text-3xl mb-2">👥</div>
            <p class="text-sm text-gray-500 mb-3">No followed channels yet</p>
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
  loadFollowedChannels, 
  subscribeToFollowedChannels 
} = useFollowing()

// Computed
const liveChannels = computed(() => 
  followedChannels.value.filter(channel => channel.isLive)
)

const offlineChannels = computed(() => 
  followedChannels.value.filter(channel => !channel.isLive)
)

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

onMounted(() => {
  loadFollowedChannels()
  unsubscribe = subscribeToFollowedChannels()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>