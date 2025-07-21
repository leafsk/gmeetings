<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <button
      @click="toggleCollapsed"
      class="w-full flex items-center justify-between text-left group"
    >
      <h2 class="text-lg font-semibold text-blue-900">
        📺 Supported Platforms
      </h2>
      <svg
        :class="[
          'w-5 h-5 text-blue-700 transition-transform duration-200',
          isCollapsed ? 'rotate-0' : 'rotate-180',
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-show="!isCollapsed"
      class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-200"
    >
      <!-- Streaming Platforms -->
      <div>
        <h3 class="font-medium text-blue-800 mb-3">Live Streaming</h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>YouTube Live</strong> - Full embed + chat support</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Twitch</strong> - Full embed + live chat
              integration</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Facebook Live</strong> - Public stream embedding</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Instagram Live</strong> - Limited embedding</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-black rounded-full"></span>
            <span class="text-blue-700"
              ><strong>TikTok Live</strong> - Basic support</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Discord</strong> - Community events</span
            >
          </div>
        </div>
      </div>

      <!-- Meeting Platforms -->
      <div>
        <h3 class="font-medium text-blue-800 mb-3">Meetings & Webinars</h3>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Zoom</strong> - Meetings & webinars</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-600 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Microsoft Teams</strong> - Live events</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-600 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Google Meet</strong> - Video meetings</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>WebEx</strong> - Webinars & meetings</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
            <span class="text-blue-700"
              ><strong>Other</strong> - Any other platform</span
            >
          </div>
        </div>
      </div>
      <!-- Pro tip -->
    </div>
    <div class="mt-4 p-3 bg-blue-100 rounded-lg">
      <div class="flex items-start gap-2">
        <svg
          class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-blue-800 text-sm">
          <strong>Pro tip:</strong> For streaming platforms, we'll automatically
          fetch thumbnails and enable live features like chat. For meetings,
          provide the participant link that people can join directly.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  initiallyCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initiallyCollapsed: true,
});

// State for collapsible functionality
const isCollapsed = ref(props.initiallyCollapsed);

// Toggle collapsed state
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Load preference from localStorage on mount
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem("supported-platforms-collapsed");
    if (saved !== null) {
      isCollapsed.value = saved === "true";
    }
  }
});

// Save preference to localStorage when toggled
watch(isCollapsed, (newValue) => {
  if (process.client) {
    localStorage.setItem("supported-platforms-collapsed", newValue.toString());
  }
});
</script>
