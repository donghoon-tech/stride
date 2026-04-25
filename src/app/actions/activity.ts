'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createManualActivity(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const goal_id = formData.get('goal_id') as string | null
  const activity_type = formData.get('activity_type') as string
  const distance = formData.get('distance') as string
  const duration = formData.get('duration') as string
  const pagesRead = formData.get('pages_read') as string
  const date = formData.get('date') as string

  const metrics = {
    distance_km: distance ? Number(distance) : undefined,
    time_min: duration ? Number(duration) : undefined,
    pages_read: pagesRead ? Number(pagesRead) : undefined,
  }

  const recorded_at = date ? new Date(date).toISOString() : new Date().toISOString()

  const { error } = await supabase
    .from('activities')
    .insert({
      user_id: session.user.id,
      goal_id: goal_id ? goal_id : null,
      activity_type,
      recorded_at,
      raw_input: 'Manual Entry',
      metrics,
      ai_confidence: 1.0, // Perfect confidence for manual entry
    })

  if (error) {
    console.error("Supabase insert error:", error)
    redirect('/dashboard?error=failed_to_log_activity')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
