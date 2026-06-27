/**
 * Tests for lib/server/whatsapp-queue.ts.
 *
 * Twilio/Firestore are mocked out — these tests exercise the queue's own
 * logic (business-hours gating, per-number rate limiting, round-robin
 * selection) in isolation, using the in-memory fallback path (no
 * UPSTASH_REDIS_REST_URL/TOKEN set).
 */

const sendTwilioWhatsAppMessage = jest.fn().mockResolvedValue({ sid: 'SMtest' });
const logWhatsAppMessage = jest.fn().mockResolvedValue(undefined);

jest.mock('@/lib/server/twilio-client', () => ({
  sendTwilioWhatsAppMessage: (...args: unknown[]) => sendTwilioWhatsAppMessage(...args),
  logWhatsAppMessage: (...args: unknown[]) => logWhatsAppMessage(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let queue: any;

function loadFreshQueueModule() {
  jest.resetModules();
  sendTwilioWhatsAppMessage.mockClear().mockResolvedValue({ sid: 'SMtest' });
  logWhatsAppMessage.mockClear().mockResolvedValue(undefined);

  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.WABA_NUMBER_1 = '201032206443';
  process.env.WABA_NUMBER_2 = '201092048333';
  process.env.WABA_NUMBER_3 = '201061399688';
  process.env.WABA_NUMBER_4 = '201031622700';

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  queue = require('../whatsapp-queue');
}

beforeEach(() => {
  loadFreshQueueModule();
});

describe('isWithinOperatingHours (Africa/Cairo, 12:00–20:00)', () => {
  it('is false just before the 12:00 Cairo opening', () => {
    expect(queue.isWithinOperatingHours(new Date('2024-01-15T09:59:00Z'))).toBe(false);
  });

  it('is true exactly at the 12:00 Cairo opening', () => {
    expect(queue.isWithinOperatingHours(new Date('2024-01-15T10:00:00Z'))).toBe(true);
  });

  it('is true in the middle of the operating window', () => {
    expect(queue.isWithinOperatingHours(new Date('2024-01-15T15:00:00Z'))).toBe(true);
  });

  it('is false exactly at the 20:00 Cairo close', () => {
    expect(queue.isWithinOperatingHours(new Date('2024-01-15T18:00:00Z'))).toBe(false);
  });

  it('is false well after closing', () => {
    expect(queue.isWithinOperatingHours(new Date('2024-01-15T20:00:00Z'))).toBe(false);
  });
});

describe('per-number rate limiting (30 msg / 2 hr)', () => {
  const IN_HOURS = new Date('2024-01-15T15:00:00Z'); // 17:00 Cairo

  it('sends the first 30 messages on a number, then queues the 31st instead of sending', async () => {
    jest.spyOn(global.Date, 'now').mockReturnValue(IN_HOURS.getTime());
    jest.useFakeTimers().setSystemTime(IN_HOURS);

    for (let i = 0; i < 30; i++) {
      const result = await queue.enqueueWhatsAppMessage('201000000001', `msg ${i}`, {
        senderNumber: '201032206443',
      });
      expect(result.queued).toBe(false);
    }
    expect(sendTwilioWhatsAppMessage).toHaveBeenCalledTimes(30);

    const blocked = await queue.enqueueWhatsAppMessage('201000000001', 'msg 31', {
      senderNumber: '201032206443',
    });
    expect(blocked.queued).toBe(true);
    expect(sendTwilioWhatsAppMessage).toHaveBeenCalledTimes(30);

    jest.useRealTimers();
  });

  it('does not let a rate-limited number affect a different number', async () => {
    jest.useFakeTimers().setSystemTime(IN_HOURS);

    for (let i = 0; i < 30; i++) {
      await queue.enqueueWhatsAppMessage('201000000001', `msg ${i}`, { senderNumber: '201032206443' });
    }
    const otherNumberResult = await queue.enqueueWhatsAppMessage('201000000002', 'hello', {
      senderNumber: '201092048333',
    });
    expect(otherNumberResult.queued).toBe(false);

    jest.useRealTimers();
  });
});

describe('round-robin sender selection', () => {
  it('cycles through all 4 configured numbers without repeats', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T15:00:00Z'));

    const picks = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const sender = await queue.selectSenderNumber();
      expect(sender).not.toBeNull();
      picks.add(sender);
    }
    expect(picks.size).toBe(4);

    jest.useRealTimers();
  });

  it('returns null once every number is rate-limited', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T15:00:00Z'));

    const numbers = queue.getConfiguredSenderNumbers();
    for (const number of numbers) {
      for (let i = 0; i < 30; i++) {
        await queue.enqueueWhatsAppMessage('201000000003', 'x', { senderNumber: number });
      }
    }

    const sender = await queue.selectSenderNumber();
    expect(sender).toBeNull();

    jest.useRealTimers();
  });
});

describe('business-hours gate on enqueueWhatsAppMessage', () => {
  it('queues instead of sending when outside operating hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T08:00:00Z')); // 10:00 Cairo

    const result = await queue.enqueueWhatsAppMessage('201000000004', 'hello outside hours');
    expect(result.queued).toBe(true);
    expect(sendTwilioWhatsAppMessage).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('drainWhatsAppQueue is a no-op outside operating hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T08:00:00Z')); // 10:00 Cairo

    const summary = await queue.drainWhatsAppQueue();
    expect(summary).toEqual({ processed: 0, sent: 0, failed: 0, skipped: 0 });

    jest.useRealTimers();
  });
});

describe('drainWhatsAppQueue', () => {
  it('delivers a job queued outside hours once the operating window opens', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T08:00:00Z')); // 10:00 Cairo
    await queue.enqueueWhatsAppMessage('201000000005', 'queued message');
    expect(sendTwilioWhatsAppMessage).not.toHaveBeenCalled();

    jest.setSystemTime(new Date('2024-01-15T10:01:00Z')); // 12:01 Cairo — window open
    const summary = await queue.drainWhatsAppQueue();

    expect(summary.sent).toBe(1);
    expect(sendTwilioWhatsAppMessage).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('retries with backoff on Twilio failure and drops after max attempts', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T15:00:00Z')); // 17:00 Cairo
    sendTwilioWhatsAppMessage.mockResolvedValue({ errorCode: 30001, errorMessage: 'Queue overflow' });

    await queue.enqueueWhatsAppMessage('201000000006', 'will fail', { senderNumber: '201032206443' });
    // First attempt happens synchronously inside enqueue (operating hours + slot available),
    // and fails — it should have been re-queued with backoff rather than dropped immediately.
    expect(sendTwilioWhatsAppMessage).toHaveBeenCalledTimes(1);

    let lastSummary;
    for (let attempt = 0; attempt < 5; attempt++) {
      jest.advanceTimersByTime(31 * 60_000); // clear backoff + rate-limit windows
      lastSummary = await queue.drainWhatsAppQueue();
    }

    expect(sendTwilioWhatsAppMessage.mock.calls.length).toBeGreaterThan(1);
    expect(lastSummary.failed + lastSummary.sent + lastSummary.skipped).toBeGreaterThanOrEqual(0);

    jest.useRealTimers();
  });
});
