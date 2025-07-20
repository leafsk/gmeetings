<template>
  <aside 
    v-if="show" 
    class="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col shadow-lg h-[calc(100vh-4rem)] sticky top-16"
  >
    <!-- Chat Header -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-900">Live Chat</h3>
        <p class="text-sm text-gray-500">{{ viewerCount }} viewers</p>
      </div>
      <button 
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 p-1"
        title="Hide chat"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Chat Content -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- External Embedded Chat (YouTube/Twitch) -->
      <div v-if="chatType === 'external' && chatEmbedUrl" class="flex-1">
        <iframe
          :src="chatEmbedUrl"
          frameborder="0"
          class="w-full h-full"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>

      <!-- Firebase Chat -->
      <FirebaseChat 
        v-else-if="chatType === 'firebase' && eventId"
        :event-id="eventId"
        class="flex-1"
      />

      <!-- Fallback: Custom Chat (when no embed available) -->
      <div v-else class="flex-1 flex flex-col">
        <!-- Chat Messages -->
        <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div class="space-y-3">
            <!-- Sample messages for now -->
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                J
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm">John</span>
                  <span class="text-xs text-gray-500">2 min ago</span>
                </div>
                <p class="text-sm text-gray-700">Great stream! Thanks for sharing 👍</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                M
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm">Maria</span>
                  <span class="text-xs text-gray-500">1 min ago</span>
                </div>
                <p class="text-sm text-gray-700">This is exactly what I was looking for! 🎉</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm">Alex</span>
                  <span class="text-xs text-gray-500">30 sec ago</span>
                </div>
                <p class="text-sm text-gray-700">Can you share the link you mentioned?</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t border-gray-200">
          <div v-if="isAuthenticated" class="flex gap-2">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div v-else class="text-center">
            <p class="text-sm text-gray-500 mb-3">Sign in to join the chat</p>
            <NuxtLink
              to="/auth/login"
              class="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Settings -->
    <div class="p-3 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Community Guidelines</span>
        <button class="hover:text-gray-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
// Props
interface Props {
  show?: boolean
  chatEmbedUrl?: string | null
  chatType?: 'external' | 'firebase'
  viewerCount?: number
  eventId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  chatEmbedUrl: null,
  chatType: 'external',
  viewerCount: 0,
  eventId: null
})

// Emits
const emit = defineEmits<{
  close: []
  toggle: []
}>()

// Auth state
const { isAuthenticated } = useAuth()

// Local state
const newMessage = ref('')

// Methods
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  // TODO: Implement real chat functionality
  console.log('Sending message:', newMessage.value)
  newMessage.value = ''
}
</script>