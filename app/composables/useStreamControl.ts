/**
 * Client-side composable for interacting with server-side stream monitoring
 * Provides manual override and force-end capabilities for event organizers
 */

export const useStreamControl = () => {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Enable manual override for an event (prevents auto-ending)
   */
  const enableManualOverride = async (eventId: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated'
      return false
    }

    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/functions/setEventManualOverride', {
        method: 'POST',
        body: {
          eventId,
          override: true,
          userId: user.value.uid
        }
      })

      return response.success
    } catch (err: any) {
      error.value = err.message || 'Failed to enable manual override'
      console.error('Error enabling manual override:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Disable manual override for an event (allows auto-ending)
   */
  const disableManualOverride = async (eventId: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated'
      return false
    }

    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/functions/setEventManualOverride', {
        method: 'POST',
        body: {
          eventId,
          override: false,
          userId: user.value.uid
        }
      })

      return response.success
    } catch (err: any) {
      error.value = err.message || 'Failed to disable manual override'
      console.error('Error disabling manual override:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Force end an event immediately
   */
  const forceEndEvent = async (eventId: string, reason?: string): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated'
      return false
    }

    try {
      loading.value = true
      error.value = null

      const response = await $fetch('/api/functions/forceEndEvent', {
        method: 'POST',
        body: {
          eventId,
          userId: user.value.uid,
          reason
        }
      })

      return response.success
    } catch (err: any) {
      error.value = err.message || 'Failed to end event'
      console.error('Error ending event:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    enableManualOverride,
    disableManualOverride,
    forceEndEvent
  }
}