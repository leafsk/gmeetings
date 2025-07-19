# 🎯 Demo Mode Setup Guide

This guide will help you quickly set up realistic demo data for the Slovakia Community application, perfect for development, testing, and presentations.

## 🚀 Quick Start

### 1. Start the Application
```bash
npm run dev
```

### 2. Initialize Demo Data
1. Navigate to `http://localhost:3002/admin/demo`
2. Click **"Enable Demo Mode"**
3. Wait for the setup to complete (usually 10-30 seconds)

That's it! Your application now has realistic event data.

## 📊 What Gets Created

When you enable demo mode, the system automatically generates:

### 🔴 Live Events (3 by default)
- Events that appear to be happening **right now**
- Dynamic viewer counts (25-175 active viewers)
- Started 30 minutes to 2 hours ago
- Will end 30 minutes to 3 hours from now

### ⏰ Upcoming Events (8 by default)
- Events scheduled for the **next few hours to days**
- Registration counts (10-90 registered attendees)
- Realistic scheduling spread over the next week

### 📽️ Past Events (5 by default)
- Events that "happened" in the **recent past**
- Total attendance counts (50-250 attendees)
- Ended 1 hour to 30 days ago

## 🎨 Event Types & Platforms

Demo events include realistic examples from various platforms:

- **YouTube Live** - Tech meetups, showcases, tutorials
- **Twitch** - Gaming events, startup pitches, casual streams  
- **Zoom** - Professional meetings, workshops, webinars
- **Google Meet** - Community calls, smaller gatherings
- **Other Platforms** - Custom event platforms and links

## 🏙️ Slovak Cities & Themes

Events are themed around real Slovak cities and relevant topics:

- **Bratislava** - Startups, tech hubs, innovation
- **Košice** - Smart city solutions, IoT
- **Žilina** - Manufacturing 4.0, automation
- **Prešov** - Cultural heritage, digital preservation
- **Banská Bystrica** - Space technology, aerospace
- **Trenčín** - Food tech, agriculture innovation
- **Nitra** - Education technology, learning
- **Trnava** - Logistics, supply chain tech

## 🔍 Search Integration

All demo events are automatically:
- **Indexed in TypeSense** for instant search
- **Tagged appropriately** for filtering
- **Searchable by title, description, organizer, and tags**
- **Faceted** for advanced filtering by type, status, and tags

## ⚙️ Configuration Options

You can customize the demo data generation:

### Event Counts
- **Live Events**: 0-10 (default: 3)
- **Upcoming Events**: 0-20 (default: 8)  
- **Past Events**: 0-20 (default: 5)

### Modification
1. Go to `/admin/demo`
2. Adjust the numbers in "Demo Configuration"
3. Click **"Refresh Demo Data"** to apply changes

## 🎛️ Demo Controls

### Enable Demo Mode
- Creates all demo events
- Initializes TypeSense search index
- Sets up realistic data for presentation

### Disable Demo Mode
- **Removes ALL demo events** from Firebase
- **Cleans up TypeSense index**
- Returns to clean state

### Refresh Demo Data
- Removes old demo events
- Generates new events with fresh dates
- Useful for keeping dates current during long development sessions

## 📈 Dynamic Dates

One of the key features of demo mode is **dynamic date generation**:

- **Live events** always appear to be happening "now"
- **Upcoming events** are always scheduled for "soon" 
- **Past events** always appear to have "recently ended"
- Dates are calculated relative to the current time

This means your demo data **always looks current**, regardless of when you enable it.

## 🧹 Cleanup

Demo events are tagged with `demo-data` for easy identification and cleanup:

- **Automatic**: Disable demo mode to remove all demo events
- **Manual**: Events with the `demo-data` tag can be filtered/deleted manually
- **Safe**: Only demo events are affected, real events are preserved

## 💡 Use Cases

### Development
- Test features with realistic data
- Verify responsive design with various content lengths
- Debug with multiple event states

### Presentations  
- Showcase the platform with professional-looking content
- Demonstrate live streaming capabilities
- Show search and filtering functionality

### Testing
- Stress test with various event types
- Verify date handling and time zones
- Test search performance and accuracy

## 🚨 Important Notes

1. **Demo mode is enabled by default** in `useDemoData.ts`
2. **All demo events are clearly tagged** to prevent confusion
3. **TypeSense integration** requires proper API keys (already configured)
4. **Firebase integration** requires proper project setup (already configured)
5. **Demo events don't affect real events** - they can coexist safely

## 🔧 Troubleshooting

### Demo Mode Won't Enable
- Check browser console for Firebase connection errors
- Verify TypeSense credentials in the config
- Ensure internet connection for image thumbnails

### Events Don't Appear
- Refresh the page after enabling demo mode
- Check the stats on `/admin/demo` to verify creation
- Look at browser network tab for API call errors

### Search Not Working
- Visit `/admin/setup` to initialize TypeSense
- Check TypeSense configuration in the plugin
- Verify API keys are correct

### Performance Issues
- Reduce the number of demo events in configuration
- Demo events include high-quality images which may load slowly
- Consider running with fewer events for development

## 🎉 Success!

Once demo mode is enabled, you should see:

- **Live events** on the homepage and `/live` page
- **Upcoming events** throughout the application  
- **Search functionality** working with realistic content
- **Professional presentation** ready for demos

Navigate around the application to see your demo data in action! 🇸🇰