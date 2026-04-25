"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createGoal } from "@/app/actions/goal"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewGoalPage() {
  const [activityType, setActivityType] = useState('running');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">Set a New Goal</h1>
            <p className="text-sm text-gray-500 mt-1">What do you want to achieve?</p>
          </header>

          <form action={createGoal} className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Goal Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="goal_type" value="cumulative" defaultChecked className="accent-black" />
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">Cumulative</div>
                    <div className="text-xs text-gray-500">e.g., Read 3000 pages</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 border rounded-lg p-3 flex-1 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="goal_type" value="record" className="accent-black" />
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">Best Record</div>
                    <div className="text-xs text-gray-500">e.g., 10km under 50m</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="activity_type" className="text-sm font-medium">Activity Type</label>
              <select 
                id="activity_type" 
                name="activity_type" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                required
              >
                <option value="running">Running</option>
                <option value="reading">Reading</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
            
            {activityType === 'custom' && (
              <div className="space-y-2">
                <label htmlFor="custom_activity_type" className="text-sm font-medium">Custom Activity Name</label>
                <Input id="custom_activity_type" name="activity_type" placeholder="e.g., Studying, Swimming" />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Goal Title</label>
              <Input id="title" name="title" placeholder="e.g., 10km under 50 mins" required />
            </div>

            {activityType === 'running' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target_distance" className="text-sm font-medium">Target Distance (km)</label>
                  <Input id="target_distance" name="target_distance" type="number" step="0.1" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="target_time" className="text-sm font-medium">Target Time (mins)</label>
                  <Input id="target_time" name="target_time" type="number" placeholder="50" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="metric_name" className="text-sm font-medium">Metric Name</label>
                  <Input 
                    key={`metric_name_${activityType}`}
                    id="metric_name" 
                    name="metric_name" 
                    placeholder={activityType === 'reading' ? 'pages' : 'e.g., laps'} 
                    defaultValue={activityType === 'reading' ? 'pages' : ''}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="target_value" className="text-sm font-medium">Target Value</label>
                  <Input id="target_value" name="target_value" type="number" placeholder="e.g., 3000" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">Deadline (Optional)</label>
              <Input id="deadline" name="deadline" type="date" />
            </div>

            <Button type="submit" className="w-full mt-4">Save Goal</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
