'use server'

import { createClient } from '@/lib/supabase/server'
import { llm } from '@/lib/llm'
import { revalidatePath } from 'next/cache'

export async function generateWeeklyPlan() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' }
    }

    const userId = session.user.id

    // Fetch the user's active goal
    const { data: goals, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (goalError || !goals || goals.length === 0) {
      return { success: false, error: 'No active goal found. Set a goal first to generate a plan.' }
    }

    const goal = goals[0]

    // Fetch recent activities (e.g., last 14 days for better context)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', fourteenDaysAgo.toISOString())
      .order('recorded_at', { ascending: true })

    // Map DB structures to LLM structures
    const mappedGoal = {
      id: goal.id,
      activity_type: goal.activity_type,
      title: goal.title,
      target: goal.target as Record<string, any>,
      deadline: goal.deadline
    }

    const mappedActivities = (activities || []).map(a => ({
      id: a.id,
      activity_type: a.activity_type,
      recorded_at: a.recorded_at,
      metrics: a.metrics as Record<string, any>
    }))

    // Ask LLM to generate the plan
    const generatedPlan = await llm.generatePlan(mappedGoal, mappedActivities)

    // Save the plan to the database
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7) // Valid for 1 week

    const { error: insertError } = await supabase
      .from('training_plans')
      .insert({
        user_id: userId,
        goal_id: goal.id,
        plan: generatedPlan.plan,
        valid_from: generatedPlan.valid_from,
        valid_until: validUntil.toISOString(),
        generated_by: generatedPlan.generated_by
      })

    if (insertError) {
      console.error("Error saving plan to DB:", insertError)
      return { success: false, error: 'Failed to save generated plan' }
    }

    // Revalidate the plan page
    revalidatePath('/plan')

    return { success: true }
  } catch (error) {
    console.error('Error generating plan:', error)
    return { success: false, error: 'Failed to generate plan' }
  }
}
