import type { ModelChatRequest, ModelChatResponse, ModelProvider } from '../../types/avatar';

export class AnthropicProvider implements ModelProvider {
  id = 'anthropic' as const;
  label = 'Anthropic';

  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private version: string;
  private viaProxy: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY ?? '';
    this.baseUrl = (import.meta.env.VITE_ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com').replace(/\/$/, '');
    this.model = import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';
    this.version = import.meta.env.VITE_ANTHROPIC_VERSION ?? '2023-06-01';
    this.viaProxy = this.baseUrl.startsWith('/');
  }

  async chat(request: ModelChatRequest): Promise<ModelChatResponse> {
    if (!this.viaProxy && !this.apiKey) {
      throw new Error(
        'Missing Anthropic key. For local demos set ANTHROPIC_API_KEY in .env and VITE_ANTHROPIC_BASE_URL=/anthropic (Vite proxy). Or set VITE_ANTHROPIC_API_KEY for direct calls.',
      );
    }

    const system = request.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');
    const messages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': this.version,
    };
    if (!this.viaProxy) {
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers,
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
