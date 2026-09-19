/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL_PROVIDER?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_BASE_URL?: string;
  readonly VITE_OPENAI_MODEL?: string;
  readonly VITE_ANTHROPIC_API_KEY?: string;
  readonly VITE_ANTHROPIC_BASE_URL?: string;
  readonly VITE_ANTHROPIC_MODEL?: string;
  readonly VITE_ANTHROPIC_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
