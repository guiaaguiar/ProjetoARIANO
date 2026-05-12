import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmptyNodeRadarProps {
  userName?: string;
  size?: number;
}

interface Blip {
  id: number;
  x: number;
  y: number;
  size: number;
}

const RADAR_COLOR = '#2dd4bf'; // teal-400
const RADAR_GLOW = 'rgba(45, 212, 191, 0.4)';

export const EmptyNodeRadar: React.FC<EmptyNodeRadarProps> = ({ size = 480 }) => {
  const [blips, setBlips] = useState<Blip[]>([]);

  // Random blip generator
  useEffect(() => {
    const interval = setInterval(() => {
      // Spawn 1 to 2 blips randomly
      const newBlipsCount = Math.floor(Math.random() * 2) + 1;
      const newBlips: Blip[] = [];
      
      for (let i = 0; i < newBlipsCount; i++) {
        // Random angle and radius (keep away from center and absolute edge)
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40 + Math.random() * ((size / 2) - 80);
        
        newBlips.push({
          id: Date.now() + i,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 6 + Math.random() * 6 // 6px to 12px
        });
      }

      setBlips(prev => {
        // Keep max 6 blips at a time
        const combined = [...prev, ...newBlips];
        return combined.slice(-6);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [size]);

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
        
        {/* Radar Tick Marks (Optional detailing on the outer ring) */}
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

        {/* Central Node */}
        <div
          className="absolute rounded-full flex items-center justify-center z-20"
          style={{
            width: 14,
            height: 14,
            background: RADAR_COLOR,
            boxShadow: `0 0 20px ${RADAR_COLOR}, 0 0 40px ${RADAR_COLOR}`,
          }}
        >
          {/* Pulsing inner ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${RADAR_COLOR}` }}
            animate={{ scale: [1, 3, 5], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        </div>

        {/* Random Blips */}
        <AnimatePresence>
          {blips.map((blip) => (
            <motion.div
              key={blip.id}
              className="absolute rounded-full z-10"
              style={{
                width: blip.size,
                height: blip.size,
                marginLeft: -(blip.size / 2),
                marginTop: -(blip.size / 2),
                left: '50%',
                top: '50%',
                background: RADAR_COLOR,
                boxShadow: `0 0 12px ${RADAR_COLOR}, 0 0 20px rgba(45, 212, 191, 0.6)`,
              }}
              initial={{ x: blip.x, y: blip.y, scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 4, 
                ease: "easeOut",
                opacity: { duration: 3, times: [0, 0.2, 1] } 
              }}
            >
              {/* Blip local ping */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${RADAR_COLOR}` }}
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
