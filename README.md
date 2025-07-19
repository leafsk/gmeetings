# 🇸🇰 Slovakia Community - Video Event Platform

A modern community platform built with Nuxt 4 and Firebase that enables people to share live streams, organize events, and build connections to make Slovakia the best country to live in.

## ✨ Features

### 🎥 Live Streaming & Events
- **Live Stream Embedding**: Support for YouTube Live and Twitch streams with automatic embedding
- **External Event Links**: Integration with Zoom, Google Meet, and other platforms
- **Real-time Status**: Live event indicators with auto-refresh
- **Event Management**: Create, edit, and manage community events

### 👥 Community Features
- **User Authentication**: Firebase-powered sign up/sign in system
- **Event Organization**: Users can create and manage their own events
- **Community Stats**: Track total events, members, and shared stories
- **Responsive Design**: Mobile-first design that works on all devices

### 🛠 Technical Features
- **Nuxt 4**: Latest version with improved performance and developer experience
- **Tailwind CSS**: Modern utility-first CSS framework
- **Firebase Integration**: Real-time database, authentication, and hosting ready
- **TypeScript**: Full type safety throughout the application
- **VueUse**: Powerful composables for enhanced functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (already configured)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Firebase Configuration

The Firebase configuration is already set up in `plugins/firebase.client.ts` with the project:
- **Project ID**: `growni10x-community`
- **Auth Domain**: `growni10x-community.firebaseapp.com`

## 📁 Project Structure

```
video-community-app/
├── components/           # Reusable Vue components
│   ├── EventCard.vue    # Individual event display
│   ├── Header.vue       # Navigation header
│   └── Footer.vue       # Site footer
├── composables/         # Vue composables for business logic
│   ├── useAuth.ts       # Authentication management
│   └── useEvents.ts     # Event CRUD operations
├── layouts/             # Page layouts
│   └── default.vue      # Main application layout
├── pages/               # Application routes
│   ├── index.vue        # Homepage
│   ├── live.vue         # Live events page
│   ├── events/          # Event-related pages
│   │   ├── index.vue    # All events listing
│   │   ├── [id].vue     # Individual event details
│   │   └── create.vue   # Event creation form
│   └── auth/            # Authentication pages
│       ├── login.vue    # Sign in page
│       └── signup.vue   # Sign up page
├── plugins/             # Nuxt plugins
│   ├── firebase.client.ts  # Firebase initialization
│   └── auth.client.ts       # Auth state initialization
├── types/               # TypeScript type definitions
│   └── event.ts         # Event-related types
└── nuxt.config.ts       # Nuxt configuration
```

## 🎯 Core Pages

### 🏠 Homepage (`/`)
- Hero section with community mission
- Live events showcase with embedded streams
- Upcoming events preview
- Community statistics
- Recent community stories

### 📅 Events (`/events`)
- Filterable event listing (All, Live, Upcoming, Past)
- Event search and categorization
- Create new event button
- Responsive grid layout

### 🔴 Live Events (`/live`)
- Featured live stream with full embed
- Real-time auto-refresh every 30 seconds
- Multiple concurrent live events
- Direct join/watch functionality

### 📝 Event Creation (`/events/create`)
- Comprehensive event creation form
- Support for multiple platform types
- Automatic embed URL generation
- Tag system for categorization

### 🔐 Authentication (`/auth/*`)
- Clean, accessible sign in/up forms
- Firebase Authentication integration
- Form validation and error handling
- Automatic redirects after authentication

## 🔥 Firebase Collections

### Events Collection (`events`)
```typescript
{
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'live' | 'ended'
  type: 'youtube' | 'twitch' | 'zoom' | 'meet' | 'other'
  streamUrl?: string
  embedUrl?: string
  externalLink?: string
  isEmbeddable: boolean
  organizer: string
  organizerId: string
  thumbnailUrl?: string
  tags: string[]
  attendeeCount: number
  maxAttendees?: number
  createdAt: Date
  updatedAt: Date
}
```

### Users Collection (`users`)
```typescript
{
  id: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
  location?: string
  website?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🎬 Live Stream Support

### Supported Platforms
- **YouTube Live**: Automatic embed URL generation from watch URLs
- **Twitch**: Live stream embedding with chat integration
- **Zoom**: External link integration (non-embeddable)
- **Google Meet**: External link integration (non-embeddable)
- **Custom Platforms**: Generic external link support

### Embed URL Generation
The system automatically converts platform URLs to embeddable formats:
- YouTube: `youtube.com/watch?v=ID` → `youtube.com/embed/ID`
- Twitch: `twitch.tv/channel` → `player.twitch.tv/?channel=channel`

## 🛠 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint (if configured)
npm run typecheck # Run TypeScript checks (if configured)
```

## 🚧 Future Enhancements

### TypeSense Search Integration
- Full-text search across events
- Advanced filtering and faceting
- Auto-complete suggestions
- Search analytics

### Additional Features
- **Event Categories**: Technology, Business, Social, etc.
- **User Profiles**: Detailed community member profiles
- **Event Reviews**: Post-event feedback and ratings
- **Calendar Integration**: Export events to Google Calendar
- **Push Notifications**: Real-time event updates
- **Social Sharing**: Enhanced sharing capabilities
- **Event Analytics**: Organizer insights and metrics

## 🎯 Mission

Building technology to make Slovakia the best country to live in through community connections, shared experiences, and collaborative growth.

---

Built with ❤️ for the Slovakia community using Nuxt 4, Firebase, and Tailwind CSS.
