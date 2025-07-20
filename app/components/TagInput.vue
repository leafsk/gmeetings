<template>
  <div class="space-y-2">
    <!-- Tags Display -->
    <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="(tag, index) in tags"
        :key="index"
        class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
      >
        {{ tag }}
        <button
          type="button"
          @click="removeTag(index)"
          class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          :aria-label="`Remove ${tag} tag`"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </span>
    </div>

    <!-- Input Field -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="currentInput"
        type="text"
        :placeholder="tags.length === 0 ? placeholder : 'Add another tag...'"
        :class="[
          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
        ]"
        :disabled="disabled"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
      
      <!-- Add button for mobile -->
      <button
        v-if="currentInput.trim()"
        type="button"
        @click="addCurrentTag"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
      >
        Add
      </button>
    </div>

    <!-- Help Text -->
    <p v-if="helpText" class="text-sm text-gray-500">
      {{ helpText }}
    </p>
    
    <!-- Suggestions (if provided) -->
    <div v-if="suggestions.length > 0 && currentInput.trim()" class="space-y-1">
      <p class="text-xs text-gray-600">Suggestions:</p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          type="button"
          @click="addTag(suggestion)"
          class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string[]
  placeholder?: string
  helpText?: string
  suggestions?: string[]
  maxTags?: number
  disabled?: boolean
  allowDuplicates?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add tags...',
  helpText: 'Press Enter or comma to add a tag, click × to remove',
  suggestions: () => [],
  maxTags: 10,
  disabled: false,
  allowDuplicates: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Local state
const currentInput = ref('')
const inputRef = ref<HTMLInputElement>()

// Computed
const tags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredSuggestions = computed(() => {
  if (!currentInput.value.trim()) return []
  
  return props.suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(currentInput.value.toLowerCase()) &&
      !tags.value.includes(suggestion)
    )
    .slice(0, 5) // Limit to 5 suggestions
})

// Methods
const addTag = (tag: string) => {
  const trimmedTag = tag.trim()
  
  if (!trimmedTag) return
  
  // Check for duplicates if not allowed
  if (!props.allowDuplicates && tags.value.includes(trimmedTag)) {
    currentInput.value = ''
    return
  }
  
  // Check max tags limit
  if (tags.value.length >= props.maxTags) {
    currentInput.value = ''
    return
  }
  
  // Add the tag
  tags.value = [...tags.value, trimmedTag]
  currentInput.value = ''
  
  // Focus back to input
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const addCurrentTag = () => {
  addTag(currentInput.value)
}

const removeTag = (index: number) => {
  tags.value = tags.value.filter((_, i) => i !== index)
  
  // Focus back to input
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault() // Prevent form submission
      addCurrentTag()
      break
      
    case ',':
      event.preventDefault()
      addCurrentTag()
      break
      
    case 'Backspace':
      if (!currentInput.value && tags.value.length > 0) {
        // Remove last tag if input is empty
        removeTag(tags.value.length - 1)
      }
      break
      
    case 'Escape':
      currentInput.value = ''
      inputRef.value?.blur()
      break
  }
}

const handleBlur = () => {
  // Add current input as tag on blur if it has content
  if (currentInput.value.trim()) {
    addCurrentTag()
  }
}

// Focus method for parent components
const focus = () => {
  inputRef.value?.focus()
}

// Expose focus method
defineExpose({
  focus
})
</script>