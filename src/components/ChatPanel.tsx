import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ChatMessage, ProviderId } from '../types/avatar';
import './ChatPanel.css';

interface Props {
  messages: ChatMessage[];
  busy: boolean;
  provider: ProviderId;
  providers: Array<{ id: ProviderId; label: string }>;
  onProviderChange: (id: ProviderId) => void;
  onSend: (text: string) => void;
  ttsSupported: boolean;
}

const DEMO_PROMPTS = [
  'Hello!',
  'Show me your dance while thinking',
  'Give me a success hug',
  'Please trigger an error crash',
];

export function ChatPanel({
  messages,
  busy,
  provider,
  providers,
  onProviderChange,
  onSend,
  ttsSupported,
}: Props) {
  const [draft, setDraft] = useState('');

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim() || busy) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <section className="chat-panel" aria-label="Chat">
      <header className="chat-header">
        <div>
          <h1>AI Avatar MVP</h1>
          <p className="subtitle">Bow → dance → lip sync → hug / cry</p>
        </div>
        <label className="provider-switch">
          <span>Model</span>
          <select
            value={provider}
            disabled={busy}
            onChange={(e) => onProviderChange(e.target.value as ProviderId)}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!ttsSupported ? (
        <div className="banner warn">
          Web Speech API unavailable — mouth animation still demos visually without audio.
        </div>
      ) : null}

      <div className="message-list" role="log" aria-live="polite">
        {messages.map((m) => (
          <article
            key={m.id}
            className={`bubble ${m.role}${m.error ? ' error' : ''}`}
          >
            <header>{m.role === 'user' ? 'You' : m.error ? 'Error' : 'Avatar'}</header>
            <p>{m.content}</p>
          </article>
        ))}
      </div>

      <div className="demo-row">
        {DEMO_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="chip"
            disabled={busy}
            onClick={() => onSend(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="composer" onSubmit={submit}>
        <input
          type="text"
          value={draft}
          disabled={busy}
          placeholder={busy ? 'Avatar is performing…' : 'Send a message…'}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message"
        />
        <button type="submit" disabled={busy || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
