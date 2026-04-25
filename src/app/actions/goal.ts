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
  const goal_type = formData.get('goal_type') as string
  const deadline = formData.get('deadline') as string
  
  // Legacy / preset fields
  const targetDistance = formData.get('target_distance') as string
  const targetTime = formData.get('target_time') as string
  
  // Universal fields
  const metricName = formData.get('metric_name') as string
  const targetValue = formData.get('target_value') as string

  let target: Record<string, any> = {};
  let current_progress: Record<string, any> | undefined = undefined;

  // Handle universal metrics first
  if (metricName && targetValue) {
    target = {
      metric_name: metricName,
      target_value: Number(targetValue)
    };
    current_progress = { [metricName]: 0 };
  } else {
    // Fallback to legacy fields for running
    target = {
      distance_km: targetDistance ? Number(targetDistance) : undefined,
      time_min: targetTime ? Number(targetTime) : undefined,
    }
  }

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: session.user.id,
      title,
      activity_type,
      goal_type,
      target,
      current_progress,
      deadline: deadline ? deadline : null,
    })

  if (error) {
    console.error("Supabase insert error:", error)
    redirect('/dashboard?error=failed_to_create_goal')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
