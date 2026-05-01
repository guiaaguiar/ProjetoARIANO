import React, { useState, useEffect, useRef, useCallback, useMemo, MutableRefObject } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Zap, Maximize2, Network } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, type EntityType } from '../types';

interface GraphNode {
  id: string; label: string; type: string;
  cluster_id: number; cluster_theme: string;
  influence: number; connectivity: number;
  connections: { uid: string; label: string; type: string; edge_type: string }[];
  metadata: Record<string, unknown>;
  x?: number; y?: number; fx?: number; fy?: number;
}
interface GraphLink { source: string | GraphNode; target: string | GraphNode; label: string; }
interface Props {
  onNodeClick?: (node: GraphNode) => void;
  hiddenTypes?: Set<string>;
  showCoT?: boolean;
  activeCoT?: number | null;
  selectedNodeId?: string | null;
  onNavigateToNode?: MutableRefObject<((uid: string) => void) | null>;
  filterPanelOpen?: boolean;
  detailPanelOpen?: boolean;
  onBackgroundClick?: () => void;
  onClustersLoaded?: (clusters: {id: number; theme: string}[]) => void;
}

export const COT_COLORS = [
  '#f77f00','#e63946','#ff4d6d','#9d4edd',
  '#f4a261','#c77dff','#e07a5f','#ffd166',
];

const NODE_BASE_SIZE: Record<string, number> = {
  area: 5, skill: 7, edital: 11, student: 13, researcher: 13, professor: 13,
};
const LINK_COLORS: Record<string, string> = {
  ELIGIBLE_FOR:'#2dd4bf', SIMILAR_TO:'#a855f7', HAS_SKILL:'#6366f1',
  REQUIRES_SKILL:'#38bdf8', RESEARCHES_AREA:'#34d399', TARGETS_AREA:'#818cf8',
  ADVISES:'#fbbf24', RELATED_TO:'#f472b6', OVERLAPS_WITH:'#fb923c',
};
const LINK_WIDTHS: Record<string, number> = {
  ELIGIBLE_FOR:3, SIMILAR_TO:2.5, ADVISES:2.5, RELATED_TO:2, HAS_SKILL:1.5, REQUIRES_SKILL:1.5,
};

const getNodeSize = (node: GraphNode): number => {
  const base = NODE_BASE_SIZE[node.type] ?? 10;
  const bonus = Math.min((node.influence / 300) * base * 0.4, base * 0.5);
  return Math.min(base + bonus, node.type === 'area' ? 8 : 22);
};

// ─── Convex Hull (CCW in canvas) ──────────────────────────────────────────────
function convexHull(pts: {x:number,y:number}[]) {
  if (pts.length < 3) return pts.slice();
  let l = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].x < pts[l].x) l = i;
  const hull: {x:number,y:number}[] = [];
  let p = l;
  do {
    hull.push(pts[p]);
    let q = (p + 1) % pts.length;
    for (let i = 0; i < pts.length; i++) {
      const cross = (pts[q].x-pts[p].x)*(pts[i].y-pts[p].y) - (pts[q].y-pts[p].y)*(pts[i].x-pts[p].x);
      if (cross < 0) q = i;
    }
    p = q;
  } while (p !== l && hull.length < pts.length);
  return hull;
}

// ─── Organic blob (Minkowski sum = hull + circle of radius) ──────────────────
// For CCW hull in canvas: outward normal = (dy/len, -dx/len)
function drawBlob(ctx: CanvasRenderingContext2D, members: GraphNode[], margin: number) {
  if (members.length === 0) return;
  const pts = members.map(n => ({ x: n.x!, y: n.y! }));

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, margin, 0, Math.PI * 2);
    return;
  }

  if (pts.length === 2) {
    const [a, b] = pts;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.beginPath();
    ctx.arc(b.x, b.y, margin, ang - Math.PI / 2, ang + Math.PI / 2, false);
    ctx.arc(a.x, a.y, margin, ang + Math.PI / 2, ang - Math.PI / 2 + Math.PI * 2, false);
    ctx.closePath();
    return;
  }

  const hull = convexHull(pts);
  const n = hull.length;

  // Edge outward normals for CCW canvas hull: (dy, -dx) normalized
  const normals = hull.map((p, i) => {
    const q = hull[(i + 1) % n];
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dy / len, y: -dx / len };
  });

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = hull[i];
    const inN = normals[(i - 1 + n) % n];
    const outN = normals[i];
    const startA = Math.atan2(inN.y, inN.x);
    const endA = Math.atan2(outN.y, outN.x);
    // false = clockwise on screen, sweeps exterior corner correctly for CCW hull
    ctx.arc(p.x, p.y, margin, startA, endA, false);
  }
  ctx.closePath();
}

