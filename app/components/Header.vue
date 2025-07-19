<script setup lang="ts">
const { user, logout } = useAuth();
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref();
onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false;
});
const handleLogout = async () => {
  await logout();
  userMenuOpen.value = false;
  await navigateTo("/");
};
</script>
<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-blue-600">
            🇸🇰 Slovakia Community
          </NuxtLink>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink
            to="/"
            class="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/events"
            class="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Events
          </NuxtLink>
          <NuxtLink
            to="/live"
            class="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Live Now
          </NuxtLink>

          <NuxtLink
            to="/admin/demo"
            class="text-gray-500 hover:text-blue-600 transition-colors text-sm"
          >
            Demo
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Authenticated User Menu -->
          <div v-if="user" class="flex items-center space-x-4">
            <NuxtLink
              to="/events/create"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </NuxtLink>

            <!-- User Menu -->

            <div class="relative" ref="userMenuRef">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <img
                  :src="user.photoURL || 'https://placehold.co/32x32'"
                  alt="User Avatar"
                  class="w-8 h-8 rounded-full"
                />
                <span class="hidden sm:block">{{ user.displayName }}</span>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <NuxtLink
                  to="/events/create"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="userMenuOpen = false"
                >
                  Create Event
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
          <div v-else class="flex items-center space-x-4">
            <NuxtLink
              to="/auth/login"
              class="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-700"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden py-4 border-t border-gray-200"
      >
        <div class="flex flex-col space-y-2">
          <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 py-2"
            >Home</NuxtLink
          >
          <NuxtLink to="/events" class="text-gray-700 hover:text-blue-600 py-2"
            >Events</NuxtLink
          >
          <NuxtLink to="/live" class="text-gray-700 hover:text-blue-600 py-2"
            >Live Now</NuxtLink
          >
          <NuxtLink
            to="/community"
            class="text-gray-700 hover:text-blue-600 py-2"
            >Community</NuxtLink
          >
        </div>
      </div>
    </nav>
  </header>
</template>
