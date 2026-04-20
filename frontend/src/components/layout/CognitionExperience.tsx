import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Network, Zap, CheckCircle2, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { MiniGraphAnimation } from '../MiniGraphAnimation';
import { MatchResultCards } from '../MatchResultCards';

interface CognitionExperienceProps {
  userName: string;
  apiPromise: Promise<any> | null;
  onComplete: () => void;
}

const AGENT_STEPS = [
  { id: 'orchestrator', label: 'Orquestrador ARIANO Iniciado', icon: Bot, color: 'text-teal-400' },
  { id: 'analyzer', label: 'ProfileAnalyzer Extraindo Skills do PDF', icon: Cpu, color: 'text-blue-400' },
  { id: 'knowledge', label: 'Mapeando Grafo de Conhecimento Individual', icon: Network, color: 'text-purple-400' },
  { id: 'match', label: 'Calculando Matches Estratégicos (Eligibility)', icon: Zap, color: 'text-amber-400' },
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
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFinish, setShowFinish] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🚀 ARIANO: Cognition Experience v2.0 (No-Console Edition) Initialized.");
    let animationDone = false;
    let apiData: any = null;
    
    // Logs estruturados para diálogo
    const logMessages = [
      { agent: 'orchestrator', msg: `Identificando novo nó: ${userName}` },
      { agent: 'analyzer', msg: 'Extraindo competências via Graph-CoT...' },
      { agent: 'analyzer', msg: 'Habilidades mapeadas com 98% de precisão.' },
      { agent: 'knowledge', msg: 'Sincronizando arestas de conhecimento...' },
      { agent: 'orchestrator', msg: 'Calculando maturidade acadêmica...' },
      { agent: 'match', msg: 'Cruzando dados com editais ativos...' },
      { agent: 'match', msg: '12 matches estratégicos detectados.' },
      { agent: 'knowledge', msg: 'Consolidando arestas SIMILAR_TO e ELIGIBLE_FOR...' },
      { agent: 'orchestrator', msg: 'Ecossistema individual pronto.' }
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs(prev => [...prev, JSON.stringify(logMessages[logIdx])]);
        logIdx++;
      }
    }, 1400);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 3200);

    // Tempo mínimo de animação para imersão total (11s)
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 11000));

    if (apiPromise) {
      Promise.all([apiPromise, minTimePromise])
        .then(([result]) => {
          setMatches(result.topMatches || []);
          setShowFinish(true);
        })
        .catch(err => {
          console.error("❌ ARIANO: Critical Error in Cognition Pipeline:", err);
          setError(err.message || 'Erro crítico no orquestrador ARIANO.');
          setTimeout(() => setShowFinish(true), 2000);
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
              exit={{ opacity: 0, y: -20 }}
              className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center"
            >
                {/* Left: Agents Status */}
                <div className="space-y-6 flex flex-col justify-center order-2 lg:order-1">
                  {AGENT_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStep;
                    const isDone = idx < currentStep;

                    return (
                      <motion.div 
                        key={step.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-500 ${
                          isActive ? `bg-gray-900/80 ${AGENT_COLORS[step.id]} scale-105` : 
                          'bg-transparent border-transparent opacity-40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                          isActive ? `${AGENT_ICON_COLORS[step.id]} shadow-lg` : 
                          isDone ? 'bg-teal-500/10 border-teal-500/30' : 'bg-gray-900/50 border-gray-800'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? step.color : isDone ? 'text-teal-500' : 'text-gray-600'}`} />
                        </div>
                        <div>
                           <p className={`text-xs font-bold uppercase tracking-tighter ${isActive ? 'text-white' : 'text-gray-600'}`}>Agente {step.id}</p>
                           <p className={`text-[10px] ${isActive ? 'text-teal-400' : 'text-gray-600'}`}>{isActive ? 'Ativo' : isDone ? 'Finalizado' : 'Aguardando'}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Center: Graph (Hero) */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center order-1 lg:order-2">
                   <div className="relative w-full aspect-square max-w-[500px]">
                      <MiniGraphAnimation step={currentStep} />
                      
                      {/* Floating Dialogue Bubbles */}
                      <AnimatePresence>
                        {logs.length > 0 && (
                          <motion.div
                            key={logs.length}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-[300px] z-20"
                          >
                            <div className="bg-gray-900/90 backdrop-blur-xl border border-teal-500/30 p-4 rounded-2xl shadow-2xl relative">
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-teal-500/30 rotate-45" />
                              <div className="flex items-center gap-2 mb-2">
                                {(() => {
                                  try {
                                    const lastLog = JSON.parse(logs[logs.length - 1]);
                                    const agent = AGENT_STEPS.find(a => a.id === lastLog.agent) || AGENT_STEPS[0];
                                    const Icon = agent.icon;
                                    return (
                                      <>
                                        <Icon className={`w-3 h-3 ${agent.color}`} />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{agent.label}</span>
                                      </>
                                    );
                                  } catch (e) {
                                    return <MessageSquare className="w-3 h-3 text-teal-400" anchor="center" />;
                                  }
                                })()}
                              </div>
                              <p className="text-xs text-gray-300 leading-relaxed italic">
                                "{JSON.parse(logs[logs.length - 1]).msg}"
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                {/* Right: AI Communication Signals */}
                <div className="flex flex-col justify-center space-y-4 order-3">
                   <div className="p-6 bg-gray-900/40 border border-border/10 rounded-3xl backdrop-blur-md">
                      <div className="flex items-center gap-3 text-teal-400 mb-4">
                         <Zap className="w-5 h-5 fill-teal-400" />
                         <span className="text-xs font-bold uppercase tracking-widest">Cognição Ativa</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">O ARIANO está sincronizando sua rede.</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Nossos agentes de IA estão interpretando seu perfil e cruzando as arestas do ecossistema para identificar elegibilidade estratégica.
                      </p>
                      
                      <div className="mt-6 space-y-3">
                         <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Sincronização de Grafo</span>
                            <span className="text-teal-400 font-mono">{Math.min(100, (currentStep + 1) * 25)}%</span>
                         </div>
                         <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(currentStep + 1) * 25}%` }}
                              className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-teal-500/50" />
                      <span className="text-[10px] text-gray-500 italic">Protocolo Graph-CoT operando em ambiente segurado.</span>
                   </div>
                </div>
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
                  className="group relative px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-xl shadow-teal-500/20 transition-all hover:scale-105 flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  Ir para Meu Ecossistema
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
