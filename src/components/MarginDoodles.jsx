import React from 'react';

/**
 * Faint pencil doodles in the page margins (wide screens only) — a little human touch.
 * Each one nods to something from the About text.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const handText = { fill: 'currentColor', stroke: 'none', fontFamily: 'Caveat, cursive' };

// Hand-written "text lines" on the manuscript.
function wavy(x1, x2, y) {
  let d = `M${x1} ${y}`;
  for (let x = x1; x + 6 <= x2; x += 6) d += ` q3 ${x % 12 === 0 ? -2.4 : -1.6} 6 0`;
  return d;
}

// Rabbit hole: a squashed spiral.
function spiral(cx, cy, turns, rMax, squash) {
  const steps = turns * 48;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const a = t * turns * 2 * Math.PI;
    const r = 2 + t * (rMax - 2);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a) * squash;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function Manuscript() {
  return (
    <svg viewBox="0 0 160 150" {...stroke}>
      <path d="M22 18 Q16 18 16 24 Q16 30 22 30 L118 30 Q124 30 124 24 Q124 18 118 18 Z" />
      <path d="M22 24 Q20 22 22 21" />
      <path d="M22 30 L24 118 M118 30 L116 118" />
      <path d="M18 118 Q12 118 12 124 Q12 130 18 130 L120 130 Q126 130 126 124 Q126 118 120 118 Z" />
      <rect x="32" y="38" width="10" height="11" rx="1.5" />
      {[[48, 106, 44], [32, 100, 58], [32, 108, 70], [32, 88, 82], [32, 102, 94], [32, 78, 106]].map(([a, b, y]) => (
        <path key={y} d={wavy(a, b, y)} />
      ))}
      {/* Quill */}
      <path d="M98 142 Q120 112 152 66" />
      <path d="M152 66 Q128 70 114 104 Q111 110 107 116" />
      <path d="M152 66 Q150 90 122 112 Q116 116 109 120" />
      <path d="M140 82 L131 85 M131 95 L123 99 M144 84 L142 93 M136 97 L131 105" />
      <circle cx="96.5" cy="144" r="1.6" fill="currentColor" />
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 170 150" {...stroke}>
      <circle cx="85" cy="92" r="34" />
      <ellipse cx="85" cy="92" rx="14" ry="34" />
      <path d="M51 92 Q85 98 119 92 M56 74 Q85 79 114 74 M56 110 Q85 115 114 110" />
      <path d="M85 126 L85 134 M70 136 Q85 133 100 136" />
      <rect x="6" y="26" width="48" height="24" rx="11" />
      <path d="M40 50 L48 60 L46 50" />
      <text x="30" y="43" fontSize="15" textAnchor="middle" style={handText}>hello</text>
      <rect x="104" y="8" width="58" height="26" rx="12" />
      <path d="M118 34 L112 46 L126 34" />
      <text x="133" y="26" fontSize="15" textAnchor="middle" style={handText}>שלום</text>
      <rect x="120" y="58" width="48" height="24" rx="11" />
      <path d="M126 76 L116 84 L132 82" />
      <text x="144" y="75" fontSize="12" textAnchor="middle" style={handText}>नमस्ते</text>
    </svg>
  );
}

function RaceCar() {
  return (
    <svg viewBox="0 0 180 80" {...stroke}>
      <path d="M2 42 L13 42 M0 50 L10 50 M4 58 L12 58" />
      <path d="M20 58 L166 58" />
      <path d="M26 58 L26 47 Q40 43 58 41 L96 37 Q106 36 112 41 Q130 45 152 47 Q164 49 166 58" />
      <path d="M68 40 Q78 27 94 37" />
      <circle cx="81" cy="34" r="5.5" />
      <path d="M17 29 L37 29 L37 35 L17 35 Z M25 35 L26 47" />
      <path d="M150 60 L174 60 L174 55" />
      <circle cx="42" cy="60" r="11" fill="var(--theme-bg-primary)" />
      <circle cx="42" cy="60" r="3" />
      <circle cx="138" cy="60" r="11" fill="var(--theme-bg-primary)" />
      <circle cx="138" cy="60" r="3" />
    </svg>
  );
}

function CookingPot() {
  return (
    <svg viewBox="0 0 140 140" {...stroke}>
      <path d="M52 58 Q46 50 52 42 Q58 34 52 26 M66 56 Q60 46 66 38 Q72 30 66 20 M80 58 Q74 50 80 42" />
      <path d="M88 66 L110 22" />
      <ellipse cx="112" cy="17" rx="5" ry="8" transform="rotate(28 112 17)" />
      <path d="M24 72 L28 112 Q70 122 112 112 L116 72" fill="var(--theme-bg-primary)" />
      <ellipse cx="70" cy="72" rx="46" ry="8" fill="var(--theme-bg-primary)" />
      <path d="M24 78 Q12 78 14 86 Q16 90 26 88 M116 78 Q128 78 126 86 Q124 90 114 88" />
      <path d="M44 132 Q48 124 52 132 Q56 122 60 132 Q64 124 68 132 Q72 122 76 132 Q80 124 84 132 Q88 122 92 132 Q96 124 100 132" />
    </svg>
  );
}

function RabbitHole() {
  return (
    <svg viewBox="0 0 150 175" {...stroke}>
      <rect x="44" y="8" width="54" height="38" rx="10" />
      <path d="M64 18 L64 36 L80 27 Z" />
      <path d="M71 50 Q62 70 74 86" strokeDasharray="2 5" />
      <path d={spiral(75, 126, 3.5, 36, 0.5)} />
      <path d="M70 124 Q65 104 70 98 Q75 103 73 124 M79 124 Q80 104 86 101 Q88 108 82 125" />
      <text x="75" y="170" fontSize="14" textAnchor="middle" style={handText}>just one more video…</text>
    </svg>
  );
}

const DOODLES = [
  { Art: Manuscript, side: 'left', top: '7%', width: 150, rotate: -6 },
  { Art: Globe, side: 'right', top: '15%', width: 160, rotate: 4 },
  { Art: RaceCar, side: 'left', top: '37%', width: 160, rotate: -3 },
  { Art: CookingPot, side: 'right', top: '51%', width: 120, rotate: 5 },
  { Art: RabbitHole, side: 'left', top: '68%', width: 140, rotate: 3 },
];

function MarginDoodles() {
  return (
    <div className="margin-doodles hidden xl:block" aria-hidden="true">
      {/* Shared pencil wobble */}
      <svg width="0" height="0" className="absolute">
        <filter id="doodle-sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </svg>
      {DOODLES.map(({ Art, side, top, width, rotate }, i) => (
        <div
          key={i}
          className={`margin-doodle margin-doodle--${side}`}
          style={{ top, width, '--doodle-rotate': `${rotate}deg` }}
        >
          <Art />
        </div>
      ))}
    </div>
  );
}

export default MarginDoodles;
