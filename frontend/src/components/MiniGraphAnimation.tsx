import React from 'react';
import { motion } from 'framer-motion';

interface MiniGraphAnimationProps {
  step: number;
}

export const MiniGraphAnimation: React.FC<MiniGraphAnimationProps> = ({ step }) => {
  const centerX = 200;
  const centerY = 200;
  
  // Nodos Mockados e Estilizados
  const userNode = { id: 'u1', x: centerX, y: centerY, color: '#0ea5e9', label: 'Você' };
  
  const skillNodes = [
    { id: 's1', x: 100, y: 130, color: '#a78bfa', label: 'IA' },
    { id: 's2', x: 300, y: 130, color: '#818cf8', label: 'Python' },
    { id: 's3', x: 200, y: 280, color: '#a78bfa', label: 'ML' },
  ];
  
  const similarNodes = [
    { id: 'p1', x: 80, y: 50, color: '#34d399', label: 'Maria (Neo4j)' },
    { id: 'p2', x: 320, y: 50, color: '#34d399', label: 'João (Pesquisa)' },
  ];
  
  const editalNodes = [
    { id: 'e1', x: 60, y: 320, color: '#2563eb', label: 'FACEPE IA' },
    { id: 'e2', x: 340, y: 320, color: '#0ea5e9', label: 'CNPq Dados' },
  ];

  const renderNode = (node: any, delay: number, withPulse: boolean = false) => (
    <motion.g
      key={node.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
    >
      {withPulse && (
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="16"
          fill={node.color}
          opacity="0.2"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <circle cx={node.x} cy={node.y} r="10" fill={node.color} />
      <text
        x={node.x}
        y={node.y + 22}
        fill="#e8f0f8"
        fontSize="11"
        textAnchor="middle"
        className="font-mono font-medium"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        {node.label}
      </text>
    </motion.g>
  );

  const drawEdge = (source: any, target: any, color: string, delay: number, isDashed: boolean = false) => (
    <motion.line
      key={`${source.id}-${target.id}`}
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={color}
      strokeWidth={isDashed ? "1" : "2"}
      strokeDasharray={isDashed ? "4,4" : undefined}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: isDashed ? 0.4 : 0.6 }}
      transition={{ duration: 1, delay, ease: "easeInOut" }}
    />
  );

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible drop-shadow-2xl">
        {/* Step 1: HAS_SKILL */}
        {step >= 1 && skillNodes.map((s, i) => drawEdge(userNode, s, s.color, i * 0.2))}
        
        {/* Step 2: SIMILAR_TO / RELATED_TO */}
        {step >= 2 && similarNodes.map((sim, i) => drawEdge(skillNodes[i % skillNodes.length], sim, '#34d399', i * 0.3, true))}
        
        {/* Step 3: ELIGIBLE_FOR (Match) */}
        {step >= 3 && editalNodes.map((e, i) => (
          <motion.path
            key={`match-${i}`}
            d={`M ${userNode.x} ${userNode.y} Q ${200} ${300} ${e.x} ${e.y}`}
            fill="transparent"
            stroke="url(#matchGradient)"
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1.5, delay: i * 0.4, ease: "easeOut" }}
          />
        ))}

        {/* Nodes */}
        {renderNode(userNode, 0, true)}
        {step >= 1 && skillNodes.map((s, i) => renderNode(s, i * 0.2))}
        {step >= 2 && similarNodes.map((sim, i) => renderNode(sim, i * 0.3))}
        {step >= 3 && editalNodes.map((e, i) => renderNode(e, i * 0.4, true))}
        
        <defs>
          <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
