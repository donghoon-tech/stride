import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { Activity, Goal } from '@/lib/llm/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch all recent activities for the heatmap and recent list
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', session.user.id)
    .order('recorded_at', { ascending: false })

  // Fetch all active goals
  const { data: goalsData } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', session.user.id)
    .is('achieved_at', null)
    .order('created_at', { ascending: false })

  const activeGoals = (goalsData as unknown as Goal[]) || []

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your current progress.</p>
        </header>

        {/* Goals Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold tracking-tight">Active Goals</h2>
            <Link href="/goals/new">
              <Button size="sm" variant={activeGoals.length > 0 ? "outline" : "default"}>
                + Add Goal
              </Button>
            </Link>
          </div>
          
          {activeGoals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeGoals.map((goal) => {
                let progress = 0;
                if (goal.goal_type === 'cumulative') {
                  if (goal.target?.distance_km) {
                    const totalDistance = activities?.filter(a => a.activity_type === goal.activity_type)
                      .reduce((sum, a) => sum + (Number((a.metrics as any)?.distance_km) || 0), 0) || 0;
                    progress = Math.min(Math.round((totalDistance / Number(goal.target.distance_km)) * 100), 100);
                  }
                } else if (goal.goal_type === 'record') {
                  if (goal.target?.distance_km && goal.target?.time_min) {
                    const targetDistance = Number(goal.target.distance_km);
                    const targetTime = Number(goal.target.time_min);
                    // Find activities that meet or exceed the target distance
                    const validActivities = activities?.filter(a => 
                      a.activity_type === goal.activity_type && 
                      (Number((a.metrics as any)?.distance_km) || 0) >= targetDistance
                    ) || [];
                    
                    if (validActivities.length > 0) {
                      const bestTime = Math.min(...validActivities.map(a => Number((a.metrics as any)?.time_min) || Infinity));
                      if (bestTime !== Infinity && bestTime > 0) {
                        progress = Math.min(Math.round((targetTime / bestTime) * 100), 100);
                      }
                    }
                  }
                }

                return (
                  <div key={goal.id} className="bg-gray-50 border rounded-xl p-5 space-y-4 transition-all hover:border-gray-300">
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
                      <span className="text-sm font-medium text-gray-500">In Progress</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
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
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center space-y-3">
              <p className="text-gray-500">No active goals yet.</p>
              <Link href="/goals/new">
                <Button>Set your first goal</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Activity Heatmap Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Activity Heatmap</h2>
          <div className="bg-gray-50 border rounded-xl p-5">
            <ActivityHeatmap activities={(activities as unknown as Activity[]) || []} />
          </div>
        </section>

        {/* Recent Activities Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Activities</h2>
            <Link href="/activities/new">
              <Button size="sm" variant="outline">
                + Log Activity
              </Button>
            </Link>
          </div>
          <RecentActivities activities={((activities as unknown as Activity[]) || []).slice(0, 10)} />
        </section>
      </div>
    </div>
  )
}
