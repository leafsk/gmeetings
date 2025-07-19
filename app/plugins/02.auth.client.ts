export default defineNuxtPlugin(async (nuxtApp) => {
  const { initAuth } = useAuth()

  // Initialize auth state listener
  await initAuth()
})