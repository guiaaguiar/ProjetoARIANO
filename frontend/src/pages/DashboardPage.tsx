import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, BookOpenText, FileText,
  Sparkles, Network, TrendingUp, Zap,
} from 'lucide-react';
import type { DashboardStats } from '../types';
import { getStats } from '../lib/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Estudantes', value: stats.total_students, icon: GraduationCap, color: '#2dd4bf' },
    { label: 'Pesquisadores', value: stats.total_researchers, icon: Users, color: '#34d399' },
    { label: 'Professores', value: stats.total_professors, icon: BookOpenText, color: '#fbbf24' },
    { label: 'Editais', value: stats.total_editais, icon: FileText, color: '#38bdf8' },
    { label: 'Skills', value: stats.total_skills, icon: Sparkles, color: '#a78bfa' },
    { label: 'Áreas', value: stats.total_areas, icon: Network, color: '#818cf8' },
    { label: 'Matches', value: stats.total_matches, icon: Zap, color: '#2dd4bf' },
    { label: 'Score Médio', value: stats.avg_match_score > 0 ? (stats.avg_match_score * 100).toFixed(0) + '%' : '—', icon: TrendingUp, color: '#34d399' },
  ] : [];

  return (
    <div className="container-fluid py-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="page-header"
      >
        <motion.h1 variants={item}>Dashboard</motion.h1>
        <motion.p variants={item}>Visão geral do ecossistema ARIANO</motion.p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} variants={item} className="kpi-card">
              <div className="h-16 skeleton" />
            </motion.div>
          ))
        ) : (
          kpis.map((kpi) => (
            <motion.div key={kpi.label} variants={item} className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-muted text-xs lg:text-sm font-medium">{kpi.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-text-primary">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
                >
                  <kpi.icon className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Info Banner */}
      <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-4 lg:p-6"
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center pulse-neon">
              <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-text-primary flex items-center gap-2">
                Motor de Matchmaking Inteligente
                {stats?.graph_mode && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400">
                    {stats.graph_mode}
                  </span>
                )}
              </h2>
              <p className="text-text-secondary text-xs lg:text-sm mt-0.5">
                Conectando Academia e Governo através de grafos de conhecimento.
                Agentes IA configuram o grafo — match = query O(1) sobre adjacência.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
