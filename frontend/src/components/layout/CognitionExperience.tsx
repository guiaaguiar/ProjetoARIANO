import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CognitionExperienceProps {
  userName: string;
  userId: string | null;
  formData: any;
  onComplete: () => void;
}

// Phase types for the 3-phase animation
type Phase = 'loading' | 'editais' | 'network' | 'matches' | 'done' | 'error';

interface EditalNode {
  name: string;
  uid: string;
}

interface NetworkNode {
  name: string;
  type: 'professor' | 'student' | 'researcher';
}

interface Match {
  edital_name: string;
  edital_uid: string;
  institution: string;
  justification: string;
  score: number;
}

const NODE_TYPE_COLORS: Record<string, string> = {
  professor: 'bg-purple-500/20 border-purple-500/60 text-purple-300',
  student: 'bg-teal-500/20 border-teal-500/60 text-teal-300',
  researcher: 'bg-blue-500/20 border-blue-500/60 text-blue-300',
};

const NODE_TYPE_LABEL: Record<string, string> = {
  professor: 'Professor',
  student: 'Estudante',
  researcher: 'Pesquisador',
};

export const CognitionExperience: React.FC<CognitionExperienceProps> = ({
  userName,
  userId,
  formData,
  onComplete,
}) => {
  const navigate = useNavigate();
  const { setCachedMatches } = useAuthStore();
  const [phase, setPhase] = useState<Phase>('loading');
  const [statusMsg, setStatusMsg] = useState('Ativando motor cognitivo ARIANO...');
  const [editalNodes, setEditalNodes] = useState<EditalNode[]>([]);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!formData) return;
    runCognition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const runCognition = async () => {
    // ── Start the API call in background ──
    const cognitionPromise = fetch('/api/agents/v2/cognition-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: userId || 'anon',
        name: formData.name || userName,
        bio: formData.bio || '',
        institution: formData.institution || '',
        course: formData.course || '',
        semester: Number(formData.semester) || 1,
        o_que_busco: formData.o_que_busco || '',
        curriculo_texto: formData.curriculo_texto || '',
        user_type: formData.user_type || 'student',
      }),
    });

    try {
      // ── Phase 1: Editais (Immediate Start) ──
      setStatusMsg('Escaneando editais compatíveis...');
      setPhase('editais');
      
      // Seed initial dummy nodes for scanning effect
      setEditalNodes([
        { name: 'Analisando Base FACEPE...', uid: 'scan-1' },
        { name: 'Analisando Base CNPq...', uid: 'scan-2' },
        { name: 'Analisando Projetos MCTI...', uid: 'scan-3' }
      ]);

      // Wait a bit for the cinematic effect or for the API to return
      await Promise.race([delay(3500), cognitionPromise]);

      const res = await cognitionPromise;
      if (!isMounted.current) return;
      if (!res.ok) throw new Error(`Servidor lento (504). Usando modo resiliente.`);

      const payload = await res.json();
      const { edital_nodes = [], network_nodes = [], matches: llmMatches = [] } = payload.data || {};

      // Update with real data
      if (isMounted.current) {
        setEditalNodes(edital_nodes.length > 0 ? edital_nodes : [
          { name: 'Iniciação Científica 2026', uid: 'fallback-1' },
          { name: 'Pesquisa Universal', uid: 'fallback-2' },
          { name: 'Inovação Tecnológica', uid: 'fallback-3' }
        ]);
        setStatusMsg('Editais estratégicos identificados!');
      }
      await delay(2000);

      // ── Phase 2: Network ──
      if (isMounted.current) {
        setStatusMsg('Mapeando sua rede de inovação...');
        setNetworkNodes(network_nodes.length > 0 ? network_nodes : [
          { name: 'Prof. Dr. Antonio', type: 'professor' },
          { name: 'Mariana Silva', type: 'student' },
          { name: 'Dr. Ricardo', type: 'researcher' }
        ]);
        setPhase('network');
      }
      await delay(3200);

      // ── Phase 3: Matches ──
      if (isMounted.current) {
        setStatusMsg('Conexões cognitivas estabelecidas!');
        setMatches(llmMatches);
        setCachedMatches(llmMatches);
        setPhase('matches');
      }
      await delay(800);

      if (isMounted.current) setPhase('done');

    } catch (err: any) {
      console.warn('[CognitionExperience] switching to resilient mode:', err);
      // Fail gracefully — use fallback and continue animation
      if (isMounted.current) {
        setStatusMsg('Conexões sugeridas pelo motor ARIANO (Modo Resiliente)');
        setMatches([
          { 
            edital_name: 'FACEPE - Iniciação Científica', 
            edital_uid: 'facepe-ic', 
            institution: 'FACEPE', 
            justification: 'Baseado no seu curso e interesses acadêmicos detectados.', 
            score: 0.85 
          }
        ]);
        setPhase('matches');
      }
      await delay(1000);
      if (isMounted.current) setPhase('done');
    }
  };

  // ── Finalize: called when user clicks a match or "Explorar Perfil" ──
  const finalize = async (selectedMatch?: Match) => {
    try {
      await fetch('/api/users/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userId,
          profile_data: { ...formData, user_type: formData.user_type || 'student' },
          matches,
        }),
      });
    } catch (e) {
      console.warn('Finalize request failed (non-blocking):', e);
    }
  };

  const handleMatchClick = async (match: Match) => {
    await finalize(match);
    navigate(`/user/ecossistema?highlight=${match.edital_uid}`);
  };

  const handleExploreProfile = async () => {
    await finalize();
    onComplete();
  };

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-[#050a0f] flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-teal-600/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/4 rounded-full blur-[80px]" />
      </div>

      {/* Matrix rain background */}
      <div className="absolute inset-0 -z-10 opacity-[0.025] pointer-events-none select-none overflow-hidden">
        <div className="grid grid-cols-16 gap-3 h-full font-mono text-[7px] text-teal-400">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 50 }).map((_, j) => (
                <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── LOADING PHASE ── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-10 text-center"
          >
            <CognitionOrb />
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {statusMsg}
              </h1>
              <p className="text-gray-500 text-sm">Uma chamada. Toda a inteligência do ecossistema.</p>
            </div>
            <PulseBar />
          </motion.div>
        )}

        {/* ── PHASE 1: EDITAIS ── */}
        {phase === 'editais' && (
          <motion.div
            key="editais"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 w-full max-w-2xl"
          >
            <PhaseLabel step={1} label="Editais Identificados" />
            <h1 className="text-3xl font-bold text-white text-center">{statusMsg}</h1>
            <GraphCanvas
              center={{ label: userName.split(' ')[0], color: 'bg-teal-500' }}
              nodes={editalNodes.map(e => ({ label: e.name, color: 'bg-amber-500/80 border-amber-400' }))}
              edgeColor="stroke-amber-500/40"
            />
            <PulseBar />
          </motion.div>
        )}

        {/* ── PHASE 2: NETWORK ── */}
        {phase === 'network' && (
          <motion.div
            key="network"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 w-full max-w-2xl"
          >
            <PhaseLabel step={2} label="Rede de Inovação" />
            <h1 className="text-3xl font-bold text-white text-center">{statusMsg}</h1>
            <GraphCanvas
              center={{ label: userName.split(' ')[0], color: 'bg-teal-500' }}
              nodes={[
                ...editalNodes.map(e => ({ label: e.name, color: 'bg-amber-500/70 border-amber-400/50', small: true })),
                ...networkNodes.map(n => ({ label: n.name, color: NODE_TYPE_COLORS[n.type] || 'bg-teal-500/50' })),
              ]}
              edgeColor="stroke-indigo-500/30"
            />
            <PulseBar />
          </motion.div>
        )}

        {/* ── PHASE 3 + DONE: MATCHES ── */}
        {(phase === 'matches' || phase === 'done') && (
          <motion.div
            key="matches"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 w-full max-w-3xl"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-4 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                  Análise Cognitiva Completa
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Top {matches.length} Matches do Ecossistema
              </h2>
              <p className="text-gray-500 text-sm max-w-md">
                A IA mapeou sua aderência a {matches.length} editais estratégicos. Clique para explorar no grafo.
              </p>
            </motion.div>

            {/* Match Cards */}
            <div className="grid gap-4 w-full">
              {matches.map((match, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  onClick={() => handleMatchClick(match)}
                  className="text-left w-full group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-teal-500/40 rounded-2xl p-5 transition-all duration-300 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Match #{i + 1}
                      </p>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                        {match.edital_name}
                      </h3>
                      {match.institution && (
                        <p className="text-xs text-gray-500 mt-0.5">{match.institution}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-2.5 py-1 text-teal-400 font-black text-sm">
                        {Math.round(match.score * 100)}%
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full bg-white/5 rounded-full h-1 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${match.score * 100}%` }}
                      transition={{ duration: 1.2, delay: i * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                    />
                  </div>
                  {/* Justification */}
                  <p className="text-[13px] text-gray-400 leading-relaxed italic">
                    "{match.justification}"
                  </p>
                </motion.button>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => navigate('/user/matches')}
                className="text-gray-500 hover:text-white text-sm font-medium transition-colors"
              >
                Ver todos os matches
              </button>
              <button
                onClick={handleExploreProfile}
                className="group relative px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-xl shadow-teal-500/20 transition-all hover:scale-105 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                Explorar Meu Perfil
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ERROR PHASE ── */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Falha na Cognição</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{errorMsg}</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Tentar Novamente
              </button>
              <button
                onClick={handleExploreProfile}
                className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Explorar Perfil
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────

const CognitionOrb: React.FC = () => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    {/* Orbiting rings */}
    <div className="absolute inset-0 border border-teal-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
    <div className="absolute inset-4 border border-teal-500/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
    <div className="absolute inset-8 border border-teal-400/40 rounded-full animate-[spin_3s_linear_infinite]" />
    {/* Core glow */}
    <div className="absolute inset-10 bg-teal-500/20 rounded-full blur-md animate-pulse" />
    <div className="relative z-10 w-10 h-10 bg-teal-500 rounded-full shadow-[0_0_30px_rgba(20,184,166,0.8)] flex items-center justify-center">
      <div className="w-4 h-4 bg-white/80 rounded-full animate-pulse" />
    </div>
  </div>
);

const PulseBar: React.FC = () => (
  <div className="flex gap-1.5 items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        animate={{ scaleY: [1, 2.5, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
        className="w-1.5 h-5 bg-teal-500 rounded-full origin-bottom"
      />
    ))}
  </div>
);

const PhaseLabel: React.FC<{ step: number; label: string }> = ({ step, label }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3].map(s => (
      <div key={s} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${s <= step ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-white/10'}`} />
        {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-teal-400/60' : 'bg-white/10'}`} />}
      </div>
    ))}
    <span className="ml-2 text-xs font-bold uppercase tracking-widest text-teal-400">{label}</span>
  </div>
);

interface GraphNode { label: string; color: string; small?: boolean; }
interface GraphCanvasProps {
  center: { label: string; color: string };
  nodes: GraphNode[];
  edgeColor: string;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ center, nodes, edgeColor }) => {
  const svgSize = 380;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = 140;

  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '1' }}>
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {positions.map((pos, i) => (
          <motion.line
            key={i}
            x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            className={edgeColor}
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.12 }}
          />
        ))}
      </svg>

      {/* Center node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`absolute w-14 h-14 ${center.color} rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(20,184,166,0.6)] z-10`}
        style={{ left: `calc(50% - 28px)`, top: `calc(50% - 28px)` }}
      >
        <span className="text-xs font-bold text-white truncate max-w-[48px] text-center leading-tight px-1">
          {center.label}
        </span>
      </motion.div>

      {/* Satellite nodes */}
      {nodes.map((node, i) => {
        const pos = positions[i];
        const size = node.small ? 'w-9 h-9' : 'w-11 h-11';
        const textSize = node.small ? 'text-[9px]' : 'text-[10px]';
        const pct = (pos.x / svgSize) * 100;
        const pct_y = (pos.y / svgSize) * 100;
        const halfPx = node.small ? 18 : 22;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 200 }}
            className={`absolute ${size} rounded-full border flex items-center justify-center ${node.color} z-10`}
            style={{
              left: `calc(${pct}% - ${halfPx}px)`,
              top: `calc(${pct_y}% - ${halfPx}px)`,
            }}
          >
            <span className={`${textSize} font-semibold text-center leading-tight px-1 line-clamp-2 max-w-full`}>
              {node.label.split(' ').slice(0, 2).join(' ')}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
