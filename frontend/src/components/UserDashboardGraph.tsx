import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS } from '../types';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  nodeType: string;
  color: string;
}

interface D3Edge extends d3.SimulationLinkDatum<D3Node> {
  color: string;
}

export const UserDashboardGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let simulation: d3.Simulation<D3Node, D3Edge>;

    api.getGraphData().then(data => {
      if (!svgRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const svg = d3.select(svgRef.current)
        .attr('viewBox', [0, 0, width, height]);
      
      svg.selectAll('*').remove();
      const g = svg.append('g');

      // Nodes & Edges
      const nodes: D3Node[] = data.nodes.map(n => ({
        id: n.id,
        label: n.label,
        nodeType: n.type,
        color: n.color
      }));

      const edges: D3Edge[] = data.edges
        .filter(e => nodes.find(n => n.id === e.source) && nodes.find(n => n.id === e.target))
        .map(e => ({
          source: e.source as any,
          target: e.target as any,
          color: e.color
        }));

      simulation = d3.forceSimulation<D3Node>(nodes)
        .force('link', d3.forceLink<D3Node, D3Edge>(edges).id(d => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(20));

      const link = g.append('g')
        .attr('stroke-opacity', 0.2)
        .selectAll('line')
        .data(edges)
        .join('line')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 1);

      const node = g.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g');

      node.append('circle')
        .attr('r', 5)
        .attr('fill', d => d.color)
        .attr('filter', 'drop-shadow(0 0 5px rgba(45,212,191,0.3))');

      simulation.on('tick', () => {
        link
          .attr('x1', d => (d.source as any).x)
          .attr('y1', d => (d.source as any).y)
          .attr('x2', d => (d.target as any).x)
          .attr('y2', d => (d.target as any).y);

        node
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });

      setLoading(false);
    }).catch(err => {
      console.error('Erro no grafo dashboard:', err);
      setLoading(false);
    });

    return () => {
      if (simulation) simulation.stop();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
