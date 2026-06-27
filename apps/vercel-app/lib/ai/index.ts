/**
 * SIERRA ESTATES — AI Service Factory
 * Automatically selects real or mock AI service based on environment.
 */

import { AIService } from './AIServiceInterface';
import { MockAIService } from './MockAIService';

let _instance: AIService | null = null;

export function getAIService(): AIService {
  if (_instance) return _instance;

  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;

  if (hasApiKey) {
    try {
      // Dynamic import to avoid 'server-only' guard in client bundles
      const { GoogleAIServiceImpl } = require('./GoogleAIServiceImpl');
      const instance = new GoogleAIServiceImpl() as AIService;
      _instance = instance;
      console.log('[AI] Using Google Gemini AI service');
      return instance;
    } catch (err) {
      console.warn('[AI] Failed to initialize Google AI, falling back to mock:', err);
    }
  }

  console.warn('[AI] GOOGLE_AI_API_KEY not set — using MockAIService. Set the key for production AI.');
  _instance = new MockAIService();
  return _instance;
}

export type { AIService, AIPrompt, AIOptions, AIModel } from './AIServiceInterface';
export { MockAIService } from './MockAIService';
