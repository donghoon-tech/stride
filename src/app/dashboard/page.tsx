import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { Activity } from '@/lib/llm/types'

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

  // Fetch goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentGoal = goals?.[0]

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your current progress.</p>
        </header>

        {/* Goal Progress Section */}
        <section className="bg-gray-50 border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Current Goal</h2>
            {!currentGoal && (
              <Link href="/goals/new">
                <Button size="sm">Set New Goal</Button>
              </Link>
            )}
          </div>
          
          {currentGoal ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{currentGoal.title}</span>
                <span>In Progress</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-black h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No active goals. Set one up to track your progress!</p>
          )}
        </section>

        {/* Recent Activities Section */}
        <section>
          <RecentActivities activities={(activities as unknown as Activity[]) || []} />
        </section>
      </div>
    </div>
  )
}
