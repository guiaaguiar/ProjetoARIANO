import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, RefreshCw, Zap, RotateCcw,
  Terminal, Cpu, Database, Network,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface CognitionExperienceProps {
  userName: string;
  userId: string | null;
  formData: any;
  onComplete: () => void;
}

// ─── Graph phase: which node types are visible ───
type GraphPhase = 0 | 1 | 2 | 3 | 4; // 0=user 1=skills 2=editais 3=docentes 4=done
type ScreenPhase = 'cognition' | 'matches';

interface Match {
  edital_name: string;
  edital_uid: string;
  institution: string;
  justification: string;
  score: number;
}

// ─── AI console log messages ───
const LOG_SCRIPTS: Record<GraphPhase, string[]> = {
  0: [
    '> [ARIANO] Boot sequence iniciado...',
    '> [Neo4j] Conectado ao AuraDB ✓',
    '> [Agent:Analyzer] Perfil carregado',
    '> [Agent:Analyzer] Construindo vetor cognitivo...',
  ],
  1: [
    '> [Agent:Analyzer] Extraindo competências do currículo...',
    '> [Neo4j] MERGE (u)-[:HAS_SKILL]->(s:Skill) ✓',
    '> [Agent:Analyzer] Skills mapeadas no grafo',
    '> [Graph-CoT] Step 1 / Competências → Nós Skill criados',
  ],
  2: [
    '> [Agent:Calculator] Varredura de editais iniciada...',
    '> [Neo4j] MATCH (e:Edital) WHERE e.status = "aberto"',
    '> [Agent:Calculator] Calculando ELIGIBLE_FOR scores...',
    '> [Graph-CoT] Step 2 / Matches de Editais computados',
  ],
  3: [
    '> [Agent:Network] Mapeando Docentes relacionados...',
    '> [Neo4j] MATCH (d:Docente)-[:RESEARCHES_AREA]->(:Area)',
    '> [Agent:Network] Rede de colaboração identificada',
    '> [Graph-CoT] Step 3 / Ecossistema completamente mapeado ✓',
  ],
  4: [
    '> [ARIANO] Pipeline cognitivo concluído.',
    '> [ARIANO] Persistência no AuraDB confirmada.',
    '> [ARIANO] Bem-vindo ao ecossistema CORETO! 🚀',
  ],
};

// ─── Node color palette ───
const COLORS = {
  user:    { bg: '#14b8a6', border: '#0d9488', shadow: 'rgba(20,184,166,0.8)', text: '#fff' },
  skill:   { bg: '#8b5cf6', border: '#7c3aed', shadow: 'rgba(139,92,246,0.6)', text: '#fff' },
  edital:  { bg: '#f59e0b', border: '#d97706', shadow: 'rgba(245,158,11,0.6)', text: '#fff' },
  docente: { bg: '#6366f1', border: '#4f46e5', shadow: 'rgba(99,102,241,0.6)', text: '#fff' },
};

// ─── Phase delays ───
const PHASE_DELAYS: Record<GraphPhase, number> = {
  0: 0,
  1: 5000,
  2: 10000,
  3: 15000,
  4: 19000,
};

// ─── Node types per phase ───
interface GNode {
  id: string;
  label: string;
  type: 'user' | 'skill' | 'edital' | 'docente';
  angle: number;
  ring: number; // 1 = inner, 2 = outer
}

function buildNodes(userName: string, editalNodes: { name: string; uid: string }[], networkNodes: { name: string; type: string }[], skills: string[]): GNode[] {
  const nodes: GNode[] = [
    { id: 'user', label: userName.split(' ')[0], type: 'user', angle: 0, ring: 0 },
  ];

  const skillList = skills.slice(0, 5);
  skillList.forEach((s, i) => {
    nodes.push({ id: `skill-${i}`, label: s, type: 'skill', angle: (i / skillList.length) * 360, ring: 1 });
  });

  const editalList = editalNodes.slice(0, 3);
  editalList.forEach((e, i) => {
    const angleOffset = 30;
    nodes.push({ id: e.uid || `edital-${i}`, label: e.name, type: 'edital', angle: angleOffset + (i / editalList.length) * 360, ring: 2 });
  });

  const docenteList = networkNodes.slice(0, 3);
  docenteList.forEach((d, i) => {
    const angleOffset = 60;
    nodes.push({ id: `docente-${i}`, label: d.name, type: 'docente', angle: angleOffset + (i / docenteList.length) * 360, ring: 2 });
  });

  return nodes;
}

