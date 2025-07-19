import type { Event, CreateEventData } from '~/types/event'

interface DemoConfig {
  enabled: boolean
  eventCount: {
    live: number
    upcoming: number
    ended: number
  }
}

export const useDemoData = () => {
  const { createEvent, getEvents, deleteEvent } = useEvents()
  const { initializeCollection, bulkIndexEvents } = useSearch()

  // Demo configuration
  const demoConfig: DemoConfig = {
    enabled: true, // Set to false to disable demo mode
    eventCount: {
      live: 3,
      upcoming: 8,
      ended: 5
    }
  }

  // Sample event templates
  const eventTemplates = [
    {
      title: "Slovakia Tech Meetup - Building the Future",
      description: "Join us for an exciting discussion about emerging technologies in Slovakia. We'll cover AI, blockchain, and sustainable tech solutions that are making Slovakia a tech hub in Central Europe.",
      type: "youtube" as const,
      tags: ["technology", "startup", "AI", "blockchain", "networking"],
      organizer: "Tech Slovakia",
      streamUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"
    },
    {
      title: "Bratislava Startup Pitch Night",
      description: "Local entrepreneurs present their innovative ideas to investors and the community. See the next generation of Slovak startups that are changing the world.",
      type: "twitch" as const,
      tags: ["startup", "entrepreneurship", "investment", "pitching", "innovation"],
      organizer: "Startup Bratislava",
      streamUrl: "https://twitch.tv/startupba",
      thumbnailUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop"
    },
    {
      title: "Digital Nomad Slovakia - Remote Work Paradise",
      description: "Discover why Slovakia is becoming the perfect destination for digital nomads. Learn about visa programs, co-working spaces, and the growing remote work community.",
      type: "zoom" as const,
      tags: ["remote-work", "digital-nomad", "lifestyle", "community", "travel"],
      organizer: "Nomad Slovakia",
      externalLink: "https://zoom.us/j/123456789",
      thumbnailUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop"
    },
    {
      title: "Košice Innovation Hub - Smart City Solutions",
      description: "Exploring how Košice is implementing smart city technologies. From IoT sensors to AI-powered traffic management, see how we're building the city of tomorrow.",
      type: "youtube" as const,
      tags: ["smart-city", "IoT", "innovation", "Košice", "sustainability"],
      organizer: "Košice Tech",
      streamUrl: "https://youtube.com/watch?v=SmartCity2024",
      thumbnailUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=450&fit=crop"
    },
    {
      title: "Slovakia Gaming Industry Showcase",
      description: "Meet the developers behind Slovakia's most successful games. Learn about the thriving gaming industry and opportunities for new developers.",
      type: "twitch" as const,
      tags: ["gaming", "game-development", "industry", "showcase", "entertainment"],
      organizer: "Game Dev Slovakia",
      streamUrl: "https://twitch.tv/gamedevsk",
      thumbnailUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=450&fit=crop"
    },
    {
      title: "Sustainable Slovakia - Green Tech Revolution",
      description: "How Slovakia is leading the green technology revolution in Europe. Solar, wind, and innovative environmental solutions changing our future.",
      type: "meet" as const,
      tags: ["sustainability", "green-tech", "environment", "renewable-energy", "climate"],
      organizer: "Green Slovakia",
      externalLink: "https://meet.google.com/green-tech-slovakia",
      thumbnailUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=450&fit=crop"
    },
    {
      title: "Prešov Cultural Heritage in Digital Age",
      description: "Preserving and promoting Slovak culture through digital platforms. VR museums, digital archives, and cultural apps bringing heritage to life.",
      type: "youtube" as const,
      tags: ["culture", "heritage", "digital", "VR", "museums", "Prešov"],
      organizer: "Digital Heritage SK",
      streamUrl: "https://youtube.com/watch?v=CulturalTech",
      thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=450&fit=crop"
    },
    {
      title: "Slovakia FinTech Forum - Banking Innovation",
      description: "Revolutionary fintech solutions developed in Slovakia. From mobile payments to blockchain banking, see how we're disrupting traditional finance.",
      type: "zoom" as const,
      tags: ["fintech", "banking", "blockchain", "payments", "innovation", "finance"],
      organizer: "FinTech Slovakia",
      externalLink: "https://zoom.us/j/fintechsk2024",
      thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop"
    },
    {
      title: "Žilina Manufacturing 4.0 Revolution",
      description: "Smart manufacturing and Industry 4.0 innovations happening in Žilina. Automation, AI, and robotics transforming traditional manufacturing.",
      type: "other" as const,
      tags: ["manufacturing", "industry-4.0", "automation", "AI", "robotics", "Žilina"],
      organizer: "Industry Slovakia",
      externalLink: "https://manufacturing4.slovakia.eu",
      thumbnailUrl: "https://images.unsplash.com/photo-1565514158740-b8996e0de0b5?w=800&h=450&fit=crop"
    },
    {
      title: "Slovakia Health Tech - Digital Medicine",
      description: "Revolutionary healthcare technology developed in Slovakia. Telemedicine, AI diagnostics, and digital health solutions improving lives.",
      type: "youtube" as const,
      tags: ["health-tech", "telemedicine", "AI", "diagnostics", "healthcare", "innovation"],
      organizer: "HealthTech SK",
      streamUrl: "https://youtube.com/watch?v=HealthTechSK",
      thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=450&fit=crop"
    },
    {
      title: "Banská Bystrica Space Tech Initiative",
      description: "Slovakia's contribution to space technology and satellite development. From small satellites to space tourism, we're reaching for the stars.",
      type: "twitch" as const,
      tags: ["space-tech", "satellites", "aerospace", "innovation", "Banská Bystrica"],
      organizer: "Space Slovakia",
      streamUrl: "https://twitch.tv/spaceslovakia",
      thumbnailUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=450&fit=crop"
    },
    {
      title: "Trenčín Food Tech - Future of Agriculture",
      description: "Innovative agricultural technology and food tech solutions. Vertical farming, food safety tech, and sustainable agriculture practices.",
      type: "meet" as const,
      tags: ["food-tech", "agriculture", "vertical-farming", "sustainability", "Trenčín"],
      organizer: "AgriTech Slovakia",
      externalLink: "https://meet.google.com/agritech-slovakia",
      thumbnailUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=450&fit=crop"
    },
    {
      title: "Nitra EdTech Revolution - Learning 3.0",
      description: "Educational technology transforming how we learn. VR classrooms, AI tutors, and personalized learning platforms developed in Slovakia.",
      type: "zoom" as const,
      tags: ["edtech", "education", "VR", "AI", "learning", "Nitra"],
      organizer: "EduTech Slovakia",
      externalLink: "https://zoom.us/j/edutechsk",
      thumbnailUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=450&fit=crop"
    },
    {
      title: "Slovakia Cybersecurity Summit",
      description: "Protecting digital Slovakia from cyber threats. Latest security technologies, threat intelligence, and cybersecurity career opportunities.",
      type: "youtube" as const,
      tags: ["cybersecurity", "security", "threats", "protection", "careers", "technology"],
      organizer: "CyberSec Slovakia",
      streamUrl: "https://youtube.com/watch?v=CyberSecSK",
      thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop"
    },
    {
      title: "Trnava Logistics Tech - Smart Supply Chain",
      description: "Revolutionary logistics and supply chain technology. Autonomous delivery, smart warehousing, and AI-powered logistics optimization.",
      type: "other" as const,
      tags: ["logistics", "supply-chain", "autonomous", "AI", "warehousing", "Trnava"],
      organizer: "LogiTech Slovakia",
      externalLink: "https://logitech.slovakia.eu",
      thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop"
    },
    {
      title: "Slovakia Women in Tech - Breaking Barriers",
      description: "Celebrating and supporting women in technology across Slovakia. Mentorship, career opportunities, and building inclusive tech communities.",
      type: "twitch" as const,
      tags: ["women-in-tech", "diversity", "inclusion", "mentorship", "careers", "community"],
      organizer: "Women Tech Slovakia",
      streamUrl: "https://twitch.tv/womentechsk",
      thumbnailUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=450&fit=crop"
    }
  ]

  // Generate dynamic dates based on current time
  const generateEventDates = (status: 'live' | 'upcoming' | 'ended') => {
    const now = new Date()
    
    switch (status) {
      case 'live':
        // Started 30 minutes to 2 hours ago, ends 30 minutes to 3 hours from now
        const liveStart = new Date(now.getTime() - (Math.random() * 120 + 30) * 60 * 1000)
        const liveEnd = new Date(now.getTime() + (Math.random() * 180 + 30) * 60 * 1000)
        return { startDate: liveStart, endDate: liveEnd }
        
      case 'upcoming':
        // Starts 1 hour to 7 days from now
        const upcomingStartOffset = (Math.random() * (7 * 24 - 1) + 1) * 60 * 60 * 1000
        const upcomingStart = new Date(now.getTime() + upcomingStartOffset)
        const upcomingEnd = new Date(upcomingStart.getTime() + (Math.random() * 120 + 60) * 60 * 1000)
        return { startDate: upcomingStart, endDate: upcomingEnd }
        
      case 'ended':
        // Ended 1 hour to 30 days ago
        const endedEndOffset = (Math.random() * (30 * 24 - 1) + 1) * 60 * 60 * 1000
        const endedEnd = new Date(now.getTime() - endedEndOffset)
        const endedStart = new Date(endedEnd.getTime() - (Math.random() * 120 + 60) * 60 * 1000)
        return { startDate: endedStart, endDate: endedEnd }
        
      default:
        return { startDate: now, endDate: new Date(now.getTime() + 60 * 60 * 1000) }
    }
  }

  // Generate random attendee count
  const generateAttendeeCount = (status: 'live' | 'upcoming' | 'ended') => {
    switch (status) {
      case 'live':
        return Math.floor(Math.random() * 150) + 25 // 25-175 active viewers
      case 'upcoming':
        return Math.floor(Math.random() * 80) + 10 // 10-90 registered
      case 'ended':
        return Math.floor(Math.random() * 200) + 50 // 50-250 total attended
      default:
        return 0
    }
  }

  // Create a demo event with retry logic
  const createDemoEvent = async (template: typeof eventTemplates[0], status: 'live' | 'upcoming' | 'ended', retries = 3): Promise<string> => {
    console.log(`📝 Creating ${status} event:`, template.title)
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { startDate, endDate } = generateEventDates(status)
        
        const eventData: CreateEventData = {
          title: template.title,
          description: template.description,
          startDate,
          endDate,
          type: template.type,
          streamUrl: template.streamUrl || undefined,
          externalLink: template.externalLink || undefined,
          thumbnailUrl: template.thumbnailUrl,
          tags: [...template.tags, 'demo-data'], // Add demo flag
          maxAttendees: status === 'upcoming' ? Math.floor(Math.random() * 200) + 100 : undefined
        }

        // Remove undefined fields to prevent Firebase errors
        Object.keys(eventData).forEach(key => {
          if (eventData[key as keyof CreateEventData] === undefined) {
            delete eventData[key as keyof CreateEventData]
          }
        })

        const eventId = await createEvent(eventData)
        console.log(`✅ Created event with ID: ${eventId}`)
        
        // Manually set the status and attendee count (since createEvent sets status to 'upcoming')
        const { updateEvent } = useEvents()
        if (status !== 'upcoming') {
          await updateEvent(eventId, {
            status,
            attendeeCount: generateAttendeeCount(status)
          })
          console.log(`🔄 Updated event ${eventId} to status: ${status}`)
        } else {
          await updateEvent(eventId, {
            attendeeCount: generateAttendeeCount(status)
          })
          console.log(`👥 Updated event ${eventId} attendee count`)
        }

        return eventId
      } catch (error: any) {
        console.error(`❌ Attempt ${attempt}/${retries} failed for ${template.title}:`, error.message)
        
        if (attempt === retries) {
          throw new Error(`Failed to create event "${template.title}" after ${retries} attempts: ${error.message}`)
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('Should not reach here')
  }

  // Generate all demo data
  const generateDemoData = async () => {
    if (!demoConfig.enabled) {
      console.log('Demo mode is disabled')
      return
    }

    console.log('🚀 Starting demo data generation...')
    console.log('Demo config:', demoConfig)
    
    try {
      // Shuffle templates to get random selection
      const shuffledTemplates = [...eventTemplates].sort(() => Math.random() - 0.5)
      let templateIndex = 0

      const createdEvents = []

      // Create live events
      for (let i = 0; i < demoConfig.eventCount.live; i++) {
        const template = shuffledTemplates[templateIndex % shuffledTemplates.length]
        const eventId = await createDemoEvent(template, 'live')
        createdEvents.push(eventId)
        templateIndex++
        console.log(`Created live event: ${template.title}`)
      }

      // Create upcoming events
      for (let i = 0; i < demoConfig.eventCount.upcoming; i++) {
        const template = shuffledTemplates[templateIndex % shuffledTemplates.length]
        const eventId = await createDemoEvent(template, 'upcoming')
        createdEvents.push(eventId)
        templateIndex++
        console.log(`Created upcoming event: ${template.title}`)
      }

      // Create ended events
      for (let i = 0; i < demoConfig.eventCount.ended; i++) {
        const template = shuffledTemplates[templateIndex % shuffledTemplates.length]
        const eventId = await createDemoEvent(template, 'ended')
        createdEvents.push(eventId)
        templateIndex++
        console.log(`Created ended event: ${template.title}`)
      }

      console.log(`✅ Generated ${createdEvents.length} demo events`)
      return createdEvents

    } catch (error) {
      console.error('Failed to generate demo data:', error)
      throw error
    }
  }

  // Clear demo data
  const clearDemoData = async () => {
    console.log('Clearing demo data...')
    
    try {
      const allEvents = await getEvents()
      const demoEvents = allEvents.filter(event => event.tags.includes('demo-data'))
      
      console.log(`Found ${demoEvents.length} demo events to delete`)
      
      for (const event of demoEvents) {
        await deleteEvent(event.id)
        console.log(`Deleted demo event: ${event.title}`)
      }

      console.log('✅ Demo data cleared')
      return demoEvents.length

    } catch (error) {
      console.error('Failed to clear demo data:', error)
      throw error
    }
  }

  // Initialize demo environment (Firebase + TypeSense)
  const initializeDemoEnvironment = async () => {
    if (!demoConfig.enabled) {
      console.log('Demo mode is disabled')
      return
    }

    console.log('Initializing demo environment...')
    
    try {
      // Initialize TypeSense collection
      await initializeCollection()
      console.log('✅ TypeSense collection initialized')

      // Generate demo events
      await generateDemoData()
      console.log('✅ Demo events created')

      // Sync to TypeSense (events are auto-synced when created)
      console.log('✅ Events synced to TypeSense')

      console.log('🎉 Demo environment ready!')

    } catch (error) {
      console.error('Failed to initialize demo environment:', error)
      throw error
    }
  }

  // Check if demo mode is enabled
  const isDemoMode = () => demoConfig.enabled

  // Toggle demo mode
  const toggleDemoMode = async (enabled: boolean) => {
    const wasEnabled = demoConfig.enabled
    demoConfig.enabled = enabled

    if (enabled && !wasEnabled) {
      // Enabling demo mode - generate data
      await initializeDemoEnvironment()
    } else if (!enabled && wasEnabled) {
      // Disabling demo mode - clear data
      await clearDemoData()
    }

    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Get demo statistics
  const getDemoStats = async () => {
    const allEvents = await getEvents()
    const demoEvents = allEvents.filter(event => event.tags.includes('demo-data'))
    
    const stats = {
      total: demoEvents.length,
      live: demoEvents.filter(e => e.status === 'live').length,
      upcoming: demoEvents.filter(e => e.status === 'upcoming').length,
      ended: demoEvents.filter(e => e.status === 'ended').length
    }

    return stats
  }

  return {
    isDemoMode,
    toggleDemoMode,
    generateDemoData,
    clearDemoData,
    initializeDemoEnvironment,
    getDemoStats,
    demoConfig
  }
}