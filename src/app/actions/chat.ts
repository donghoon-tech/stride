'use server'

import { createClient } from '@/lib/supabase/server'
import { llm } from '@/lib/llm'
import { ParsedActivity } from '@/lib/llm/types'

export async function processUserMessage(message: string) {
  try {
    // 1. LLM parses the message
    const parsed = await llm.parse(message)

    // 2. Validate and Save to Supabase (if confidence is high enough)
    // Even if confidence is low, we might still want to return it to the UI for user confirmation.
    
    // Attempt to get the current user session
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    let savedActivity = null;

    if (session?.user && parsed.ai_confidence >= 0.8) {
      // Save directly to activities table
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: session.user.id,
          activity_type: parsed.activity_type,
          recorded_at: new Date().toISOString(),
          raw_input: message,
          metrics: parsed.metrics,
          ai_confidence: parsed.ai_confidence
        })
        .select()
        .single()

      if (!error && data) {
        savedActivity = data;
        
        // After saving, generate a coaching message
        // Fetch recent history (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentActivities } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('recorded_at', sevenDaysAgo.toISOString())
          .order('recorded_at', { ascending: true });

        // Pass recent activities as context in the chat
        const historyContext = `Recent activities (last 7 days):\n${JSON.stringify(recentActivities || [])}\n\nUser just logged: ${message}`;
        
        const coaching = await llm.chat([
          { role: 'user', content: historyContext }
        ], { userId: session.user.id });

        // Save the coach message
        await supabase
          .from('coach_messages')
          .insert({
            user_id: session.user.id,
            activity_id: data.id,
            role: 'assistant',
            content: coaching.content,
            ui_card: parsed as any // Or some other UI representation
          })

        return { 
          success: true, 
          parsed, 
          coaching: coaching.content,
          requiresConfirmation: false 
        }
      }
    }

    // If no user session, or confidence < 0.8, require confirmation from UI
    return {
      success: true,
      parsed,
      coaching: null,
      requiresConfirmation: parsed.ai_confidence < 0.8 || !session?.user
    }

  } catch (error) {
    console.error("Error processing message:", error);
    return { success: false, error: "Failed to process the message." }
  }
}
