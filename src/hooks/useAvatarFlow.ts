import { useCallback, useRef, useState } from 'react';
import type { AvatarExpression, ChatMessage, ProviderId } from '../types/avatar';
import { modelRouter } from '../models/ModelRouter';
import { useTTS } from './useTTS';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const SYSTEM_PROMPT =
  'You are a friendly, concise AI avatar assistant. Keep replies short (2-4 sentences) so lip sync stays snappy.';

export function useAvatarFlow() {
  const [expression, setExpression] = useState<AvatarExpression>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content:
        'Hey! I am your AI Avatar MVP. Send a message to see bow → dance → lip sync → hug. Type "error" to demo the cry pose.',
      timestamp: Date.now(),
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [provider, setProviderState] = useState<ProviderId>(modelRouter.getActive());
  const abortRef = useRef<AbortController | null>(null);
  const tts = useTTS();

  const setProvider = useCallback((id: ProviderId) => {
    modelRouter.setActive(id);
    setProviderState(id);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);
      setBusy(true);

      try {
        // 1) High-respect greeting / bow
        setExpression('respect');
        await wait(1100);
        if (ac.signal.aborted) return;

        // 2) Dance while thinking / waiting on model
        setExpression('dance');
        const history = [...messages, userMsg]
          .filter((m) => m.role !== 'system')
          .slice(-12)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const reply = await modelRouter.chat({
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: 'assistant',
          content: reply.content,
          timestamp: Date.now(),
        };
        setMessages((m) => [...m, assistantMsg]);

        // 3) Speak with lip sync
        setExpression('speak');
        await tts.speak(reply.content);
        if (ac.signal.aborted) return;

        // 4) Love + hugs on success
        setExpression('hug');
        await wait(1600);
        setExpression('idle');
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: 'assistant',
            content: message,
            timestamp: Date.now(),
            error: true,
          },
        ]);
        // 5) Cry on error
        setExpression('cry');
        await wait(2200);
        setExpression('idle');
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, tts],
  );

  return {
    expression,
    mouth: tts.mouth,
    speaking: tts.speaking,
    messages,
    busy,
    provider,
    providers: modelRouter.list(),
    setProvider,
    send,
    ttsSupported: tts.supported,
  };
}
