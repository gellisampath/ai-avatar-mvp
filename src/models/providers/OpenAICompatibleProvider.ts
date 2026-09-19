import type { ModelChatRequest, ModelChatResponse, ModelProvider } from '../../types/avatar';

export class OpenAICompatibleProvider implements ModelProvider {
  id = 'openai' as const;
  label = 'OpenAI-compatible';

  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? '';
    this.baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    this.model = import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  async chat(request: ModelChatRequest): Promise<ModelChatResponse> {
    if (!this.apiKey) {
      throw new Error('Missing VITE_OPENAI_API_KEY. Set it in .env or switch to Mock.');
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: 0.7,
      }),
      signal: request.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenAI-compatible error ${res.status}: ${body.slice(0, 200) || res.statusText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('OpenAI-compatible response had empty content.');
    return { content };
  }
}
