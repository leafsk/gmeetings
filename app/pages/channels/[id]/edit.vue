<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading channel...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">⚠️ Error loading channel</div>
      <p class="text-gray-600">{{ error }}</p>
      <NuxtLink 
        to="/channels/discover"
        class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Discover
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <div v-else-if="channel">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink 
          :to="`/channels/${channelId}`"
          class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Back to Channel
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Edit Channel</h1>
            <p class="text-gray-600">
              Make changes to your channel profile.
            </p>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <form @submit.prevent="updateChannel" class="space-y-6">
        <!-- Channel Name -->
        <div>
          <label for="channelName" class="block text-lg font-medium text-gray-900 mb-2">
            Channel Name
          </label>
          <input
            id="channelName"
            v-model="form.channelName"
            type="text"
            required
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-lg font-medium text-gray-900 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="4"
            placeholder="Tell people about your channel, what kind of content you create, and what they can expect..."
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">{{ form.bio.length }}/500 characters</p>
        </div>

        <!-- Website -->
        <div>
          <label for="website" class="block text-lg font-medium text-gray-900 mb-2">
            Website
          </label>
          <input
            id="website"
            v-model="form.website"
            type="url"
            placeholder="https://yourwebsite.com"
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <!-- Content Categories -->
        <div>
          <label class="block text-lg font-medium text-gray-900 mb-2">
            Content Categories
          </label>
          <TagInput
            v-model="form.categories"
            placeholder="tech, gaming, education, music"
            help-text="Help people discover your channel by adding relevant categories"
            :suggestions="['tech', 'gaming', 'education', 'music', 'art', 'business', 'entertainment', 'cooking', 'fitness', 'travel', 'lifestyle', 'news', 'comedy', 'diy', 'science']"
            :max-tags="5"
          />
        </div>

        <!-- Streaming Schedule -->
        <div>
          <label for="schedule" class="block text-lg font-medium text-gray-900 mb-2">
            Streaming Schedule (Optional)
          </label>
          <textarea
            id="schedule"
            v-model="form.schedule"
            rows="3"
            placeholder="e.g., Monday/Wednesday/Friday 8PM CET, Weekends 2PM CET"
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">Let your followers know when they can catch you live</p>
        </div>

        <!-- Social Links -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Social Links</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="twitter" class="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
              <input 
                id="twitter" 
                v-model="form.socialLinks.twitter" 
                type="url" 
                placeholder="https://twitter.com/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label for="youtube" class="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
              <input 
                id="youtube" 
                v-model="form.socialLinks.youtube" 
                type="url" 
                placeholder="https://youtube.com/@username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label for="twitch" class="block text-sm font-medium text-gray-700 mb-1">Twitch</label>
              <input 
                id="twitch" 
                v-model="form.socialLinks.twitch" 
                type="url" 
                placeholder="https://twitch.tv/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            <div>
              <label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input 
                id="instagram" 
                v-model="form.socialLinks.instagram" 
                type="url" 
                placeholder="https://instagram.com/username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-6">
          <button
            type="submit"
            :disabled="updating"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ updating ? 'Updating...' : 'Update Channel' }}
          </button>
          
          <NuxtLink 
            :to="`/channels/${channelId}`"
            class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-block text-center"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type { UserProfile } from '~/composables/useAuth'

// Meta tags
useHead({
  title: 'Edit Channel - Slovakia Community',
  meta: [
    { name: 'description', content: 'Edit your channel details' }
  ]
})

// Get route params
const route = useRoute()
const channelId = route.params.id as string

// State
const { user, isAuthenticated } = useAuth()
const channel = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const updating = ref(false)

// Form data
const form = ref({
  channelName: '',
  bio: '',
  website: '',
  categories: [] as string[],
  schedule: '',
  socialLinks: {
    twitter: '',
    youtube: '',
    twitch: '',
    instagram: ''
  }
})

// Load channel data
const loadChannel = async () => {
  try {
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) throw new Error('Database not initialized')

    if (!user.value || channelId !== user.value.uid) {
      throw new Error('You do not have permission to edit this channel')
    }

    const userDoc = await getDoc(doc(nuxtApp.$db, 'users', channelId))
    if (!userDoc.exists()) {
      throw new Error('Channel not found')
    }
    
    const userData = userDoc.data()
    channel.value = userData as UserProfile
    
    // Populate form
    form.value = {
      channelName: userData.channelName || userData.displayName || '',
      bio: userData.bio || '',
      website: userData.website || '',
      categories: userData.categories || [],
      schedule: userData.schedule || '',
      socialLinks: {
        twitter: userData.socialLinks?.twitter || '',
        youtube: userData.socialLinks?.youtube || '',
        twitch: userData.socialLinks?.twitch || '',
        instagram: userData.socialLinks?.instagram || ''
      }
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Update channel
const updateChannel = async () => {
  if (!channel.value) return
  
  try {
    updating.value = true
    const nuxtApp = useNuxtApp()
    if (!nuxtApp.$db) throw new Error('Database not initialized')

    const userDocRef = doc(nuxtApp.$db, 'users', channelId)
    
    await updateDoc(userDocRef, {
      channelName: form.value.channelName.trim(),
      bio: form.value.bio.trim(),
      website: form.value.website.trim(),
      categories: form.value.categories,
      schedule: form.value.schedule.trim(),
      socialLinks: {
        twitter: form.value.socialLinks.twitter.trim(),
        youtube: form.value.socialLinks.youtube.trim(),
        twitch: form.value.socialLinks.twitch.trim(),
        instagram: form.value.socialLinks.instagram.trim()
      },
      updatedAt: new Date()
    })
    
    // Redirect back to channel
    await navigateTo(`/channels/${channelId}`)
  } catch (err: any) {
    alert('Failed to update channel: ' + err.message)
  } finally {
    updating.value = false
  }
}

// Auth check and load channel
onMounted(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }
  
  await loadChannel()
})
</script>
