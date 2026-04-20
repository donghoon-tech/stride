import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { Activity, Goal } from '@/lib/llm/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch recent activities
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', session.user.id)
    .order('recorded_at', { ascending: false })
    .limit(10)

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
                <div key={goal.id} className="bg-gray-50 border rounded-xl p-5 space-y-4 transition-all hover:border-gray-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white capitalize">
                        {goal.activity_type}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">In Progress</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {goal.target?.distance_km && (
                      <div className="flex justify-between">
                        <span>Target Distance:</span>
                        <span className="font-medium text-gray-900">{goal.target.distance_km} km</span>
                      </div>
                    )}
                    {goal.target?.time_min && (
                      <div className="flex justify-between">
                        <span>Target Time:</span>
                        <span className="font-medium text-gray-900">{goal.target.time_min} mins</span>
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
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
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

        {/* Recent Activities Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Activities</h2>
          <RecentActivities activities={(activities as unknown as Activity[]) || []} />
        </section>
      </div>
    </div>
  )
}
