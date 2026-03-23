import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import type { Match } from '../types';
import * as api from '../lib/api';
import { NODE_COLORS, NODE_LABELS } from '../types';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    api.getMatches(undefined, threshold)
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [threshold]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-text-primary">
            Matches
          </motion.h1>
          <p className="text-text-secondary mt-1">
            Matches calculados via Cypher sobre arestas ELIGIBLE_FOR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary">Score mínimo:</label>
          <input type="range" min={0} max={100} value={threshold * 100}
            onChange={e => setThreshold(Number(e.target.value) / 100)}
            className="w-32 accent-accent" />
          <span className="text-accent font-mono text-sm w-12">{(threshold * 100).toFixed(0)}%</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-glass p-5 animate-pulse">
              <div className="h-24 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-glass p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 pulse-neon">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhum match encontrado</h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Os agentes de IA precisam processar os perfis e editais para criar as arestas ELIGIBLE_FOR no grafo.
            Execute o EligibilityCalculator para gerar os matches.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, i) => {
            const entityColor = NODE_COLORS[match.entity_type as keyof typeof NODE_COLORS] || '#64748b';
            const scorePercent = (match.score * 100).toFixed(0);
            return (
              <motion.div
                key={`${match.entity_uid}-${match.edital_uid}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-glass p-5"
              >
                <div className="flex items-center gap-4">
                  {/* Entity */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge text-[11px]"
                        style={{ backgroundColor: `${entityColor}15`, borderColor: `${entityColor}30`, color: entityColor }}>
                        {NODE_LABELS[match.entity_type as keyof typeof NODE_LABELS] || match.entity_type}
                      </span>
                      <h3 className="font-semibold text-text-primary text-sm">{match.entity_name}</h3>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 px-4">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
                    <ArrowRight className="w-4 h-4 text-accent" />
                    <div className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
                  </div>

                  {/* Edital */}
                  <div className="flex-1 text-right">
                    <span className="badge text-[11px] mb-1"
                      style={{ backgroundColor: `${NODE_COLORS.edital}15`, borderColor: `${NODE_COLORS.edital}30`, color: NODE_COLORS.edital }}>
                      Edital
                    </span>
                    <h3 className="font-semibold text-text-primary text-sm">{match.edital_title}</h3>
                  </div>

                  {/* Score */}
                  <div className="w-20 text-center">
                    <div className="text-2xl font-bold" style={{ color: Number(scorePercent) >= 70 ? '#10b981' : Number(scorePercent) >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {scorePercent}%
                    </div>
                    <p className="text-[10px] text-text-muted uppercase">Score</p>
                  </div>
                </div>

                {/* Skills/Areas */}
                {(match.matched_skills.length > 0 || match.matched_areas.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                    {match.matched_skills.map(sk => (
                      <span key={sk} className="badge text-[10px]"
                        style={{ backgroundColor: `${NODE_COLORS.skill}15`, borderColor: `${NODE_COLORS.skill}30`, color: NODE_COLORS.skill }}>
                        {sk}
                      </span>
                    ))}
                    {match.matched_areas.map(a => (
                      <span key={a} className="badge text-[10px]"
                        style={{ backgroundColor: `${NODE_COLORS.area}15`, borderColor: `${NODE_COLORS.area}30`, color: NODE_COLORS.area }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

