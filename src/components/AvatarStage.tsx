import type { AvatarExpression, MouthFrame } from '../types/avatar';
import './AvatarStage.css';

interface Props {
  expression: AvatarExpression;
  mouth: MouthFrame;
  statusLabel: string;
}

function MouthOverlay({ frame }: { frame: MouthFrame }) {
  // Positioned over the character's mouth on the base art (approx %).
  const paths: Record<MouthFrame, string> = {
    closed: 'M 18 14 Q 32 18 46 14',
    slight: 'M 16 12 Q 32 22 48 12',
    open: 'M 16 10 Q 20 28 32 30 Q 44 28 48 10 Q 32 16 16 10',
    wide: 'M 14 8 Q 18 34 32 36 Q 46 34 50 8 Q 32 14 14 8',
  };
  const fill = frame === 'closed' || frame === 'slight' ? 'none' : '#3a1f1a';
  return (
    <svg className={`mouth-overlay mouth-${frame}`} viewBox="0 0 64 40" aria-hidden>
      <path d={paths[frame]} fill={fill} stroke="#1a1a1a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      {frame === 'wide' || frame === 'open' ? (
        <ellipse cx="32" cy="22" rx="7" ry="4" fill="#c45c5c" opacity="0.85" />
      ) : null}
    </svg>
  );
}

function CryOverlay() {
  return (
    <div className="cry-overlay" aria-hidden>
      <span className="tear tear-l" />
      <span className="tear tear-r" />
      <svg className="sad-brows" viewBox="0 0 120 40">
        <path d="M20 28 Q 35 8 50 22" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
        <path d="M70 22 Q 85 8 100 28" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function HugOverlay() {
  return (
    <div className="hug-overlay" aria-hidden>
      <svg className="hug-arms" viewBox="0 0 200 120">
        {/* Left arm reaching out */}
        <path
          d="M70 55 C 40 50, 18 70, 22 95 C 24 108, 48 112, 62 100"
          fill="#111"
          stroke="#000"
          strokeWidth="3"
        />
        <ellipse cx="28" cy="102" rx="14" ry="10" fill="#d4a574" stroke="#000" strokeWidth="2.5" />
        {/* Right arm */}
        <path
          d="M130 55 C 160 50, 182 70, 178 95 C 176 108, 152 112, 138 100"
          fill="#111"
          stroke="#000"
          strokeWidth="3"
        />
        <ellipse cx="172" cy="102" rx="14" ry="10" fill="#d4a574" stroke="#000" strokeWidth="2.5" />
      </svg>
      <span className="heart h1">❤</span>
      <span className="heart h2">❤</span>
      <span className="heart h3">💕</span>
    </div>
  );
}

function RespectBadge() {
  return (
    <div className="respect-badge" aria-hidden>
      <span>🙏</span>
      <em>Respect</em>
    </div>
  );
}

export function AvatarStage({ expression, mouth, statusLabel }: Props) {
  const showMouth = expression === 'speak' || expression === 'idle';
  const bodyClass = [
    'avatar-body',
    `expr-${expression}`,
    expression === 'dance' ? 'is-dancing' : '',
    expression === 'respect' ? 'is-bowing' : '',
    expression === 'hug' ? 'is-hugging' : '',
    expression === 'cry' ? 'is-crying' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="avatar-stage" aria-label="AI Avatar stage">
      <div className="stage-glow" />
      <div className={bodyClass}>
        <img src="/avatar/base.png" alt="Cartoon AI avatar character" className="avatar-base" draggable={false} />
        {showMouth ? <MouthOverlay frame={expression === 'speak' ? mouth : 'closed'} /> : null}
        {expression === 'cry' ? <CryOverlay /> : null}
        {expression === 'hug' ? <HugOverlay /> : null}
        {expression === 'respect' ? <RespectBadge /> : null}
        {expression === 'dance' ? (
          <div className="music-notes" aria-hidden>
            <span>♪</span>
            <span>♫</span>
            <span>♪</span>
          </div>
        ) : null}
      </div>
      <div className="status-pill" data-expr={expression}>
        <span className="status-dot" />
        {statusLabel}
      </div>
    </section>
  );
}
