import React from 'react';
import { motion } from 'framer-motion';
import { LoopTypewriter } from './TypewriterText';

interface EmptyNodeRadarProps {
  userName: string;
  size?: number;
}

const TERMINAL_STRINGS = [
  'Analisando perfil acadêmico...',
  'Vetorizando currículo e bio...',
  'Consultando base de editais...',
  'Mapeando rede de inovação...',
  'Calculando compatibilidade...',
  'Aguardando resposta da IA...',
];

export const EmptyNodeRadar: React.FC<EmptyNodeRadarProps> = ({ userName, size = 120 }) => {
  const firstName = userName?.split(' ')[0] || 'Você';
  const containerSize = size * 3.8;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* ── Radar field ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Background scan grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
          viewBox="0 0 200 200"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0" y1={i * 25 + 12.5}
              x2="200" y2={i * 25 + 12.5}
              stroke="#2dd4bf" strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 25 + 12.5} y1="0"
              x2={i * 25 + 12.5} y2="200"
              stroke="#2dd4bf" strokeWidth="0.5"
            />
          ))}
          {/* Crosshair */}
          <circle cx="100" cy="100" r="70" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
          <circle cx="100" cy="100" r="45" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
          <line x1="30" y1="100" x2="170" y2="100" stroke="#2dd4bf" strokeWidth="0.3" />
          <line x1="100" y1="30" x2="100" y2="170" stroke="#2dd4bf" strokeWidth="0.3" />
        </svg>

        {/* Radar waves — 4 rings, staggered */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size * 0.9,
              height: size * 0.9,
              border: '1px solid rgba(45,212,191,0.45)',
            }}
            animate={{
              scale: [1, 3.8, 4.2],
              opacity: [0.6, 0.12, 0],
            }}
            transition={{
              duration: 2.8,
              delay: i * 0.65,
              repeat: Infinity,
              ease: [0.2, 0.5, 0.8, 1],
            }}
          />
        ))}

        {/* Rotating scan arm */}
        <motion.div
          className="absolute"
          style={{
            width: containerSize / 2,
            height: 1,
            left: '50%',
            top: '50%',
            transformOrigin: '0% 50%',
            background: 'linear-gradient(to right, rgba(45,212,191,0.6), transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Main empty node */}
        <motion.div
          className="relative rounded-full flex items-center justify-center z-10"
          style={{
            width: size,
            height: size,
            border: '2px solid rgba(45,212,191,0.85)',
            background: 'rgba(45,212,191,0.04)',
            boxShadow:
              '0 0 40px rgba(45,212,191,0.35), 0 0 80px rgba(45,212,191,0.12), inset 0 0 30px rgba(45,212,191,0.06)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Rotating outer ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: -8,
              border: '1px solid rgba(45,212,191,0.2)',
              borderTopColor: 'rgba(45,212,191,0.6)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Counter-rotating inner ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: 12,
              border: '1px solid rgba(45,212,191,0.15)',
              borderBottomColor: 'rgba(45,212,191,0.45)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner glow pulse */}
          <motion.div
            className="absolute rounded-full"
            style={{ inset: 0, background: 'rgba(45,212,191,0.06)' }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center dot */}
          <motion.div
            className="w-4 h-4 rounded-full z-10"
            style={{ background: '#2dd4bf' }}
            animate={{
              scale: [1, 1.5, 1],
              boxShadow: [
                '0 0 10px rgba(45,212,191,0.7)',
                '0 0 28px rgba(45,212,191,1)',
                '0 0 10px rgba(45,212,191,0.7)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* User name tag */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p
          className="font-black tracking-widest uppercase"
          style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#2dd4bf',
            textShadow: '0 0 12px rgba(45,212,191,0.8)',
          }}
        >
          {firstName}
        </p>

        {/* Terminal text */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded"
          style={{
            background: 'rgba(45,212,191,0.05)',
            border: '1px solid rgba(45,212,191,0.15)',
          }}
        >
          <span style={{ color: 'rgba(45,212,191,0.5)', fontSize: '10px', fontFamily: 'monospace' }}>
            {'> '}
          </span>
          <LoopTypewriter
            strings={TERMINAL_STRINGS}
            speed={38}
            pauseMs={1600}
            className="font-mono text-[10px]"
            // inline style applied via wrapper
          />
        </div>
      </motion.div>
    </div>
  );
};
