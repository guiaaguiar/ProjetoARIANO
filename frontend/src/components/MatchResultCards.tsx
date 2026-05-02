import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Bot, ArrowRight, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MatchData {
  title: string;
  instituicao: string;
  score: number;
  justification: string;
}

interface MatchResultCardsProps {
  matches: MatchData[];
}

export const MatchResultCards: React.FC<MatchResultCardsProps> = ({ matches }) => {
  const navigate = useNavigate();

  if (!matches || matches.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/30 backdrop-blur-xl rounded-[2rem] p-12 border border-dashed border-border flex flex-col items-center text-center max-w-2xl mx-auto"
      >
        <div className="p-4 rounded-3xl bg-primary/10 mb-6">
          <Bot className="w-10 h-10 text-primary opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">Seu perfil é singular no ecossistema</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
          Nossa inteligência está processando as fronteiras do ecossistema. Assim que editais estratégicos convergirem com sua trajetória, você será notificado.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 w-full">
      {matches.map((match, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => navigate('/user/ecossistema')}
          className="bg-card/40 backdrop-blur-xl border border-border rounded-[2rem] p-6 flex flex-col gap-4 group cursor-pointer hover:border-primary/40 transition-all duration-500 overflow-hidden relative"
        >
          {/* Subtle background glow on hover */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.15em] text-[10px] mb-1">
                <Target className="w-3 h-3" /> Oportunidade Identificada
              </div>
              <h4 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{match.title}</h4>
              <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{match.instituicao}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(dot => (
                    <div key={dot} className={`w-1 h-1 rounded-full ${match.score > 80 ? 'bg-primary' : 'bg-warning'} animate-pulse`} style={{ animationDelay: `${dot * 200}ms` }} />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Reliability: High</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-[12px] font-black uppercase tracking-tighter">{match.score}% Score</span>
              </div>
              <div className="p-2 rounded-full bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="w-full bg-muted/30 rounded-full h-1 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${match.score}%` }} 
              transition={{ duration: 1.5, delay: i * 0.1 + 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"
            />
          </div>
          
          <div className="flex items-start gap-3 bg-muted/20 p-4 rounded-2xl border border-border/40 relative z-10 group-hover:bg-muted/40 transition-colors">
            <div className="mt-1 p-1 rounded-md bg-warning/10 text-warning">
              <Sparkles className="w-3 h-3" />
            </div>
            <p className="text-[13px] text-foreground leading-relaxed italic opacity-80">
              "{match.justification}"
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
