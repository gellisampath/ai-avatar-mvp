import type { ModelChatRequest, ModelChatResponse, ModelProvider, ProviderId } from '../types/avatar';
import { MockProvider } from './providers/MockProvider';
import { OpenAICompatibleProvider } from './providers/OpenAICompatibleProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';

export class ModelRouter {
  private providers: Record<ProviderId, ModelProvider>;
  private active: ProviderId;

  constructor(initial?: ProviderId) {
    this.providers = {
      mock: new MockProvider(),
      openai: new OpenAICompatibleProvider(),
      anthropic: new AnthropicProvider(),
    };
    const fromEnv = (import.meta.env.VITE_MODEL_PROVIDER as ProviderId | undefined) ?? 'mock';
    this.active = initial ?? (fromEnv in this.providers ? fromEnv : 'mock');
  }

  list(): Array<{ id: ProviderId; label: string }> {
    return Object.values(this.providers).map((p) => ({ id: p.id, label: p.label }));
  }

  getActive(): ProviderId {
    return this.active;
  }

  setActive(id: ProviderId): void {
    if (!this.providers[id]) throw new Error(`Unknown provider: ${id}`);
    this.active = id;
  }

  async chat(request: ModelChatRequest): Promise<ModelChatResponse> {
    return this.providers[this.active].chat(request);
  }
}

export const modelRouter = new ModelRouter();
