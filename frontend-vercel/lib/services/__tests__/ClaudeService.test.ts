// __tests__/ClaudeService.test.ts
import { ClaudeService } from '../../services/ClaudeService';

describe('ClaudeService.generateReply', () => {
  it('throws if config missing', async () => {
    const origUrl = process.env.CLAUDE_API_URL;
    const origKey = process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_API_URL;
    delete process.env.CLAUDE_API_KEY;
    await expect(ClaudeService.generateReply('test')).rejects.toThrow('Claude configuration not set');
    process.env.CLAUDE_API_URL = origUrl;
    process.env.CLAUDE_API_KEY = origKey;
  });
});
