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
    const systemInstruction = `You are a supportive, professional AI fitness coach. Analyze the user's latest activity and their history if provided. Keep your response brief, encouraging, and actionable (under 3 sentences).`;
    
    // Convert our internal Message format to Gemini's format if needed,
    // but the simplest way is to just send the whole conversation as text.
    const prompt = systemInstruction + '\n\n' + messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return { content: response.text || "Good job! Keep it up." };
  }

  async generatePlan(goal: Goal, history: Activity[]): Promise<TrainingPlan> {
    const planSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        plan: {
          type: Type.OBJECT,
          description: "A structured weekly training plan. Keys should be days (e.g., 'Monday', 'Tuesday'), and values should be the workout instructions (e.g., '5km easy run at 6:00 pace')."
        }
      },
      required: ['plan']
    };

    const prompt = `Generate a 1-week training plan.
Goal: ${goal.title} (${goal.activity_type})
Target: ${JSON.stringify(goal.target)}
History (last few activities): ${JSON.stringify(history)}

Create a balanced schedule taking the user's history and goal into account. Provide rest days.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
        temperature: 0.2,
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini while generating plan");
    }

    const parsed = JSON.parse(response.text);

    return {
      valid_from: new Date().toISOString(),
      plan: parsed.plan,
      generated_by: 'gemini-2.5-flash'
    };
  }
}
