# 🚀 Quick Start Guide

## First Time Setup

Follow these steps **in order** to get your Slovakia Community app running with demo data:

### 1. Start the Application
```bash
npm run dev
```
Navigate to: `http://localhost:3002`

### 2. Initialize TypeSense Search (First!)
1. Go to: `http://localhost:3002/admin/setup`
2. Click **"Initialize Search Index"**
3. Wait for "Successfully initialized" message

### 3. Enable Demo Data
1. Go to: `http://localhost:3002/admin/demo`
2. Click **"Enable Demo Mode"**
3. Wait for demo events to be created

### 4. Enjoy the Demo!
- **Homepage**: See live and upcoming events
- **Events Page**: Browse and search all events
- **Live Page**: Watch active live streams
- **Search**: Try searching for "tech", "startup", or city names

## ⚠️ Important Notes

- **Always initialize TypeSense FIRST** before enabling demo data
- If you see search errors, go to `/admin/setup` and initialize
- Demo events are automatically cleaned up when you disable demo mode
- All demo data is tagged with `demo-data` for easy identification

## 🔧 Troubleshooting

**Search Not Working?**
- Go to `/admin/setup` → Click "Initialize Search Index"
- Then go to `/admin/demo` → Click "Refresh Demo Data"

**No Events Showing?**
- Check `/admin/demo` to see if demo mode is enabled
- Look at the statistics to verify events were created

**TypeSense Collection Errors?**
- This is normal on first run - just initialize the search index first!

## 🎯 Demo Features to Try

- **Live Events**: See events with "LIVE" indicators and viewer counts
- **Search & Filter**: Use the search bar on the events page
- **Embedded Streams**: Click on YouTube/Twitch events to see embeds
- **Event Details**: Click any event to see full details page
- **Responsive Design**: Try on mobile/tablet sizes

Ready to explore Slovakia's vibrant tech community! 🇸🇰