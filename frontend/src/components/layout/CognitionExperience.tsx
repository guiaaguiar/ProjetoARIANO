import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Network, Zap, CheckCircle2, ArrowRight, Terminal } from 'lucide-react';

interface CognitionExperienceProps {
  userName: string;
  onComplete: () => void;
}

const AGENT_STEPS = [
  { id: 'orchestrator', label: 'Orquestrador ARIANO Iniciado', icon: Bot, color: 'text-teal-400' },
  { id: 'analyzer', label: 'ProfileAnalyzer Extraindo Skills do PDF', icon: Cpu, color: 'text-blue-400' },
  { id: 'knowledge', label: 'Mapeando Grafo de Conhecimento Individual', icon: Network, color: 'text-purple-400' },
  { id: 'match', label: 'Calculando Matches Estratégicos (Eligibility)', icon: Zap, color: 'text-amber-400' },
];

export const CognitionExperience: React.FC<CognitionExperienceProps> = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => {
    const logMessages = [
      `> Iniciando protocolo de cognição para ${userName}...`,
      `> Agente Orchestrator detectou novo nó no ecossistema.`,
      `> ProfileAnalyzer extraindo competências via Graph-CoT...`,
      `> Extração de PDF concluída com 98% de precisão.`,
      `> Skills identificadas: [React, IA, Node.js, Graph Databases].`,
      `> Calculando maturidade acadêmica com base no contexto...`,
      `> Maturidade definida como 7.5 (Intermediário Avançado).`,
      `> EligibilityCalculator cruzando dados com 45 editais ativos...`,
      `> 12 matches de alta afinidade (>85%) detectados.`,
      `> Criando arestas ELIGIBLE_FOR e SIMILAR_TO no grafo...`,
      `> Sincronização de comunidades completa.`,
      `> Ecossistema pronto para visualização.`
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs(prev => [...prev, logMessages[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => setShowFinish(true), 1000);
      }
    }, 800);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => {
      clearInterval(logInterval);
      clearInterval(stepInterval);
    };
  }, [userName]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10">
        
        {/* Left Side: Visual Progress */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-teal-400"
            >
              <Zap className="w-6 h-6 fill-teal-400" />
              <span className="text-sm font-bold tracking-widest uppercase">Processamento Ativo</span>
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              A Inteligência <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">ARIANO</span> está processando seu perfil.
            </h1>
          </div>

          <div className="space-y-4">
            {AGENT_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;

              return (
                <div key={step.id} className="flex items-center gap-4 relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                    isActive ? `bg-gray-900 border-${step.color.split('-')[1]}-500 shadow-lg shadow-${step.color.split('-')[1]}-500/20 scale-110` : 
                    isDone ? 'bg-teal-500/10 border-teal-500/30' : 'bg-gray-900/50 border-gray-800'
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? step.color : isDone ? 'text-teal-500' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-colors duration-500 ${isActive ? 'text-white' : isDone ? 'text-teal-500' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.2 }}
                        className="h-0.5 bg-gradient-to-r from-teal-500 to-transparent mt-1" 
                      />
                    )}
                  </div>
                  {isDone && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-teal-500" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Terminal Log */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl blur-xl transition-opacity animate-pulse" />
          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl h-[400px] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-400">ariano-cognition-logs.sh</span>
              <div className="flex gap-1.5 ml-auto">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500/50" />
              </div>
            </div>
            <div className="p-4 font-mono text-sm overflow-y-auto space-y-2 scrollbar-hide flex flex-col-reverse h-full">
              <div className="flex flex-col-reverse">
                {[...logs].reverse().map((log, i) => (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={`${log.startsWith('>') ? 'text-teal-500' : 'text-gray-400'} leading-relaxed`}
                  >
                    {log}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFinish && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 z-20"
          >
            <button
              onClick={onComplete}
              className="group relative px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/20 transition-all hover:scale-105 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              Explorar Meu Ecossistema
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
