import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Info, Loader2 } from 'lucide-react';
import { NODE_COLORS, type EntityType } from '../types';
import * as api from '../lib/api';

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  cluster_id: number;
  influence: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface Props {
  onNodeClick?: (node: any) => void;
}

const CLUSTER_COLORS = [
  '#2dd4bf', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899',
];

export const NetworkXGraphView: React.FC<Props> = ({ onNodeClick }) => {
  const [data, setData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewBox, setViewBox] = useState({ x: -1000, y: -1000, w: 2000, h: 2000 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) {
           // Fallback or handle error
        } else {
           setData(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleZoom = (factor: number) => {
    setViewBox(prev => ({
      ...prev,
      x: prev.x + (prev.w * (1 - factor)) / 2,
      y: prev.y + (prev.h * (1 - factor)) / 2,
      w: prev.w * factor,
      h: prev.h * factor
    }));
  };

  const resetView = () => setViewBox({ x: -1000, y: -1000, w: 2000, h: 2000 });

  const getEdgeCoords = (edge: Edge) => {
    const s = data?.nodes.find(n => n.id === edge.source);
    const t = data?.nodes.find(n => n.id === edge.target);
    if (!s || !t) return null;
    return { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-void/30 backdrop-blur-md rounded-3xl border border-border/40">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
          Renderizando Camada NetworkX (Graph-CoT)...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#020810] rounded-3xl overflow-hidden border border-border/30 shadow-2xl group">
      {/* NetworkX SVG Engine */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        <g className="edges">
          {data?.edges.map((edge, i) => {
            const coords = getEdgeCoords(edge);
            if (!coords) return null;
            const isRelated = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            return (
              <line
                key={i}
                x1={coords.x1} y1={coords.y1}
                x2={coords.x2} y2={coords.y2}
                stroke={isRelated ? "#2dd4bf" : "#1e293b"}
                strokeWidth={isRelated ? 2 : 1}
                strokeOpacity={isRelated ? 0.8 : 0.2}
                transition-all="true"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {data?.nodes.map((node) => {
            const color = CLUSTER_COLORS[node.cluster_id % CLUSTER_COLORS.length];
            const typeColor = NODE_COLORS[node.type as EntityType] || color;
            const isHovered = hoveredNode === node.id;
            const isDimmed = hoveredNode && !isHovered && !data.edges.some(e => 
              (e.source === hoveredNode && e.target === node.id) || 
              (e.target === hoveredNode && e.source === node.id)
            );

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick?.(node)}
                className="cursor-pointer"
                style={{ opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.3s' }}
              >
                {/* Community Glow */}
                <circle
                  r={node.influence * 3 + 15}
                  fill={color}
                  opacity={0.1}
                  filter="url(#glow)"
                />
                {/* Node Core */}
                <circle
                  r={node.influence * 2 + 6}
                  fill={typeColor}
                  stroke={color}
                  strokeWidth={2}
                />
                {/* Label */}
                {(isHovered || node.influence > 8) && (
                  <text
                    y={node.influence * 2 + 20}
                    textAnchor="middle"
                    fill="#e4e4ed"
                    fontSize="12"
                    fontWeight="600"
                    className="pointer-events-none select-none"
                    style={{ paintOrder: 'stroke', stroke: '#020810', strokeWidth: '3px' }}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => handleZoom(0.8)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(1.2)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><ZoomOut size={18} /></button>
        <button onClick={resetView} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><Maximize2 size={18} /></button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
        <div className="bg-void/80 backdrop-blur-xl border border-accent/20 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Motor de Análise NetworkX
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <span className="text-[10px] text-text-primary font-medium">Comunidade CoT (Graph Of Thoughts)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
              <span className="text-[10px] text-text-primary font-medium">Layout: spring_layout (NetworkX Native)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] text-text-muted bg-void/60 px-3 py-2 rounded-full backdrop-blur-sm border border-border/20">
        <Info size={12} className="text-accent" />
        Renderização Nativa React SVG baseada em coordenadas de servidor NetworkX.
      </div>
    </div>
  );
};
