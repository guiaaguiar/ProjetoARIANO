import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface NeonNode {
  id: string;
  label: string;
  sublabel?: string;
  score?: number; // 0-1
  type: 'center' | 'edital' | 'professor' | 'student' | 'researcher';
  /** injected after mount — set by parent */
  x?: number;
  y?: number;
}

interface NeonGraphCanvasProps {
  centerLabel: string;
  nodes: NeonNode[];
  /** 'editais' shows teal/amber edges; 'network' shows indigo edges */
  mode?: 'editais' | 'network';
  /** px radius of satellite orbit */
  radius?: number;
  /** max canvas size */
  size?: number;
}

const TYPE_CONFIG = {
  center:     { border: '#2dd4bf', glow: 'rgba(45,212,191,0.9)', bg: 'rgba(45,212,191,0.08)', text: '#2dd4bf' },
  edital:     { border: '#f59e0b', glow: 'rgba(245,158,11,0.8)',  bg: 'rgba(245,158,11,0.07)', text: '#fbbf24' },
  professor:  { border: '#a78bfa', glow: 'rgba(167,139,250,0.8)', bg: 'rgba(167,139,250,0.07)', text: '#c4b5fd' },
  student:    { border: '#34d399', glow: 'rgba(52,211,153,0.8)',  bg: 'rgba(52,211,153,0.07)',  text: '#6ee7b7' },
  researcher: { border: '#60a5fa', glow: 'rgba(96,165,250,0.8)',  bg: 'rgba(96,165,250,0.07)',  text: '#93c5fd' },
};

const EDGE_COLOR = {
  editais: { stroke: '#2dd4bf', strokeAlt: '#f59e0b' },
  network: { stroke: '#818cf8', strokeAlt: '#818cf8' },
};

export const NeonGraphCanvas: React.FC<NeonGraphCanvasProps> = ({
  centerLabel,
  nodes,
  mode = 'editais',
  radius = 150,
  size = 400,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxNodes = 7;
  const visible = nodes.slice(0, maxNodes);

  const positions = visible.map((_, i) => {
    const angle = (i / visible.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const edgeColors = EDGE_COLOR[mode];

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, maxWidth: '100%' }}
    >
      {/* SVG edges layer */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {visible.map((_, i) => (
            <linearGradient
              key={`grad-${i}`}
              id={`edge-grad-${i}`}
              x1={`${(cx / size) * 100}%`}
              y1={`${(cy / size) * 100}%`}
              x2={`${(positions[i].x / size) * 100}%`}
              y2={`${(positions[i].y / size) * 100}%`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={edgeColors.stroke} stopOpacity="0.6" />
              <stop offset="100%" stopColor={edgeColors.strokeAlt} stopOpacity="0.25" />
            </linearGradient>
          ))}
        </defs>

        {positions.map((pos, i) => {
          const len = Math.hypot(pos.x - cx, pos.y - cy);
          return (
            <motion.line
              key={`edge-${i}`}
              x1={cx} y1={cy} x2={pos.x} y2={pos.y}
              stroke={`url(#edge-grad-${i})`}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len}
              animate={{ strokeDashoffset: 0, opacity: [0, 0.9] }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.18, ease: 'easeOut' }}
            />
          );
        })}

        {/* Pulsing edge overlay for "active" feel */}
        {positions.map((pos, i) => (
          <motion.line
            key={`pulse-${i}`}
            x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke={edgeColors.stroke}
            strokeWidth={0.5}
            strokeLinecap="round"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2.5, delay: 1.2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>

      {/* Center node */}
      <CenterNode label={centerLabel} cx={cx} cy={cy} size={size} />

      {/* Satellite nodes */}
      {visible.map((node, i) => (
        <SatelliteNode
          key={node.id}
          node={node}
          pos={positions[i]}
          size={size}
          delay={0.25 + i * 0.2}
        />
      ))}
    </div>
  );
};

// ─── Center Node ──────────────────────────────────────────────────────────────

const CenterNode: React.FC<{ label: string; cx: number; cy: number; size: number }> = ({
  label, cx, cy, size,
}) => {
  const cfg = TYPE_CONFIG.center;
  const nodeSize = 76;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.15, 1], opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute flex items-center justify-center rounded-full z-20"
      style={{
        width: nodeSize,
        height: nodeSize,
        left: `calc(${(cx / size) * 100}% - ${nodeSize / 2}px)`,
        top: `calc(${(cy / size) * 100}% - ${nodeSize / 2}px)`,
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        boxShadow: `0 0 24px ${cfg.glow}, 0 0 60px rgba(45,212,191,0.2), inset 0 0 20px rgba(45,212,191,0.05)`,
      }}
    >
      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1px solid rgba(45,212,191,0.25)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner pulse glow */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{ background: 'rgba(45,212,191,0.08)' }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        className="relative z-10 font-bold text-[11px] text-center px-1 leading-tight"
        style={{ color: cfg.text }}
      >
        {label.split(' ')[0]}
      </span>
    </motion.div>
  );
};

// ─── Satellite Node ────────────────────────────────────────────────────────────

const SatelliteNode: React.FC<{
  node: NeonNode;
  pos: { x: number; y: number };
  size: number;
  delay: number;
}> = ({ node, pos, size, delay }) => {
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.edital;
  const nodeSize = 60;
  const pct_x = (pos.x / size) * 100;
  const pct_y = (pos.y / size) * 100;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 220, damping: 15 }}
      className="absolute z-20"
      style={{
        width: nodeSize,
        height: nodeSize,
        left: `calc(${pct_x}% - ${nodeSize / 2}px)`,
        top: `calc(${pct_y}% - ${nodeSize / 2}px)`,
      }}
    >
      {/* Glow burst on enter */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: cfg.glow }}
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 2.2 }}
        transition={{ duration: 0.8, delay }}
      />

      {/* Node body */}
      <div
        className="relative w-full h-full rounded-full flex flex-col items-center justify-center px-1 overflow-hidden"
        style={{
          background: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          boxShadow: `0 0 16px ${cfg.glow}, inset 0 0 10px rgba(255,255,255,0.02)`,
        }}
      >
        {/* Subtle inner glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: cfg.bg }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: delay * 0.5 }}
        />

        <span
          className="relative z-10 font-semibold text-center leading-tight"
          style={{ color: cfg.text, fontSize: '9px', maxWidth: '52px' }}
        >
          {node.label.split(' ').slice(0, 3).join(' ')}
        </span>

        {/* Score badge */}
        {node.score !== undefined && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.4 }}
            className="relative z-10 font-black mt-0.5"
            style={{ color: cfg.border, fontSize: '8px' }}
          >
            {Math.round(node.score * 100)}%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};
