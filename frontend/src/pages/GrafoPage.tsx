import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Maximize2, ZoomIn, ZoomOut, Loader2, X, ExternalLink, Info } from 'lucide-react';
import type { GraphData } from '../types';
import { NODE_COLORS, NODE_LABELS, type EntityType } from '../types';

import * as api from '../lib/api';

const EDGE_LABEL_MAP: Record<string, string> = {
  HAS_SKILL: 'possui',
  REQUIRES: 'requer',
  REQUIRES_SKILL: 'requer',
  TARGETS_AREA: 'foca em',
  RESEARCHES_AREA: 'pesquisa',
  ADVISES: 'orienta',
  COLLABORATES: 'colabora',
  ELIGIBLE_FOR: 'elegível',
};

interface NodeDetail {
  id: string;
  label: string;
  type: string;
  color: string;
  neighbors: { id: string; label: string; type: string; edgeLabel: string; color: string }[];
  metadata: Record<string, unknown>;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  nodeType: string;
  color: string;
  size: number;
  metadata: Record<string, unknown>;
}

interface D3Edge extends d3.SimulationLinkDatum<D3Node> {
  label: string;
  rawLabel: string;
  color: string;
  weight: number;
}

export default function GrafoPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [graphInfo, setGraphInfo] = useState({ nodes: 0, edges: 0 });
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set([]));
  const nodesRef = useRef<D3Node[]>([]);
  const edgesRef = useRef<D3Edge[]>([]);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Edge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const activeFiltersRef = useRef<Set<string>>(activeFilters);

  // Keep ref in sync with state
  useEffect(() => {
    activeFiltersRef.current = activeFilters;
  }, [activeFilters]);

  const getNeighborList = useCallback((nodeId: string) => {
    return edgesRef.current
      .filter(e => {
        const s = typeof e.source === 'object' ? (e.source as D3Node).id : e.source;
        const t = typeof e.target === 'object' ? (e.target as D3Node).id : e.target;
        return s === nodeId || t === nodeId;
      })
      .map(e => {
        const s = typeof e.source === 'object' ? (e.source as D3Node) : nodesRef.current.find(n => n.id === e.source)!;
        const t = typeof e.target === 'object' ? (e.target as D3Node) : nodesRef.current.find(n => n.id === e.target)!;
        const neighbor = s.id === nodeId ? t : s;
        return { id: neighbor.id, label: neighbor.label, type: neighbor.nodeType, edgeLabel: e.rawLabel, color: neighbor.color };
      });
  }, []);

  // Highlight a node: dim others, show edges only to VISIBLE neighbors
  const applyHighlight = useCallback((nodeId: string, nodeElements: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>, edgePaths: d3.Selection<SVGPathElement, D3Edge, SVGGElement, unknown>, edgeLabels: d3.Selection<SVGTextElement, D3Edge, SVGGElement, unknown>) => {
    const filters = activeFiltersRef.current;
    const neighborIds = new Set<string>();
    neighborIds.add(nodeId);
    edgesRef.current.forEach(e => {
      const s = typeof e.source === 'object' ? (e.source as D3Node).id : e.source;
      const t = typeof e.target === 'object' ? (e.target as D3Node).id : e.target;
      if (s === nodeId) neighborIds.add(t as string);
      if (t === nodeId) neighborIds.add(s as string);
    });

    // Dim non-neighbors
    nodeElements.transition().duration(200)
      .attr('opacity', (n: D3Node) => {
        if (!filters.has(n.nodeType)) return 0; // hidden by filter
        return neighborIds.has(n.id) ? 1 : 0.1;
      });

    // Show edges only if BOTH endpoints are visible (pass filter) and one is the selected node
    edgePaths.transition().duration(200)
      .attr('opacity', (e: D3Edge) => {
        const s = typeof e.source === 'object' ? (e.source as D3Node) : nodesRef.current.find(n => n.id === e.source)!;
        const t = typeof e.target === 'object' ? (e.target as D3Node) : nodesRef.current.find(n => n.id === e.target)!;
        const isConnected = s.id === nodeId || t.id === nodeId;
        const bothVisible = filters.has(s.nodeType) && filters.has(t.nodeType);
        return (isConnected && bothVisible) ? 0.85 : 0;
      })
      .attr('stroke', (e: D3Edge) => {
        const s = typeof e.source === 'object' ? (e.source as D3Node).id : e.source;
        const t = typeof e.target === 'object' ? (e.target as D3Node).id : e.target;
        return (s === nodeId || t === nodeId) ? '#38bdf8cc' : e.color + '80';
      })
      .attr('stroke-width', (e: D3Edge) => {
        const s = typeof e.source === 'object' ? (e.source as D3Node).id : e.source;
        const t = typeof e.target === 'object' ? (e.target as D3Node).id : e.target;
        return (s === nodeId || t === nodeId) ? 2.5 : Math.max(1, e.weight * 2);
      });

    edgeLabels.transition().duration(200)
      .attr('opacity', (e: D3Edge) => {
        const s = typeof e.source === 'object' ? (e.source as D3Node) : nodesRef.current.find(n => n.id === e.source)!;
        const t = typeof e.target === 'object' ? (e.target as D3Node) : nodesRef.current.find(n => n.id === e.target)!;
        const isConnected = s.id === nodeId || t.id === nodeId;
        const bothVisible = filters.has(s.nodeType) && filters.has(t.nodeType);
        return (isConnected && bothVisible) ? 1 : 0;
      });

    // Scale up selected node
    nodeElements.each(function (d: D3Node) {
      const el = d3.select(this);
      if (d.id === nodeId) {
        el.select('.node-core').transition().duration(200).attr('r', d.size * 1.5);
        el.select('.node-glow').transition().duration(200).attr('r', d.size * 3.5).attr('opacity', 0.3);
      } else if (neighborIds.has(d.id)) {
        el.select('.node-core').transition().duration(200).attr('r', d.size * 1.15);
        el.select('.node-glow').transition().duration(200).attr('r', d.size * 2.8).attr('opacity', 0.18);
      } else {
        el.select('.node-core').transition().duration(200).attr('r', d.size);
        el.select('.node-glow').transition().duration(200).attr('r', d.size * 2.5).attr('opacity', 0.08);
      }
    });
  }, []);

  // Clear all highlights
  const clearHighlight = useCallback((nodeElements: d3.Selection<SVGGElement, D3Node, SVGGElement, unknown>, edgePaths: d3.Selection<SVGPathElement, D3Edge, SVGGElement, unknown>, edgeLabels: d3.Selection<SVGTextElement, D3Edge, SVGGElement, unknown>) => {
    const filters = activeFiltersRef.current;
    nodeElements.transition().duration(300)
      .attr('opacity', (n: D3Node) => filters.has(n.nodeType) ? 1 : 0);

    edgePaths.transition().duration(300).attr('opacity', 0);
    edgeLabels.transition().duration(300).attr('opacity', 0);

    nodeElements.each(function (d: D3Node) {
      const el = d3.select(this);
      el.select('.node-core').transition().duration(300).attr('r', d.size);
      el.select('.node-glow').transition().duration(300).attr('r', d.size * 2.5).attr('opacity', 0.12);
    });
  }, []);

  const initGraph = useCallback((data: GraphData) => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const nodes: D3Node[] = data.nodes.map(n => ({
      id: n.id,
      label: n.label,
      nodeType: n.type,
      color: n.color,
      size: n.size,
      metadata: n.metadata,
    }));

    const edges: D3Edge[] = data.edges
      .filter(e => nodes.find(n => n.id === e.source) && nodes.find(n => n.id === e.target))
      .map(e => ({
        source: e.source,
        target: e.target,
        label: EDGE_LABEL_MAP[e.label] || e.label,
        rawLabel: e.label,
        color: e.color,
        weight: e.weight,
      }));

    const edgeSet = new Set<string>();
    const uniqueEdges = edges.filter(e => {
      const key = `${e.source}-${e.target}`;
      const rkey = `${e.target}-${e.source}`;
      if (edgeSet.has(key) || edgeSet.has(rkey)) return false;
      edgeSet.add(key);
      return true;
    });

    nodesRef.current = nodes;
    edgesRef.current = uniqueEdges;
    setGraphInfo({ nodes: nodes.length, edges: uniqueEdges.length });

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Defs: glow filters
    const defs = svg.append('defs');

    Object.entries(NODE_COLORS).forEach(([type, color]) => {
      const filter = defs.append('filter')
        .attr('id', `glow-${type}`)
        .attr('x', '-80%').attr('y', '-80%')
        .attr('width', '260%').attr('height', '260%');
      filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'glow');
      filter.append('feFlood').attr('flood-color', color).attr('flood-opacity', '0.6').attr('result', 'color');
      filter.append('feComposite').attr('in', 'color').attr('in2', 'glow').attr('operator', 'in').attr('result', 'coloredGlow');
      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'coloredGlow');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    });

    const edgeGlow = defs.append('filter')
      .attr('id', 'edge-glow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    edgeGlow.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
    const edgeMerge = edgeGlow.append('feMerge');
    edgeMerge.append('feMergeNode').attr('in', 'blur');
    edgeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15).attr('refY', 0)
      .attr('markerWidth', 4).attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf890');

    const g = svg.append('g').attr('class', 'graph-container');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);
    zoomRef.current = zoom;

    const edgeGroup = g.append('g').attr('class', 'edges');
    const edgeLabelGroup = g.append('g').attr('class', 'edge-labels');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Edges — hidden by default
    const edgePaths = edgeGroup.selectAll<SVGPathElement, D3Edge>('path')
      .data(uniqueEdges)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', d => d.color + '80')
      .attr('stroke-width', d => Math.max(1, d.weight * 2))
      .attr('opacity', 0)
      .attr('filter', 'url(#edge-glow)')
      .attr('marker-end', 'url(#arrowhead)');

    // Edge labels — hidden by default
    const edgeLabels = edgeLabelGroup.selectAll<SVGTextElement, D3Edge>('text')
      .data(uniqueEdges)
      .enter()
      .append('text')
      .attr('font-size', '9px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('fill', '#38bdf8')
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .text(d => d.label);

    // Nodes
    const nodeElements = nodeGroup.selectAll<SVGGElement, D3Node>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .attr('opacity', 0)
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulationRef.current?.alphaTarget(0.2).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulationRef.current?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Outer glow
    nodeElements.append('circle')
      .attr('class', 'node-glow')
      .attr('r', d => d.size * 2.5)
      .attr('fill', d => d.color)
      .attr('opacity', 0.12)
      .attr('filter', d => `url(#glow-${d.nodeType})`);

    // Main circle
    nodeElements.append('circle')
      .attr('class', 'node-core')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', d => d3.color(d.color)!.brighter(0.8).toString())
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.95);

    // Inner spot
    nodeElements.append('circle')
      .attr('class', 'node-inner')
      .attr('r', d => d.size * 0.4)
      .attr('fill', 'white')
      .attr('opacity', 0.2);

    // Labels
    nodeElements.append('text')
      .attr('dy', d => d.size + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.size >= 10 ? '11px' : '9px')
      .attr('font-family', "'Outfit', sans-serif")
      .attr('fill', '#cbd5e1')
      .attr('font-weight', d => d.size >= 10 ? '600' : '400')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#020810')
      .attr('stroke-width', '3px')
      .text(d => d.label);

    // --- HOVER: only visual feedback if NO node is selected ---
    nodeElements
      .on('mouseenter', function (_event, d) {
        if (selectedIdRef.current) return; // don't hover-highlight while a node is clicked/selected
        applyHighlight(d.id, nodeElements, edgePaths, edgeLabels);
      })
      .on('mouseleave', function () {
        if (selectedIdRef.current) return;
        clearHighlight(nodeElements, edgePaths, edgeLabels);
      });

    // --- CLICK: lock selection ---
    nodeElements.on('click', (event, d) => {
      event.stopPropagation();
      selectedIdRef.current = d.id;
      const neighbors = getNeighborList(d.id);
      setSelectedNode({
        id: d.id,
        label: d.label,
        type: d.nodeType,
        color: d.color,
        neighbors,
        metadata: d.metadata || {},
      });
      applyHighlight(d.id, nodeElements, edgePaths, edgeLabels);
    });

    // --- CLICK BACKGROUND: deselect ---
    svg.on('click', () => {
      selectedIdRef.current = null;
      setSelectedNode(null);
      clearHighlight(nodeElements, edgePaths, edgeLabels);
    });

    // --- ESC to deselect ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectedIdRef.current = null;
        setSelectedNode(null);
        clearHighlight(nodeElements, edgePaths, edgeLabels);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Force simulation - Tweaked for more fluid and visual physics
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Edge>(uniqueEdges)
        .id(d => d.id)
        .distance(d => d.rawLabel === 'ELIGIBLE_FOR' ? 220 : 130)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody<D3Node>()
        .strength(d => -d.size * 40) // Stronger repel for less clustering
        .distanceMax(600)
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('collision', d3.forceCollide<D3Node>().radius(d => d.size * 3 + 15).iterations(2))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.04) // Slower decay = longer, smoother animation 
      .velocityDecay(0.5); // Less friction = more bouncy and fluid

    simulationRef.current = simulation;

    simulation.on('tick', () => {
      edgePaths.attr('d', (d: D3Edge) => {
        const s = d.source as D3Node;
        const t = d.target as D3Node;
        const dx = t.x! - s.x!;
        const dy = t.y! - s.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M${s.x},${s.y} A${dr},${dr} 0 0,1 ${t.x},${t.y}`;
      });

      edgeLabels
        .attr('x', (d: D3Edge) => {
          const s = d.source as D3Node;
          const t = d.target as D3Node;
          const mx = (s.x! + t.x!) / 2;
          const dy = t.y! - s.y!;
          const dx = t.x! - s.x!;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return mx + (dy / len) * 15;
        })
        .attr('y', (d: D3Edge) => {
          const s = d.source as D3Node;
          const t = d.target as D3Node;
          const my = (s.y! + t.y!) / 2;
          const dx = t.x! - s.x!;
          const dy = t.y! - s.y!;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return my - (dx / len) * 15;
        });

      nodeElements.attr('transform', (d: D3Node) => `translate(${d.x},${d.y})`);
    });

    // Initial zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.9));

    // Staggered Fade-in Animation
    nodeElements.transition()
      .duration(1000)
      .delay((_d, i) => Math.min(i * 15, 800)) // smooth staggered effect
      .attr('opacity', (n: D3Node) => activeFiltersRef.current.has(n.nodeType) ? 1 : 0);

    // Store refs for filter updates
    (svgRef.current as any).__nodeElements = nodeElements;
    (svgRef.current as any).__edgePaths = edgePaths;
    (svgRef.current as any).__edgeLabels = edgeLabels;

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getNeighborList, applyHighlight, clearHighlight]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    api.getGraphData()
      .then(data => { cleanup = initGraph(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
      if (cleanup) cleanup();
    };
  }, [initGraph]);

  // When filters change, update visibility and re-apply selection highlight if active
  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      activeFiltersRef.current = next;

      // Update node visibility
      if (svgRef.current) {
        const nodeElements = (svgRef.current as any).__nodeElements as d3.Selection<SVGGElement, D3Node, SVGGElement, unknown> | undefined;
        const edgePaths = (svgRef.current as any).__edgePaths as d3.Selection<SVGPathElement, D3Edge, SVGGElement, unknown> | undefined;
        const edgeLabels = (svgRef.current as any).__edgeLabels as d3.Selection<SVGTextElement, D3Edge, SVGGElement, unknown> | undefined;
        if (nodeElements && edgePaths && edgeLabels) {
          if (selectedIdRef.current) {
            // Re-apply highlight with new filters
            applyHighlight(selectedIdRef.current, nodeElements, edgePaths, edgeLabels);
          } else {
            // Just show/hide nodes
            nodeElements.transition().duration(200)
              .attr('opacity', (d: D3Node) => next.has(d.nodeType) ? 1 : 0);
            edgePaths.transition().duration(200).attr('opacity', 0);
            edgeLabels.transition().duration(200).attr('opacity', 0);
          }
        }
      }

      return next;
    });
  };

  const selectNodeFromPanel = (nodeId: string) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return;
    const neighbors = getNeighborList(nodeId);
    selectedIdRef.current = nodeId;
    setSelectedNode({ id: nodeId, label: node.label, type: node.nodeType, color: node.color, neighbors, metadata: node.metadata || {} });

    if (svgRef.current) {
      const nodeElements = (svgRef.current as any).__nodeElements;
      const edgePaths = (svgRef.current as any).__edgePaths;
      const edgeLabels = (svgRef.current as any).__edgeLabels;
      if (nodeElements && edgePaths && edgeLabels) {
        applyHighlight(nodeId, nodeElements, edgePaths, edgeLabels);
      }
    }

    // Pan to node
    if (svgRef.current && zoomRef.current) {
      const w = containerRef.current!.clientWidth;
      const h = containerRef.current!.clientHeight;
      const transform = d3.zoomIdentity.translate(w / 2 - node.x! * 1.5, h / 2 - node.y! * 1.5).scale(1.5);
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, transform);
    }
  };

  const deselectNode = () => {
    selectedIdRef.current = null;
    setSelectedNode(null);
    if (svgRef.current) {
      const nodeElements = (svgRef.current as any).__nodeElements;
      const edgePaths = (svgRef.current as any).__edgePaths;
      const edgeLabels = (svgRef.current as any).__edgeLabels;
      if (nodeElements && edgePaths && edgeLabels) {
        clearHighlight(nodeElements, edgePaths, edgeLabels);
      }
    }
  };

  const handleZoom = (dir: 'in' | 'out' | 'reset') => {
    if (!svgRef.current || !zoomRef.current) return;
    const s = d3.select(svgRef.current);
    if (dir === 'in') s.transition().duration(300).call(zoomRef.current.scaleBy, 1.4);
    else if (dir === 'out') s.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    else s.transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity.scale(0.9));
  };

  const nodeColor = (type: string) => NODE_COLORS[type as EntityType] || '#64748b';

  return (
    <div className="h-[calc(100vh-88px)] lg:h-[calc(100vh-56px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-2xl lg:text-3xl font-bold text-text-primary">
            Grafo de Conhecimento
          </motion.h1>
          <p className="text-text-secondary text-sm mt-1.5">
            <span className="text-accent font-mono">{graphInfo.nodes}</span> nós ·{' '}
            <span className="text-accent font-mono">{graphInfo.edges}</span> arestas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom('in')} className="btn-secondary p-2.5"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => handleZoom('out')} className="btn-secondary p-2.5"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => handleZoom('reset')} className="btn-secondary p-2.5"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Legend/Filters */}
      <div className="flex gap-2.5 flex-wrap">
        {(Object.entries(NODE_COLORS) as [EntityType, string][]).map(([type, color]) => (
          <button key={type} onClick={() => toggleFilter(type)}
            className={`badge text-xs cursor-pointer transition-all py-1.5 ${activeFilters.has(type) ? '' : 'opacity-20'}`}
            style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color, paddingLeft: '2px', paddingRight: '2px' }}>
            <span className="w-2.5 h-2.5 rounded-full mr-2 inline-block" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
            <span style={{ paddingLeft: '2px' }}>{NODE_LABELS[type]}</span>
          </button>
        ))}
      </div>

      {/* Graph + Detail panel */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Graph Container */}
        <div ref={containerRef} className="relative rounded-xl border border-border overflow-hidden flex-1"
          style={{ backgroundColor: '#020810' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-void/90 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
                <span className="text-text-secondary text-sm">Simulando forças do grafo...</span>
              </div>
            </div>
          )}
          <svg ref={svgRef} className="w-full h-full" />

          {/* Hint */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-text-muted text-[10px] bg-void/70 px-2.5 py-1.5 rounded-md backdrop-blur-sm">
            <Info className="w-3 h-3" />
            Arraste nós · Clique para detalhes · ESC para desselecionar · Scroll para zoom
          </div>
        </div>

        {/* Detail Panel — Desktop */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:flex flex-col rounded-xl border border-border bg-surface overflow-hidden min-w-0"
            >
              <div className="border-b border-border" style={{ padding: '4px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color, boxShadow: `0 0 15px ${selectedNode.color}30` }}>
                      {selectedNode.label.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text-primary truncate">{selectedNode.label}</h3>
                      <span className="badge text-[10px] mt-0.5" style={{ backgroundColor: `${selectedNode.color}15`, borderColor: `${selectedNode.color}30`, color: selectedNode.color }}>
                        {NODE_LABELS[selectedNode.type as EntityType]}
                      </span>
                    </div>
                  </div>
                  <button onClick={deselectNode}
                    className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5" style={{ padding: '4px' }}>
                {Object.entries(selectedNode.metadata).filter(([, v]) => v).length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2.5 font-semibold" style={{ padding: '4px' }}>Detalhes</p>
                    <div className="space-y-2 bg-void-light rounded-lg" style={{ padding: '4px' }}>
                      {Object.entries(selectedNode.metadata).filter(([, v]) => v).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs gap-2">
                          <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-text-primary font-medium text-right truncate max-w-[180px]">
                            {typeof val === 'number' && val >= 100
                              ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Conexões ({selectedNode.neighbors.length})
                  </p>
                  <div className="space-y-1">
                    {selectedNode.neighbors.map(n => (
                      <div key={n.id}
                        onClick={() => selectNodeFromPanel(n.id)}
                        className="flex items-center gap-2.5 rounded-lg hover:bg-surface-hover cursor-pointer transition-all group"
                        style={{ padding: '4px' }}
                      >
                        <span className="w-2.5 h-2.5 min-w-[10px] rounded-full" style={{ backgroundColor: nodeColor(n.type), boxShadow: `0 0 6px ${nodeColor(n.type)}60` }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate group-hover:text-accent transition-colors">{n.label}</p>
                          <p className="text-[10px] text-text-muted font-mono">
                            {EDGE_LABEL_MAP[n.edgeLabel] || n.edgeLabel.toLowerCase().replace(/_/g, ' ')}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border rounded-t-2xl z-50 max-h-[55vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}>
                    {selectedNode.label.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{selectedNode.label}</h3>
                    <span className="badge text-[10px]" style={{ backgroundColor: `${selectedNode.color}15`, borderColor: `${selectedNode.color}30`, color: selectedNode.color }}>
                      {NODE_LABELS[selectedNode.type as EntityType]}
                    </span>
                  </div>
                </div>
                <button onClick={deselectNode} className="text-text-muted hover:text-text-primary p-1.5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {Object.entries(selectedNode.metadata).filter(([, v]) => v).length > 0 && (
                <div className="mb-4 bg-void-light rounded-lg p-3">
                  {Object.entries(selectedNode.metadata).filter(([, v]) => v).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs py-1">
                      <span className="text-text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-text-primary font-medium">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold">Conexões ({selectedNode.neighbors.length})</p>
              <div className="grid grid-cols-2 gap-1.5">
                {selectedNode.neighbors.slice(0, 8).map(n => (
                  <div key={n.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-void-light">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nodeColor(n.type) }} />
                    <span className="text-xs text-text-primary truncate">{n.label}</span>
                  </div>
                ))}
                {selectedNode.neighbors.length > 8 && (
                  <div className="flex items-center justify-center p-2 text-xs text-text-muted">
                    +{selectedNode.neighbors.length - 8} mais
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
