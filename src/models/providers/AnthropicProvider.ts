import type { ModelChatRequest, ModelChatResponse, ModelProvider } from '../../types/avatar';

export class AnthropicProvider implements ModelProvider {
  id = 'anthropic' as const;
  label = 'Anthropic';

  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private version: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY ?? '';
    this.baseUrl = (import.meta.env.VITE_ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com').replace(/\/$/, '');
    this.model = import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-3-5-haiku-latest';
    this.version = import.meta.env.VITE_ANTHROPIC_VERSION ?? '2023-06-01';
  }

  async chat(request: ModelChatRequest): Promise<ModelChatResponse> {
    if (!this.apiKey) {
      throw new Error('Missing VITE_ANTHROPIC_API_KEY. Set it in .env or switch to Mock.');
    }

    const system = request.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');
    const messages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.version,
        // Browser demos often need this when hitting Anthropic from the client:
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: system || undefined,
        messages,
      }),
      signal: request.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Anthropic error ${res.status}: ${body.slice(0, 200) || res.statusText}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const content = data.content?.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n').trim();
    if (!content) throw new Error('Anthropic response had empty content.');
    return { content };
  }
}
