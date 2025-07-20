import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import type { Event, CreateEventData, EventFilter } from '~/types/event'

export const useEvents = () => {
  const nuxtApp = useNuxtApp()

  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate()
    }
    if (timestamp instanceof Date) {
      return timestamp
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp)
    }
    if (timestamp && timestamp.seconds) {
      // Firestore timestamp object
      return new Date(timestamp.seconds * 1000)
    }
    console.warn('Invalid timestamp format:', timestamp)
    return new Date() // Fallback to current date
  }

  // Simple time-based status computation (avoiding circular dependency)
  const getTimeBasedStatus = (startDate: Date, endDate: Date, now: Date): Event['status'] => {
    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'ended'
    return 'live'
  }

  // Convert Event data from Firestore
  const convertEventData = (id: string, data: any): Event => {
    const startDate = convertTimestamp(data.startDate)
    const endDate = convertTimestamp(data.endDate)
    const endedAt = data.endedAt ? convertTimestamp(data.endedAt) : undefined
    
    // Compute status with proper respect for manually ended events
    let computedStatus: Event['status']
    if (data.status === 'adhoc') {
      computedStatus = 'adhoc'
    } else if (endedAt) {
      // If manually ended, always show as ended regardless of time
      computedStatus = 'ended'
    } else {
      // Otherwise use time-based computation
      computedStatus = getTimeBasedStatus(startDate, endDate, new Date())
    }
    
    return {
      id,
      title: data.title,
      description: data.description,
      startDate,
      endDate,
      status: computedStatus,
      category: data.category || 'internal',
      type: data.type,
      streamUrl: data.streamUrl,
      embedUrl: data.embedUrl,
      replayUrl: data.replayUrl,
      replayEmbedUrl: data.replayEmbedUrl || generateEmbedUrl(data.type, data.replayUrl),
      stageUrl: data.stageUrl,
      externalLink: data.externalLink,
      participantLink: data.participantLink,
      isEmbeddable: data.isEmbeddable,
      organizer: data.organizer,
      organizerId: data.organizerId,
      thumbnailUrl: data.thumbnailUrl,
      tags: data.tags || [],
      attendeeCount: data.attendeeCount || 0,
      participantCount: data.participantCount || 0,
      maxAttendees: data.maxAttendees,
      maxParticipants: data.maxParticipants,
      endedAt: data.endedAt ? convertTimestamp(data.endedAt) : undefined,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt)
    }
  }

  // Create a new event
  const createEvent = async (eventData: CreateEventData): Promise<string> => {
    try {
      loading.value = true
      error.value = null

      // Get current user info
      const { user, getCurrentUserDisplayName } = useAuth()
      if (!user.value) {
        throw new Error('User must be logged in to create events')
      }

      const now = Timestamp.now()
      const docData = {
        ...eventData,
        startDate: Timestamp.fromDate(eventData.startDate),
        endDate: Timestamp.fromDate(eventData.endDate),
        status: eventData.status || 'upcoming',
        isEmbeddable: checkIfEmbeddable(eventData.category, eventData.type, eventData.streamUrl),
        embedUrl: generateEmbedUrl(eventData.type, eventData.streamUrl),
        organizerId: user.value.uid,
        organizer: getCurrentUserDisplayName(),
        attendeeCount: 0,
        participantCount: 0,
        createdAt: now,
        updatedAt: now
      }

      // Remove undefined fields to prevent Firebase errors
      Object.keys(docData).forEach(key => {
        if (docData[key as keyof typeof docData] === undefined) {
          delete docData[key as keyof typeof docData]
        }
      })

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')
      
      const docRef = await addDoc(collection(nuxtApp.$db, 'events'), docData)
      
      // Sync to TypeSense search index
      try {
        const newEvent = convertEventData(docRef.id, docData)
        const { syncEvent } = useTypesenseSync()
        await syncEvent(newEvent)
      } catch (searchError) {
        console.warn('Failed to sync event to search index:', searchError)
      }
      
      return docRef.id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all events with optional filtering
  const getEvents = async (filter?: EventFilter): Promise<Event[]> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')
      
      let q = query(collection(nuxtApp.$db, 'events'), orderBy('startDate', 'asc'))

      // Only filter by type, never by status since status is computed
      if (filter?.type) {
        q = query(q, where('type', '==', filter.type))
      }

      const querySnapshot = await getDocs(q)
      const eventList: Event[] = []

      querySnapshot.forEach((doc) => {
        const event = convertEventData(doc.id, doc.data())
        
        // Apply status filter after computation
        if (!filter?.status || event.status === filter.status) {
          eventList.push(event)
        }
      })

      events.value = eventList
      return eventList
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get live events
  const getLiveEvents = async (): Promise<Event[]> => {
    return getEvents({ status: 'live' })
  }

  // Get upcoming events
  const getUpcomingEvents = async (): Promise<Event[]> => {
    return getEvents({ status: 'upcoming' })
  }

  // Get past events
  const getPastEvents = async (limit?: number): Promise<Event[]> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')
      
      // Get all events and filter for ended ones
      const q = query(collection(nuxtApp.$db, 'events'), orderBy('endDate', 'desc'))
      const querySnapshot = await getDocs(q)
      const eventList: Event[] = []

      querySnapshot.forEach((doc) => {
        const event = convertEventData(doc.id, doc.data())
        if (event.status === 'ended') {
          eventList.push(event)
        }
      })

      const result = limit ? eventList.slice(0, limit) : eventList
      return result
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get most popular past events (by attendee count)
  const getPopularPastEvents = async (limit: number = 6): Promise<Event[]> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')
      
      // Get all events and filter for ended ones with high attendance
      const q = query(collection(nuxtApp.$db, 'events'), orderBy('attendeeCount', 'desc'))
      const querySnapshot = await getDocs(q)
      const eventList: Event[] = []

      querySnapshot.forEach((doc) => {
        const event = convertEventData(doc.id, doc.data())
        if (event.status === 'ended' && event.attendeeCount > 0) {
          eventList.push(event)
        }
      })

      return eventList.slice(0, limit)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get single event by ID
  const getEvent = async (id: string): Promise<Event | null> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')

      const docRef = doc(nuxtApp.$db, 'events', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return convertEventData(docSnap.id, docSnap.data())
      }
      return null
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update event
  const updateEvent = async (id: string, updates: Partial<Event>): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')

      const docRef = doc(nuxtApp.$db, 'events', id)
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      }

      // Convert Date objects to Timestamps
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate)
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate)
      }
      if (updates.endedAt) {
        updateData.endedAt = Timestamp.fromDate(updates.endedAt)
      }

      await updateDoc(docRef, updateData)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete event
  const deleteEvent = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')

      const docRef = doc(nuxtApp.$db, 'events', id)
      await deleteDoc(docRef)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Subscribe to events (real-time updates)
  const subscribeToEvents = (filter?: EventFilter): Unsubscribe => {
    if (!nuxtApp.$db) {
      console.warn('Firebase db not initialized, cannot subscribe to events')
      return () => {}
    }

    let q = query(collection(nuxtApp.$db, 'events'), orderBy('startDate', 'asc'))

    // Only filter by type in database, status is computed
    if (filter?.type) {
      q = query(q, where('type', '==', filter.type))
    }

    return onSnapshot(q, (querySnapshot) => {
      const eventList: Event[] = []
      querySnapshot.forEach((doc) => {
        const event = convertEventData(doc.id, doc.data())
        
        // Apply status filter after computation
        if (!filter?.status || event.status === filter.status) {
          eventList.push(event)
        }
      })
      events.value = eventList
    })
  }

  // Helper function to check if URL is embeddable
  const checkIfEmbeddable = (category: Event['category'], type: Event['type'], url?: string): boolean => {
    if (!url || category === 'external') return false
    
    switch (type) {
      case 'youtube':
        return url.includes('youtube.com') || url.includes('youtu.be')
      case 'twitch':
        return url.includes('twitch.tv')
      default:
        return false
    }
  }

  // Helper function to generate embed URL
  const generateEmbedUrl = (type: Event['type'], url?: string): string | undefined => {
    if (!url) return undefined

    // If the URL is already an embed URL, return it as is
    if (url.includes('/embed/')) {
      return url
    }

    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        if (youtubeMatch) {
          return `https://www.youtube.com/embed/${youtubeMatch[1]}`
        }
        break
      case 'twitch':
        const twitchMatch = url.match(/twitch\.tv\/(\w+)/)
        if (twitchMatch) {
          return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}`
        }
        break
    }
    return undefined
  }

  return {
    events: readonly(events),
    loading: readonly(loading),
    error: readonly(error),
    createEvent,
    getEvents,
    getLiveEvents,
    getUpcomingEvents,
    getPastEvents,
    getPopularPastEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    subscribeToEvents
  }
}