export interface ParsedActivity {
  activity_type: string;
  metrics: Record<string, any>;
  ai_confidence: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserContext {
  userId: string;
  // Can add more context like current timezone, preferences, etc.
}

export interface CoachResponse {
  content: string;
  ui_card?: Record<string, any>;
}

export interface Goal {
  id: string;
  activity_type: string;
  title: string;
  target: Record<string, any>;
  deadline?: string | null;
}

export interface Activity {
  id: string;
  activity_type: string;
  recorded_at: string;
  metrics: Record<string, any>;
}

export interface TrainingPlan {
  valid_from: string;
  valid_until?: string | null;
  plan: Record<string, any>;
  generated_by: string;
}

export interface LLMProvider {
  parse(prompt: string): Promise<ParsedActivity>;
  chat(messages: Message[], context: UserContext): Promise<CoachResponse>;
  generatePlan(goal: Goal, history: Activity[]): Promise<TrainingPlan>;
}
