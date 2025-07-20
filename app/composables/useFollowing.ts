import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc,
  increment,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import type { UserProfile } from './useAuth'

export interface Following {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface ChannelInfo {
  id: string
  channelName: string
  displayName: string
  photoURL?: string
  bio?: string
  followerCount: number
  isLive?: boolean
  lastLiveAt?: Date
}

export const useFollowing = () => {
  const nuxtApp = useNuxtApp()
  const { user, userProfile } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const followedChannels = ref<ChannelInfo[]>([])
  const suggestedChannels = ref<ChannelInfo[]>([])
  const isFollowing = ref<Map<string, boolean>>(new Map())

  // Follow a user/channel
  const followUser = async (targetUserId: string): Promise<void> => {
    const currentUserId = user.value?.uid
    if (!currentUserId || !nuxtApp.$db) return

    try {
      loading.value = true
      error.value = null

      // Check if already following
      const existingFollow = await getDocs(
        query(
          collection(nuxtApp.$db, 'follows'),
          where('followerId', '==', currentUserId),
          where('followingId', '==', targetUserId)
        )
      )

      if (!existingFollow.empty) {
        throw new Error('Already following this user')
      }

      // Add follow relationship
      await addDoc(collection(nuxtApp.$db, 'follows'), {
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: Timestamp.now()
      })

      // Update follower count for target user
      await updateDoc(doc(nuxtApp.$db, 'users', targetUserId), {
        followerCount: increment(1)
      })

      // Update following count for current user
      await updateDoc(doc(nuxtApp.$db, 'users', currentUserId), {
        followingCount: increment(1)
      })

      // Update local state
      isFollowing.value.set(targetUserId, true)
      await loadFollowedChannels()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Unfollow a user/channel
  const unfollowUser = async (targetUserId: string): Promise<void> => {
    const currentUserId = user.value?.uid
    if (!currentUserId || !nuxtApp.$db) return

    try {
      loading.value = true
      error.value = null

      // Find and delete follow relationship
      const followQuery = query(
        collection(nuxtApp.$db, 'follows'),
        where('followerId', '==', currentUserId),
        where('followingId', '==', targetUserId)
      )
      
      const followSnapshot = await getDocs(followQuery)
      if (followSnapshot.empty) {
        throw new Error('Not following this user')
      }

      // Delete the follow document
      await deleteDoc(followSnapshot.docs[0].ref)

      // Update follower count for target user
      await updateDoc(doc(nuxtApp.$db, 'users', targetUserId), {
        followerCount: increment(-1)
      })

      // Update following count for current user
      await updateDoc(doc(nuxtApp.$db, 'users', currentUserId), {
        followingCount: increment(-1)
      })

      // Update local state
      isFollowing.value.set(targetUserId, false)
      await loadFollowedChannels()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Check if current user is following target user
  const checkIsFollowing = async (targetUserId: string): Promise<boolean> => {
    const currentUserId = user.value?.uid
    if (!currentUserId || !nuxtApp.$db) return false

    try {
      const followQuery = query(
        collection(nuxtApp.$db, 'follows'),
        where('followerId', '==', currentUserId),
        where('followingId', '==', targetUserId)
      )
      
      const followSnapshot = await getDocs(followQuery)
      const following = !followSnapshot.empty
      isFollowing.value.set(targetUserId, following)
      return following
    } catch (err: any) {
      console.error('Error checking follow status:', err)
      return false
    }
  }

  // Load followed channels for current user
  const loadFollowedChannels = async (): Promise<void> => {
    const currentUserId = user.value?.uid
    if (!currentUserId || !nuxtApp.$db) return

    try {
      loading.value = true
      error.value = null

      // Get all follows for current user
      const followsQuery = query(
        collection(nuxtApp.$db, 'follows'),
        where('followerId', '==', currentUserId)
      )
      
      const followsSnapshot = await getDocs(followsQuery)
      const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId)

      if (followingIds.length === 0) {
        followedChannels.value = []
        return
      }

      // Get user profiles for followed users
      const channels: ChannelInfo[] = []
      for (const userId of followingIds) {
        const userDoc = await getDoc(doc(nuxtApp.$db, 'users', userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          channels.push({
            id: userId,
            channelName: userData.channelName || userData.displayName,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            bio: userData.bio,
            followerCount: userData.followerCount || 0,
            isLive: userData.isLive || false,
            lastLiveAt: userData.lastLiveAt?.toDate()
          })
        }
      }

      followedChannels.value = channels.sort((a, b) => {
        // Sort by live status first, then by last live time
        if (a.isLive && !b.isLive) return -1
        if (!a.isLive && b.isLive) return 1
        return 0
      })
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed properties for live and offline channels
  const liveChannels = computed(() => 
    followedChannels.value.filter(channel => channel.isLive)
  )
  
  const offlineChannels = computed(() => 
    followedChannels.value.filter(channel => !channel.isLive)
  )

  // Load suggested channels (users with most followers, excluding already followed)
  const loadSuggestedChannels = async (limit: number = 10): Promise<void> => {
    const currentUserId = user.value?.uid
    if (!nuxtApp.$db) return

    try {
      loading.value = true
      error.value = null

      // Get all users ordered by follower count
      const usersSnapshot = await getDocs(collection(nuxtApp.$db, 'users'))
      const channels: ChannelInfo[] = []

      usersSnapshot.forEach((doc) => {
        const userData = doc.data()
        const userId = doc.id

        // Skip current user
        if (userId === currentUserId) return

        channels.push({
          id: userId,
          channelName: userData.channelName || userData.displayName,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          bio: userData.bio,
          followerCount: userData.followerCount || 0,
          isLive: userData.isLive || false,
          lastLiveAt: userData.lastLiveAt?.toDate()
        })
      })

      // Sort by follower count and limit
      suggestedChannels.value = channels
        .sort((a, b) => b.followerCount - a.followerCount)
        .slice(0, limit)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Subscribe to followed channels for real-time updates
  const subscribeToFollowedChannels = (): Unsubscribe => {
    const currentUserId = user.value?.uid
    if (!currentUserId || !nuxtApp.$db) {
      return () => {}
    }

    const followsQuery = query(
      collection(nuxtApp.$db, 'follows'),
      where('followerId', '==', currentUserId)
    )

    return onSnapshot(followsQuery, () => {
      loadFollowedChannels()
    })
  }

  // Toggle follow status
  const toggleFollow = async (targetUserId: string): Promise<void> => {
    const following = await checkIsFollowing(targetUserId)
    if (following) {
      await unfollowUser(targetUserId)
    } else {
      await followUser(targetUserId)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    followedChannels: readonly(followedChannels),
    liveChannels,
    offlineChannels,
    suggestedChannels: readonly(suggestedChannels),
    isFollowing: readonly(isFollowing),
    followUser,
    unfollowUser,
    checkIsFollowing,
    loadFollowedChannels,
    loadSuggestedChannels,
    subscribeToFollowedChannels,
    toggleFollow
  }
}