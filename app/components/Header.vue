<script setup lang="ts">
const { user, userProfile, logout } = useAuth();
const { getLiveEvents } = useEvents();
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref();
const imageError = ref(false);
const userLiveEvent = ref(null);

// Chat sidebar state
const { showChatSidebar, toggleChat } = useChat()

onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false;
});

const handleLogout = async () => {
  await logout();
  userMenuOpen.value = false;
  await navigateTo("/");
};

// Get user photo URL with fallbacks
const getUserPhotoURL = () => {
  if (imageError.value) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getFirstName())}&background=3b82f6&color=fff&size=32`;
  }
  
  // Try userProfile first (from Firestore), then Firebase user, then fallback
  return userProfile.value?.photoURL || 
         user.value?.photoURL || 
         `https://ui-avatars.com/api/?name=${encodeURIComponent(getFirstName())}&background=3b82f6&color=fff&size=32`;
};

// Extract first name from display name
const getFirstName = () => {
  const displayName = userProfile.value?.displayName || user.value?.displayName || 'User';
  return displayName.split(' ')[0];
};

// Handle image loading errors
const handleImageError = () => {
  imageError.value = true;
};

// Check for user's live events
const checkUserLiveEvent = async () => {
  if (!user.value) {
    userLiveEvent.value = null;
    return;
  }
  
  try {
    const liveEvents = await getLiveEvents();
    userLiveEvent.value = liveEvents.find(event => event.organizerId === user.value?.uid) || null;
  } catch (error) {
    console.error('Failed to check user live events:', error);
    userLiveEvent.value = null;
  }
};

// Computed properties for go live button
const isUserLive = computed(() => !!userLiveEvent.value);
const goLiveLabel = computed(() => isUserLive.value ? 'LIVE!' : '🔴 Go Live');
const goLiveClass = computed(() => 
  isUserLive.value 
    ? 'bg-red-600 text-white px-4 py-2 rounded-lg font-medium animate-pulse'
    : 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium'
);

const handleGoLive = () => {
  if (isUserLive.value && userLiveEvent.value) {
    // Navigate to the live event
    navigateTo(`/events/${userLiveEvent.value.id}`);
  } else {
    // Navigate to go live page
    navigateTo('/go-live');
  }
};

// Watch for user changes and check for live events
watch(user, () => {
  checkUserLiveEvent();
}, { immediate: true });

// Refresh live event status periodically
let liveCheckInterval: NodeJS.Timeout;
onMounted(() => {
  liveCheckInterval = setInterval(checkUserLiveEvent, 30000); // Check every 30 seconds
});

onUnmounted(() => {
  if (liveCheckInterval) {
    clearInterval(liveCheckInterval);
  }
});
</script>
<template>
  <header class="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-40">
    <nav class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-blue-600">
            🇸🇰 Slovakia Community
          </NuxtLink>
        </div>


        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Chat Toggle (for live events) -->
          <button 
            v-if="user && $route.path.includes('/events/')"
            @click="toggleChat"
            class="text-gray-500 hover:text-gray-700 p-2 transition-colors"
            :class="{ 'text-blue-600': showChatSidebar }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          <!-- Authenticated User Menu -->
          <div v-if="user" class="flex items-center space-x-2 md:space-x-3">
            <!-- Go Live Button - only show on larger screens -->
            <button
              @click="handleGoLive"
              :class="goLiveClass"
              class="hidden lg:flex items-center gap-2"
            >
              {{ goLiveLabel }}
            </button>
            
            <!-- Schedule Event Button - hide on small screens -->
            <NuxtLink
              to="/events/create"
              class="hidden md:flex border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm items-center"
            >
              Schedule Event
            </NuxtLink>

            <!-- User Menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center space-x-1 md:space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <img
                  :src="getUserPhotoURL()"
                  :alt="getFirstName()"
                  class="w-8 h-8 rounded-full object-cover"
                  @error="handleImageError"
                />
                <span class="hidden md:block text-sm">{{ getFirstName() }}</span>
                <svg class="w-4 h-4 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
              >
                <NuxtLink
                  :to="`/channels/${user.uid}`"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  My Channel
                </NuxtLink>
                <button
                  @click="handleGoLive; userMenuOpen = false"
                  :class="isUserLive ? 'block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 animate-pulse' : 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'"
                >
                  {{ goLiveLabel }}
                </button>
                <NuxtLink
                  to="/events/create"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  Schedule Event
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <!-- Guest User Menu -->
          <div v-else class="flex items-center space-x-2 md:space-x-4">
            <NuxtLink
              to="/auth/login"
              class="text-gray-700 hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Sign Up
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden ml-2">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-700 p-1"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden py-4 border-t border-gray-200 bg-white"
      >
        <div class="flex flex-col space-y-1">
          <!-- User-specific mobile menu items -->
          <template v-if="user">
            <div class="border-t border-gray-200 mt-2 pt-2">
              <button 
                @click="handleGoLive; mobileMenuOpen = false"
                :class="isUserLive ? 'flex items-center w-full text-left text-red-600 hover:bg-red-50 px-4 py-3 transition-colors font-medium animate-pulse' : 'flex items-center w-full text-left text-red-600 hover:bg-red-50 px-4 py-3 transition-colors font-medium'"
              >
                {{ goLiveLabel }}
              </button>
              <NuxtLink 
                to="/events/create" 
                class="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 py-3 transition-colors"
                @click="mobileMenuOpen = false"
              >
                Schedule Event
              </NuxtLink>
              <NuxtLink 
                :to="`/channels/${user.uid}`" 
                class="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 py-3 transition-colors"
                @click="mobileMenuOpen = false"
              >
                My Channel
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </template>
          
        </div>
      </div>
    </nav>
  </header>
</template>
