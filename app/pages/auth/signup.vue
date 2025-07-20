<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-blue-600 mb-2">🇸🇰 Slovakia Community</h1>
        <h2 class="text-2xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleSignUp" class="space-y-6">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div class="mt-1">
              <input
                id="displayName"
                v-model="form.displayName"
                name="displayName"
                type="text"
                autocomplete="name"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choose a strong password"
              />
            </div>
            <div class="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <!-- Terms and Privacy -->
          <div class="flex items-center">
            <input
              id="agree-terms"
              v-model="form.agreeTerms"
              name="agree-terms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
              and
              <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </label>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="loading || !form.agreeTerms"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>

          <!-- Error message -->
          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {{ error }}
            </div>
          </div>

          <!-- Validation errors -->
          <div v-if="validationError" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {{ validationError }}
            </div>
          </div>
        </form>

        <!-- Social signup options (future) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="handleGoogleSignUp"
              :disabled="loading"
            >
              <span class="sr-only">Sign up with Google</span>
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">{{ loading ? 'Signing up...' : 'Continue with Google' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Modal -->
    <WelcomeModal 
      :show="showWelcomeModal" 
      @close="() => { showWelcomeModal = false; router.push('/') }"
    />
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Sign Up - Slovakia Community',
  meta: [
    { name: 'description', content: 'Create your Slovakia Community account' }
  ]
})

// State
const { signUp, signInWithGoogle, loading, error } = useAuth()
const router = useRouter()

// Form data
const form = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const validationError = ref('')
const showWelcomeModal = ref(false)

// Handle sign up
const handleSignUp = async () => {
  // Reset validation error
  validationError.value = ''

  // Validate form
  if (!form.value.displayName.trim()) {
    validationError.value = 'Please enter your full name'
    return
  }

  if (form.value.password.length < 6) {
    validationError.value = 'Password must be at least 6 characters long'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    validationError.value = 'Passwords do not match'
    return
  }

  if (!form.value.agreeTerms) {
    validationError.value = 'Please agree to the Terms of Service and Privacy Policy'
    return
  }

  try {
    await signUp(form.value.email, form.value.password, form.value.displayName)
    
    // Show welcome modal for new users, then redirect
    showWelcomeModal.value = true
  } catch (err) {
    console.error('Sign up failed:', err)
  }
}

// Handle Google sign up
const handleGoogleSignUp = async () => {
  try {
    await signInWithGoogle()
    
    // Redirect to home page
    await router.push('/')
  } catch (err) {
    console.error('Google sign up failed:', err)
  }
}

// Redirect if already authenticated
const { isAuthenticated } = useAuth()
watchEffect(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})
</script>