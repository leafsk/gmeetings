import type { SearchResponse } from 'typesense/lib/Typesense/Documents'
import type { Event } from '~/types/event'

export interface SearchResult {
  events: Event[]
  totalHits: number
  searchTime: number
  facets?: Record<string, any>
}

export interface SearchFilters {
  status?: string[]
  type?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export const useSearch = () => {
  const nuxtApp = useNuxtApp()
  
  const searchResults = ref<SearchResult>({
    events: [],
    totalHits: 0,
    searchTime: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Collection schema for events
  const eventsSchema = {
    name: 'events',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'organizer', type: 'string' },
      { name: 'status', type: 'string', facet: true },
      { name: 'type', type: 'string', facet: true },
      { name: 'tags', type: 'string[]', facet: true },
      { name: 'startDate', type: 'int64' },
      { name: 'endDate', type: 'int64' },
      { name: 'attendeeCount', type: 'int32' },
      { name: 'isEmbeddable', type: 'bool', facet: true },
      { name: 'createdAt', type: 'int64' }
    ]
  }

  // Initialize collection (call this once from server-side)
  const initializeCollection = async () => {
    try {
      if (!nuxtApp.$typesenseAdmin) {
        throw new Error('TypeSense admin client not initialized')
      }

      // Check if collection exists
      try {
        await nuxtApp.$typesenseAdmin.collections('events').retrieve()
        console.log('Events collection already exists')
        return
      } catch (err) {
        // Collection doesn't exist, create it
        console.log('Creating events collection...')
      }

      await nuxtApp.$typesenseAdmin.collections().create(eventsSchema)
      console.log('Events collection created successfully')
    } catch (err: any) {
      console.error('Failed to initialize collection:', err)
      error.value = err.message
    }
  }

  // Index an event to TypeSense
  const indexEvent = async (event: Event) => {
    try {
      if (!nuxtApp.$typesenseAdmin) {
        console.warn('TypeSense admin client not initialized, skipping indexing')
        return
      }
      const document = {
        id: event.id,
        title: event.title,
        description: event.description,
        organizer: event.organizer,
        status: event.status,
        type: event.type,
        tags: event.tags,
        startDate: Math.floor(event.startDate.getTime() / 1000),
        endDate: Math.floor(event.endDate.getTime() / 1000),
        attendeeCount: event.attendeeCount,
        isEmbeddable: event.isEmbeddable,
        createdAt: Math.floor(event.createdAt.getTime() / 1000)
      }

      await nuxtApp.$typesenseAdmin.collections('events').documents().upsert(document)
      console.log('Event indexed successfully:', event.id)
    } catch (err: any) {
      console.error('Failed to index event:', err)
      error.value = err.message
    }
  }

  // Remove event from TypeSense
  const removeEvent = async (eventId: string) => {
    try {
      await nuxtApp.$typesenseAdmin.collections('events').documents(eventId).delete()
      console.log('Event removed from search index:', eventId)
    } catch (err: any) {
      console.error('Failed to remove event from index:', err)
      error.value = err.message
    }
  }

  // Search events
  const searchEvents = async (
    query: string = '*',
    filters: SearchFilters = {},
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchResult> => {
    try {
      loading.value = true
      error.value = null

      if (!nuxtApp.$typesenseSearch) {
        throw new Error('TypeSense search client not initialized')
      }

      // Check if collection exists first
      try {
        await nuxtApp.$typesenseAdmin?.collections('events').retrieve()
      } catch (collectionError) {
        console.warn('Events collection does not exist yet, returning empty results')
        return {
          events: [],
          totalHits: 0,
          searchTime: 0,
          facets: {}
        }
      }

      let filterBy = []

      // Status filter
      if (filters.status && filters.status.length > 0) {
        filterBy.push(`status:=[${filters.status.join(',')}]`)
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        filterBy.push(`type:=[${filters.type.join(',')}]`)
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        filterBy.push(`tags:=[${filters.tags.join(',')}]`)
      }

      // Date range filter
      if (filters.dateRange) {
        const startTimestamp = Math.floor(filters.dateRange.start.getTime() / 1000)
        const endTimestamp = Math.floor(filters.dateRange.end.getTime() / 1000)
        filterBy.push(`startDate:>=${startTimestamp} && endDate:<=${endTimestamp}`)
      }

      const searchParams = {
        q: query,
        query_by: 'title,description,organizer,tags',
        filter_by: filterBy.join(' && '),
        facet_by: 'status,type,tags,isEmbeddable',
        sort_by: 'startDate:desc,createdAt:desc',
        page,
        per_page: perPage,
        highlight_full_fields: 'title,description',
        snippet_threshold: 30,
        num_typos: 1,
        typo_tokens_threshold: 1
      }

      const response: SearchResponse<any> = await nuxtApp.$typesenseSearch
        .collections('events')
        .documents()
        .search(searchParams)

      // Convert results back to Event objects
      const events: Event[] = response.hits?.map((hit: any) => {
        const doc = hit.document
        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          organizer: doc.organizer,
          organizerId: 'unknown', // Not indexed for privacy
          status: doc.status,
          type: doc.type,
          tags: doc.tags || [],
          startDate: new Date(doc.startDate * 1000),
          endDate: new Date(doc.endDate * 1000),
          attendeeCount: doc.attendeeCount || 0,
          maxAttendees: undefined, // Not indexed
          isEmbeddable: doc.isEmbeddable,
          streamUrl: undefined, // Not indexed for security
          embedUrl: undefined, // Not indexed for security
          externalLink: undefined, // Not indexed for security
          thumbnailUrl: undefined, // Not indexed for security
          createdAt: new Date(doc.createdAt * 1000),
          updatedAt: new Date(doc.createdAt * 1000) // Use createdAt as fallback
        }
      }) || []

      const result: SearchResult = {
        events,
        totalHits: response.found || 0,
        searchTime: response.search_time_ms || 0,
        facets: response.facet_counts?.reduce((acc: any, facet: any) => {
          acc[facet.field_name] = facet.counts?.map((count: any) => ({
            value: count.value,
            count: count.count
          }))
          return acc
        }, {})
      }

      searchResults.value = result
      return result
    } catch (err: any) {
      console.error('Search failed:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get search suggestions
  const getSuggestions = async (query: string, limit: number = 5): Promise<string[]> => {
    try {
      if (query.length < 2) return []
      
      if (!nuxtApp.$typesenseSearch) {
        console.warn('TypeSense search client not initialized')
        return []
      }

      // Check if collection exists first
      try {
        await nuxtApp.$typesenseAdmin?.collections('events').retrieve()
      } catch (collectionError) {
        console.warn('Events collection does not exist yet, returning empty suggestions')
        return []
      }

      const response = await nuxtApp.$typesenseSearch
        .collections('events')
        .documents()
        .search({
          q: query,
          query_by: 'title,tags',
          prefix: true,
          per_page: limit,
          facet_by: 'tags'
        })

      const suggestions = new Set<string>()
      
      // Add title matches
      response.hits?.forEach((hit: any) => {
        if (hit.highlights) {
          hit.highlights.forEach((highlight: any) => {
            if (highlight.field === 'title') {
              suggestions.add(hit.document.title)
            }
          })
        }
      })

      // Add tag suggestions
      response.facet_counts?.forEach((facet: any) => {
        if (facet.field_name === 'tags') {
          facet.counts?.slice(0, 3).forEach((count: any) => {
            if (count.value.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(count.value)
            }
          })
        }
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (err: any) {
      console.error('Failed to get suggestions:', err)
      return []
    }
  }

  // Get popular search terms
  const getPopularTags = async (limit: number = 10): Promise<Array<{tag: string, count: number}>> => {
    try {
      if (!nuxtApp.$typesenseSearch) {
        console.warn('TypeSense search client not initialized')
        return []
      }

      // Check if collection exists first
      try {
        await nuxtApp.$typesenseAdmin?.collections('events').retrieve()
      } catch (collectionError) {
        console.warn('Events collection does not exist yet, returning empty tags')
        return []
      }

      const response = await nuxtApp.$typesenseSearch
        .collections('events')
        .documents()
        .search({
          q: '*',
          query_by: 'title',
          facet_by: 'tags',
          per_page: 1
        })

      const tagCounts = response.facet_counts?.find((facet: any) => facet.field_name === 'tags')
      
      return tagCounts?.counts?.slice(0, limit).map((count: any) => ({
        tag: count.value,
        count: count.count
      })) || []
    } catch (err: any) {
      console.error('Failed to get popular tags:', err)
      return []
    }
  }

  // Bulk index events from Firebase
  const bulkIndexEvents = async (events: Event[]) => {
    try {
      const documents = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        organizer: event.organizer,
        status: event.status,
        type: event.type,
        tags: event.tags,
        startDate: Math.floor(event.startDate.getTime() / 1000),
        endDate: Math.floor(event.endDate.getTime() / 1000),
        attendeeCount: event.attendeeCount,
        isEmbeddable: event.isEmbeddable,
        createdAt: Math.floor(event.createdAt.getTime() / 1000)
      }))

      await nuxtApp.$typesenseAdmin.collections('events').documents().import(documents)
      console.log(`Bulk indexed ${events.length} events`)
    } catch (err: any) {
      console.error('Failed to bulk index events:', err)
      error.value = err.message
    }
  }

  return {
    searchResults: readonly(searchResults),
    loading: readonly(loading),
    error: readonly(error),
    initializeCollection,
    indexEvent,
    removeEvent,
    searchEvents,
    getSuggestions,
    getPopularTags,
    bulkIndexEvents
  }
}