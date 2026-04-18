import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap } from 'lucide-react';

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
  return (
    <div className="grid gap-4 mt-6 w-full">
      {matches.map((match, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-4 flex flex-col gap-3 card-glass"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-bold text-lg">{match.title}</h4>
              <p className="text-xs text-gray-400 capitalize">{match.instituicao}</p>
            </div>
            <div className="flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-full">
              <Award className="w-3 h-3 text-teal-400" />
              <span className="text-teal-400 text-xs font-bold">{match.score}% Score</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${match.score}%` }} 
              transition={{ duration: 1.5, delay: i * 0.2 + 0.3, ease: 'easeOut' }}
              className="bg-gradient-to-r from-teal-500 to-sky-400 h-1.5 rounded-full"
            />
          </div>
          
          <div className="flex items-start gap-2 bg-gray-950/50 p-3 rounded-lg mt-2 border border-gray-800/50">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 italic leading-relaxed">{match.justification}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
