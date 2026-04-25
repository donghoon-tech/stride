export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          title: string
          target: Json
          current_progress: Json | null
          deadline: string | null
          achieved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          title: string
          target: Json
          current_progress?: Json | null
          deadline?: string | null
          achieved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          title?: string
          target?: Json
          current_progress?: Json | null
          deadline?: string | null
          achieved_at?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          activity_type: string
          recorded_at: string
          raw_input: string | null
          metrics: Json
          ai_confidence: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          activity_type: string
          recorded_at: string
          raw_input?: string | null
          metrics: Json
          ai_confidence?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          activity_type?: string
          recorded_at?: string
          raw_input?: string | null
          metrics?: Json
          ai_confidence?: number | null
          created_at?: string
        }
      }
      coach_messages: {
        Row: {
          id: string
          user_id: string
          activity_id: string | null
          role: 'user' | 'assistant'
          content: string
          ui_card: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id?: string | null
          role: 'user' | 'assistant'
          content: string
          ui_card?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string | null
          role?: 'user' | 'assistant'
          content?: string
          ui_card?: Json | null
          created_at?: string
        }
      }
      training_plans: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          plan: Json
          valid_from: string
          valid_until: string | null
          generated_by: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          plan: Json
          valid_from: string
          valid_until?: string | null
          generated_by: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          plan?: Json
          valid_from?: string
          valid_until?: string | null
          generated_by?: string
          created_at?: string
        }
      }
    }
  }
}
