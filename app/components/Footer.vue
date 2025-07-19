<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-lg font-semibold mb-4">🇸🇰 Slovakia Community</h3>
          <p class="text-gray-300 mb-4">
            Building the best country to live in through community events, live
            streams, and shared stories.
          </p>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-4 uppercase">Community</h4>
          <ul class="space-y-2 text-gray-300">
            <li>
              <NuxtLink to="/events" class="hover:text-white">Events</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/live" class="hover:text-white"
                >Live Streams</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/stories" class="hover:text-white"
                >Stories</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- <div>
          <h4 class="text-sm font-semibold mb-4 uppercase">Support</h4>
          <ul class="space-y-2 text-gray-300">
            <li><NuxtLink to="/help" class="hover:text-white">Help Center</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-white">About</NuxtLink></li>
          </ul>
        </div> -->
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>
          &copy; 2025 Slovakia Community. Making Slovakia the best country to
          live in.
        </p>
      </div>
    </div>
  </footer>
</template>