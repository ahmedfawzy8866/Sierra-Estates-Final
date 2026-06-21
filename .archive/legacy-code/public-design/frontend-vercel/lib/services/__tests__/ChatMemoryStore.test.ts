import { ChatMemoryStore } from '../../services/ChatMemoryStore';

describe('ChatMemoryStore', () => {
  it('adds and retrieves a message', async () => {
    const stakeholderId = 'test-stakeholder';
    await ChatMemoryStore.addMessage(stakeholderId, 'user', 'Hello world', 'web', false);
    const history = await ChatMemoryStore.getHistory(stakeholderId);
    expect(history.length).toBeGreaterThan(0);
    const last = history[history.length - 1];
    expect(last.sender).toBe('user');
    expect(last.text).toBe('Hello world');
    expect(last.platform).toBe('web');
  });
});
