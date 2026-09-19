import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouthFrame } from '../types/avatar';

function amplitudeToMouth(level: number): MouthFrame {
  if (level < 0.08) return 'closed';
  if (level < 0.22) return 'slight';
  if (level < 0.45) return 'open';
  return 'wide';
}

export interface UseTTSResult {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  speaking: boolean;
  mouth: MouthFrame;
  supported: boolean;
}

/**
 * Web Speech API TTS with a lightweight amplitude-style mouth driver.
 * Real audio amplitude isn't exposed by speechSynthesis, so we drive
 * mouth frames from utterance boundary/word timing + a gentle oscillator.
 */
export function useTTS(): UseTTSResult {
  const [speaking, setSpeaking] = useState(false);
  const [mouth, setMouth] = useState<MouthFrame>('closed');
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animRef = useRef<number | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const clearAnim = useCallback(() => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setMouth('closed');
  }, []);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    clearAnim();
    setSpeaking(false);
    resolveRef.current?.();
    resolveRef.current = null;
  }, [supported, clearAnim]);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        stop();
        resolveRef.current = resolve;

        if (!supported || !text.trim()) {
          // Offline visual-only fallback: animate mouth for ~duration of text
          setSpeaking(true);
          const duration = Math.min(8000, Math.max(1200, text.length * 45));
          const start = performance.now();
          const tick = (now: number) => {
            const t = (now - start) / duration;
            if (t >= 1) {
              clearAnim();
              setSpeaking(false);
              resolveRef.current = null;
              resolve();
              return;
            }
            const pulse = Math.abs(Math.sin(now / 90)) * (0.35 + 0.65 * Math.sin(now / 210));
            setMouth(amplitudeToMouth(pulse));
            animRef.current = requestAnimationFrame(tick);
          };
          animRef.current = requestAnimationFrame(tick);
          return;
        }

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.02;
        utter.pitch = 1;
        utterRef.current = utter;

        const start = performance.now();
        const tick = (now: number) => {
          // Pseudo-amplitude from layered sines — reads as lively lip sync.
          const pulse =
            0.55 * Math.abs(Math.sin(now / 85)) +
            0.3 * Math.abs(Math.sin(now / 47)) +
            0.15 * Math.abs(Math.sin((now - start) / 170));
          setMouth(amplitudeToMouth(pulse));
          animRef.current = requestAnimationFrame(tick);
        };

        utter.onstart = () => {
          setSpeaking(true);
          animRef.current = requestAnimationFrame(tick);
        };
        utter.onend = () => {
          clearAnim();
          setSpeaking(false);
          resolveRef.current = null;
          resolve();
        };
        utter.onerror = () => {
          clearAnim();
          setSpeaking(false);
          resolveRef.current = null;
          resolve();
        };

        window.speechSynthesis.speak(utter);
      }),
    [supported, stop, clearAnim],
  );

  return { speak, stop, speaking, mouth, supported };
}
