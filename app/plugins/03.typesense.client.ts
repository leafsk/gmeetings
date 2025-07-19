import { Client } from 'typesense'

export default defineNuxtPlugin(() => {
  // Search-only client for frontend
  const searchClient = new Client({
    nodes: [
      {
        host: 'w9as741c0md3tf5yp-1.a1.typesense.net',
        port: 443,
        protocol: 'https'
      }
    ],
    apiKey: 'syr07v7dpkMoNPkwE12Ti2Ob5BCLsjNX', // Search-only API key
    connectionTimeoutSeconds: 2
  })

  // Admin client for server-side operations (collections, indexing)
  const adminClient = new Client({
    nodes: [
      {
        host: 'w9as741c0md3tf5yp-1.a1.typesense.net',
        port: 443,
        protocol: 'https'
      }
    ],
    apiKey: 'EgHA4Xl0zwjdyeOUKHDTHyGErI3uWfYn', // Admin API key
    connectionTimeoutSeconds: 2
  })

  return {
    provide: {
      typesenseSearch: searchClient,
      typesenseAdmin: adminClient
    }
  }
})