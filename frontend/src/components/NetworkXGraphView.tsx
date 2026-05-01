import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Zap, Maximize2, Network } from 'lucide-react';
import * as api from '../lib/api';
import { NODE_COLORS, type EntityType } from '../types';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  label: string;
  type: string;
  cluster_id: number;
  cluster_theme: string;
  influence: number;
  connectivity: number;
  connections: { uid: string; label: string; type: string; edge_type: string }[];
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
}

interface Props {
  onNodeClick?: (node: GraphNode) => void;
  hiddenTypes?: Set<string>;
  showCoT?: boolean;       // Exibir halos de cluster
  activeCoT?: number | null; // null = todas; number = isola esse cluster
}

// ─── Cores dos CoT — paleta quente, distinta das cores de nó ──────────────────
// Cores de nó usam: teal, sky-blue, emerald, yellow, violet, indigo
// CoT usa: laranja, vermelho, rosa, terracota, magenta — paleta quente/diferente
export const COT_COLORS = [
  '#f77f00', // laranja
  '#e63946', // vermelho
  '#ff4d6d', // rosa-vermelho
  '#9d4edd', // violeta vibrante
  '#f4a261', // salmão
  '#c77dff', // lilás
  '#e07a5f', // terracota
  '#ffd166', // amarelo-âmbar
];

// ─── Tamanhos base por tipo ───────────────────────────────────────────────────
const NODE_BASE_SIZE: Record<string, number> = {
  area: 5,
  skill: 7,
  edital: 11,
  student: 13,
  researcher: 13,
  professor: 13,
};

const LINK_COLORS: Record<string, string> = {
  ELIGIBLE_FOR: '#2dd4bf',
  SIMILAR_TO: '#a855f7',
  HAS_SKILL: '#6366f1',
  REQUIRES_SKILL: '#38bdf8',
  RESEARCHES_AREA: '#34d399',
  TARGETS_AREA: '#818cf8',
  ADVISES: '#fbbf24',
  RELATED_TO: '#f472b6',
  OVERLAPS_WITH: '#fb923c',
};

const LINK_WIDTHS: Record<string, number> = {
  ELIGIBLE_FOR: 3,
  SIMILAR_TO: 2.5,
  ADVISES: 2.5,
  RELATED_TO: 2,
  HAS_SKILL: 1.5,
  REQUIRES_SKILL: 1.5,
};

const getNodeSize = (node: GraphNode): number => {
  const base = NODE_BASE_SIZE[node.type] ?? 10;
  const bonus = Math.min((node.influence / 300) * base * 0.4, base * 0.5);
  const max = node.type === 'area' ? 8 : 22;
  return Math.min(base + bonus, max);
};

// ─── Convex Hull (Gift Wrapping) ──────────────────────────────────────────────
function computeConvexHull(pts: { x: number; y: number }[]) {
  if (pts.length < 3) return pts;
  let l = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].x < pts[l].x) l = i;
  const hull: { x: number; y: number }[] = [];
  let p = l;
  do {
    hull.push(pts[p]);
    let q = (p + 1) % pts.length;
    for (let i = 0; i < pts.length; i++) {
      const cross =
        (pts[q].x - pts[p].x) * (pts[i].y - pts[p].y) -
        (pts[q].y - pts[p].y) * (pts[i].x - pts[p].x);
      if (cross < 0) q = i;
    }
    p = q;
  } while (p !== l && hull.length < pts.length);
  return hull;
}

// Expande cada ponto do hull para fora do centróide
function expandHull(hull: { x: number; y: number }[], margin: number) {
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + (dx / len) * margin, y: p.y + (dy / len) * margin };
  });
}

// Desenha curva suave (bezier quadrático) por pontos do hull
function drawSmoothPath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  const mids = pts.map((p, i) => {
    const nx = pts[(i + 1) % pts.length];
    return { x: (p.x + nx.x) / 2, y: (p.y + nx.y) / 2 };
  });
  ctx.beginPath();
  ctx.moveTo(mids[0].x, mids[0].y);
  for (let i = 0; i < pts.length; i++) {
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mids[(i + 1) % pts.length].x, mids[(i + 1) % pts.length].y);
  }
  ctx.closePath();
}

