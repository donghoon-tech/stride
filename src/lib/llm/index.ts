import { LLMProvider } from './types';
import { GeminiProvider } from './providers/gemini';

// Currently only Gemini is implemented, but we can easily swap or configure this
// based on environment variables later (e.g. process.env.LLM_PROVIDER === 'claude' ? new ClaudeProvider() : ...)

export const llm: LLMProvider = new GeminiProvider();
