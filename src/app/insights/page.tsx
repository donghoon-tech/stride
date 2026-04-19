import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DistanceChart } from '@/components/charts/DistanceChart'
import { Activity } from '@/lib/llm/types'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch activities from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('recorded_at', sevenDaysAgo.toISOString())
    .order('recorded_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-gray-500 mt-2">Analyze your recent performance.</p>
        </header>

        <section>
          {activities && activities.length > 0 ? (
            <DistanceChart activities={(activities as unknown as Activity[])} />
          ) : (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-500">
              Not enough data to generate insights yet. Keep logging!
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