// Desenha texto com quebra de linha, centrado em (x, y)
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const totalH = lines.length * lineHeight;
  lines.forEach((l, i) => {
    ctx.fillText(l, x, y - totalH / 2 + i * lineHeight + lineHeight / 2);
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────
export const NetworkXGraphView: React.FC<Props> = ({
  onNodeClick,
  hiddenTypes,
  showCoT = true,
  activeCoT = null,
}) => {
  const [rawData, setRawData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [clusters, setClusters] = useState<{ id: number; theme: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);
  const dataRef = useRef<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.getEnrichedGraph()
      .then(res => {
        if (res.error) { console.error('Grafo:', res.error); return; }
        setClusters(res.summary?.clusters || []);
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

  // ─── Filtragem por tipo (hiddenTypes) ─────────────────────────────────────
  const graphData = useMemo(() => {
    if (!rawData) return null;
    const hidden = hiddenTypes && hiddenTypes.size > 0;
    const filtered = activeCoT !== null;
    if (!hidden && !filtered) return rawData;

    const visibleIds = new Set(
      rawData.nodes
        .filter(n => {
          if (hidden && hiddenTypes!.has(n.type)) return false;
          if (filtered && n.cluster_id !== activeCoT) return false;
          return true;
        })
        .map(n => n.id)
    );
    return {
      nodes: rawData.nodes.filter(n => visibleIds.has(n.id)),
      links: rawData.links.filter(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return visibleIds.has(s) && visibleIds.has(t);
      }),
    };
  }, [rawData, hiddenTypes, activeCoT]);

  // Atualiza dataRef quando graphData muda
  useEffect(() => {
    if (graphData) dataRef.current = graphData;
  }, [graphData]);

  const freezeAllNodes = () => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => { if (n.x !== undefined) { n.fx = n.x; n.fy = n.y; } });
  };

  // ─── Halos de Cluster (Convex Hull orgânico) ──────────────────────────────
  const onRenderFramePre = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!showCoT || !dataRef.current) return; // Ocultar todos os halos
    const nodes = dataRef.current.nodes;
    const groups: Record<number, GraphNode[]> = {};
    nodes.forEach(n => {
      if (n.x === undefined) return;
      const cid = n.cluster_id ?? 0;
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(n);
    });

    Object.entries(groups).forEach(([cidStr, members]) => {
      const cid = parseInt(cidStr);
      const color = COT_COLORS[cid % COT_COLORS.length];
      const MARGIN = getNodeSize(members[0]) + 12; // margem ~8-12px + raio do nó

      if (members.length === 1) {
        const n = members[0];
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, MARGIN + 4, 0, Math.PI * 2);
      } else if (members.length === 2) {
        // Cápsula entre dois nós
        const pts = expandHull(members.map(n => ({ x: n.x!, y: n.y! })), MARGIN);
        drawSmoothPath(ctx, pts);
      } else {
        // Hull convexo orgânico
        const pts = computeConvexHull(members.map(n => ({ x: n.x!, y: n.y! })));
        const expanded = expandHull(pts, MARGIN);
        drawSmoothPath(ctx, expanded);
      }

      // Preenchimento suave
      ctx.fillStyle = `${color}0e`;
      ctx.fill();

      // Borda tracejada
      ctx.strokeStyle = `${color}45`;
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([7 / globalScale, 4 / globalScale]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tema do cluster — acima do hull
      const theme = members[0]?.cluster_theme || `CoT ${cid}`;
      const fontSize = Math.max(8, 11 / globalScale);
      ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const topY = Math.min(...members.map(n => (n.y ?? 0)));
      const cx = members.reduce((s, n) => s + (n.x ?? 0), 0) / members.length;
      const textW = ctx.measureText(theme).width;
      ctx.fillStyle = 'rgba(2,8,16,0.6)';
      ctx.fillRect(cx - textW / 2 - 3, topY - MARGIN - fontSize - 2, textW + 6, fontSize + 3);
      ctx.fillStyle = `${color}cc`;
      ctx.fillText(theme, cx, topY - MARGIN + 2);
    });
  }, []);

  // ─── Desenho de Nó ────────────────────────────────────────────────────────
  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x === undefined || node.y === undefined) return;
    const size = getNodeSize(node);
    const cotColor = COT_COLORS[(node.cluster_id ?? 0) % COT_COLORS.length];
    const nodeColor = NODE_COLORS[node.type as EntityType] || '#888';
    const label = node.label || node.id;

    // Aura do CoT (cor do cluster, anel externo)
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 4 / globalScale, 0, Math.PI * 2);
    ctx.fillStyle = `${cotColor}18`;
    ctx.fill();

    // Glow (cor do tipo de nó)
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 20 / globalScale;

    // Círculo principal
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    // Highlight interno
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(node.x, node.y - size * 0.22, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();

    // Borda do CoT (anel fino com cor do cluster)
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.strokeStyle = `${cotColor}80`;
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // ─── Label ───────────────────────────────────────────────────────────
    if (size >= 9) {
      // Tamanho de fonte menor — ~65% do raio, não mais que 10px real
      const rawPx = (size * 0.65) / globalScale;
      const fontSize = Math.max(5.5, Math.min(rawPx, 11 / globalScale));
      ctx.font = `bold ${fontSize}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Contorno para legibilidade
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 3 / globalScale;

      if (globalScale >= 1.8) {
        // Modo zoom-in: com quebra de linha
        const lineHeight = fontSize * 1.3;
        const maxW = size * 1.6;
        ctx.strokeText('', node.x, node.y); // reset stroke
        // Stroke
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = 3 / globalScale;
        drawWrappedText(ctx, label, node.x, node.y, maxW, lineHeight);
        ctx.fillStyle = '#ffffff';
        drawWrappedText(ctx, label, node.x, node.y, maxW, lineHeight);
      } else {
        // Modo normal: trunca em 1 linha
        let display = label;
        const maxW = size * 1.5;
        while (ctx.measureText(display).width > maxW && display.length > 2) {
          display = display.slice(0, -2) + '…';
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = 3 / globalScale;
        ctx.strokeText(display, node.x, node.y);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(display, node.x, node.y);
      }
    } else {
      // Nós pequenos: label abaixo
      const fontSize = Math.max(5, 7.5 / globalScale);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(node.x - tw / 2 - 1, node.y + size + 1, tw + 2, fontSize + 2);
      ctx.fillStyle = `${nodeColor}dd`;
      ctx.fillText(label, node.x, node.y + size + 2);
    }
  }, []);

  // ─── Arrastar individual ──────────────────────────────────────────────────
  const handleNodeDrag = useCallback((node: GraphNode) => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => {
      if (n.id !== node.id && n.x !== undefined) { n.fx = n.x; n.fy = n.y; }
    });
  }, []);

  const handleNodeDragEnd = useCallback((node: GraphNode) => {
    if (!dataRef.current) return;
    dataRef.current.nodes.forEach(n => { if (n.id !== node.id) { delete n.fx; delete n.fy; } });
    node.fx = node.x;
    node.fy = node.y;
    setTimeout(() => freezeAllNodes(), 1500);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-3xl border border-border/40" style={{ background: 'rgba(2,8,16,0.82)' }}>
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
        <p className="text-white font-bold text-lg">Contextualizando CoTs...</p>
        <p className="text-gray-500 text-xs mt-1">NetworkX detectando comunidades de pensamento</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ background: 'rgba(2,8,16,0.78)', backdropFilter: 'blur(3px)' }}
    >
      {graphData && graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode as any}
          nodeCanvasObjectMode={() => 'replace'}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            const size = getNodeSize(node as GraphNode) + 6;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fill();
          }}
          linkColor={(link: any) => LINK_COLORS[link.label] || 'rgba(255,255,255,0.18)'}
          linkWidth={(link: any) => LINK_WIDTHS[link.label] || 1.5}
          linkDirectionalParticles={(link: any) =>
            (link.label === 'ELIGIBLE_FOR' || link.label === 'SIMILAR_TO') ? 3 : 0
          }
          linkDirectionalParticleWidth={2.5}
          linkDirectionalParticleColor={(link: any) => LINK_COLORS[link.label] || '#fff'}
          linkDirectionalParticleSpeed={0.004}
          onRenderFramePre={onRenderFramePre as any}
          onNodeClick={(node) => { if (onNodeClick) onNodeClick(node as GraphNode); }}
          onNodeDrag={handleNodeDrag as any}
          onNodeDragEnd={handleNodeDragEnd as any}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.35}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Network className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ecossistema em Silêncio</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Nenhum dado de rede localizado. Certifique-se de que existem acadêmicos e editais cadastrados.
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Legenda CoT — usa COT_COLORS */}
      <div className="absolute top-4 left-4 pointer-events-none max-w-[230px]">
        <div className="bg-black/65 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[9px] uppercase tracking-[0.2em] text-orange-400 font-black mb-3 flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5 animate-pulse" />
            Comunidades de Pensamento
          </h4>
          <div className="space-y-2">
            {clusters.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: COT_COLORS[c.id % COT_COLORS.length],
                    boxShadow: `0 0 8px ${COT_COLORS[c.id % COT_COLORS.length]}`,
                  }}
                />
                <div>
                  <span className="text-[9px] text-white font-bold truncate block leading-tight">{c.theme}</span>
                  <span className="text-[7px] text-gray-600 font-mono uppercase">CoT #{c.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => fgRef.current?.zoomToFit(400)}
          className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-orange-500/20 hover:border-orange-500/40 transition-all"
          title="Ajustar ao ecrã"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
