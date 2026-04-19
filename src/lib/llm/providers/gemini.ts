import { GoogleGenAI, Type, Schema } from '@google/genai';
import { LLMProvider, ParsedActivity, Message, UserContext, CoachResponse, Goal, Activity, TrainingPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const parseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    activity_type: {
      type: Type.STRING,
      description: "The type of activity. e.g. 'running', 'pullup', 'reading', 'studying', 'swimming'. Infer from the prompt."
    },
    metrics: {
      type: Type.OBJECT,
      description: "A flexible dictionary of metrics extracted. For running, might include distance_km (number), duration_min (number), pace_per_km (string), avg_hr (number), cadence (number), difficulty (1-10). For reading, might include pages_read. Parse numbers as numbers."
    },
    ai_confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0.0 and 1.0 of how well the prompt was understood. 1.0 means perfectly unambiguous."
    }
  },
  required: ['activity_type', 'metrics', 'ai_confidence']
};

export class GeminiProvider implements LLMProvider {
  async parse(prompt: string): Promise<ParsedActivity> {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: parseSchema,
        temperature: 0.1,
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text) as ParsedActivity;
  }

  async chat(messages: Message[], context: UserContext): Promise<CoachResponse> {
    // Basic implementation for now, will enhance in later chunk
    return { content: "Good job! Keep it up." };
  }

  async generatePlan(goal: Goal, history: Activity[]): Promise<TrainingPlan> {
     // Basic implementation for now, will enhance in later chunk
     return {
       valid_from: new Date().toISOString(),
       plan: {},
       generated_by: 'gemini-2.5-flash'
     };
  }
}
