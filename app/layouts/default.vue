<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <!-- Layout with Sidebars -->
    <div class="flex min-h-[calc(100vh-4rem)]">
      <!-- Left Channels Sidebar - hidden on mobile -->
      <ChannelsSidebar 
        v-if="isAuthenticated" 
        class="hidden lg:block"
        @toggle-sidebar="toggleLeftSidebar"
      />
      
      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <slot />
      </main>
      
      <!-- Right Chat Sidebar - only show on event pages -->
      <ChatSidebar 
        v-if="isEventPage && showChatSidebar"
        :show="showChatSidebar"
        :chat-embed-url="chatEmbedUrl"
        :chat-type="chatType"
        :viewer-count="viewerCount"
        :event-id="currentEventId"
        @close="closeChat"
        @toggle="toggleChat"
      />
      
      <!-- Chat Toggle Button (when hidden) - positioned over content -->
      <button 
        v-if="isEventPage && !showChatSidebar && currentEventId" 
        @click="toggleChat"
        class="hidden lg:block fixed right-4 top-20 bg-white border border-gray-200 rounded-lg p-3 shadow-lg hover:bg-gray-50 transition-colors z-30"
        title="Show chat"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Authentication state
const { isAuthenticated } = useAuth()

// Router state
const route = useRoute()

// Check if we're on an event page
const isEventPage = computed(() => {
  return route.path.startsWith('/events/') && route.params.id
})

// Chat sidebar state
const { showChatSidebar, chatEmbedUrl, chatType, viewerCount, currentEventId, closeChat, toggleChat } = useChat()

// Left sidebar state
const leftSidebarCollapsed = ref(false)

// Close chat when navigating away from event pages
watch(isEventPage, (newValue) => {
  if (!newValue) {
    closeChat()
  }
})

// Methods
const toggleLeftSidebar = () => {
  leftSidebarCollapsed.value = !leftSidebarCollapsed.value
}

// Layout meta
// defineOgImageComponent('NuxtSeo', {
//   title: 'Slovakia Community - The Best Country to Live In',
//   description: 'Join our community events and live streams'
// })
</script>
