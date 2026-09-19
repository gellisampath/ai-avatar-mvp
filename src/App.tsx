import { AvatarStage } from './components/AvatarStage';
import { ChatPanel } from './components/ChatPanel';
import { useAvatarFlow } from './hooks/useAvatarFlow';
import './App.css';

const STATUS: Record<string, string> = {
  idle: 'Idle — ready for a task',
  respect: 'Respectful greeting…',
  dance: 'Thinking (dance mode)…',
  speak: 'Speaking with lip sync…',
  hug: 'Success — love & hugs!',
  cry: 'Error — feeling blue…',
};

export default function App() {
  const flow = useAvatarFlow();

  return (
    <div className="app-shell">
      <main className="layout">
        <AvatarStage
          expression={flow.expression}
          mouth={flow.mouth}
          statusLabel={STATUS[flow.expression] ?? flow.expression}
        />
        <ChatPanel
          messages={flow.messages}
          busy={flow.busy}
          provider={flow.provider}
          providers={flow.providers}
          onProviderChange={flow.setProvider}
          onSend={flow.send}
          ttsSupported={flow.ttsSupported}
        />
      </main>
      <footer className="app-footer">
        <span>Mock works fully offline.</span>
        <span>Keys stay in env vars — never hardcoded.</span>
      </footer>
    </div>
  );
}
