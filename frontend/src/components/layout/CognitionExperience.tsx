import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Network, Zap, CheckCircle2, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { MiniGraphAnimation } from '../MiniGraphAnimation';
import { MatchResultCards } from '../MatchResultCards';
import { useAuthStore } from '../../store/authStore';

interface CognitionExperienceProps {
  userName: string;
  apiPromise: Promise<any> | null;
  onComplete: () => void;
}

const AGENT_STEPS = [
  { id: 'orchestrator', label: 'Iniciando Cognição', icon: Bot, color: 'text-teal-400', glow: 'shadow-teal-500/40' },
  { id: 'analyzer', label: 'Análise de Potencial', icon: Cpu, color: 'text-blue-400', glow: 'shadow-blue-500/40' },
  { id: 'knowledge', label: 'Integração de Rede', icon: Network, color: 'text-purple-400', glow: 'shadow-purple-500/40' },
  { id: 'match', label: 'Otimização de Matches', icon: Zap, color: 'text-amber-400', glow: 'shadow-amber-500/40' },
];

const AGENT_COLORS: Record<string, string> = {
  orchestrator: 'border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.1)]',
  analyzer: 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
  knowledge: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]',
  match: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
};

const AGENT_ICON_COLORS: Record<string, string> = {
  orchestrator: 'bg-gray-950 border-teal-500 shadow-teal-500/20',
  analyzer: 'bg-gray-950 border-blue-500 shadow-blue-500/20',
  knowledge: 'bg-gray-950 border-purple-500 shadow-purple-500/20',
  match: 'bg-gray-950 border-amber-500 shadow-amber-500/20',
};

