<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink 
        :to="`/channels/${user?.uid}`"
        class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        ← Back to My Channel
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
      <p class="text-gray-600">
        Update your channel information and settings.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading profile...</p>
    </div>

    <!-- Edit Form -->
    <div v-else-if="userProfile" class="space-y-8">
      <!-- Profile Picture and Banner -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Images</h2>
        
        <!-- Profile Picture -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div class="flex items-center gap-4">
            <img 
              :src="form.photoURL || '/default-avatar.png'"
              :alt="form.displayName"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <input
                v-model="form.photoURL"
                type="url"
                placeholder="https://example.com/photo.jpg"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Enter a URL to your profile picture</p>
            </div>
          </div>
        </div>

        <!-- Channel Banner -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Channel Banner
          </label>
          <div class="space-y-2">
            <div 
              class="h-32 rounded-lg bg-gray-200 bg-cover bg-center"
              :style="form.channelBanner ? `background-image: url(${form.channelBanner})` : ''"
            >
              <div v-if="!form.channelBanner" class="h-full flex items-center justify-center text-gray-500">
                No banner set
              </div>
            </div>
            <input
              v-model="form.channelBanner"
              type="url"
              placeholder="https://example.com/banner.jpg"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-gray-500">Enter a URL to your channel banner image</p>
          </div>
        </div>
      </div>

      <!-- Basic Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Channel Name -->
          <div>
            <label for="channelName" class="block text-sm font-medium text-gray-700 mb-2">
              Channel Name
            </label>
            <input
              id="channelName"
              v-model="form.channelName"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Your channel's brand name</p>
          </div>

          <!-- Location -->
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              placeholder="e.g. Bratislava, Slovakia"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Website -->
          <div>
            <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              placeholder="https://yourwebsite.com"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Bio/Description -->
        <div class="mt-6">
          <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
            Channel Description
          </label>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="4"
            placeholder="Tell your audience about your channel, what content you create, and what they can expect..."
            class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxlength="500"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ (form.bio || '').length }}/500 characters</p>
        </div>
      </div>

      <!-- Social Links -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Social Links</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- YouTube -->
          <div>
            <label for="youtube" class="block text-sm font-medium text-gray-700 mb-2">
              YouTube Channel
            </label>
            <input
              id="youtube"
              v-model="form.socialLinks.youtube"
              type="url"
              placeholder="https://youtube.com/@yourchannel"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Twitch -->
          <div>
            <label for="twitch" class="block text-sm font-medium text-gray-700 mb-2">
              Twitch Channel
            </label>
            <input
              id="twitch"
              v-model="form.socialLinks.twitch"
              type="url"
              placeholder="https://twitch.tv/yourchannel"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Twitter -->
          <div>
            <label for="twitter" class="block text-sm font-medium text-gray-700 mb-2">
              Twitter/X Profile
            </label>
            <input
              id="twitter"
              v-model="form.socialLinks.twitter"
              type="url"
              placeholder="https://twitter.com/yourusername"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Instagram -->
          <div>
            <label for="instagram" class="block text-sm font-medium text-gray-700 mb-2">
              Instagram Profile
            </label>
            <input
              id="instagram"
              v-model="form.socialLinks.instagram"
              type="url"
              placeholder="https://instagram.com/yourusername"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          @click="updateProfile"
          :disabled="updating"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ updating ? 'Saving...' : 'Save Changes' }}
        </button>
        
        <NuxtLink 
          :to="`/channels/${user?.uid}`"
          class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-block text-center"
        >
          Cancel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Edit Profile - Slovakia Community',
  meta: [
    { name: 'description', content: 'Edit your channel profile and settings' }
  ]
})

// Auth check
const { user, userProfile, updateUserProfile, loading, isAuthenticated } = useAuth()
const updating = ref(false)

// Form data
const form = ref({
  displayName: '',
  channelName: '',
  photoURL: '',
  bio: '',
  location: '',
  website: '',
  channelBanner: '',
  socialLinks: {
    youtube: '',
    twitch: '',
    twitter: '',
    instagram: ''
  }
})

// Initialize form with current profile data
const initializeForm = () => {
  if (userProfile.value) {
    form.value = {
      displayName: userProfile.value.displayName || '',
      channelName: userProfile.value.channelName || '',
      photoURL: userProfile.value.photoURL || '',
      bio: userProfile.value.bio || '',
      location: userProfile.value.location || '',
      website: userProfile.value.website || '',
      channelBanner: userProfile.value.channelBanner || '',
      socialLinks: {
        youtube: userProfile.value.socialLinks?.youtube || '',
        twitch: userProfile.value.socialLinks?.twitch || '',
        twitter: userProfile.value.socialLinks?.twitter || '',
        instagram: userProfile.value.socialLinks?.instagram || ''
      }
    }
  }
}

// Update profile
const updateProfile = async () => {
  if (!userProfile.value) return
  
  try {
    updating.value = true
    
    const updates = {
      displayName: form.value.displayName.trim(),
      channelName: form.value.channelName.trim() || form.value.displayName.trim(),
      photoURL: form.value.photoURL.trim() || undefined,
      bio: form.value.bio.trim() || undefined,
      location: form.value.location.trim() || undefined,
      website: form.value.website.trim() || undefined,
      channelBanner: form.value.channelBanner.trim() || undefined,
      socialLinks: {
        youtube: form.value.socialLinks.youtube.trim() || undefined,
        twitch: form.value.socialLinks.twitch.trim() || undefined,
        twitter: form.value.socialLinks.twitter.trim() || undefined,
        instagram: form.value.socialLinks.instagram.trim() || undefined
      }
    }
    
    await updateUserProfile(updates)
    
    // Redirect back to profile
    await navigateTo(`/channels/${user.value?.uid}`)
  } catch (err: any) {
    alert('Failed to update profile: ' + err.message)
  } finally {
    updating.value = false
  }
}

// Watch for profile changes
watch(userProfile, initializeForm, { immediate: true })

// Auth guard
onMounted(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/auth/login')
    return
  }
  
  // Initialize form once profile is loaded
  if (userProfile.value) {
    initializeForm()
  }
})
</script>