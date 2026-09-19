# AI Avatar MVP

Interactive 2D AI avatar web app: Vite + React + TypeScript. Chat beside a cartoon character that **bows** on a new task, **dances** while thinking, **lip-syncs** while speaking (Web Speech API), then **hugs** on success or **cries** on error.

Character art lives at `public/avatar/base.png` (yellow + galaxy-blue curly hair, black hoodie with gold L, red pants).

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm install
npm run build
npm run preview
```

## Providers (ModelRouter)

Use the **Model** dropdown in the UI, or set `VITE_MODEL_PROVIDER` in `.env`.

| Provider   | Id         | Notes |
|-----------|------------|--------|
| Mock      | `mock`     | Fully offline. Demos all six behaviors. |
| OpenAI-compatible | `openai` | Any OpenAI-style `/chat/completions` API. |
| Anthropic | `anthropic`| Messages API (`/v1/messages`). |

Copy env template:

```bash
cp .env.example .env
```

### Env vars (never hardcode secrets)

```env
VITE_MODEL_PROVIDER=mock

# OpenAI-compatible
VITE_OPENAI_API_KEY=
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o-mini

# Anthropic-style
VITE_ANTHROPIC_API_KEY=
VITE_ANTHROPIC_BASE_URL=https://api.anthropic.com
VITE_ANTHROPIC_MODEL=claude-3-5-haiku-latest
VITE_ANTHROPIC_VERSION=2023-06-01
```

Keys are read only via `import.meta.env`. Do not commit `.env`.

### Adding a model / provider

1. Implement `ModelProvider` in `src/models/providers/` (`id`, `label`, `chat`).
2. Register it in `src/models/ModelRouter.ts`.
3. Extend `ProviderId` in `src/types/avatar.ts`.
4. Add any `VITE_*` env keys to `.env.example` and `src/vite-env.d.ts`.

## Avatar behavior flow

1. **Respect** — bow + badge when a new message is sent  
2. **Dance** — bob + music notes while waiting on the model  
3. **Speak** — Web Speech TTS + mouth SVG frames (pseudo-amplitude)  
4. **Hug** — arms + hearts on success  
5. **Cry** — tears + sad brows on error  
6. **Idle** — resting pose with closed mouth  

Lip sync uses layered timing while `speechSynthesis` speaks (the Web Speech API does not expose real PCM amplitude). If TTS is unavailable, mouth animation still runs visually.

## Offline demo script (Mock)

Keep **Model → Mock (offline)**. Then click chips or type:

1. `Hello!` — full bow → dance → speak → hug  
2. `Show me your dance while thinking` — emphasizes dance while “thinking”  
3. `Give me a success hug` — success celebration  
4. `Please trigger an error crash` — mock throws → cry pose  

Mock also fails on messages containing `error`, `fail`, `crash`, or `break`.

## Project layout

```
public/avatar/base.png     # character art
src/components/            # AvatarStage, ChatPanel
src/hooks/                 # useAvatarFlow, useTTS
src/models/                # ModelRouter + providers
src/types/avatar.ts
```

## Caveats

- Browser TTS quality/voices vary by OS; Chrome/Edge work best.
- Calling OpenAI/Anthropic **from the browser** exposes the key to anyone with DevTools. For production, proxy through your own backend.
- Anthropic browser calls may require CORS-friendly setups; mock mode needs none.
- Mouth overlays are positioned for the included `base.png`; swap art carefully or tweak `%` in `AvatarStage.css`.

## License

MVP demo code — use and adapt freely for your project.
