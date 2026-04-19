import { format } from 'date-fns'
import { ActivityCard } from '../chat/ActivityCard'
import { Activity } from '@/lib/llm/types'

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 border rounded-xl text-gray-500">
        No recent activities found. Start logging your workouts in the Coach tab!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500 z-10">
              {format(new Date(activity.recorded_at), 'MMM d, yyyy h:mm a')}
            </div>
            <ActivityCard 
              activity={{
                activity_type: activity.activity_type,
                metrics: activity.metrics,
                ai_confidence: 1.0 // Assumed confirmed if it's in the DB
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
