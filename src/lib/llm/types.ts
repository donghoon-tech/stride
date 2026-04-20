export interface ParsedActivity {
  activity_type: string;
  metrics: Record<string, unknown>;
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
  ui_card?: Record<string, unknown>;
}

export interface Goal {
  id: string;
  activity_type: string;
  goal_type: 'cumulative' | 'record';
  title: string;
  target: Record<string, unknown>;
  deadline?: string | null;
}

export interface Activity {
  id: string;
  activity_type: string;
  recorded_at: string;
  metrics: Record<string, unknown>;
}

export interface TrainingPlan {
  valid_from: string;
  valid_until?: string | null;
  plan: Record<string, unknown>;
  generated_by: string;
}

export interface LLMProvider {
  parse(prompt: string): Promise<ParsedActivity>;
  chat(messages: Message[], context: UserContext): Promise<CoachResponse>;
  generatePlan(goal: Goal, history: Activity[]): Promise<TrainingPlan>;
}
