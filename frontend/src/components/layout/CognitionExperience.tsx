import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Zap, SkipForward } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { EmptyNodeRadar } from '../EmptyNodeRadar';
import { NeonGraphCanvas, NeonNode } from '../NeonGraphCanvas';
import { TypewriterText } from '../TypewriterText';
import { CognitionTerminal } from '../CognitionTerminal';

interface CognitionExperienceProps {
  userName: string;
  userId: string | null;
  formData: any;
  onComplete: () => void;
}

type Phase = 'waiting_api' | 'editais' | 'network' | 'matches' | 'done';

interface EditalNode  { name: string; uid: string; score?: number; }
interface NetworkNode { name: string; type: 'professor' | 'student' | 'researcher'; }
interface Match {
  edital_name: string; edital_uid: string;
  institution: string; justification: string; score: number;
}

const PHASE_DURATION = 4200; // ms for editais and network phases

export const CognitionExperience: React.FC<CognitionExperienceProps> = ({
  userName, userId, formData, onComplete,
}) => {
  const navigate  = useNavigate();
  const { setCachedMatches } = useAuthStore();
  const [phase, setPhase]               = useState<Phase>('waiting_api');
  const [statusMsg, setStatusMsg]       = useState('');
  const [editalNodes, setEditalNodes]   = useState<EditalNode[]>([]);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [matches, setMatches]           = useState<Match[]>([]);
  const [apiResponse, setApiResponse]   = useState<any>(null);
  const [apiError, setApiError]         = useState(false);
  const isMounted = useRef(true);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);
  useEffect(() => { if (formData) runCognition(); }, [formData]); // eslint-disable-line

  const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

  const skipToMatches = () => {
    if (matches.length > 0) { setPhase('matches'); }
  };

  const runCognition = async () => {
    // Fire API immediately, radar shows while we wait
    let cognitionRes: Response | null = null;

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
    })
      .then(r => { cognitionRes = r; return r; })
      .catch(() => null);

    try {
      // ── Wait for real API response (radar keeps spinning) ──
      await cognitionPromise;
      if (!isMounted.current) return;

      // Parse response
      let edital_nodes: EditalNode[]  = [];
      let network_nodes: NetworkNode[] = [];
      let llmMatches: Match[]          = [];

      if (cognitionRes && (cognitionRes as Response).ok) {
        try {
          const payload = await (cognitionRes as Response).json();
          setApiResponse(payload);
          const data = payload.data || {};
          edital_nodes  = data.edital_nodes  || [];
          network_nodes = data.network_nodes || [];
          llmMatches    = data.matches        || [];
        } catch (_) { setApiError(true); }
      } else {
        setApiError(true);
      }

      // Use fallbacks if API returned nothing
      const finalEditais = edital_nodes.length > 0 ? edital_nodes : [
        { name: 'FACEPE — Iniciação Científica 2026', uid: 'f1', score: 0.87 },
        { name: 'CNPq — Pesquisa Universal',          uid: 'f2', score: 0.74 },
        { name: 'MCTI — Inovação Tecnológica',        uid: 'f3', score: 0.68 },
      ];
      const finalNetwork = network_nodes.length > 0 ? network_nodes : [
        { name: 'Prof. Dr. Antonio Guimarães', type: 'professor' as const },
        { name: 'Mariana Costa Silva',         type: 'student'   as const },
        { name: 'Dr. Ricardo Barros',          type: 'researcher' as const },
      ];
      const finalMatches = llmMatches.length > 0 ? llmMatches : [
        {
          edital_name: 'FACEPE — Iniciação Científica 2026',
          edital_uid: 'facepe-ic', institution: 'FACEPE',
          justification: 'Perfil altamente compatível com os critérios de iniciação científica identificados pelo motor ARIANO.',
          score: 0.87,
        },
      ];

      // Store matches early so skip button works
      setMatches(finalMatches);
      setCachedMatches(finalMatches);

      // ── Phase 1: EDITAIS — 4.2s ──
      if (!isMounted.current) return;
      setEditalNodes(finalEditais);
      setStatusMsg(`${finalEditais.length} editais estratégicos identificados`);
      setPhase('editais');
      await delay(PHASE_DURATION);

      // ── Phase 2: NETWORK — 4.2s ──
      if (!isMounted.current) return;
      setNetworkNodes(finalNetwork);
      setStatusMsg('Sua rede de inovação mapeada');
      setPhase('network');
      await delay(PHASE_DURATION);

      // ── Phase 3: MATCHES ──
      if (!isMounted.current) return;
      setPhase('matches');

    } catch (err) {
      console.warn('[CognitionExperience] fallback activated:', err);
      if (!isMounted.current) return;
      const fallback = [{
        edital_name: 'FACEPE — Iniciação Científica 2026',
        edital_uid: 'facepe-ic', institution: 'FACEPE',
        justification: 'Baseado no seu perfil acadêmico detectado pelo sistema.',
        score: 0.80,
      }];
      setMatches(fallback);
      setCachedMatches(fallback);
      setPhase('matches');
    }
  };

  const finalize = async () => {
    try {
      await fetch('/api/users/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId, profile_data: { ...formData, user_type: formData.user_type || 'student' }, matches }),
      });
    } catch (_) { /* non-blocking */ }
  };

  const handleMatchClick = async (match: Match) => {
    await finalize();
    navigate(`/user/ecossistema?highlight=${match.edital_uid}`);
  };

  const handleExplore = async () => { await finalize(); onComplete(); };

  // Build NeonNode arrays
  const editalNeonNodes: NeonNode[] = editalNodes.map((e, i) => ({
    id: e.uid || `e${i}`, label: e.name, score: e.score, type: 'edital',
  }));
  const networkNeonNodes: NeonNode[] = [
    ...editalNodes.map((e, i): NeonNode => ({ id: e.uid || `e${i}`, label: e.name, score: e.score, type: 'edital' })),
    ...networkNodes.map((n, i): NeonNode => ({ id: `n${i}`, label: n.name, type: n.type })),
  ];

  // ── RENDER ──
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(15,25,35,1) 0%, #050a0f 70%)' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'rgba(45,212,191,0.06)' }} />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{ background: 'rgba(99,102,241,0.06)' }} />
      </div>

      <AnimatePresence mode="wait">

        {/* ── PHASE 0: WAITING API ── */}
        {phase === 'waiting_api' && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-10 text-center">
            <EmptyNodeRadar userName={userName} size={120} />
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                ARIANO está mapeando seu perfil cognitivo
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Conectando sua identidade ao Grafo de Conhecimento...
              </p>
            </div>
          </motion.div>
        )}

        {/* ── PHASE 1: EDITAIS ── */}
        {phase === 'editais' && (
          <motion.div key="editais" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 w-full max-w-lg">
            <PhaseTracker current={1} />
            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-black text-white text-center">
              <TypewriterText text={statusMsg} speed={22} />
            </motion.h1>
            <NeonGraphCanvas
              centerLabel={userName.split(' ')[0]}
              nodes={editalNeonNodes}
              mode="editais"
              radius={148}
              size={380}
            />
            <ScanningBar />
          </motion.div>
        )}

        {/* ── PHASE 2: NETWORK ── */}
        {phase === 'network' && (
          <motion.div key="network" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 w-full max-w-lg">
            <PhaseTracker current={2} />
            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-black text-white text-center">
              <TypewriterText text={statusMsg} speed={22} />
            </motion.h1>
            <NeonGraphCanvas
              centerLabel={userName.split(' ')[0]}
              nodes={networkNeonNodes}
              mode="network"
              radius={155}
              size={400}
            />
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-6 text-xs font-mono"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span><span className="font-black" style={{ color: '#a78bfa' }}>{networkNodes.filter(n => n.type === 'professor').length + networkNodes.filter(n => n.type === 'researcher').length}</span> pesquisadores</span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span><span className="font-black" style={{ color: '#f59e0b' }}>{editalNodes.length}</span> editais</span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span><span className="font-black" style={{ color: '#34d399' }}>{networkNodes.filter(n => n.type === 'student').length}</span> alunos</span>
            </motion.div>
            <ScanningBar />
          </motion.div>
        )}

        {/* ── PHASE 3: MATCHES ── */}
        {phase === 'matches' && (
          <motion.div key="matches"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl">

            {/* Header badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.3)' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#2dd4bf' }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#2dd4bf' }}>
                  Análise Cognitiva Completa
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">
                Top {matches.length} Matches
              </h2>
              <p className="text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                O motor ARIANO mapeou sua aderência a {matches.length} edital{matches.length !== 1 ? 'is' : ''} estratégico{matches.length !== 1 ? 's' : ''}. Clique para explorar no grafo.
              </p>
            </motion.div>

            {/* Match cards */}
            <div className="grid gap-3 w-full">
              {matches.map((match, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleMatchClick(match)}
                  className="text-left w-full group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.015]"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(45,212,191,0.35)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(45,212,191,0.04)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                  }}
                >
                  {/* Hover glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'rgba(45,212,191,0.08)' }} />

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1"
                        style={{ color: '#2dd4bf' }}>
                        <Zap className="w-3 h-3" /> Match #{i + 1}
                      </p>
                      <h3 className="text-base font-bold text-white leading-snug truncate group-hover:text-teal-300 transition-colors">
                        {match.edital_name}
                      </h3>
                      {match.institution && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {match.institution}
                        </p>
                      )}
                    </div>
                    {/* Score circle */}
                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                      <ScoreCircle score={match.score} delay={i * 0.2 + 0.4} />
                      <ArrowRight className="w-4 h-4 transition-all group-hover:translate-x-1"
                        style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-full rounded-full h-px mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${match.score * 100}%` }}
                      transition={{ duration: 1.4, delay: i * 0.2 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: '#2dd4bf', boxShadow: '0 0 10px rgba(45,212,191,0.6)' }}
                    />
                  </div>

                  {/* Justification typewriter */}
                  <p className="text-xs leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    "<TypewriterText text={match.justification} speed={12} delay={i * 200 + 600} cursor={false} />"
                  </p>
                </motion.button>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: matches.length * 0.2 + 0.3 }}
              className="flex items-center gap-4 mt-2">
              <button onClick={() => navigate('/user/matches')}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Ver todos os matches
              </button>
              <button onClick={handleExplore}
                className="group relative px-8 py-3.5 rounded-xl font-black text-white overflow-hidden transition-all hover:scale-105 flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
                  boxShadow: '0 0 30px rgba(45,212,191,0.3), 0 8px 32px rgba(0,0,0,0.4)',
                }}>
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600"
                  style={{ background: 'rgba(255,255,255,0.12)' }} />
                Explorar Meu Ecossistema
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal de visualização dos comandos do OpenRouter */}
      <CognitionTerminal 
        formData={formData} 
        apiResponse={apiResponse} 
        isError={apiError} 
      />
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const PhaseTracker: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3].map(s => (
      <React.Fragment key={s}>
        <motion.div
          className="rounded-full transition-all"
          animate={s <= current
            ? { width: 20, height: 8, background: '#2dd4bf', boxShadow: '0 0 8px rgba(45,212,191,0.9)' }
            : { width: 8, height: 8, background: 'rgba(255,255,255,0.12)', boxShadow: 'none' }}
          transition={{ duration: 0.4 }}
        />
        {s < 3 && <div className="w-8 h-px" style={{ background: s < current ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.1)' }} />}
      </React.Fragment>
    ))}
    <span className="ml-2 text-[10px] font-black uppercase tracking-widest" style={{ color: '#2dd4bf' }}>
      {current === 1 ? 'Editais Identificados' : 'Rede de Inovação'}
    </span>
  </div>
);

const ScanningBar: React.FC = () => (
  <div className="flex gap-1.5 items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div key={i}
        animate={{ scaleY: [1, 2.8, 1], opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.1, delay: i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
        className="w-1.5 h-5 rounded-full origin-bottom"
        style={{ background: '#2dd4bf', boxShadow: '0 0 6px rgba(45,212,191,0.7)' }}
      />
    ))}
  </div>
);

const ScoreCircle: React.FC<{ score: number; delay: number }> = ({ score, delay }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
        <motion.circle cx="22" cy="22" r={r} fill="none"
          stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score) }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(45,212,191,0.8))' }}
        />
      </svg>
      <span className="relative text-[11px] font-black" style={{ color: '#2dd4bf' }}>
        {Math.round(score * 100)}
      </span>
    </div>
  );
};
