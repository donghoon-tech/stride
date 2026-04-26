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

  const goal_id_raw = formData.get('goal_id') as string | null
  const final_goal_id = goal_id_raw === 'none' ? null : goal_id_raw;

  const activity_type = formData.get('activity_type') as string
  const date = formData.get('date') as string
  
  // Legacy / preset fields
  const distance = formData.get('distance') as string
  const duration = formData.get('duration') as string
  
  // Universal fields
  const metricName = formData.get('metric_name') as string
  const metricValue = formData.get('metric_value') as string

  let metrics: Record<string, any> = {};

  if (metricName && metricValue) {
    metrics[metricName] = Number(metricValue);
  } else {
    metrics = {
      distance_km: distance ? Number(distance) : undefined,
      time_min: duration ? Number(duration) : undefined,
    }
  }

  // Auto-upgrade legacy reading goals to universal metrics
  if (final_goal_id && activity_type === 'reading') {
    const { data: goal } = await supabase.from('goals').select('*').eq('id', final_goal_id).single();
    if (goal && !goal.target?.metric_name) {
      const legacyPagesReadTarget = goal.target?.pages_read || 3000;
      const newTarget = { ...goal.target, metric_name: 'pages_read', target_value: legacyPagesReadTarget };
      const currentPagesRead = goal.current_progress?.pages_read || 0;
      const newProgress = { ...goal.current_progress, pages_read: currentPagesRead };
      
      await supabase.from('goals').update({
        target: newTarget,
        current_progress: newProgress
      }).eq('id', final_goal_id);
    }
  }

  const recorded_at = date ? new Date(date).toISOString() : new Date().toISOString()

  const { error } = await supabase
    .from('activities')
    .insert({
      user_id: session.user.id,
      goal_id: final_goal_id,
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
