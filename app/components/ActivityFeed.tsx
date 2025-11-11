// app/components/ActivityFeed.tsx
'use client'

import { useState, useEffect } from 'react'

interface Activity {
  activity_id: string
  activity_type: string
  activity_data: any
  created_at: string
  user: {
    email: string
  }
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    loadActivities()
    const interval = setInterval(loadActivities, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadActivities = async () => {
    const response = await fetch('/api/activity/feed')
    const data = await response.json()
    if (data.activities) setActivities(data.activities)
  }

  const formatActivity = (activity: Activity) => {
    const userEmail = activity.user.email.split('@')[0]
    const timeAgo = getTimeAgo(new Date(activity.created_at))

    switch (activity.activity_type) {
      case 'word_added':
        return `${userEmail} added "${activity.activity_data.word}" to their vocabulary`
      case 'wordlist_created':
        return `${userEmail} created a new word list: "${activity.activity_data.name}"`
      case 'study_session':
        return `${userEmail} completed a study session`
      //case 'achievement':
      //  return `${userEmail} earned an achievement: ${activity.activity_data.name}`
      default:
        return `${userEmail} did something`
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Friend Activity</h2>
      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity from friends</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.activity_id} className="border-b pb-3">
              <p>{formatActivity(activity)}</p>
              <p className="text-sm text-gray-500">{getTimeAgo(new Date(activity.created_at))}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}