// ─── Componente ───────────────────────────────────────────────────────────────
export const NetworkXGraphView: React.FC<Props> = ({
  onNodeClick, hiddenTypes, showCoT = true, activeCoT = null,
  selectedNodeId, onNavigateToNode,
  filterPanelOpen = false, detailPanelOpen = false,
  onBackgroundClick, onClustersLoaded,
}) => {
  const [rawData, setRawData] = useState<{nodes:GraphNode[],links:GraphLink[]}|null>(null);
  const [clusters, setClusters] = useState<{id:number,theme:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);
  const dataRef = useRef<{nodes:GraphNode[],links:GraphLink[]}|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) { console.error('Grafo:', res.error); return; }
        const loadedClusters = res.summary?.clusters || [];
        setClusters(loadedClusters);
        if (onClustersLoaded) onClustersLoaded(loadedClusters);
        const data = {
          nodes: res.nodes as GraphNode[],
          links: (res.edges as any[]).map(e => ({ source: e.source, target: e.target, label: e.label })),
        };
        setRawData(data);
        dataRef.current = data;
        setTimeout(() => {
          if (fgRef.current) fgRef.current.zoomToFit(600, 80);
          setTimeout(() => freezeAllNodes(), 4000);
        }, 500);
      })
      .catch(err => console.error('Erro ao buscar grafo:', err))
      .finally(() => setLoading(false));
  }, []);

  const graphData = useMemo(() => {
    if (!rawData) return null;
    const hidden = hiddenTypes && hiddenTypes.size > 0;
    const filtered = activeCoT !== null;
    if (!hidden && !filtered) return rawData;
    const visibleIds = new Set(rawData.nodes.filter(n => {
      if (hidden && hiddenTypes!.has(n.type)) return false;
      if (filtered && n.cluster_id !== activeCoT) return false;
      return true;
    }).map(n => n.id));
    return {
      nodes: rawData.nodes.filter(n => visibleIds.has(n.id)),
      links: rawData.links.filter(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return visibleIds.has(s) && visibleIds.has(t);
      }),
    };
  }, [rawData, hiddenTypes, activeCoT]);

  useEffect(() => { if (graphData) dataRef.current = graphData; }, [graphData]);

  // Centraliza o nó no CENTRO VISUAL da área entre os painéis
  const centerOnNode = useCallback((node: GraphNode) => {
    if (!fgRef.current || node.x === undefined || node.y === undefined) return;
    const TARGET_ZOOM = 2.5;
    const el = containerRef.current;
    const W = el?.clientWidth || 800;
    const H = el?.clientHeight || 600;

    // Largura dos painéis em % real do container
    const leftW = filterPanelOpen ? 256 : 0;
    const rightW = detailPanelOpen ? 320 : 0;

    // Centro visual em px (fração da área visível)
    const visibleCenterX = leftW + (W - leftW - rightW) / 2;
    const visibleCenterY = H / 2;

    // O ForceGraph2D centra em W/2, H/2. Calculamos o delta para corrigir.
    const deltaX = (visibleCenterX - W / 2) / TARGET_ZOOM; // converter px → graph units
    const deltaY = (visibleCenterY - H / 2) / TARGET_ZOOM;

    fgRef.current.centerAt(node.x - deltaX, node.y - deltaY, 600);
    fgRef.current.zoom(TARGET_ZOOM, 600);
  }, [filterPanelOpen, detailPanelOpen]);

  // Ao mudar selectedNodeId, centraliza
  useEffect(() => {
    if (!selectedNodeId || !dataRef.current) return;
    const node = dataRef.current.nodes.find(n => n.id === selectedNodeId);
    if (node) setTimeout(() => centerOnNode(node), 50); // pequeno delay para painel renderizar
  }, [selectedNodeId, centerOnNode]);

  const navigateToNode = useCallback((uid: string) => {
    if (!dataRef.current || !fgRef.current) return;
    const node = dataRef.current.nodes.find(n => n.id === uid);
    if (!node) return;
    centerOnNode(node);
    if (onNodeClick) onNodeClick(node);
  }, [onNodeClick, centerOnNode]);

  // Expõe navigateToNode via ref para o pai
  useEffect(() => {
    if (onNavigateToNode) onNavigateToNode.current = navigateToNode;
  }, [navigateToNode, onNavigateToNode]);

  const freezeAllNodes = () => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => { if (n.x !== undefined) { n.fx = n.x; n.fy = n.y; } });
  };

  // ─── Halos de Cluster ─────────────────────────────────────────────────────
  const onRenderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!showCoT || !dataRef.current) return;
    const groups: Record<number, GraphNode[]> = {};
    dataRef.current.nodes.forEach(n => {
      if (n.x === undefined) return;
      const cid = n.cluster_id ?? 0;
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(n);
    });

    Object.entries(groups).forEach(([cidStr, members]) => {
      const cid = parseInt(cidStr);
      const color = COT_COLORS[cid % COT_COLORS.length];
      // margin = largest node radius in cluster + 8px
      const margin = Math.max(...members.map(n => getNodeSize(n))) + 8;

      ctx.save();
      drawBlob(ctx, members, margin);

      // Soft fill
      ctx.fillStyle = `${color}10`;
      ctx.fill();

      // Dashed glow border
      ctx.strokeStyle = `${color}55`;
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([7 / globalScale, 4 / globalScale]);
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 / globalScale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Theme label above blob
      const topY = Math.min(...members.map(n => (n.y ?? 0))) - margin;
      const cx = members.reduce((s, n) => s + (n.x ?? 0), 0) / members.length;
      const fontSize = Math.max(9, 12 / globalScale);
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const tw = ctx.measureText(members[0]?.cluster_theme || '').width;
      ctx.fillStyle = 'rgba(2,8,16,0.65)';
      ctx.fillRect(cx - tw / 2 - 4, topY - fontSize - 2, tw + 8, fontSize + 4);
      ctx.fillStyle = `${color}ee`;
      ctx.fillText(members[0]?.cluster_theme || `CoT ${cid}`, cx, topY);
      ctx.restore();
    });
  }, [showCoT]);

  // ─── Desenho dos Nós ──────────────────────────────────────────────────────
  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x === undefined || node.y === undefined) return;
    const size = getNodeSize(node);
    const cotColor = COT_COLORS[(node.cluster_id ?? 0) % COT_COLORS.length];
    const nodeColor = NODE_COLORS[node.type as EntityType] || '#888';
    const isSelected = node.id === selectedNodeId;

    // CoT aura ring — maior e sempre visível
    const auraSize = isSelected ? size + 14 : size + 5;
    ctx.beginPath();
    ctx.arc(node.x, node.y, auraSize, 0, Math.PI * 2);
    ctx.fillStyle = `${cotColor}${isSelected ? '35' : '18'}`;
    ctx.fill();

    // Segundo anel externo se selecionado (pulsa)
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 22, 0, Math.PI * 2);
      ctx.fillStyle = `${cotColor}12`;
      ctx.fill();
    }

    // Glow (muito mais forte quando selecionado)
    ctx.shadowColor = isSelected ? cotColor : nodeColor;
    ctx.shadowBlur = isSelected ? 70 : 20;

    // Main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y - size * 0.22, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();

    // CoT border ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? `${cotColor}ff` : `${cotColor}80`;
    ctx.lineWidth = (isSelected ? 2.5 : 1.5) / globalScale;
    ctx.stroke();

    // ─── Label (always clipped inside circle, always outlined, max 2px) ───
    if (size >= 7) {
      ctx.save();
      // Clip to node circle — text NEVER escapes
      ctx.beginPath();
      ctx.arc(node.x, node.y, size - 1 / globalScale, 0, Math.PI * 2);
      ctx.clip();

      const label = node.label || node.id;
      const fontPx = Math.max(4.5, (size * 0.6) / globalScale);
      ctx.font = `bold ${fontPx}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline: always present, max 2px screen
      const strokeW = Math.min(2, 2.5 / globalScale);
      ctx.strokeStyle = 'rgba(0,0,0,0.92)';
      ctx.lineWidth = strokeW;
      ctx.lineJoin = 'round';

      if (globalScale >= 1.8) {
        // Zoom-in: wrap text in multiple lines
        const maxW = (size * 1.7);
        const words = label.split(' ');
        const lines: string[] = [];
        let cur = '';
        for (const w of words) {
          const test = cur ? `${cur} ${w}` : w;
          if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
          else cur = test;
        }
        if (cur) lines.push(cur);
        const lh = fontPx * 1.25;
        const startY = node.y - ((lines.length - 1) * lh) / 2;
        lines.forEach((l, i) => {
          ctx.strokeText(l, node.x!, startY + i * lh);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(l, node.x!, startY + i * lh);
        });
      } else {
        // Normal: single line, truncate to fit
        let display = label;
        const maxW = size * 1.5;
        while (ctx.measureText(display).width > maxW && display.length > 2) {
          display = display.slice(0, -2) + '…';
        }
        ctx.strokeText(display, node.x, node.y);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(display, node.x, node.y);
      }
      ctx.restore();
    }
  }, [selectedNodeId]);

  // ─── Drag individual ─────────────────────────────────────────────────────
  const handleNodeDrag = useCallback((node: GraphNode) => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => {
      if (n.id !== node.id && n.x !== undefined) { n.fx = n.x; n.fy = n.y; }
    });
  }, []);
  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => { if (n.id !== node.id) { delete n.fx; delete n.fy; } });
    node.fx = node.x; node.fy = node.y;
    setTimeout(() => freezeAllNodes(), 1500);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-3xl border border-border/40" style={{ background: 'rgba(2,8,16,0.82)' }}>
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
        <p className="text-white font-bold text-lg">Contextualizando CoTs...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(2,8,16,0.78)', backdropFilter: 'blur(3px)' }}>
      {graphData && graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode as any}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            const s = getNodeSize(node as GraphNode) + 6;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, s, 0, Math.PI * 2);
            ctx.fill();
          }}
          linkColor={(link: any) => LINK_COLORS[link.label] || 'rgba(255,255,255,0.18)'}
          linkWidth={(link: any) => LINK_WIDTHS[link.label] || 1.5}
          linkDirectionalParticles={(link: any) => (link.label === 'ELIGIBLE_FOR' || link.label === 'SIMILAR_TO') ? 3 : 0}
          linkDirectionalParticleWidth={2.5}
          linkDirectionalParticleColor={(link: any) => LINK_COLORS[link.label] || '#fff'}
          linkDirectionalParticleSpeed={0.004}
          onRenderFramePre={onRenderFramePre as any}
          onNodeClick={(node) => { if (onNodeClick) onNodeClick(node as GraphNode); }}
          onBackgroundClick={() => { if (onBackgroundClick) onBackgroundClick(); }}
          onNodeDrag={handleNodeDrag as any}
          onNodeDragEnd={handleNodeDragEnd as any}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.35}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Network className="w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ecossistema em Silêncio</h3>
          <p className="text-gray-500 max-w-md mb-6">Nenhum dado de rede localizado.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Tentar Novamente</button>
        </div>
      )}

      {/* CoT Legend */}
      <div className="absolute top-4 left-4 pointer-events-none max-w-[220px]">
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[9px] uppercase tracking-[0.2em] text-orange-400 font-black mb-3 flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5 animate-pulse" /> Comunidades de Pensamento
          </h4>
          <div className="space-y-2">
            {clusters.slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COT_COLORS[c.id % COT_COLORS.length], boxShadow: `0 0 8px ${COT_COLORS[c.id % COT_COLORS.length]}` }} />
                <div>
                  <span className="text-[9px] text-white font-bold truncate block leading-tight">{c.theme}</span>
                  <span className="text-[7px] text-gray-600 font-mono uppercase">CoT #{c.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4">
        <button onClick={() => fgRef.current?.zoomToFit(400)} className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all" title="Ajustar">
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