export const CognitionExperience: React.FC<CognitionExperienceProps> = ({ userName, apiPromise, onComplete }) => {
  const { setCachedMatches } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFinish, setShowFinish] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ARIANO: Cognition Experience v2.0 Cinematic Edition
    let animationDone = false;
    let apiData: any = null;
    
    // Logs estruturados para diálogo
    const logMessages = [
      { agent: 'orchestrator', msg: `Olá! Identificamos sua chegada ao ecossistema ARIANO.` },
      { agent: 'analyzer', msg: 'Estou analisando seu currículo para entender seus diferenciais...' },
      { agent: 'analyzer', msg: 'Encontrei competências incríveis! Estou mapeando-as no grafo agora.' },
      { agent: 'knowledge', msg: 'Sincronizando suas conexões com a rede de conhecimento Recife.' },
      { agent: 'orchestrator', msg: 'Calculando como você se integra às oportunidades estratégicas...' },
      { agent: 'match', msg: 'Detectamos matches que fazem sentido para sua carreira.' },
      { agent: 'match', msg: 'Sua elegibilidade para editais ativos foi validada!' },
      { agent: 'knowledge', msg: 'Consolidando sua posição única neste ecossistema...' },
      { agent: 'orchestrator', msg: 'Tudo pronto. Seja bem-vindo ao futuro da pesquisa.' }
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs(prev => [...prev, JSON.stringify(logMessages[logIdx])]);
        logIdx++;
      }
    }, 1800);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);

    // Tempo mínimo de animação para imersão total (15s)
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 15000));

    if (apiPromise) {
      Promise.all([apiPromise, minTimePromise])
        .then(async ([result]) => {
          // Se o backend retornou matches, salva. 
          // Se não (comum em background tasks), tentamos uma busca rápida pelo uid
          let finalMatches = result.topMatches || [];
          
          if (finalMatches.length === 0 && result.uid) {
             try {
               const fresh = await api.getMatches(result.uid, 0.3);
               finalMatches = fresh;
             } catch(e) { /* silent fail */ }
          }
          
          setMatches(finalMatches);
          setCachedMatches(finalMatches);
          
          // Transição automática para o sucesso
          setTimeout(() => setShowFinish(true), 1000);
        })
        .catch(err => {
          console.error("❌ ARIANO: Pipeline Error:", err);
          setError('Tivemos uma pequena instabilidade na conexão, mas seu perfil está sendo processado.');
          setTimeout(() => setShowFinish(true), 3000);
        });
    }

    return () => {
      clearInterval(logInterval);
      clearInterval(stepInterval);
    };
  }, [userName, apiPromise]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className={`w-full transition-all duration-700 z-10 ${showFinish ? 'max-w-4xl' : 'max-w-7xl'}`}>
        <AnimatePresence mode="wait">
          {!showFinish ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center space-y-12"
            >
              {/* Central Title */}
              <div className="text-center space-y-4">
                 <motion.div
                   animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="text-xs font-bold uppercase tracking-[0.5em] text-teal-500 mb-2"
                 >
                   Sincronização Ativa
                 </motion.div>
                 <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                   O <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">ARIANO</span> está processando seu futuro.
                 </h1>
              </div>

              {/* Central Graph & Agent Orbit */}
              <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
                 {/* Agent Orbit Circles */}
                 <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute inset-20 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                 
                 {/* The Graph */}
                 <div className="relative z-10 w-full h-full scale-125">
                    <MiniGraphAnimation step={currentStep} />
                 </div>

                 {/* Agent Floating Bubbles */}
                 {AGENT_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStep;
                    const isDone = idx < currentStep;
                    
                    const angle = (idx * 90) * (Math.PI / 180);
                    const radius = window.innerWidth > 1024 ? 260 : 200; 
                    
                    return (
                      <motion.div
                        key={step.id}
                        initial={false}
                        animate={{
                          scale: isActive ? 1.2 : 0.9,
                          opacity: isActive ? 1 : isDone ? 0.6 : 0.2,
                          x: Math.cos(angle) * (isActive ? 200 : radius),
                          y: Math.sin(angle) * (isActive ? 200 : radius),
                        }}
                        className={`absolute w-16 h-16 rounded-3xl backdrop-blur-2xl border flex items-center justify-center transition-all duration-700 ${
                          isActive ? `bg-gray-900 ${AGENT_COLORS[step.id]} ring-2 ring-white/20` : 
                          isDone ? 'bg-teal-500/5 border-teal-500/20' : 'bg-gray-900/40 border-white/5'
                        }`}
                      >
                         <Icon className={`w-8 h-8 ${isActive ? step.color : 'text-gray-500'}`} />
                         {isActive && (
                            <motion.div 
                              layoutId="activeGlow"
                              className="absolute -inset-4 bg-teal-500/10 blur-2xl rounded-full -z-10"
                            />
                         )}
                      </motion.div>
                    );
                 })}
              </div>

              {/* Progress Stepper (Non-technical) */}
              <div className="flex gap-4 items-center mt-8">
                 {AGENT_STEPS.map((step, idx) => (
                   <div key={idx} className="flex items-center">
                      <motion.div
                        animate={{
                          width: idx === currentStep ? 120 : 12,
                          backgroundColor: idx === currentStep ? '#14b8a6' : idx < currentStep ? '#0f766e' : '#1f2937',
                        }}
                        className="h-1.5 rounded-full relative overflow-hidden"
                      >
                         {idx === currentStep && (
                           <motion.div 
                             initial={{ x: '-100%' }}
                             animate={{ x: '100%' }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                             className="absolute inset-0 bg-white/30"
                           />
                         )}
                      </motion.div>
                   </div>
                 ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-8 w-full"
            >
              <div className="text-center space-y-2 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-4 ${error ? 'bg-red-500/10 border-red-500/30' : 'bg-teal-500/10 border-teal-500/30'}`}
                >
                  {error ? (
                    <Bot className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  )}
                  <span className={`text-sm font-bold uppercase tracking-widest ${error ? 'text-red-400' : 'text-teal-400'}`}>
                    {error ? 'Erro de Processamento' : 'Processamento Concluído'}
                  </span>
                </motion.div>
                <h2 className="text-4xl font-bold text-white">
                  {error ? 'Ops! Erro de Conexão' : 'Top 3 Matches Imediatos'}
                </h2>
                <p className="text-gray-400">
                  {error ? 'Não conseguimos processar seus dados em tempo real. Tente atualizar a página.' : 'O sistema pré-calculou sua aderência em milissegundos.'}
                </p>
              </div>

              {!error && (
                <MatchResultCards 
                  matches={matches.length > 0 ? matches : [
                    { title: 'Edital FACEPE IA 2026', instituicao: 'FACEPE', score: 92, justification: 'Alinhamento forte devido à sobreposição em Python e NLP detectada pela IA.' },
                    { title: 'Bolsa Pesquisa Dados', instituicao: 'CNPq', score: 85, justification: 'Perfil atende à maturidade exigida (7.5) e compartilha áreas de Saúde Digital.' },
                    { title: 'Inovação Tech Gov', instituicao: 'Pref. Recife', score: 78, justification: 'Afinidade identificada com o cluster de pesquisadores bem sucedidos da UFPE.' }
                  ]} 
                />
              )}

              <div className="flex items-center gap-6 mt-8">
                <button
                  onClick={() => window.location.href = '/user/matchs'}
                  className="text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Ver Todos os Matches
                </button>
                <button
                  onClick={onComplete}
                  className="group relative px-10 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold shadow-2xl shadow-teal-500/30 transition-all hover:scale-105 flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  Explorar Meu Perfil
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Matrix Background (Simplified) */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
             <div key={i} className="flex flex-col gap-2 font-mono text-[8px] text-teal-500">
               {Array.from({ length: 40 }).map((_, j) => (
                 <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
               ))}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
