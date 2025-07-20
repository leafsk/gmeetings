<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="onCancel"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="text-4xl mb-3">{{ icon || '⚠️' }}</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          {{ title }}
        </h2>
        <p class="text-gray-600">
          {{ message }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="onCancel"
          class="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {{ cancelText || 'Cancel' }}
        </button>
        <button
          @click="onConfirm"
          :disabled="loading"
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50',
            confirmType === 'danger' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          ]"
        >
          {{ loading ? 'Processing...' : (confirmText || 'Confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  title: string
  message: string
  icon?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'danger' | 'primary'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  confirmType: 'primary',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const onConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}

const onCancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}
</script>