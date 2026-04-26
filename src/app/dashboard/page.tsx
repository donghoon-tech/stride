import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { Activity, Goal } from '@/lib/llm/types'
import { GoalCard } from '@/components/dashboard/GoalCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch all recent activities for the heatmap and recent list
  const { data: activitiesData } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', session.user.id)
    .order('recorded_at', { ascending: false })

  const activities = (activitiesData as unknown as Activity[]) || []

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
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  activities={activities} 
                />
              ))}
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
            <ActivityHeatmap activities={activities} />
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
          <RecentActivities activities={activities.slice(0, 10)} />
        </section>
      </div>
    </div>
  )
}