// ─── SVG graph component ───
const CinematicGraph: React.FC<{
  graphPhase: GraphPhase;
  userName: string;
  editalNodes: { name: string; uid: string }[];
  networkNodes: { name: string; type: string }[];
  skills: string[];
}> = ({ graphPhase, userName, editalNodes, networkNodes, skills }) => {
  const SIZE = 420;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RING1 = 120; // skills ring
  const RING2 = 195; // editais/docentes ring

  const allNodes = buildNodes(userName, editalNodes, networkNodes, skills);

  const getPos = (node: GNode) => {
    if (node.type === 'user') return { x: CX, y: CY };
    const r = node.ring === 1 ? RING1 : RING2;
    const rad = (node.angle * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  const isVisible = (node: GNode): boolean => {
    if (node.type === 'user') return graphPhase >= 0;
    if (node.type === 'skill') return graphPhase >= 1;
    if (node.type === 'edital') return graphPhase >= 2;
    if (node.type === 'docente') return graphPhase >= 3;
    return false;
  };

  const getNodeSize = (node: GNode): number => {
    if (node.type === 'user') return 30;
    if (node.type === 'skill') return 14; // visibly smaller per DoD
    if (node.type === 'edital') return 20;
    if (node.type === 'docente') return 18;
    return 16;
  };

  const visibleNodes = allNodes.filter(isVisible);
  const centerNode = allNodes.find(n => n.type === 'user')!;

  return (
    <div className="relative w-full" style={{ maxWidth: SIZE, margin: '0 auto', aspectRatio: '1' }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Concentric guide rings */}
        {graphPhase >= 1 && (
          <motion.circle cx={CX} cy={CY} r={RING1} fill="none"
            stroke="rgba(139,92,246,0.08)" strokeWidth="1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          />
        )}
        {graphPhase >= 2 && (
          <motion.circle cx={CX} cy={CY} r={RING2} fill="none"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          />
        )}

        {/* Edges */}
        {visibleNodes.filter(n => n.type !== 'user').map((node, i) => {
          const from = getPos(centerNode);
          const to = getPos(node);
          const col = COLORS[node.type];
          return (
            <motion.line
              key={`edge-${node.id}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={col.border}
              strokeWidth={node.type === 'skill' ? 0.8 : 1.2}
              strokeOpacity={0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            />
          );
        })}

        {/* Nodes (SVG circles for crisper rendering) */}
        <AnimatePresence>
          {visibleNodes.map((node, i) => {
            const pos = getPos(node);
            const r = getNodeSize(node);
            const col = COLORS[node.type];
            const isUser = node.type === 'user';
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22, delay: isUser ? 0 : i * 0.08 }}
                style={{ originX: `${pos.x}px`, originY: `${pos.y}px` }}
              >
                {/* Glow */}
                <circle cx={pos.x} cy={pos.y} r={r + 6} fill={col.bg} opacity={0.15} />
                {/* Main circle */}
                <circle
                  cx={pos.x} cy={pos.y} r={r}
                  fill={col.bg}
                  stroke={col.border}
                  strokeWidth={1.5}
                  filter={isUser ? 'url(#userGlow)' : undefined}
                />
                {/* Label */}
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={node.type === 'skill' ? 7 : node.type === 'user' ? 11 : 8}
                  fontWeight="700"
                  fill="#fff"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.label.split(' ')[0].slice(0, 10)}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        <defs>
          <filter id="userGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// ─── AI Console ───
const AIConsole: React.FC<{ logs: string[] }> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      className="h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(20,184,166,0.15)',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: 'rgba(20,184,166,0.15)', background: 'rgba(20,184,166,0.05)' }}
      >
        <Terminal className="w-3.5 h-3.5" style={{ color: '#14b8a6' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#14b8a6' }}>
          ARIANO Agent Console
        </span>
        <div className="ml-auto flex gap-1.5">
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Log stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={`log-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] leading-relaxed"
              style={{
                color: log.includes('✓') || log.includes('🚀')
                  ? '#34d399'
                  : log.includes('[Neo4j]')
                  ? '#60a5fa'
                  : log.includes('[Graph-CoT]')
                  ? '#a78bfa'
                  : 'rgba(255,255,255,0.5)',
              }}
            >
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Blinking cursor */}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-3.5 ml-0.5"
          style={{ background: '#14b8a6', verticalAlign: 'text-bottom' }}
        />
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

// ─── Phase indicator ───
const PhaseIndicator: React.FC<{ graphPhase: GraphPhase }> = ({ graphPhase }) => {
  const phases = [
    { icon: Cpu,      label: 'Perfil',    phase: 0 },
    { icon: Zap,      label: 'Skills',    phase: 1 },
    { icon: Database, label: 'Editais',   phase: 2 },
    { icon: Network,  label: 'Docentes',  phase: 3 },
  ];
  return (
    <div className="flex items-center gap-3">
      {phases.map(({ icon: Icon, label, phase }, i) => {
        const active = graphPhase === phase;
        const done = graphPhase > phase;
        return (
          <React.Fragment key={phase}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: done ? '#14b8a6' : active ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done || active ? '#14b8a6' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: active ? '0 0 12px rgba(20,184,166,0.5)' : 'none',
                }}
              >
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  : <Icon className="w-3 h-3" style={{ color: active ? '#14b8a6' : 'rgba(255,255,255,0.25)' }} />
                }
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-300"
                style={{ color: active ? '#14b8a6' : done ? 'rgba(20,184,166,0.6)' : 'rgba(255,255,255,0.2)' }}
              >
                {label}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div
                className="h-px flex-1 transition-all duration-1000"
                style={{ background: done ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.06)' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Match Card ───
const MatchCard: React.FC<{ match: Match; rank: number; onClick: () => void; delay: number }> = ({
  match, rank, onClick, delay
}) => {
  const scoreColor = match.score >= 0.85 ? '#14b8a6' : match.score >= 0.7 ? '#f59e0b' : '#6366f1';
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 24 }}
      onClick={onClick}
      className="text-left w-full group relative rounded-2xl p-4 transition-all duration-300 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.borderColor = `${scoreColor}40`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {/* Rank badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
          >
            #{rank}
          </span>
          {match.institution && (
            <span className="text-[10px] text-white/30 font-medium">{match.institution}</span>
          )}
        </div>
        {/* Score badge */}
        <div
          className="shrink-0 text-sm font-black rounded-full px-2.5 py-0.5"
          style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
        >
          {Math.round(match.score * 100)}%
        </div>
      </div>

      <h3 className="text-[13px] font-bold text-white leading-snug mb-2 pr-2">
        {match.edital_name}
      </h3>

      {/* Score bar */}
      <div className="w-full h-0.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${match.score * 100}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: scoreColor, boxShadow: `0 0 6px ${scoreColor}80` }}
        />
      </div>

      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
        "{match.justification}"
      </p>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4" style={{ color: scoreColor }} />
      </div>
    </motion.button>
  );
};


// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════

export const CognitionExperience: React.FC<CognitionExperienceProps> = ({
  userName,
  userId,
  formData,
  onComplete,
}) => {
  const navigate = useNavigate();
  const { setCachedMatches } = useAuthStore();

  const [screenPhase, setScreenPhase] = useState<ScreenPhase>('cognition');
  const [graphPhase, setGraphPhase] = useState<GraphPhase>(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [editalNodes, setEditalNodes] = useState<{ name: string; uid: string }[]>([]);
  const [networkNodes, setNetworkNodes] = useState<{ name: string; type: string }[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const isMounted = useRef(true);
  const replayKey = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const addLogs = useCallback((phase: GraphPhase) => {
    const lines = LOG_SCRIPTS[phase] || [];
    lines.forEach((line, i) => {
      setTimeout(() => {
        if (isMounted.current) setConsoleLogs(prev => [...prev, line]);
      }, i * 420);
    });
  }, []);

  const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

  const runCognition = useCallback(async () => {
    if (!isMounted.current) return;

    // ── Reset state ──
    setGraphPhase(0);
    setConsoleLogs([]);
    setEditalNodes([]);
    setNetworkNodes([]);
    setSkills([]);
    setMatches([]);
    setScreenPhase('cognition');

    // ── T=0: Dispara API + mostra nó do usuário ──
    addLogs(0);

    const cognitionPromise = fetch('/api/agents/v2/cognition-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        uid: userId || 'anon',
        name: formData?.name || userName,
        bio: formData?.bio || '',
        institution: formData?.institution || '',
        course: formData?.course || '',
        semester: Number(formData?.semester) || 1,
        o_que_busco: formData?.o_que_busco || '',
        curriculo_texto: formData?.curriculo_texto || '',
        user_type: formData?.user_type || 'student',
      }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .catch(err => {
        // Log but don't throw — the animation continues with empty data
        console.error('[CognitionExperience] cognition-full failed:', err);
        return null;
      });

    // ── T=5s: Skills aparecem ──
    await delay(PHASE_DELAYS[1]);
    if (!isMounted.current) return;
    addLogs(1);

    // Skills: pega as tags reais submetidas no formulário (dados reais do usuário)
    const formSkills: string[] = (() => {
      try {
        const raw = formData?.skills || '';
        if (typeof raw === 'string' && raw.startsWith('[')) return (JSON.parse(raw) as string[]).slice(0, 6);
        if (Array.isArray(raw)) return (raw as string[]).slice(0, 6);
        return [];
      } catch { return []; }
    })();
    // Se não há tags do formulário, tenta extrair do curriculo_texto (primeiras palavras chave)
    const textSkills: string[] = formSkills.length === 0 && formData?.curriculo_texto
      ? (formData.curriculo_texto as string)
          .split(/[,;\n]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 3 && s.length < 30)
          .slice(0, 5)
      : [];
    const resolvedSkills = formSkills.length > 0 ? formSkills : textSkills;
    setSkills(resolvedSkills);
    setGraphPhase(1);

    // ── T=10s: Editais aparecem ──
    await delay(PHASE_DELAYS[2] - PHASE_DELAYS[1]);
    if (!isMounted.current) return;
    addLogs(2);

    // Aguarda a resposta real da API (com timeout de 2s a partir deste ponto)
    let apiData: any = null;
    try {
      apiData = await Promise.race([
        cognitionPromise,
        delay(2000).then(() => null),
      ]);
    } catch { /* noop */ }

    // Editais: apenas dados reais. Array vazio é honesto.
    const realEditais: { name: string; uid: string }[] = apiData?.data?.edital_nodes || [];
    setEditalNodes(realEditais);
    setGraphPhase(2);

    // ── T=15s: Docentes aparecem ──
    await delay(PHASE_DELAYS[3] - PHASE_DELAYS[2]);
    if (!isMounted.current) return;
    addLogs(3);

    // Rede: apenas dados reais.
    const realNetwork: { name: string; type: string }[] = apiData?.data?.network_nodes || [];
    setNetworkNodes(realNetwork);
    setGraphPhase(3);

    // ── T=19s: Finaliza pipeline ──
    await delay(PHASE_DELAYS[4] - PHASE_DELAYS[3]);
    if (!isMounted.current) return;
    addLogs(4);
    setGraphPhase(4);

    // Matches: apenas dados reais da API.
    const llmMatches: Match[] = apiData?.data?.matches || [];
    const finalMatches = llmMatches.slice(0, 5);
    setMatches(finalMatches);
    setCachedMatches(finalMatches);

    // Persiste no backend de forma não-bloqueante
    if (userId) {
      fetch('/api/users/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: userId,
          profile_data: { ...formData, user_type: formData?.user_type || 'student' },
          matches: finalMatches,
        }),
      }).catch(err => console.warn('[CognitionExperience] finalize failed:', err));
    }

    await delay(600);
    if (isMounted.current) setScreenPhase('matches');
  }, [formData, userId, userName, addLogs, setCachedMatches]);


  useEffect(() => {
    if (formData) runCognition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Replay ──
  const handleReplay = useCallback(() => {
    replayKey.current += 1;
    runCognition();
  }, [runCognition]);

  const handleMatchClick = (match: Match) => {
    navigate(`/user/ecossistema?highlight=${match.edital_uid}`);
  };

  const handleExploreProfile = () => onComplete();

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: '#050a0f' }}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse"
          style={{ background: 'rgba(20,184,166,0.06)' }} />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse"
          style={{ background: 'rgba(99,102,241,0.05)', animationDelay: '2s' }} />
      </div>

      {/* ── COGNITION SCREEN ── */}
      <AnimatePresence mode="wait">
        {screenPhase === 'cognition' && (
          <motion.div
            key={`cognition-${replayKey.current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="shrink-0 px-6 lg:px-10 pt-6 pb-4">
              <PhaseIndicator graphPhase={graphPhase} />
            </div>

            {/* Main layout: Graph | Console */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 px-6 lg:px-10 pb-6 min-h-0">
              {/* Graph */}
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="w-full max-w-[440px]">
                  <CinematicGraph
                    graphPhase={graphPhase}
                    userName={userName}
                    editalNodes={editalNodes}
                    networkNodes={networkNodes}
                    skills={skills}
                  />
                </div>

                {/* Phase label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={graphPhase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-center"
                  >
                    <p className="text-[12px] font-bold uppercase tracking-widest"
                      style={{ color: 'rgba(20,184,166,0.7)' }}>
                      {graphPhase === 0 && 'T+0s — Inicializando perfil...'}
                      {graphPhase === 1 && 'T+5s — Mapeando competências...'}
                      {graphPhase === 2 && 'T+10s — Conectando editais estratégicos...'}
                      {graphPhase === 3 && 'T+15s — Expandindo rede de inovação...'}
                      {graphPhase === 4 && 'T+19s — Ecossistema mapeado ✓'}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Legend */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  {Object.entries(COLORS).map(([type, col]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.bg }} />
                      <span className="text-[10px] capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {type === 'user' ? userName.split(' ')[0] : type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console */}
              <div className="hidden lg:flex flex-col min-h-0">
                <AIConsole logs={consoleLogs} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MATCHES SCREEN ── */}
        {screenPhase === 'matches' && (
          <motion.div
            key="matches"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="shrink-0 px-6 lg:px-10 pt-8 pb-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)' }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: '#14b8a6' }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#14b8a6' }}>
                  Análise Cognitiva Completa
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl lg:text-4xl font-black text-white mb-2"
              >
                Top {matches.length} Matches
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                O motor ARIANO mapeou sua aderência ao ecossistema de inovação de Recife.
              </motion.p>
            </div>

            {/* Match cards + console split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 lg:px-10 pb-8 min-h-0 overflow-y-auto">
              {/* Cards */}
              <div className="space-y-3">
                {matches.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-8 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-[14px] font-semibold text-white/60 mb-2">Nenhum edital disponível no momento</p>
                    <p className="text-[12px] text-white/30 leading-relaxed">
                      O ecossistema ainda não possui editais cadastrados com status "aberto".
                      Acesse o painel para explorar seu perfil e acompanhe quando novos editais forem publicados.
                    </p>
                  </motion.div>
                ) : matches.map((match, i) => (
                  <MatchCard
                    key={match.edital_uid || i}
                    match={match}
                    rank={i + 1}
                    onClick={() => handleMatchClick(match)}
                    delay={i * 0.12}
                  />
                ))}

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-4 pt-2"
                >
                  <button
                    onClick={() => navigate('/user/matches')}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    Ver todos os matches
                  </button>
                  <button
                    onClick={handleExploreProfile}
                    className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #14b8a6, #0891b2)',
                      boxShadow: '0 0 24px rgba(20,184,166,0.35)',
                    }}
                  >
                    Explorar Meu Perfil
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>

              {/* Console (replay-able) */}
              <div className="hidden lg:flex flex-col min-h-0">
                <AIConsole logs={consoleLogs} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REPLAY BUTTON (floating) ── */}
      {screenPhase === 'matches' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-6 left-6 z-[70]"
        >
          <button
            onClick={handleReplay}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#14b8a6';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(20,184,166,0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay da Animação
          </button>
        </motion.div>
      )}

    </div>
  );
};
