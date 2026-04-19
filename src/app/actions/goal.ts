'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGoal(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const activity_type = formData.get('activity_type') as string
  const targetDistance = formData.get('target_distance') as string
  const targetTime = formData.get('target_time') as string
  const deadline = formData.get('deadline') as string

  const target = {
    distance_km: targetDistance ? Number(targetDistance) : undefined,
    time_min: targetTime ? Number(targetTime) : undefined,
  }

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: session.user.id,
      title,
      activity_type,
      target,
      deadline: deadline ? deadline : null,
    })

  if (error) {
    console.error(error)
    redirect('/dashboard?error=failed_to_create_goal')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
