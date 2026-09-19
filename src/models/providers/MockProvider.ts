import type { ModelChatRequest, ModelChatResponse, ModelProvider } from '../../types/avatar';

const SUCCESS_REPLIES = [
  "Got it! Here's a friendly take: stay curious, keep shipping, and enjoy the dance moves while I think.",
  "Nice question! In short — break the problem down, try the simplest path first, then polish.",
  "Absolutely. Mock mode is online and ready. Ask me anything and I'll demo the full avatar flow.",
  "Great timing! I'm your offline avatar buddy. Lip sync, hugs, and bows included.",
];

const ERROR_TRIGGERS = [/crash/i, /fail/i, /error/i, /break/i];

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export class MockProvider implements ModelProvider {
  id = 'mock' as const;
  label = 'Mock (offline)';

  async chat(request: ModelChatRequest): Promise<ModelChatResponse> {
    const lastUser = [...request.messages].reverse().find((m) => m.role === 'user');
    const text = lastUser?.content ?? '';

    await delay(900 + Math.random() * 700, request.signal);

    if (ERROR_TRIGGERS.some((re) => re.test(text))) {
      throw new Error('Mock provider simulated failure (try a message without "error/fail/crash").');
    }

    if (/hello|hi\b|hey/i.test(text)) {
      return {
        content:
          "Hello! I'm your AI Avatar MVP. Watch me bow, dance while thinking, then speak with lip sync.",
      };
    }

    if (/dance|think/i.test(text)) {
      return {
        content:
          "Thinking is my favorite dance break. When a real model is connected, this same groove plays while waiting.",
      };
    }

    if (/hug|love|success/i.test(text)) {
      return {
        content:
          "Success! Enjoy the hugs and hearts — that's the celebration pose after a good reply.",
      };
    }

    const pick = SUCCESS_REPLIES[Math.floor(Math.random() * SUCCESS_REPLIES.length)];
    return { content: `${pick}\n\nYou said: "${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"` };
  }
}
