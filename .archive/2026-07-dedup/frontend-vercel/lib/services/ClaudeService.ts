// lib/services/ClaudeService.ts

/**
 * Service that talks to the Claude AI model.
 * It abstracts the HTTP request/response handling, retries, and token management.
 *
 * The endpoint and API key are expected in environment variables:
 *   CLAUDE_API_URL  – Base URL of the Claude service (e.g., https://api.anthropic.com/v1/complete)
 *   CLAUDE_API_KEY  – Secret key for authentication.
 */
export class ClaudeService {
  private static readonly apiUrl = process.env.CLAUDE_API_URL;
  private static readonly apiKey = process.env.CLAUDE_API_KEY;

  /**
   * Sends a prompt to Claude and returns the generated reply.
   * Retries with exponential back‑off up to 3 attempts on transient failures.
   */
  static async generateReply(prompt: string, conversationId?: string): Promise<string> {
    const url = this.apiUrl;
    const key = this.apiKey;
    if (!url || !key) {
      console.error('❌ ClaudeService configuration missing.');
      throw new Error('Claude configuration not set');
    }

    const payload = {
      prompt,
      // Optional conversation tracking – sent back on each request for context stitching.
      conversation_id: conversationId,
      max_tokens: 1024,
      temperature: 0.7,
      model: 'claude-2.1', // Adjust if needed.
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': key,
    };

    const makeRequest = async (attempt = 1): Promise<any> => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Claude request failed ${response.status}: ${errBody}`);
        }
        return response.json();
      } catch (err) {
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 200;
          console.warn(`⚡ Claude retry ${attempt} after ${delay}ms – ${err}`);
          await new Promise(res => setTimeout(res, delay));
          return makeRequest(attempt + 1);
        }
        throw err;
      }
    };

    const data = await makeRequest();
    // Anthropic returns {completion: "..."} – adapt if using a different provider.
    return data.completion?.trim() ?? '';
  }
}
