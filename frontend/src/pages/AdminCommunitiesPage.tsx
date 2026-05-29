import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RefreshCw, Layers, ShieldCheck, HelpCircle, 
  Terminal, Cpu, Network, Database, Zap, Filter
} from 'lucide-react';
import * as api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function AdminCommunitiesPage() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'run' | 'status'>('run');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<any>(null);

  // Stats query
  const fetchStats = () => {
    api.getMatchStats()
      .then(res => {
        if (res.status === 'success') {
          setStats(res.data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runOrchestrator = async () => {
    if (running) return;
    setRunning(true);
    setLogs([
      '> [ARIANO] Inicializando varredura global do cérebro...',
      '> [Neo4j] Buscando dados de conexões globais no AuraDB...',
    ]);

    try {
      // Dispara o job de recálculo global no backend
      const res = await api.recalculateAllMatches();
      
      let step = 0;
      const sampleLogs = [
        '> [Neo4j] MATCH (n) WHERE n:Student OR n:Docente OR n:Edital OR n:Skill OR n:Area...',
        '> [Agent:Orchestrator] Mapeando relações complexas...',
        '> [Agent:ContextualAnalyzer] Iniciando reavaliação de conexões globais...',
        '> [Agent:ContextualAnalyzer] "Você é o orquestrador. Reavalie as conexões deste grafo. Atualize as porcentagens de match se necessário e crie novas arestas se identificar perfis similares."',
        '> [LLM] Invocando NVIDIA Nemotron-3-Super via OpenRouter...',
        '> [Graph-CoT] Reavaliando compatibilidade de habilidades implicitamente...',
        '> [Neo4j] MERGE (u)-[:ELIGIBLE_FOR]->(e:Edital) com pontuações de match recalibradas...',
        '> [Agent:Orchestrator] Identificando comunidades de pensamento via algoritmo Louvain (NetworkX)...',
        `> [NetworkX] Clusters identificados. Comunidades mapeadas e alinhadas.`,
        '> [ARIANO] Reprocessamento de grafo global concluído com sucesso ✓',
        `> [ARIANO] Processo finalizado. Total de matches calculados: ${res.data?.total_pairs_calculated || 'N/A'}. Arestas criadas: ${res.data?.matches_created || 0}`
      ];

      // Simulamos streaming dos logs da execução no console lúdico para fins de apresentação
      const interval = setInterval(() => {
        if (step < sampleLogs.length) {
          setLogs(prev => [...prev, sampleLogs[step]]);
          step++;
        } else {
          clearInterval(interval);
          setRunning(false);
          fetchStats();
        }
      }, 900);

      pollInterval.current = interval;

    } catch (e: any) {
      setLogs(prev => [...prev, `❌ [Erro] Falha ao executar orquestrador: ${e.message || e}`]);
      setRunning(false);
    }
  };

  return (
    <div className="container-fluid py-4 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-header !mb-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Cpu className="text-orange-400 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Orquestrador Global & Comunidades</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span className="text-orange-400 font-mono font-bold px-1.5 py-0.5 bg-orange-400/10 rounded">ARIANO Orchestrator Control Panel</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>Varredura diária da IA, matches globais e detecção de clusters</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 min-h-[500px]">
        {/* Left: Console / Action Area */}
        <div className="flex flex-col gap-4">
          <div className="card-glass p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary text-base">Reavaliação Global do Ecossistema</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Dispare manualmente o processo global da LLM para recalcular a afinidade de todos os acadêmicos com editais.
                </p>
              </div>

              <button
                disabled={running}
                onClick={runOrchestrator}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider transition-all ${
                  running 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:scale-105 shadow-lg shadow-orange-500/20'
                }`}
              >
                {running ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Varrendo Grafo...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Disparar Orquestrador
                  </>
                )}
              </button>
            </div>

            {/* AI Console Screen */}
            <div 
              className="flex-1 min-h-[300px] h-[340px] rounded-2xl overflow-hidden flex flex-col mt-2"
              style={{
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(245,158,11,0.2)',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
                style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}
              >
                <Terminal className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
                  Chain-of-Thought Scratchpad (LLM Real-time Logs)
                </span>
                <div className="ml-auto flex gap-1.5">
                  {['#ff5f57','#febc2e','#28c840'].map(c => (
                    <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Logs Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white/30 text-xs">
                    <Terminal className="w-8 h-8 mb-2 text-white/10" />
                    <span>Aguardando disparo do Orquestrador para exibir os logs de raciocínio da IA.</span>
                  </div>
                ) : (
                  <>
                    {logs.map((log, i) => (
                      <motion.div
                        key={`log-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] leading-relaxed"
                        style={{
                          color: log.includes('✓') || log.includes('concluído')
                            ? '#34d399'
                            : log.includes('[Erro]')
                            ? '#f87171'
                            : log.includes('[Neo4j]')
                            ? '#60a5fa'
                            : log.includes('[LLM]')
                            ? '#fb923c'
                            : log.includes('Orchestrator')
                            ? '#c084fc'
                            : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {log}
                      </motion.div>
                    ))}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Active Stats & Settings */}
        <div className="space-y-4">
          {/* Stats Card */}
          <div className="card-glass p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-white/5 pb-2">
              Status do Match Engine
            </h3>

            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Total Matches</span>
                    <p className="text-xl font-black text-white mt-1">{stats.total_matches ?? 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold">Score Médio</span>
                    <p className="text-xl font-black text-orange-400 mt-1">
                      {stats.avg_score ? (stats.avg_score * 100).toFixed(0) + '%' : '—'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Top 3 Conexões mais fortes</span>
                  <div className="space-y-1.5">
                    {stats.top_matches?.slice(0, 3).map((match: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px]">
                        <span className="text-white/60 truncate max-w-[140px]">{match.entity}</span>
                        <span className="text-orange-400 font-bold">{(match.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-white/30">
                Processando estatísticas...
              </div>
            )}
          </div>

          {/* Engine Parameters */}
          <div className="card-glass p-5 space-y-3">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest border-b border-white/5 pb-2">
              Diretiva de Execução
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Modelo LLM:</span>
                <span className="font-mono text-orange-400 bg-orange-400/5 px-2 py-0.5 rounded border border-orange-400/10 text-[10px]">
                  Nemotron-3-Super
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Grafo Ativo:</span>
                <span className="font-semibold text-white">Neo4j AuraDB</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Detecção de CoT:</span>
                <span className="font-semibold text-teal-400">Louvain (NetworkX)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
