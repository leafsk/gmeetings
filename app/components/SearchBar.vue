<template>
  <div class="relative" ref="searchContainer">
    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="query"
        @input="handleInput"
        @focus="showSuggestions = true"
        @keydown="handleKeydown"
        type="text"
        :placeholder="placeholder"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      
      <!-- Clear button -->
      <button
        v-if="query"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Search Suggestions Dropdown -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || popularTags.length > 0)"
      class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
    >
      <!-- Recent/Query Suggestions -->
      <div v-if="suggestions.length > 0">
        <div class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          Suggestions
        </div>
        <button
          v-for="(suggestion, index) in suggestions"
          :key="`suggestion-${index}`"
          @click="selectSuggestion(suggestion)"
          :class="[
            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center',
            selectedIndex === index ? 'bg-blue-50' : ''
          ]"
        >
          <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{{ suggestion }}</span>
        </button>
      </div>

      <!-- Popular Tags -->
      <div v-if="popularTags.length > 0 && (!query || query.length < 2)">
        <div class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-100">
          Popular Tags
        </div>
        <button
          v-for="(tag, index) in popularTags.slice(0, 5)"
          :key="`tag-${index}`"
          @click="selectSuggestion(tag.tag)"
          :class="[
            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between',
            selectedIndex === suggestions.length + index ? 'bg-blue-50' : ''
          ]"
        >
          <div class="flex items-center">
            <svg class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{{ tag.tag }}</span>
          </div>
          <span class="text-xs text-gray-400">{{ tag.count }}</span>
        </button>
      </div>

      <!-- No results -->
      <div v-if="query && query.length >= 2 && suggestions.length === 0" class="px-3 py-2 text-sm text-gray-500">
        No suggestions found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  autofocus?: boolean
}

interface Emits {
  (e: 'search', query: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search events, organizers, tags...',
  autofocus: false
})

const emit = defineEmits<Emits>()

// State
const query = ref('')
const showSuggestions = ref(false)
const selectedIndex = ref(-1)
const searchContainer = ref()

// Search composable
const { getSuggestions, getPopularTags } = useSearch()

// Suggestions
const suggestions = ref<string[]>([])
const popularTags = ref<Array<{tag: string, count: number}>>([])

// Debounced input handler
const debouncedGetSuggestions = useDebounceFn(async (searchQuery: string) => {
  if (searchQuery.length >= 2) {
    suggestions.value = await getSuggestions(searchQuery)
  } else {
    suggestions.value = []
  }
}, 300)

// Handle input changes
const handleInput = () => {
  selectedIndex.value = -1
  debouncedGetSuggestions(query.value)
}

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  const totalItems = suggestions.value.length + (query.value.length < 2 ? popularTags.value.length : 0)
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        if (selectedIndex.value < suggestions.value.length) {
          selectSuggestion(suggestions.value[selectedIndex.value])
        } else {
          const tagIndex = selectedIndex.value - suggestions.value.length
          selectSuggestion(popularTags.value[tagIndex]?.tag || '')
        }
      } else {
        performSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedIndex.value = -1
      break
  }
}

// Select suggestion
const selectSuggestion = (suggestion: string) => {
  query.value = suggestion
  showSuggestions.value = false
  selectedIndex.value = -1
  performSearch()
}

// Perform search
const performSearch = () => {
  emit('search', query.value)
  showSuggestions.value = false
}

// Clear search
const clearSearch = () => {
  query.value = ''
  suggestions.value = []
  selectedIndex.value = -1
  emit('clear')
}

// Load popular tags on mount
onMounted(async () => {
  try {
    popularTags.value = await getPopularTags(10)
  } catch (error) {
    console.warn('Failed to load popular tags, continuing without them:', error)
    popularTags.value = []
  }
})

// Close suggestions when clicking outside
onClickOutside(searchContainer, () => {
  showSuggestions.value = false
  selectedIndex.value = -1
})

// Watch query changes
watch(query, (newQuery) => {
  if (newQuery.trim()) {
    performSearch()
  }
})
</script>