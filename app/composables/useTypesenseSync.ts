import type { Event } from '~/types/event'

export const useTypesenseSync = () => {
  const { initializeCollection, bulkIndexEvents, indexEvent, removeEvent } = useSearch()
  const { getEvents } = useEvents()

  // Initialize TypeSense collection and sync all events from Firebase
  const initializeAndSync = async () => {
    try {
      console.log('Initializing TypeSense collection...')
      await initializeCollection()
      
      console.log('Loading events from Firebase...')
      const events = await getEvents()
      
      if (events.length > 0) {
        console.log(`Syncing ${events.length} events to TypeSense...`)
        await bulkIndexEvents(events)
        console.log('Sync completed successfully!')
      } else {
        console.log('No events found in Firebase')
      }
    } catch (error) {
      console.error('Failed to initialize and sync:', error)
    }
  }

  // Sync a single event when it's created/updated
  const syncEvent = async (event: Event) => {
    try {
      await indexEvent(event)
      console.log('Event synced to TypeSense:', event.id)
    } catch (error) {
      console.warn('Failed to sync event to TypeSense (collection may not exist yet):', error)
      // Don't throw error, just log warning
    }
  }

  // Remove event from search index when deleted
  const unsyncEvent = async (eventId: string) => {
    try {
      await removeEvent(eventId)
      console.log('Event removed from TypeSense:', eventId)
    } catch (error) {
      console.error('Failed to remove event from search:', error)
    }
  }

  return {
    initializeAndSync,
    syncEvent,
    unsyncEvent
  }
}