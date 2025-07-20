# Scripts

## update-past-events-images.js

Updates past events that are missing cover images by fetching thumbnails from YouTube/Twitch APIs.

### Prerequisites

1. Set up environment variables:
   ```bash
   export FIREBASE_API_KEY="your_firebase_api_key"
   export FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
   export FIREBASE_PROJECT_ID="your_project_id"
   export FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
   export FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   export FIREBASE_APP_ID="your_app_id"
   export TWITCH_CLIENT_ID="your_twitch_client_id"
   export TWITCH_CLIENT_SECRET="your_twitch_client_secret"
   ```

2. The script uses the existing dependencies from your project (firebase is already installed)

### Usage

```bash
node scripts/update-past-events-images.js
```

### What it does

1. Fetches all events from Firestore that don't have a `thumbnailUrl`
2. For YouTube events: Extracts video ID and fetches thumbnail from YouTube
3. For Twitch events: Extracts channel name and fetches thumbnail from Twitch API
4. For other events or when platform thumbnails fail: Generates a fallback image using ui-avatars.com
5. Updates the event records in Firestore with the thumbnail URLs

### Safety features

- Only updates events that don't already have thumbnails
- Includes error handling and graceful fallbacks
- Adds delays between updates to avoid rate limiting
- Provides detailed logging of the update process

### Example output

```
🚀 Starting past events image update...
🔍 Fetching events without thumbnails...
📊 Found 15 events to update

🔄 Processing: Weekly Tech Talk #23
  📺 Fetching YouTube thumbnail for video: dQw4w9WgXcQ
  ✅ Updated: https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg

🔄 Processing: Gaming Stream Archive
  🟣 Fetching Twitch thumbnail for channel: awesome_streamer
  ✅ Updated: https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/...

📈 Summary:
  ✅ Updated: 15 events
  ❌ Skipped: 0 events
  📊 Total processed: 15 events

🎉 Script completed!
```