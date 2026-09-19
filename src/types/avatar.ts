export type AvatarExpression =
  | 'idle'
  | 'respect'
  | 'dance'
  | 'speak'
  | 'hug'
  | 'cry';

export type MouthFrame = 'closed' | 'slight' | 'open' | 'wide';

export type ProviderId = 'mock' | 'openai' | 'anthropic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  error?: boolean;
}

export interface ModelChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  signal?: AbortSignal;
}

export interface ModelChatResponse {
  content: string;
}

export interface ModelProvider {
  id: ProviderId;
  label: string;
  chat(request: ModelChatRequest): Promise<ModelChatResponse>;
}
