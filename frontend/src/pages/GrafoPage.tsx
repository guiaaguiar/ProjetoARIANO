import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import noverlap from 'graphology-layout-noverlap';
import { Maximize2, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import type { GraphData } from '../types';
import { NODE_COLORS, NODE_LABELS, type EntityType } from '../types';
import * as api from '../lib/api';

export default function GrafoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; type: string } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['student', 'researcher', 'professor', 'edital', 'skill', 'area']));

  const initGraph = useCallback((data: GraphData) => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }

    const graph = new Graph();
    graphRef.current = graph;

    // Add nodes
    data.nodes.forEach(node => {
      graph.addNode(node.id, {
        label: node.label,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: node.size,
        color: node.color,
        nodeType: node.type,
        originalColor: node.color,
        originalSize: node.size,
        ...node.metadata,
      });
    });

    // Add edges
    data.edges.forEach(edge => {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        try {
          graph.addEdge(edge.source, edge.target, {
            label: edge.label,
            size: Math.max(0.5, edge.weight),
            color: edge.color + '60',
          });
        } catch { /* skip duplicate edges */ }
      }
    });

    // Apply ForceAtlas2 layout
    if (graph.order > 0) {
      forceAtlas2.assign(graph, {
        iterations: 100,
        settings: {
          gravity: 1,
          scalingRatio: 10,
          barnesHutOptimize: true,
          strongGravityMode: false,
          slowDown: 5,
        },
      });
      noverlap.assign(graph, { maxIterations: 50 });
    }

    // Create Sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      labelRenderedSizeThreshold: 6,
      labelSize: 12,
      labelColor: { color: '#e2e8f0' },
      defaultEdgeColor: '#1e3a5f40',
      defaultNodeColor: '#0ea5e9',
      labelFont: 'Outfit',
      stagePadding: 40,
    });

    // Hover effects
    sigma.on('enterNode', ({ node }) => {
      setHoveredNode(node);
      const attrs = graph.getNodeAttributes(node);
      const pos = sigma.graphToViewport({ x: attrs.x, y: attrs.y });
      setTooltip({ x: pos.x, y: pos.y, label: attrs.label, type: attrs.nodeType });

      // Highlight neighbors
      const neighbors = new Set(graph.neighbors(node));
      neighbors.add(node);
      graph.forEachNode((n, a) => {
        if (neighbors.has(n)) {
          graph.setNodeAttribute(n, 'color', a.originalColor);
          graph.setNodeAttribute(n, 'size', n === node ? a.originalSize * 1.8 : a.originalSize * 1.3);
        } else {
          graph.setNodeAttribute(n, 'color', a.originalColor + '30');
          graph.setNodeAttribute(n, 'size', a.originalSize * 0.7);
        }
      });
      graph.forEachEdge((e, a, source, target) => {
        if (neighbors.has(source) && neighbors.has(target)) {
          graph.setEdgeAttribute(e, 'color', '#0ea5e990');
          graph.setEdgeAttribute(e, 'size', 2);
        } else {
          graph.setEdgeAttribute(e, 'color', '#1e3a5f15');
          graph.setEdgeAttribute(e, 'size', 0.3);
        }
      });
    });

    sigma.on('leaveNode', () => {
      setHoveredNode(null);
      setTooltip(null);
      graph.forEachNode((n, a) => {
        graph.setNodeAttribute(n, 'color', a.originalColor);
        graph.setNodeAttribute(n, 'size', a.originalSize);
      });
      graph.forEachEdge((e) => {
        graph.setEdgeAttribute(e, 'color', '#1e3a5f40');
        graph.setEdgeAttribute(e, 'size', 0.5);
      });
    });

    sigmaRef.current = sigma;
  }, []);

  useEffect(() => {
    api.getGraphData()
      .then(data => initGraph(data))
      .catch(() => {
        // Mock data for demo
        initGraph({
          nodes: [
            { id: '1', label: 'Ana Carolina', type: 'student', size: 8, color: NODE_COLORS.student, metadata: {} },
            { id: '2', label: 'Python', type: 'skill', size: 5, color: NODE_COLORS.skill, metadata: {} },
            { id: '3', label: 'Machine Learning', type: 'skill', size: 5, color: NODE_COLORS.skill, metadata: {} },
            { id: '4', label: 'FACEPE IC 2026', type: 'edital', size: 12, color: NODE_COLORS.edital, metadata: {} },
            { id: '5', label: 'Dr. Marcos Vasconcelos', type: 'researcher', size: 8, color: NODE_COLORS.researcher, metadata: {} },
            { id: '6', label: 'IA', type: 'area', size: 5, color: NODE_COLORS.area, metadata: {} },
            { id: '7', label: 'Prof. Antonio', type: 'professor', size: 10, color: NODE_COLORS.professor, metadata: {} },
            { id: '8', label: 'Deep Learning', type: 'skill', size: 5, color: NODE_COLORS.skill, metadata: {} },
            { id: '9', label: 'CNPq Universal', type: 'edital', size: 12, color: NODE_COLORS.edital, metadata: {} },
            { id: '10', label: 'Bruno Costa', type: 'student', size: 8, color: NODE_COLORS.student, metadata: {} },
            { id: '11', label: 'React', type: 'skill', size: 5, color: NODE_COLORS.skill, metadata: {} },
            { id: '12', label: 'TypeScript', type: 'skill', size: 5, color: NODE_COLORS.skill, metadata: {} },
          ],
          edges: [
            { id: 'e1', source: '1', target: '2', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e2', source: '1', target: '3', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e3', source: '4', target: '2', label: 'REQUIRES', weight: 1, color: '#8b5cf6', metadata: {} },
            { id: 'e4', source: '4', target: '6', label: 'TARGETS', weight: 1, color: '#6366f1', metadata: {} },
            { id: 'e5', source: '5', target: '2', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e6', source: '5', target: '6', label: 'RESEARCHES', weight: 1, color: '#6366f1', metadata: {} },
            { id: 'e7', source: '7', target: '3', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e8', source: '7', target: '8', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e9', source: '9', target: '3', label: 'REQUIRES', weight: 1, color: '#8b5cf6', metadata: {} },
            { id: 'e10', source: '9', target: '8', label: 'REQUIRES', weight: 1, color: '#8b5cf6', metadata: {} },
            { id: 'e11', source: '10', target: '11', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
            { id: 'e12', source: '10', target: '12', label: 'HAS_SKILL', weight: 1, color: '#06b6d4', metadata: {} },
          ],
        });
      })
      .finally(() => setLoading(false));

    return () => {
      if (sigmaRef.current) sigmaRef.current.kill();
    };
  }, [initGraph]);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);

      // Apply filter
      if (graphRef.current) {
        graphRef.current.forEachNode((n, a) => {
          const visible = next.has(a.nodeType);
          graphRef.current!.setNodeAttribute(n, 'hidden', !visible);
        });
      }
      return next;
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-text-primary">
            Grafo de Conhecimento
          </motion.h1>
          <p className="text-text-secondary mt-1">Visualização interativa do grafo Neo4j — Sigma.js + Graphology</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => sigmaRef.current?.getCamera().animatedZoom({ duration: 300 })}
            className="btn-secondary p-2"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => sigmaRef.current?.getCamera().animatedUnzoom({ duration: 300 })}
            className="btn-secondary p-2"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => sigmaRef.current?.getCamera().animatedReset({ duration: 300 })}
            className="btn-secondary p-2"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Legend/Filters */}
      <div className="flex gap-2 mb-3">
        {(Object.entries(NODE_COLORS) as [EntityType, string][]).map(([type, color]) => (
          <button key={type} onClick={() => toggleFilter(type)}
            className={`badge text-xs cursor-pointer transition-all ${activeFilters.has(type) ? '' : 'opacity-30'}`}
            style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}>
            <span className="w-2 h-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: color }} />
            {NODE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative rounded-xl border border-border overflow-hidden bg-void-light">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/80 z-10">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-text-secondary">Carregando grafo...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Tooltip */}
        {tooltip && (
          <div className="graph-tooltip absolute" style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[tooltip.type as EntityType] }} />
              <span className="font-medium">{tooltip.label}</span>
              <span className="text-text-muted text-[11px]">{NODE_LABELS[tooltip.type as EntityType]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

