"use client"

import { format } from 'date-fns'
import { ActivityCard } from '../chat/ActivityCard'
import { Activity } from '@/lib/llm/types'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { deleteActivity } from '@/app/actions/activity'
import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RecentActivitiesProps {
  activities: Activity[]
}

function ActivityActions({ activityId }: { activityId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteActivity(activityId)
        toast.success('Activity deleted successfully')
      } catch {
        toast.error('Failed to delete activity')
      }
    })
  }

  return (
    <div className={isPending ? 'opacity-50' : ''}>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors opacity-50 group-hover:opacity-100">
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <AlertDialogTrigger className="w-full">
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this activity log. Your goal progress will be updated accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
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
          <div key={activity.id} className="relative group">
            <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500 z-10">
              {format(new Date(activity.recorded_at), 'MMM d, yyyy h:mm a')}
            </div>
            
            <ActivityCard 
              activity={{
                activity_type: activity.activity_type,
                metrics: activity.metrics as Record<string, unknown>,
                ai_confidence: 1.0 // Assumed confirmed if it's in the DB
              }}
              actions={<ActivityActions activityId={activity.id} />}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
