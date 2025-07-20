# Live Streaming Status Detection System

## Overview

This system solves the fundamental problem of knowing when external streams are actually live vs scheduled/ended/broken.

## How It Works

### 1. **Computed Status (Never Stored)**
- Event status is ALWAYS computed in real-time
- Database only stores event metadata, never current status
- Status calculation combines time + platform detection

### 2. **Multi-Layer Detection**

**Time-Based Foundation:**
- Uses `startDate` and `endDate` with grace periods
- 15min before start: "upcoming" 
- 30min after end: "ended"
- During window: Check platform APIs

**Platform-Specific APIs:**
- **YouTube**: Uses YouTube Data API v3 to check `liveBroadcastContent`
- **Twitch**: Uses Twitch Helix API to check stream status
- **Zoom/Meet**: Time-based (hard to detect externally)
- **Other**: Manual/"adhoc" status

### 3. **Graceful Fallbacks**
1. API check succeeds → Use real platform status
2. API fails → Fall back to time-based logic
3. Time ambiguous → Show as live with warning

## Implementation

### Core Files
- `composables/useEventStatus.ts` - Status computation logic
- `server/api/stream-status.ts` - Platform API calls (avoids CORS)
- `composables/useEvents.ts` - Updated to use computed status

### Usage
```typescript
const { getEventStatus } = useEventStatus()
const status = await getEventStatus(event) // 'live' | 'upcoming' | 'ended' | 'adhoc'
```

## API Configuration

### YouTube Data API
```env
YOUTUBE_API_KEY=your_api_key_here
```

### Twitch API
```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```

## Status Flow

```
Event Created
    ↓
Time Check → Before Grace Period? → "upcoming"
    ↓
Within Live Window?
    ↓
Platform API Check
    ↓
├─ Live? → "live"
├─ Not Live? → Check time bounds
└─ API Failed? → Time-based fallback
    ↓
After Grace Period? → "ended"
```

## Platform Detection Logic

### YouTube
- Extracts video ID from various URL formats
- Calls YouTube Data API v3 `/videos` endpoint
- Checks `liveBroadcastContent` field:
  - `"live"` = currently live
  - `"none"` = not live/recorded
  - `"upcoming"` = scheduled but not started

### Twitch
- Extracts channel name from URL
- Gets OAuth token using client credentials
- Calls Twitch Helix API `/streams` endpoint
- Stream exists in response = live, otherwise offline

### Zoom/Meet
- No reliable external API
- Uses time-based detection only
- Assumes valid during scheduled window

## Caching Strategy

- **1-minute cache** for API results per event
- Prevents excessive API calls
- Cache key: `{eventId}-{type}-{streamUrl}`
- Automatic cache invalidation

## Error Handling

- **API Failures**: Graceful fallback to time-based logic
- **Invalid URLs**: Marked as invalid, falls back to time
- **Rate Limits**: Cached results prevent hitting limits
- **Network Issues**: Falls back to scheduled times

## Benefits

1. **Real-time Accuracy**: Know actual platform status
2. **Reliability**: Multiple fallback layers
3. **Performance**: Caching prevents API spam
4. **Flexibility**: Easy to add new platforms
5. **User Experience**: Accurate live indicators

## Future Enhancements

- **Webhooks**: Real-time platform notifications
- **Stream Health**: Check if embed URLs work
- **Viewer Counts**: Real-time viewership data
- **Recording Detection**: Distinguish live vs recorded
- **Manual Overrides**: Creator can force status