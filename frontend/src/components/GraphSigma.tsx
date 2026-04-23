import React, { useEffect, useState, useMemo } from 'react';
import { SigmaContainer, useLoadGraph, useSigma, ControlsContainer, ZoomControl, FullScreenControl } from '@sigma/react';
import { Graph } from 'graphology';
import { animateNodes } from 'sigma/utils';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import noverlap from 'graphology-layout-noverlap';
import { Loader2, Info, Search } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, NODE_LABELS, type EntityType } from '../types';

// Palette for communities (NetworkX clusters)
const CLUSTER_COLORS = [
  '#2dd4bf', // Teal
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#ec4899', // Pink
];

interface GraphSigmaProps {
  onNodeClick?: (nodeData: any) => void;
}

const GraphEvents: React.FC<GraphSigmaProps> = ({ onNodeClick }) => {
  const sigma = useSigma();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    sigma.on('enterNode', (event) => setHoveredNode(event.node));
    sigma.on('leaveNode', () => setHoveredNode(null));
    sigma.on('clickNode', (event) => {
      const nodeData = sigma.getGraph().getNodeAttributes(event.node);
      if (onNodeClick) onNodeClick({ id: event.node, ...nodeData });
    });
  }, [sigma, onNodeClick]);

  // Set visual states for hover/dimming
  useEffect(() => {
    sigma.setSetting('nodeReducer', (node, data) => {
      const res = { ...data };
      if (hoveredNode && node !== hoveredNode && !sigma.getGraph().hasEdge(node, hoveredNode) && !sigma.getGraph().hasEdge(hoveredNode, node)) {
        res.label = '';
        res.color = '#1e293b';
        res.opacity = 0.2;
      }
      return res;
    });

    sigma.setSetting('edgeReducer', (edge, data) => {
      const res = { ...data };
      if (hoveredNode && !sigma.getGraph().hasExtremity(edge, hoveredNode)) {
        res.hidden = true;
      }
      return res;
    });
  }, [sigma, hoveredNode]);

  return null;
};

export const GraphSigma: React.FC<GraphSigmaProps> = ({ onNodeClick }) => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    api.getEnrichedGraph()
      .then(data => {
        if (data.error) {
          api.getGraphData().then(setGraphData);
        } else {
          setGraphData(data);
        }
      })
      .catch(() => api.getGraphData().then(setGraphData))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !graphData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-void/50 backdrop-blur-sm border border-border/40 rounded-3xl">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">Sincronizando Cognição NetworkX...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#050b14] rounded-3xl overflow-hidden border border-border/30 shadow-2xl shadow-void/50">
      <SigmaContainer
        style={{ height: '100%', width: '100%' }}
        settings={{
          labelFont: 'Outfit, sans-serif',
          labelColor: { color: '#cbd5e1' },
          labelSize: 11,
          labelWeight: '600',
          edgeLabelFont: 'JetBrains Mono, monospace',
          defaultEdgeType: 'arrow',
          renderEdgeLabels: true,
          hideEdgesOnMove: true,
          labelRenderedSizeThreshold: 6,
        }}
      >
        <GraphLoader data={graphData} />
        <GraphEvents onNodeClick={onNodeClick} />
        
        <ControlsContainer position="bottom-right">
          <ZoomControl />
          <FullScreenControl />
        </ControlsContainer>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
           <div className="bg-void/80 backdrop-blur-md border border-border/40 p-3 rounded-xl shadow-xl">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-2">Análise NetworkX</h4>
              <div className="flex flex-col gap-1.5">
                 <div className="flex items-center gap-2 text-[10px] text-text-primary">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Tamanho = Centralidade (PageRank)
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-text-primary">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Cores = Comunidades Detectadas
                 </div>
              </div>
           </div>
        </div>
      </SigmaContainer>
    </div>
  );
};

const GraphLoader: React.FC<{ data: any }> = ({ data }) => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();

  useEffect(() => {
    const graph = new Graph();

    // 1. Add Nodes
    data.nodes.forEach((node: any) => {
      const clusterColor = CLUSTER_COLORS[(node.cluster_id || 0) % CLUSTER_COLORS.length];
      const typeColor = NODE_COLORS[node.type as EntityType] || '#64748b';
      
      graph.addNode(node.id, {
        label: node.label,
        size: node.influence ? Math.max(5, Math.min(25, node.influence * 2)) : 5,
        color: node.cluster_id !== undefined ? clusterColor : typeColor,
        type: node.type,
        x: Math.random() * 100,
        y: Math.random() * 100,
        cluster: node.cluster_id,
        influence: node.influence,
        metadata: node.metadata || {}
      });
    });

    // 2. Add Edges
    data.edges.forEach((edge: any) => {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        graph.addEdge(edge.source, edge.target, {
          label: edge.label,
          size: 1,
          color: '#2dd4bf30',
        });
      }
    });

    // 3. Layout: ForceAtlas2 (Professional)
    const positions = forceAtlas2(graph, {
      iterations: 150,
      settings: forceAtlas2.inferSettings(graph),
    });

    // 4. No Overlap
    noverlap(graph, {
      maxIterations: 50,
    });

    loadGraph(graph);

    // Initial animation
    animateNodes(graph, positions, { duration: 1000, easing: 'quadraticInOut' });

  }, [data, loadGraph, sigma]);

  return null;
};
