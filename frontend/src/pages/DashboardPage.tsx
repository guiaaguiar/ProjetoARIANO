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
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {
        // If backend is not running, show mock data
        setStats({
          total_students: 5, total_researchers: 5, total_professors: 5,
          total_editais: 8, total_skills: 20, total_areas: 8,
          total_matches: 0, avg_match_score: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Estudantes', value: stats.total_students, icon: GraduationCap, color: '#06b6d4' },
    { label: 'Pesquisadores', value: stats.total_researchers, icon: Users, color: '#10b981' },
    { label: 'Professores', value: stats.total_professors, icon: BookOpenText, color: '#f59e0b' },
    { label: 'Editais', value: stats.total_editais, icon: FileText, color: '#0ea5e9' },
    { label: 'Skills', value: stats.total_skills, icon: Sparkles, color: '#8b5cf6' },
    { label: 'Áreas', value: stats.total_areas, icon: Network, color: '#6366f1' },
    { label: 'Matches', value: stats.total_matches, icon: Zap, color: '#0ea5e9' },
    { label: 'Score Médio', value: stats.avg_match_score.toFixed(2), icon: TrendingUp, color: '#10b981' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-text-primary"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary mt-1"
        >
          Visão geral do ecossistema ARIANO
        </motion.p>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} variants={item} className="kpi-card animate-pulse">
              <div className="h-20 bg-surface-hover rounded-lg" />
            </motion.div>
          ))
        ) : (
          kpis.map((kpi) => (
            <motion.div key={kpi.label} variants={item} className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-muted text-sm font-medium">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-2 text-text-primary">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
                >
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-glass p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center pulse-neon">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Motor de Matchmaking Inteligente
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Conectando Academia e Governo através de grafos de conhecimento.
              Os agentes de IA configuram o grafo — o match é uma query O(1) sobre adjacência.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

