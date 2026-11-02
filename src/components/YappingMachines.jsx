import React, { useEffect, useId, useRef, useState } from 'react';

/**
 * Two hand-drawn computers taking turns yapping at each other (LLMs talking to LLMs).
 * The speaker's bubble types out a line while its words stream across to the listener.
 */
const SCRIPT = [
  { speaker: 'L', text: 'As an AI language model…' },
  { speaker: 'R', text: 'Great question! Let me delve in.' },
  { speaker: 'L', text: 'Certainly! Here’s a 12-step plan:' },
  { speaker: 'R', text: 'You’re absolutely right, my bad.' },
  { speaker: 'L', text: 'नमस्ते! שלום! ¡Hola!' },
  { speaker: 'R', text: 'Sorry, could you say that in English?' },
  { speaker: 'L', text: 'Let me think step by step…' },
  { speaker: 'R', text: '…therefore, the answer is 42.' },
];

const CHAR_MS = 45;
const SPACE_MS = 110;
const HOLD_MS = 1800;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return reduced;
}

function Machine({ side, talking }) {
  const filterId = useId().replace(/:/g, '');
  const isRight = side === 'R';
  return (
    <svg
      viewBox="0 -8 92 86"
      className="yap-machine w-[68px] sm:w-[92px] flex-shrink-0 text-gray-600 dark:text-gray-300"
      aria-hidden="true"
    >
      <defs>
        {/* Slight wobble so the strokes read as pen-drawn */}
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={isRight ? 7 : 3} />
          <feDisplacementMap in="SourceGraphic" scale="1.8" />
        </filter>
      </defs>
      <g
        filter={`url(#${filterId})`}
        transform={isRight ? 'translate(92 0) scale(-1 1)' : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isRight && (
          <>
            <path d="M40 7 L42 -2" />
            <circle cx="42.5" cy="-4" r="2.2" fill="currentColor" />
          </>
        )}
        {/* CRT body + screen */}
        <path d="M8 8 Q40 5 72 8 Q75 31 72 56 Q40 59 8 56 Q5 31 8 8 Z" fill="var(--theme-bg-secondary)" />
        <path d="M15 14 Q40 12 65 14 Q67 31 65 49 Q40 51 15 49 Q13 31 15 14 Z" className="yap-screen" />
        {/* Face */}
        <g className="yap-eyes" fill="currentColor" stroke="none">
          <ellipse cx="31" cy="26" rx="2.3" ry="2.9" />
          <ellipse cx="49" cy="26" rx="2.3" ry="2.9" />
        </g>
        <circle cx="24" cy="35" r="2.6" className="yap-cheek" stroke="none" />
        <circle cx="56" cy="35" r="2.6" className="yap-cheek" stroke="none" />
        {talking ? (
          <ellipse cx="40" cy="38" rx="5.5" ry="4.2" fill="currentColor" className="yap-mouth" />
        ) : (
          <path d="M35 37 Q40 41 45 37" />
        )}
        {/* Stand + keyboard */}
        <path d="M34 58 L33 64 M46 58 L47 64" />
        <path d="M22 65 Q40 63 58 65 L61 71 Q40 73 19 71 Z" fill="var(--theme-bg-secondary)" />
        <path d="M27 68 L29 68 M34 68 L36 68 M41 68 L43 68 M48 68 L50 68" />
        {/* Sound waves toward the other machine */}
        {talking && (
          <g className="yap-waves">
            <path d="M78 31 Q81 36 78 41" />
            <path d="M83 27 Q88 36 83 45" />
          </g>
        )}
      </g>
    </svg>
  );
}

function YappingMachines() {
  const reduced = usePrefersReducedMotion();
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState(0);
  const [tokens, setTokens] = useState([]);
  const nextId = useRef(0);

  const { speaker, text } = SCRIPT[line];
  const visible = reduced ? text.length : shown;
  const talking = !reduced && shown < text.length;

  useEffect(() => {
    if (reduced) return undefined;
    let i = 0;
    let timer;
    const tick = () => {
      i += 1;
      setShown(i);
      // A word just finished: send it across as a token.
      if (i === text.length || text[i] === ' ') {
        const word = text.slice(text.lastIndexOf(' ', i - 1) + 1, i);
        const id = nextId.current++;
        const lift = Math.round(Math.random() * 6 - 3);
        setTokens((t) => [...t.slice(-5), { id, word, dir: speaker === 'L' ? 'ltr' : 'rtl', lift }]);
      }
      if (i < text.length) {
        timer = setTimeout(tick, text[i] === ' ' ? SPACE_MS : CHAR_MS);
      } else {
        timer = setTimeout(() => {
          setShown(0);
          setLine((l) => (l + 1) % SCRIPT.length);
        }, HOLD_MS);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [line, reduced, speaker, text]);

  const fromRight = speaker === 'R';

  return (
    <div
      className="yap mt-auto pt-5 select-none"
      role="img"
      aria-label="Two cartoon computers chatting away: language models yapping at each other"
    >
      <div className="flex items-end gap-1.5 sm:gap-3" aria-hidden="true">
        <Machine side="L" talking={talking && !fromRight} />

        <div className="relative flex-1 min-w-0 pb-[54px] sm:pb-[64px]">
          <div className={`flex ${fromRight ? 'justify-end' : 'justify-start'}`}>
            <div key={line} className={`yap-bubble ${fromRight ? 'yap-bubble--right' : 'yap-bubble--left'}`}>
              <span>{text.slice(0, visible)}</span>
              {talking && <span className="yap-caret">|</span>}
              {/* Reserve the full line's width so the bubble doesn't grow while typing */}
              <span className="invisible block h-0 overflow-hidden">{text}</span>
            </div>
          </div>

          <div className="yap-lane">
            {tokens.map((t) => (
              <span
                key={t.id}
                className={`yap-token yap-token--${t.dir}`}
                style={{ marginTop: `${t.lift}px` }}
                onAnimationEnd={() => setTokens((all) => all.filter((x) => x.id !== t.id))}
              >
                {t.word}
              </span>
            ))}
          </div>
        </div>

        <Machine side="R" talking={talking && fromRight} />
      </div>
    </div>
  );
}

export default YappingMachines;
