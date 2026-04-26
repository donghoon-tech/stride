"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createManualActivity } from "@/app/actions/activity"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function NewActivityPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('none');
  
  useEffect(() => {
    const fetchGoals = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.user.id)
          .is('achieved_at', null)
          .order('created_at', { ascending: false });
          
        if (data) setGoals(data);
      }
    };
    fetchGoals();
  }, []);

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  
  let isUniversalMetric = false;
  let metricName = '';

  if (selectedGoal) {
    if (selectedGoal.target?.metric_name) {
      isUniversalMetric = true;
      metricName = selectedGoal.target.metric_name;
    } else if (selectedGoal.activity_type === 'reading') {
      isUniversalMetric = true;
      metricName = 'pages_read';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight">Log Activity</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your workout or progress details manually.</p>
          </header>

          <form action={createManualActivity} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="goal_id" className="text-sm font-medium">Which Goal are you logging progress for?</label>
              <select 
                id="goal_id" 
                name="goal_id" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
              >
                <option value="none">Log activity without a goal</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title} ({g.activity_type})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="activity_type" className="text-sm font-medium">Activity Type</label>
              <Input 
                id="activity_type" 
                name="activity_type" 
                value={selectedGoal ? selectedGoal.activity_type : 'running'} 
                onChange={() => {}} // Controlled by goal
                readOnly={!!selectedGoal}
                required 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Date & Time</label>
              <Input 
                id="date" 
                name="date" 
                type="datetime-local" 
                defaultValue={(() => {
                  const now = new Date();
                  const offset = now.getTimezoneOffset() * 60000;
                  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
                })()} 
                required 
              />
            </div>
            
            {isUniversalMetric ? (
              <div className="space-y-2">
                <input type="hidden" name="metric_name" value={metricName} />
                <label htmlFor="metric_value" className="text-sm font-medium">How many {metricName}?</label>
                <Input id="metric_value" name="metric_value" type="number" step="any" placeholder="e.g., 15" required />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="distance" className="text-sm font-medium">Distance (km)</label>
                  <Input id="distance" name="distance" type="number" step="0.1" placeholder="5.0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-sm font-medium">Duration (mins)</label>
                  <Input id="duration" name="duration" type="number" placeholder="30" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-4">Save Activity</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
