"use client"

import { Goal, Activity } from '@/lib/llm/types'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { deleteGoal } from '@/app/actions/goal'
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

interface GoalCardProps {
  goal: Goal
  activities: Activity[]
}

export function GoalCard({ goal, activities }: GoalCardProps) {
  const [isPending, startTransition] = useTransition()

  let progress = 0;
  let currentVal = 0;
  let targetVal = 0;
  let metricName = "";

  if (goal.target?.metric_name) {
    // Universal Metric Logic
    metricName = goal.target.metric_name as string;
    const progressObj = goal.current_progress as Record<string, number> | undefined;
    currentVal = progressObj?.[metricName] || 0;
    targetVal = Number(goal.target.target_value) || 1; // avoid div by 0
    progress = Math.min(Math.round((currentVal / targetVal) * 100), 100);
  } else if (goal.activity_type === 'reading') {
    // Legacy Reading Logic
    metricName = 'pages_read';
    const progressObj = goal.current_progress as Record<string, number> | undefined;
    currentVal = progressObj?.pages_read || 0;
    targetVal = Number(goal.target?.pages_read) || 1;
    progress = Math.min(Math.round((currentVal / targetVal) * 100), 100);
  } else if (goal.goal_type === 'cumulative') {
    // Legacy Running Logic (Cumulative)
    if (goal.target?.distance_km) {
      const totalDistance = activities?.filter(a => a.activity_type === goal.activity_type)
        .reduce((sum, a) => {
          const metrics = a.metrics as Record<string, number> | undefined;
          return sum + (metrics?.distance_km || 0);
        }, 0) || 0;
      progress = Math.min(Math.round((totalDistance / Number(goal.target.distance_km)) * 100), 100);
    }
  } else if (goal.goal_type === 'record') {
    // Legacy Running Logic (Record)
    if (goal.target?.distance_km && goal.target?.time_min) {
      const targetDistance = Number(goal.target.distance_km);
      const targetTime = Number(goal.target.time_min);
      const validActivities = activities?.filter(a => {
        const metrics = a.metrics as Record<string, number> | undefined;
        return a.activity_type === goal.activity_type && (metrics?.distance_km || 0) >= targetDistance;
      }) || [];
      
      if (validActivities.length > 0) {
        const bestTime = Math.min(...validActivities.map(a => {
          const metrics = a.metrics as Record<string, number> | undefined;
          return metrics?.time_min || Infinity;
        }));
        if (bestTime !== Infinity && bestTime > 0) {
          progress = Math.min(Math.round((targetTime / bestTime) * 100), 100);
        }
      }
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteGoal(goal.id)
        toast.success('Goal deleted successfully')
      } catch {
        toast.error('Failed to delete goal')
      }
    })
  }

  return (
    <div className={`bg-gray-50 border rounded-xl p-5 space-y-4 transition-all hover:border-gray-300 group relative ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{goal.title}</h3>
          <div className="flex gap-2 mt-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white capitalize">
              {goal.activity_type}
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-white">
              {goal.goal_type === 'record' ? 'Best Record' : 'Cumulative'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-500 mr-2">In Progress</span>
          
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors opacity-50 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
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
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your goal
                  and remove any associated training plans.
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
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {Boolean(metricName) ? (
          <>
            <div className="flex justify-between">
              <span>Target {metricName}:</span>
              <span className="font-medium text-gray-900">{targetVal} {metricName}</span>
            </div>
            <div className="flex justify-between">
              <span>Current {metricName}:</span>
              <span className="font-medium text-gray-900">{currentVal} {metricName}</span>
            </div>
          </>
        ) : (
          // Legacy Running Fields
          <>
            {Boolean(goal.target?.distance_km) && (
              <div className="flex justify-between">
                <span>Target Distance:</span>
                <span className="font-medium text-gray-900">{String(goal.target.distance_km)} km</span>
              </div>
            )}
            {Boolean(goal.target?.time_min) && (
              <div className="flex justify-between">
                <span>Target Time:</span>
                <span className="font-medium text-gray-900">{String(goal.target.time_min)} mins</span>
              </div>
            )}
          </>
        )}
        {goal.deadline && (
          <div className="flex justify-between">
            <span>Deadline:</span>
            <span className="font-medium text-gray-900">
              {new Date(goal.deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between text-xs font-medium text-gray-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-black h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
