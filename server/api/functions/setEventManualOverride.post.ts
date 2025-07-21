export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    // Get the Firebase Functions URL from environment
    const functionsUrl = process.env.FIREBASE_FUNCTIONS_URL || 'https://us-central1-your-project.cloudfunctions.net'
    
    const response = await fetch(`${functionsUrl}/setEventManualOverride`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`Firebase Function call failed: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
    
  } catch (error) {
    console.error('Error calling Firebase Function:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to set manual override'
    })
  }
})