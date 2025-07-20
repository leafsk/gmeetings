<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Chat Header -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <h3 class="font-semibold text-gray-900">Live Chat</h3>
      <p class="text-sm text-gray-600">Join the conversation</p>
    </div>

    <!-- Messages Area -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3"
      style="max-height: calc(100vh - 200px);"
    >
      <!-- Loading State -->
      <div v-if="loading && messages.length === 0" class="text-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-500 text-sm mt-2">Loading chat...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-500 text-sm">Failed to load chat</p>
        <button 
          @click="retry"
          class="text-blue-600 text-sm hover:underline mt-1"
        >
          Try again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="text-center py-8">
        <div class="text-gray-400 text-4xl mb-2">💬</div>
        <p class="text-gray-500 text-sm">No messages yet</p>
        <p class="text-gray-400 text-xs">Be the first to say something!</p>
      </div>

      <!-- Messages -->
      <div v-else class="space-y-3">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="flex gap-3"
        >
          <img 
            :src="message.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.username)}&background=3b82f6&color=fff&size=32`"
            :alt="message.username"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="font-medium text-sm text-gray-900 truncate">
                {{ message.username }}
              </span>
              <span class="text-xs text-gray-500 flex-shrink-0">
                {{ formatTime(message.timestamp) }}
              </span>
            </div>
            <p class="text-sm text-gray-700 break-words">
              {{ message.text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <form @submit.prevent="handleSendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          :disabled="!user || sendingMessage"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          maxlength="500"
        />
        <button
          type="submit"
          :disabled="!canSendMessage"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Send
        </button>
      </form>
      
      <!-- Login prompt -->
      <div v-if="!user" class="mt-2 text-center">
        <NuxtLink 
          to="/auth/login" 
          class="text-blue-600 hover:text-blue-700 text-sm"
        >
          Sign in to chat
        </NuxtLink>
      </div>
      
      <!-- Message count -->
      <div v-else class="mt-2 text-xs text-gray-500 text-center">
        {{ newMessage.length }}/500 characters
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  eventId: string
}

const props = defineProps<Props>()

// Composables
const { user } = useAuth()
const { 
  messages, 
  loading, 
  error, 
  sendMessage, 
  subscribeToMessages, 
  stopSubscription 
} = useFirebaseChat()

// State
const newMessage = ref('')
const sendingMessage = ref(false)
const messagesContainer = ref<HTMLElement>()

// Computed
const canSendMessage = computed(() => {
  return user.value && 
         newMessage.value.trim().length > 0 && 
         newMessage.value.trim().length <= 500 && 
         !sendingMessage.value
})

// Methods
const handleSendMessage = async () => {
  if (!canSendMessage.value) return
  
  try {
    sendingMessage.value = true
    await sendMessage(props.eventId, newMessage.value)
    newMessage.value = ''
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sendingMessage.value = false
  }
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const retry = () => {
  stopSubscription()
  subscribeToMessages(props.eventId)
}

// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Start chat subscription
onMounted(() => {
  subscribeToMessages(props.eventId)
})

// Cleanup on unmount
onUnmounted(() => {
  stopSubscription()
})

// Cleanup when event changes
watch(() => props.eventId, (newEventId, oldEventId) => {
  if (newEventId !== oldEventId) {
    stopSubscription()
    if (newEventId) {
      subscribeToMessages(newEventId)
    }
  }
})
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>