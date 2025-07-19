<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <!-- Layout with Sidebar -->
    <div class="flex">
      <!-- Channels Sidebar -->
      <ChannelsSidebar v-if="isAuthenticated" />
      
      <!-- Main Content -->
      <main :class="[
        'flex-1 transition-all duration-300',
        isAuthenticated ? 'ml-60' : 'ml-0'
      ]">
        <slot />
      </main>
    </div>
    
    <Footer :class="[
      'transition-all duration-300',
      isAuthenticated ? 'ml-60' : 'ml-0'
    ]" />
  </div>
</template>

<script setup lang="ts">
// Authentication state
const { isAuthenticated } = useAuth()

// Layout meta
// defineOgImageComponent('NuxtSeo', {
//   title: 'Slovakia Community - The Best Country to Live In',
//   description: 'Join our community events and live streams'
// })
</script>
