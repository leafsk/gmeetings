import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

export interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  location?: string
  website?: string
  channelName?: string
  channelBanner?: string
  socialLinks?: {
    twitter?: string
    youtube?: string
    twitch?: string
    instagram?: string
  }
  followerCount: number
  followingCount: number
  isLive?: boolean
  lastLiveAt?: Date
  createdAt: Date
  updatedAt: Date
}

export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  
  const user = useState<User | null>('user', () => null)
  const userProfile = useState<UserProfile | null>('userProfile', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize auth state listener
  const initAuth = () => {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(nuxtApp.$auth, async (firebaseUser) => {
        unsub()
        user.value = firebaseUser
        if (firebaseUser) {
          await loadUserProfile(firebaseUser.uid)
        }
        resolve(firebaseUser)
      }, () => {
        unsub()
        resolve(null)
      })
    })
  }

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      if (!nuxtApp.$db) return
      
      const userDoc = await getDoc(doc(nuxtApp.$db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        userProfile.value = {
          id: uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          location: data.location,
          website: data.website,
          channelName: data.channelName,
          channelBanner: data.channelBanner,
          socialLinks: data.socialLinks,
          followerCount: data.followerCount || 0,
          followingCount: data.followingCount || 0,
          isLive: data.isLive || false,
          lastLiveAt: data.lastLiveAt?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        }
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      if (!nuxtApp.$auth) throw new Error('Firebase auth not initialized')
      
      const result = await signInWithEmailAndPassword(nuxtApp.$auth, email, password)
      return result.user
    } catch (err: any) {
      // Provide more helpful error messages
      if (err.code === 'auth/configuration-not-found') {
        error.value = 'Authentication is not properly configured. Please contact support.'
      } else if (err.code === 'auth/user-not-found') {
        error.value = 'No account found with this email address.'
      } else if (err.code === 'auth/wrong-password') {
        error.value = 'Incorrect password.'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'Invalid email address.'
      } else {
        error.value = err.message
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$auth || !nuxtApp.$db) throw new Error('Firebase not initialized')

      const result = await createUserWithEmailAndPassword(nuxtApp.$auth, email, password)
      
      // Update the user's display name
      await updateProfile(result.user, { displayName })

      // Create user profile in Firestore
      const now = new Date()
      const userProfileData = {
        email,
        displayName,
        photoURL: result.user.photoURL,
        bio: '',
        location: '',
        website: '',
        channelName: displayName,
        followerCount: 0,
        followingCount: 0,
        isLive: false,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(doc(nuxtApp.$db, 'users', result.user.uid), userProfileData)

      return result.user
    } catch (err: any) {
      // Provide more helpful error messages
      if (err.code === 'auth/operation-not-allowed') {
        error.value = 'Email/password sign-up is not enabled. Please enable it in your Firebase project console.'
      } else if (err.code === 'auth/configuration-not-found') {
        error.value = 'Authentication is not properly configured. Please contact support.'
      } else if (err.code === 'auth/email-already-in-use') {
        error.value = 'An account with this email already exists.'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'Password should be at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        error.value = 'Invalid email address.'
      } else {
        error.value = err.message
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$auth || !nuxtApp.$db) throw new Error('Firebase not initialized')

      const provider = new GoogleAuthProvider()
      // Optional: Add additional scopes
      provider.addScope('profile')
      provider.addScope('email')

      const result = await signInWithPopup(nuxtApp.$auth, provider)
      
      // Check if user profile exists in Firestore, create if not
      const userDoc = await getDoc(doc(nuxtApp.$db, 'users', result.user.uid))
      
      if (!userDoc.exists()) {
        // Create user profile in Firestore for new Google users
        const now = new Date()
        const userProfileData = {
          email: result.user.email || '',
          displayName: result.user.displayName || 'Google User',
          photoURL: result.user.photoURL,
          bio: '',
          location: '',
          website: '',
          channelName: result.user.displayName || 'Google User',
          followerCount: 0,
          followingCount: 0,
          isLive: false,
          createdAt: now,
          updatedAt: now
        }

        await setDoc(doc(nuxtApp.$db, 'users', result.user.uid), userProfileData)
      }

      // Manually update state
      user.value = result.user
      await loadUserProfile(result.user.uid)

      return result.user
    } catch (err: any) {
      // Provide more helpful error messages for Google Sign-In
      if (err.code === 'auth/configuration-not-found') {
        error.value = 'Google Sign-In is not properly configured. Please contact support.'
      } else if (err.code === 'auth/popup-closed-by-user') {
        error.value = 'Sign-in was cancelled.'
      } else if (err.code === 'auth/popup-blocked') {
        error.value = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
      } else if (err.code === 'auth/cancelled-popup-request') {
        error.value = 'Sign-in was cancelled due to another request.'
      } else {
        error.value = err.message
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      if (!nuxtApp.$auth) throw new Error('Firebase auth not initialized')
      
      await signOut(nuxtApp.$auth)
      user.value = null
      userProfile.value = null
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateUserProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>) => {
    if (!user.value) throw new Error('No user logged in')

    try {
      loading.value = true
      error.value = null

      // Update Firebase Auth profile if displayName or photoURL changed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user.value, {
          displayName: updates.displayName || user.value.displayName,
          photoURL: updates.photoURL || user.value.photoURL
        })
      }

      // Update Firestore profile
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }

      if (!nuxtApp.$db) throw new Error('Firebase db not initialized')
      
      await updateDoc(doc(nuxtApp.$db, 'users', user.value.uid), updateData)

      // Update local profile
      if (userProfile.value) {
        Object.assign(userProfile.value, updateData)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get current user ID
  const getCurrentUserId = (): string | null => {
    return user.value?.uid || null
  }

  // Get current user display name
  const getCurrentUserDisplayName = (): string => {
    return userProfile.value?.displayName || user.value?.displayName || 'Anonymous'
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    initAuth,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
    getCurrentUserId,
    getCurrentUserDisplayName
  }
}