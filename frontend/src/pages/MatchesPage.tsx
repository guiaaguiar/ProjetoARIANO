import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import type { Match } from '../types';
import * as api from '../lib/api';
import { NODE_COLORS, NODE_LABELS } from '../types';
import { MOCK_MATCHES } from '../lib/mockData';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    api.getMatches(undefined, threshold)
      .then(setMatches)
      .catch(() => setMatches(MOCK_MATCHES.filter(m => m.score >= threshold)))
      .finally(() => setLoading(false));
  }, [threshold]);

  const filteredMatches = matches.filter(m => m.score >= threshold);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-2xl lg:text-3xl font-bold text-text-primary">
            Matches
          </motion.h1>
          <p className="text-text-secondary text-sm mt-1.5">
            {filteredMatches.length} matches encontrados via arestas ELIGIBLE_FOR
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface rounded-lg border border-border" style={{ padding: '4px' }}>
          <label className="text-xs text-text-secondary whitespace-nowrap">Score mínimo:</label>
          <input type="range" min={0} max={100} value={threshold * 100}
            onChange={e => setThreshold(Number(e.target.value) / 100)}
            className="w-32 sm:w-48 accent-accent" />
          <span className="text-accent font-mono text-sm w-10 text-right">{(threshold * 100).toFixed(0)}%</span>
        </div>
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              <div className="card-glass animate-pulse" style={{ padding: '4px' }}>
                <div className="h-20 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-glass text-center" style={{ padding: '4px' }}
          >
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 pulse-neon">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhum match neste threshold</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Reduza o score mínimo ou aguarde os agentes IA processarem mais perfis.
            </p>
          </motion.div>
        </div>
      ) : (
        <div>
          {filteredMatches.map((match, i) => {
            const entityColor = NODE_COLORS[match.entity_type as keyof typeof NODE_COLORS] || '#64748b';
            const scorePercent = (match.score * 100).toFixed(0);
            const scoreColor = Number(scorePercent) >= 90 ? '#10b981' : Number(scorePercent) >= 80 ? '#0ea5e9' : Number(scorePercent) >= 70 ? '#f59e0b' : '#ef4444';
            return (
              <div key={`${match.entity_uid}-${match.edital_uid}`} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-glass" style={{ padding: '4px' }}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                    {/* Entity */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${entityColor}20`, color: entityColor }}>
                        {match.entity_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="badge text-[10px]"
                            style={{ backgroundColor: `${entityColor}15`, borderColor: `${entityColor}30`, color: entityColor }}>
                            {NODE_LABELS[match.entity_type as keyof typeof NODE_LABELS] || match.entity_type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-text-primary text-sm truncate">{match.entity_name}</h3>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2">
                      <div className="h-px w-6 bg-gradient-to-r from-transparent to-accent/50" />
                      <ArrowRight className="w-4 h-4 text-accent/70" />
                      <div className="h-px w-6 bg-gradient-to-r from-accent/50 to-transparent" />
                    </div>

                    {/* Edital */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 lg:justify-end">
                      <div className="min-w-0 lg:text-right">
                        <span className="badge text-[10px]"
                          style={{ backgroundColor: `${NODE_COLORS.edital}15`, borderColor: `${NODE_COLORS.edital}30`, color: NODE_COLORS.edital }}>
                          Edital
                        </span>
                        <h3 className="font-semibold text-text-primary text-sm truncate">{match.edital_title}</h3>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3 lg:ml-3">
                      <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                        style={{ backgroundColor: `${scoreColor}10`, border: `1px solid ${scoreColor}30` }}>
                        <span className="text-xl font-bold" style={{ color: scoreColor }}>{scorePercent}</span>
                        <span className="text-[9px] text-text-muted uppercase">Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Justification + Skills */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {match.justification && (
                      <p className="text-text-secondary text-xs mb-2 italic">"{match.justification}"</p>
                    )}
                    <div className="flex flex-wrap gap-1">
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
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
