import React from 'react';
import { motion } from 'framer-motion';

interface MiniGraphNode {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
}

interface MiniGraphAnimationProps {
  step: number;
  activeSkills?: string[];
  activeAreas?: string[];
  activeMatches?: { title: string }[];
}

export const MiniGraphAnimation: React.FC<MiniGraphAnimationProps> = ({ step, activeSkills = [], activeAreas = [], activeMatches = [] }) => {
  const centerX = 200;
  const centerY = 200;
  
  const userNode: MiniGraphNode = { id: 'user', x: centerX, y: centerY, color: '#0ea5e9', label: 'Você' };
  
  // Posicionamento dinâmico baseado no que a IA encontrou
  const skillNodes: MiniGraphNode[] = activeSkills.map((s, i) => {
    const angle = (i * (360 / Math.max(activeSkills.length, 1))) * (Math.PI / 180);
    return {
      id: `s-${i}`,
      x: centerX + Math.cos(angle) * 100,
      y: centerY + Math.sin(angle) * 100,
      color: '#a78bfa',
      label: s
    };
  });
  
  const areaNodes: MiniGraphNode[] = activeAreas.map((a, i) => {
    const angle = (i * (360 / Math.max(activeAreas.length, 1)) + 45) * (Math.PI / 180);
    return {
      id: `a-${i}`,
      x: centerX + Math.cos(angle) * 160,
      y: centerY + Math.sin(angle) * 160,
      color: '#34d399',
      label: a
    };
  });
  
  const matchNodes: MiniGraphNode[] = activeMatches.map((m, i) => {
    const angle = (i * 60 + 180) * (Math.PI / 180);
    return {
      id: `m-${i}`,
      x: centerX + Math.cos(angle) * 180,
      y: centerY + Math.sin(angle) * 180,
      color: '#f59e0b',
      label: m.title.substring(0, 12) + '...'
    };
  });

  const renderNode = (node: MiniGraphNode, delay: number, withPulse: boolean = false) => (
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
        fontSize="10"
        textAnchor="middle"
        className="font-mono font-medium"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
      >
        {node.label}
      </text>
    </motion.g>
  );

  const drawEdge = (source: MiniGraphNode, target: MiniGraphNode, color: string, delay: number, isDashed: boolean = false) => (
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
      animate={{ pathLength: 1, opacity: isDashed ? 0.3 : 0.6 }}
      transition={{ duration: 0.8, delay, ease: "easeInOut" }}
    />
  );

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible drop-shadow-2xl">
        {/* Step 1 & 2: Skills & Areas */}
        {(step >= 1 || activeSkills.length > 0) && skillNodes.map((s, i) => drawEdge(userNode, s, s.color, i * 0.1))}
        {(step >= 2 || activeAreas.length > 0) && areaNodes.map((a, i) => drawEdge(skillNodes[i % skillNodes.length] || userNode, a, a.color, i * 0.1, true))}
        
        {/* Step 3: Matches */}
        {(step >= 3 || activeMatches.length > 0) && matchNodes.map((m, i) => (
          <motion.path
            key={`match-${i}`}
            d={`M ${userNode.x} ${userNode.y} Q ${m.x - 20} ${m.y + 20} ${m.x} ${m.y}`}
            fill="transparent"
            stroke="url(#matchGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
          />
        ))}

        {/* Nodes */}
        {renderNode(userNode, 0, true)}
        {skillNodes.map((s, i) => renderNode(s, i * 0.1))}
        {areaNodes.map((a, i) => renderNode(a, i * 0.1))}
        {matchNodes.map((m, i) => renderNode(m, i * 0.1, true))}
        
        <defs>
          <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
