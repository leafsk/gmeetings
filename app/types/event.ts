export interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'live' | 'ended' | 'adhoc'
  category: 'internal' | 'external'
  type: 'youtube' | 'twitch' | 'zoom' | 'meet' | 'other'
  streamUrl?: string
  embedUrl?: string
  stageUrl?: string
  externalLink?: string
  participantLink?: string
  isEmbeddable: boolean
  organizer: string
  organizerId: string
  thumbnailUrl?: string
  tags: string[]
  attendeeCount: number
  participantCount?: number
  maxAttendees?: number
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateEventData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  category: Event['category']
  type: Event['type']
  streamUrl?: string
  stageUrl?: string
  externalLink?: string
  participantLink?: string
  thumbnailUrl?: string
  tags: string[]
  maxAttendees?: number
  maxParticipants?: number
}

export interface EventFilter {
  status?: Event['status']
  type?: Event['type']
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}