<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Event Hosting Guide</h1>
      <p class="text-lg text-gray-600">
        Learn how to host amazing events with different platform combinations for participants and audiences.
      </p>
    </div>

    <!-- Quick Overview -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-blue-900 mb-3">🎯 Quick Decision Guide</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold text-green-700 mb-2">✅ Choose Internal Events When:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• You want to broadcast to many viewers</li>
            <li>• Content is one-way (presentation, demo)</li>
            <li>• You're streaming on YouTube/Twitch</li>
            <li>• Audience just watches and chats</li>
          </ul>
        </div>
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-semibold text-purple-700 mb-2">✅ Choose External Events When:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• You need two-way interaction</li>
            <li>• Participants will speak/share screens</li>
            <li>• Workshop, meeting, or discussion format</li>
            <li>• Limited active participants needed</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Internal Events Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
        📺 Internal Events (Streaming)
      </h2>
      
      <div class="space-y-6">
        <!-- YouTube Live -->
        <div class="border-l-4 border-red-500 pl-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🔴 YouTube Live</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="font-medium mb-2">How it works:</h4>
            <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Start a YouTube Live stream from your channel</li>
              <li>Copy the YouTube watch URL (youtube.com/watch?v=...)</li>
              <li>Create internal event with this URL</li>
              <li>Viewers watch embedded stream on your platform</li>
              <li>Chat happens on your platform, not YouTube</li>
            </ol>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium text-green-700 mb-2">✅ Best for:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Product demos</li>
                <li>• Educational content</li>
                <li>• Company announcements</li>
                <li>• Large audience events</li>
              </ul>
            </div>
            <div>
              <h4 class="font-medium text-blue-700 mb-2">💡 Pro tips:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Enable live chat on YouTube as backup</li>
                <li>• Test stream quality beforehand</li>
                <li>• Schedule stream in advance</li>
                <li>• Use OBS for better production value</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Twitch -->
        <div class="border-l-4 border-purple-500 pl-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🎮 Twitch Stream</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="font-medium mb-2">How it works:</h4>
            <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Go live on your Twitch channel</li>
              <li>Copy your Twitch channel URL (twitch.tv/yourchannel)</li>
              <li>Create internal event with this URL</li>
              <li>Stream embeds directly in your platform</li>
            </ol>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p class="text-sm text-yellow-800">
              <strong>Note:</strong> Twitch embeds work best for gaming content and interactive streams.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- External Events Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
        🤝 External Events (Meetings)
      </h2>
      
      <div class="space-y-6">
        <!-- Zoom + YouTube Hybrid -->
        <div class="border-l-4 border-blue-500 pl-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">💼 Zoom + YouTube (Hybrid Approach)</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="font-medium mb-2">Perfect setup for interactive events with audience:</h4>
            <ol class="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Create Zoom meeting</strong> for active participants (speakers, panelists)</li>
              <li><strong>Start YouTube Live stream</strong> and stream your Zoom meeting to it</li>
              <li><strong>Create external event</strong> with:
                <ul class="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Participant link: Zoom meeting URL (private)</li>
                  <li>Audience stream: YouTube Live URL (public)</li>
                </ul>
              </li>
              <li><strong>Participants</strong> join Zoom to speak/interact</li>
              <li><strong>Audience</strong> watches YouTube stream on your platform</li>
            </ol>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="bg-green-50 p-3 rounded">
              <h4 class="font-medium text-green-700 mb-2">👥 Participants Get:</h4>
              <ul class="text-xs text-green-600 space-y-1">
                <li>• Zoom meeting link</li>
                <li>• Can speak & share screen</li>
                <li>• Full interaction</li>
              </ul>
            </div>
            <div class="bg-blue-50 p-3 rounded">
              <h4 class="font-medium text-blue-700 mb-2">👀 Audience Gets:</h4>
              <ul class="text-xs text-blue-600 space-y-1">
                <li>• YouTube embedded stream</li>
                <li>• Can watch & chat</li>
                <li>• No meeting access needed</li>
              </ul>
            </div>
            <div class="bg-purple-50 p-3 rounded">
              <h4 class="font-medium text-purple-700 mb-2">🎯 You Get:</h4>
              <ul class="text-xs text-purple-600 space-y-1">
                <li>• Best of both worlds</li>
                <li>• Scalable audience</li>
                <li>• Interactive participants</li>
              </ul>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 class="font-semibold text-blue-900 mb-2">📋 Setup Checklist:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium text-blue-800 mb-1">Before the event:</h5>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>☐ Schedule Zoom meeting</li>
                  <li>☐ Set up YouTube Live stream</li>
                  <li>☐ Test streaming Zoom to YouTube</li>
                  <li>☐ Send participant links privately</li>
                </ul>
              </div>
              <div>
                <h5 class="font-medium text-blue-800 mb-1">During the event:</h5>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>☐ Start Zoom meeting</li>
                  <li>☐ Begin YouTube Live stream</li>
                  <li>☐ Share screen to stream Zoom</li>
                  <li>☐ Monitor both chats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Google Meet + YouTube -->
        <div class="border-l-4 border-green-500 pl-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📞 Google Meet + YouTube</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="font-medium mb-2">Same concept as Zoom, with Google Meet:</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Create Google Meet for participants</li>
              <li>Use YouTube Live to broadcast the meeting</li>
              <li>Meet has built-in recording and live streaming options</li>
              <li>Great integration with Google Workspace</li>
            </ul>
          </div>
        </div>

        <!-- Meeting-Only -->
        <div class="border-l-4 border-gray-500 pl-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">💬 Meeting-Only (No Stream)</h3>
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="font-medium mb-2">For smaller, interactive sessions:</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Only provide meeting link (Zoom, Meet, etc.)</li>
              <li>All attendees join as participants</li>
              <li>Best for workshops, team meetings, discussions</li>
              <li>Limited by meeting platform capacity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Platform Comparison -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">🔍 Platform Comparison</h2>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left p-3 font-semibold">Platform</th>
              <th class="text-left p-3 font-semibold">Best For</th>
              <th class="text-left p-3 font-semibold">Max Participants</th>
              <th class="text-left p-3 font-semibold">Streaming</th>
              <th class="text-left p-3 font-semibold">Recording</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="p-3 font-medium">YouTube Live</td>
              <td class="p-3">Large audiences, one-way content</td>
              <td class="p-3">Unlimited viewers</td>
              <td class="p-3">✅ Native</td>
              <td class="p-3">✅ Automatic</td>
            </tr>
            <tr>
              <td class="p-3 font-medium">Twitch</td>
              <td class="p-3">Gaming, interactive content</td>
              <td class="p-3">Unlimited viewers</td>
              <td class="p-3">✅ Native</td>
              <td class="p-3">✅ VODs</td>
            </tr>
            <tr>
              <td class="p-3 font-medium">Zoom</td>
              <td class="p-3">Professional meetings</td>
              <td class="p-3">100-1000 (plan dependent)</td>
              <td class="p-3">⚠️ Manual setup</td>
              <td class="p-3">✅ Built-in</td>
            </tr>
            <tr>
              <td class="p-3 font-medium">Google Meet</td>
              <td class="p-3">Casual meetings, Google users</td>
              <td class="p-3">100-250 (plan dependent)</td>
              <td class="p-3">⚠️ Manual setup</td>
              <td class="p-3">✅ Google Drive</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Best Practices -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">🎯 Best Practices</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🚀 Before Your Event</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              Test all technology 24 hours before
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              Send clear instructions to participants
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              Have backup plans for technical issues
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              Set up moderation for chat/Q&A
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              Prepare engaging content and visuals
            </li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">⚡ During Your Event</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              Start 5-10 minutes early for setup
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              Monitor both participant and audience engagement
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              Have someone manage chat while you present
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              Include interactive elements (polls, Q&A)
            </li>
            <li class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              Keep energy high and pace appropriate
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="mt-8 text-center">
      <NuxtLink 
        to="/events/create"
        class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Create Your Event Now
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
useHead({
  title: 'Event Hosting Guide - Slovakia Community',
  meta: [
    { name: 'description', content: 'Learn how to host amazing events with different platform combinations for participants and audiences' }
  ]
})
</script>