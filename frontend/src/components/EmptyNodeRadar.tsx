import React from 'react';
import { motion } from 'framer-motion';

interface EmptyNodeRadarProps {
  userName: string;
  size?: number;
}

export const EmptyNodeRadar: React.FC<EmptyNodeRadarProps> = ({ userName, size = 64 }) => {
  const firstName = userName.split(' ')[0];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Radar container */}
      <div className="relative flex items-center justify-center" style={{ width: size * 4, height: size * 4 }}>
        {/* Radar waves */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-teal-400/40"
            style={{ width: size, height: size }}
            animate={{
              scale: [1, 3.5, 4],
              opacity: [0.55, 0.1, 0],
            }}
            transition={{
              duration: 2.4,
              delay: i * 0.7,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Main empty node circle */}
        <motion.div
          className="relative rounded-full border-2 border-teal-400 flex items-center justify-center"
          style={{ width: size, height: size }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Inner glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-full bg-teal-400/10"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center dot */}
          <motion.div
            className="w-3 h-3 rounded-full bg-teal-400"
            animate={{
              scale: [1, 1.4, 1],
              boxShadow: [
                '0 0 8px rgba(45,212,191,0.6)',
                '0 0 20px rgba(45,212,191,0.9)',
                '0 0 8px rgba(45,212,191,0.6)',
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* User name label */}
      <motion.p
        className="text-teal-400 font-mono font-bold text-sm tracking-widest uppercase"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {firstName}
      </motion.p>
    </div>
  );
};
