import React from 'react';
import { motion } from 'framer-motion';

interface EmptyNodeRadarProps {
  userName?: string;
  size?: number;
}

const RADAR_COLOR = '#2dd4bf'; // teal-400

export const EmptyNodeRadar: React.FC<EmptyNodeRadarProps> = ({ size = 480 }) => {
  return (
    <div className="flex flex-col items-center justify-center select-none w-full max-w-3xl mx-auto py-10 overflow-hidden">
      {/* ── Radar Container ── */}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ 
          width: size, 
          height: size,
          background: 'rgba(11, 16, 26, 0.3)',
          border: `2px solid rgba(45, 212, 191, 0.2)`,
          boxShadow: `0 0 40px rgba(45, 212, 191, 0.05), inset 0 0 60px rgba(45, 212, 191, 0.1)`
        }}
      >
        {/* Concentric Rings */}
        {[0.2, 0.4, 0.6, 0.8].map((scale, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size * scale,
              height: size * scale,
              border: `1px solid rgba(45, 212, 191, ${0.15 - (i * 0.02)})`,
            }}
          />
        ))}

        {/* Crosshairs */}
        <div className="absolute w-full h-[1px]" style={{ background: 'rgba(45, 212, 191, 0.15)' }} />
        <div className="absolute h-full w-[1px]" style={{ background: 'rgba(45, 212, 191, 0.15)' }} />
        
        {/* Radar Tick Marks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={`tick-${i}`}
            className="absolute h-full w-[2px] pointer-events-none"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className="w-full h-2" style={{ background: 'rgba(45, 212, 191, 0.4)' }} />
          </div>
        ))}

        {/* Scanning Cone */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(45, 212, 191, 0.05) 300deg, rgba(45, 212, 191, 0.25) 355deg, rgba(45, 212, 191, 0.8) 360deg)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
           {/* The solid leading line of the sweep */}
           <div 
             className="absolute top-0 left-1/2 w-[2px] h-1/2 origin-bottom" 
             style={{ 
               background: RADAR_COLOR,
               boxShadow: `0 0 10px ${RADAR_COLOR}, 0 0 20px ${RADAR_COLOR}`,
             }}
           />
        </motion.div>

        {/* Central Node (Clean) */}
        <div
          className="absolute rounded-full flex items-center justify-center z-20"
          style={{
            width: 14,
            height: 14,
            background: RADAR_COLOR,
            boxShadow: `0 0 20px ${RADAR_COLOR}, 0 0 40px ${RADAR_COLOR}`,
          }}
        />
      </div>
    </div>
  );
};
