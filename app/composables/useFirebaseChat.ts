import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore'

export interface ChatMessage {
  id: string
  text: string
  userId: string
  username: string
  userAvatar?: string
  timestamp: Date
  eventId: string
}

export const useFirebaseChat = () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  let unsubscribe: Unsubscribe | null = null

  // Send a message
  const sendMessage = async (eventId: string, text: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { user, userProfile } = useAuth()
      if (!user.value) {
        throw new Error('You must be logged in to send messages')
      }
      
      const nuxtApp = useNuxtApp()
      if (!nuxtApp.$db) throw new Error('Database not initialized')
      
      const messageData = {
        text: text.trim(),
        userId: user.value.uid,
        username: userProfile.value?.displayName || user.value.displayName || 'Anonymous',
        userAvatar: userProfile.value?.photoURL || user.value.photoURL,
        eventId,
        timestamp: serverTimestamp()
      }
      
      await addDoc(collection(nuxtApp.$db, 'chat'), messageData)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Subscribe to messages for an event
  const subscribeToMessages = (eventId: string): Unsubscribe => {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) {
      console.warn('Database not initialized, cannot subscribe to chat')
      return () => {}
    }
    
    // Clean up existing subscription
    if (unsubscribe) {
      unsubscribe()
    }
    
    const q = query(
      collection(nuxtApp.$db, 'chat'),
      orderBy('timestamp', 'desc'),
      limit(100)
    )
    
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatMessages: ChatMessage[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Only include messages for this event
        if (data.eventId === eventId) {
          chatMessages.push({
            id: doc.id,
            text: data.text,
            userId: data.userId,
            username: data.username,
            userAvatar: data.userAvatar,
            timestamp: data.timestamp?.toDate() || new Date(),
            eventId: data.eventId
          })
        }
      })
      
      // Reverse to show oldest first
      messages.value = chatMessages.reverse()
    }, (err) => {
      console.error('Chat subscription error:', err)
      error.value = err.message
    })
    
    return unsubscribe
  }

  // Stop subscription
  const stopSubscription = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    messages.value = []
  }

  // Clear chat
  const clearChat = () => {
    messages.value = []
    error.value = null
  }

  return {
    // State
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    
    // Methods
    sendMessage,
    subscribeToMessages,
    stopSubscription,
    clearChat
  }
}