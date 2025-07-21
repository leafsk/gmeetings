<template>
  <div 
    v-if="shouldShowChat"
    :class="[
      'bg-white flex flex-col',
      'h-full min-h-[400px]',
      'lg:border-l lg:border-gray-200',
      'border border-gray-200 lg:border-0 rounded-lg lg:rounded-none',
      isCollapsed ? 'w-12' : 'w-full lg:w-80 xl:w-96'
    ]"
  >
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-3 border-b border-gray-200 bg-purple-50">
      <div v-if="!isCollapsed" class="flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium text-purple-700">Twitch Chat</span>
        <span v-if="channelName" class="text-sm text-purple-600">
          #{{ channelName }}
        </span>
      </div>
      
      <!-- Collapse/Expand Button -->
      <button
        @click="toggleCollapse"
        class="p-1 rounded-md hover:bg-purple-100 text-purple-600 transition-colors"
        :title="isCollapsed ? 'Expand chat' : 'Collapse chat'"
      >
        <svg 
          v-if="isCollapsed" 
          class="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg 
          v-else 
          class="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Chat Content -->
    <div v-if="!isCollapsed" class="flex-1 relative">
      <!-- Loading State -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 flex items-center justify-center bg-white"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p class="text-sm text-gray-500">Loading chat...</p>
        </div>
      </div>

      <!-- Error State -->
      <div 
        v-else-if="error" 
        class="absolute inset-0 flex items-center justify-center bg-white p-4"
      >
        <div class="text-center">
          <div class="text-gray-400 text-4xl mb-2">💬</div>
          <p class="text-sm text-gray-600 mb-2">Chat unavailable</p>
          <p class="text-xs text-gray-500">{{ error }}</p>
          <button 
            @click="reloadChat"
            class="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>

      <!-- Twitch Chat Iframe -->
      <iframe
        v-else
        ref="chatFrame"
        :src="chatUrl"
        class="w-full h-full border-0"
        :title="`Twitch chat for ${channelName}`"
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        @load="onChatLoad"
        @error="onChatError"
      ></iframe>
    </div>

    <!-- Collapsed State Content -->
    <div v-else class="flex-1 flex items-center justify-center">
      <svg class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Chat Controls (when expanded) -->
    <div v-if="!isCollapsed" class="p-2 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ isLive ? '🔴 Live Chat' : 'Chat Replay' }}</span>
        <a 
          v-if="channelName"
          :href="`https://www.twitch.tv/${channelName}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-purple-600 hover:text-purple-700 font-medium"
        >
          Open on Twitch ↗
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  channelName?: string | null
  streamUrl?: string | null
  isLive?: boolean
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  channelName: null,
  streamUrl: null,
  isLive: false,
  show: true
})

// State
const isCollapsed = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const chatFrame = ref<HTMLIFrameElement | null>(null)

// Extract channel name from URL if not provided directly
const extractedChannelName = computed(() => {
  if (props.channelName) return props.channelName
  
  if (props.streamUrl) {
    const match = props.streamUrl.match(/twitch\.tv\/(\w+)/)
    return match ? match[1] : null
  }
  
  return null
})

const channelName = computed(() => extractedChannelName.value)

// Determine if chat should be shown
const shouldShowChat = computed(() => {
  return props.show && channelName.value && props.isLive
})

// Generate chat embed URL
const chatUrl = computed(() => {
  if (!channelName.value) return ''
  
  // Get the current domain for the parent parameter
  const parentDomain = process.client ? window.location.hostname : 'localhost'
  
  return `https://www.twitch.tv/embed/${channelName.value}/chat?parent=${parentDomain}&darkpopout`
})

// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  
  // Save preference to localStorage
  if (process.client) {
    localStorage.setItem('twitch-chat-collapsed', isCollapsed.value.toString())
  }
}

const onChatLoad = () => {
  isLoading.value = false
  error.value = null
}

const onChatError = () => {
  isLoading.value = false
  error.value = 'Failed to load Twitch chat. Please check your connection.'
}

const reloadChat = () => {
  isLoading.value = true
  error.value = null
  
  // Force reload the iframe
  if (chatFrame.value) {
    chatFrame.value.src = chatFrame.value.src
  }
}

// Load collapse preference from localStorage
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('twitch-chat-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  }
})

// Reset loading state when channel changes
watch(() => channelName.value, () => {
  if (channelName.value) {
    isLoading.value = true
    error.value = null
  }
})

// Expose methods for parent components
defineExpose({
  toggleCollapse,
  reloadChat,
  isCollapsed: readonly(isCollapsed)
})
</script>

<style scoped>
/* Ensure iframe fits properly */
iframe {
  min-height: 400px;
}

/* Mobile optimization */
@media (max-width: 1023px) {
  iframe {
    min-height: 60vh;
  }
}

/* Smooth transitions */
.transition-width {
  transition: width 0.2s ease-in-out;
}

/* Chat header styling */
.bg-purple-50 {
  background-color: #faf5ff;
}

/* Scrollbar styling for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c4b5fd;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a78bfa;
}
</style>