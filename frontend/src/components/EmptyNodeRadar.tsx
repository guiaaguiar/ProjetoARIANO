import React from 'react';
import { motion } from 'framer-motion';
import { LoopTypewriter } from './TypewriterText';
import { FileText, Briefcase, Users, Network, Award, FileBadge, Link2, Lightbulb, Brain } from 'lucide-react';

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

const RADAR_COLOR = '#f97316'; // orange-500
const RADAR_GLOW = 'rgba(249, 115, 22, 0.5)';

const SATELLITES = [
  { id: 1, label: 'Histórico', icon: FileText, angle: 315, radius: 190 },
  { id: 2, label: 'Documentos', icon: Briefcase, angle: 265, radius: 190 },
  { id: 3, label: 'Sinistro/Leilão', icon: Search, angle: 220, radius: 190 },
  { id: 4, label: 'Multas', icon: FileBadge, angle: 0, radius: 150 },
  { id: 5, label: 'Restrições', icon: Award, angle: 180, radius: 150 },
  { id: 6, label: 'IPVA', icon: Network, angle: 45, radius: 190 },
  { id: 7, label: 'Licenciamento', icon: Link2, angle: 95, radius: 190 },
  { id: 8, label: 'Débitos', icon: Lightbulb, angle: 140, radius: 190 },
];

export const EmptyNodeRadar: React.FC<EmptyNodeRadarProps> = ({ userName, size = 480 }) => {
  const firstName = userName?.split(' ')[0] || 'Você';
  const centerSize = 72;

  // Substituindo pelos icones que remetem ao ambiente acadêmico da plataforma
  const ARIANO_SATELLITES = [
    { id: 1, label: 'Histórico', icon: FileText, angle: 315, radius: 190 },
    { id: 2, label: 'Documentos', icon: FileBadge, angle: 265, radius: 190 },
    { id: 3, label: 'Sinistro/Leilão', icon: Search, angle: 220, radius: 190 },
    { id: 4, label: 'Multas', icon: FileText, angle: 0, radius: 150 },
    { id: 5, label: 'Restrições', icon: Award, angle: 180, radius: 150 },
    { id: 6, label: 'IPVA', icon: Network, angle: 45, radius: 190 },
    { id: 7, label: 'Licenciamento', icon: Link2, angle: 95, radius: 190 },
    { id: 8, label: 'Débitos', icon: Lightbulb, angle: 140, radius: 190 },
  ];

  return (
    <div className="flex flex-col items-center gap-8 select-none w-full max-w-3xl mx-auto overflow-hidden py-10">
      {/* ── Radar Container ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Concentric Rings */}
        {[100, 180, 260, 340, 420, 500].map((diameter, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: diameter,
              height: diameter,
              border: `1px solid rgba(249, 115, 22, ${0.12 - (i * 0.015)})`,
            }}
          />
        ))}

        {/* Rotating Full-Diameter Line */}
        <motion.div
          className="absolute z-10"
          style={{
            width: size * 1.3,
            height: '2px',
            left: '50%',
            top: '50%',
            marginLeft: -(size * 1.3) / 2,
            marginTop: '-1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.05) 20%, rgba(249, 115, 22, 0.8) 50%, rgba(249, 115, 22, 0.05) 80%, transparent 100%)',
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Scanner Glow Overlay */}
        <motion.div
          className="absolute rounded-full z-0 pointer-events-none"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 170deg, rgba(249, 115, 22, 0.03) 180deg, transparent 190deg, transparent 350deg, rgba(249, 115, 22, 0.03) 360deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Central Node */}
        <div
          className="absolute rounded-full flex items-center justify-center z-20 bg-[#0b101a] backdrop-blur-sm"
          style={{
            width: centerSize,
            height: centerSize,
            border: `1px solid ${RADAR_COLOR}`,
            boxShadow: `0 0 30px rgba(249, 115, 22, 0.25), inset 0 0 20px rgba(249, 115, 22, 0.15)`,
          }}
        >
          {/* Pulsing inner glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(249, 115, 22, 0.1)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Brain className="w-8 h-8 text-orange-500 z-10" />
        </div>

        {/* Floating Satellites (Icons with Text) */}
        {ARIANO_SATELLITES.map((sat) => {
          // Convert angle and radius to x, y offsets
          const rad = (sat.angle - 90) * (Math.PI / 180);
          const x = sat.radius * Math.cos(rad);
          const y = sat.radius * Math.sin(rad);

          return (
            <div
              key={sat.id}
              className="absolute flex flex-col items-center justify-center z-10"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <div 
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center bg-[#0b101a] backdrop-blur-md mb-2"
                style={{
                  border: `1px solid rgba(249, 115, 22, 0.35)`,
                  boxShadow: `0 0 15px rgba(249, 115, 22, 0.08)`,
                }}
              >
                <sat.icon className="w-[22px] h-[22px] text-orange-500" strokeWidth={1.5} />
              </div>
              <span 
                className="text-orange-200/80 text-[11px] px-3 py-[3px] rounded-full bg-[#0b101a]/80"
                style={{ border: '1px solid rgba(249, 115, 22, 0.15)' }}
              >
                {sat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal text / Status */}
      <motion.div
        className="flex flex-col items-center gap-3 mt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p
          className="font-black tracking-widest uppercase"
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: RADAR_COLOR,
            textShadow: `0 0 12px ${RADAR_GLOW}`,
          }}
        >
          {firstName}
        </p>

        {/* Terminal text */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(249, 115, 22, 0.05)',
            border: '1px solid rgba(249, 115, 22, 0.15)',
          }}
        >
          <span style={{ color: 'rgba(249, 115, 22, 0.5)', fontSize: '12px', fontFamily: 'monospace' }}>
            {'> '}
          </span>
          <LoopTypewriter
            strings={TERMINAL_STRINGS}
            speed={38}
            pauseMs={1600}
            className="font-mono text-xs text-orange-400/80"
          />
        </div>
      </motion.div>
    </div>
  );
};
