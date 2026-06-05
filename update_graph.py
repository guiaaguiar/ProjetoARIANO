import re

with open('frontend/src/pages/Landing.tsx', 'r') as f:
    content = f.read()

old_block = """            <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>

              {/* SVG: linhas diagonais do centro para os 4 cantos (layout X) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
              >
                {ECOSYSTEM_ITEMS.map((item, i) => {
                  const isActive = activeNode === i;
                  // Coords dos cantos em viewBox 0-100
                  const corners = [
                    { x: 12, y: 12 }, // top-left  (nó 0)
                    { x: 88, y: 12 }, // top-right (nó 1)
                    { x: 12, y: 88 }, // bot-left  (nó 2)
                    { x: 88, y: 88 }, // bot-right (nó 3)
                  ];
                  if (i === 4) return null;
                  const c = corners[i];
                  return (
                    <line
                      key={i}
                      x1="50" y1="50"
                      x2={c.x} y2={c.y}
                      stroke={isActive ? item.accent : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)")}
                      strokeWidth={isActive ? 0.6 : 0.35}
                      strokeDasharray={isActive ? "0" : "2 2"}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 3px ${item.accent})` : "none",
                        transition: "stroke 0.3s, stroke-width 0.3s, filter 0.3s",
                        vectorEffect: "non-scaling-stroke",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Nós centrais e periféricos */}
              
              {ECOSYSTEM_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeNode === i;
                const isCenter = i === 4;

                return (
                  <div
                    key={i}
                    className="absolute z-20 cursor-pointer"
                    style={item.nodePos as any}
                    onClick={() => setActiveNode(i)}
                  >
                    <motion.div
                      animate={{ 
                        scale: isActive ? 1.15 : 1,
                        y: [0, -8, 0] 
                      } as any}
                      transition={{ 
                        scale: { duration: 0.25 },
                        y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: i * 0.2 } 
                      } as any}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isCenter ? "w-16 h-16" : "w-14 h-14"
                        } bg-gradient-to-br from-white to-slate-200 dark:from-slate-700 dark:to-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.1),_inset_0_-3px_5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.5),_inset_0_-3px_5px_rgba(0,0,0,0.5)]`}
                        style={{
                          border: `2px solid ${isActive ? item.accent : (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)")}`,
                          boxShadow: isActive
                            ? `0 0 20px ${item.accent}55, inset 0 -3px 5px rgba(0,0,0,0.1)`
                            : undefined,
                        }}
                      >
                        <Icon
                          className={`${isCenter ? "w-7 h-7" : "w-6 h-6"} text-white`}
                          style={{
                            color: isActive ? item.accent : "#ffffff",
                            filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none",
                          }}
                        />
                      </div>
                      {!isCenter && (
                        <span
                          className={`mt-3 text-[11px] text-slate-800 dark:text-slate-300 font-medium tracking-wide transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          }`}
                          style={
                            isActive 
                              ? { color: item.accent, textShadow: `0 0 12px ${item.accent}90` }
                              : undefined
                          }
                        >
                          {item.label}
                        </span>
                      )}
                      {isCenter && (
                        <p className="text-[10px] text-white text-center mt-1 font-mono uppercase tracking-wider font-bold">ARIANO</p>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>"""

new_block = """            <div className="relative w-full aspect-square" style={{ perspective: "1200px" }}>
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  transformStyle: "preserve-3d", 
                  transform: "rotateX(60deg) rotateZ(45deg)" 
                }}
              >
                {/* SVG: linhas diagonais do centro para os 4 cantos (layout X) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  {ECOSYSTEM_ITEMS.map((item, i) => {
                    const isActive = activeNode === i;
                    // Coords dos cantos em viewBox 0-100
                    const corners = [
                      { x: 12, y: 12 }, // top-left  (nó 0)
                      { x: 88, y: 12 }, // top-right (nó 1)
                      { x: 12, y: 88 }, // bot-left  (nó 2)
                      { x: 88, y: 88 }, // bot-right (nó 3)
                    ];
                    if (i === 4) return null;
                    const c = corners[i];
                    return (
                      <line
                        key={i}
                        x1="50" y1="50"
                        x2={c.x} y2={c.y}
                        stroke={isActive ? item.accent : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)")}
                        strokeWidth={isActive ? 0.6 : 0.35}
                        strokeDasharray={isActive ? "0" : "2 2"}
                        style={{
                          filter: isActive ? `drop-shadow(0 0 3px ${item.accent})` : "none",
                          transition: "stroke 0.3s, stroke-width 0.3s, filter 0.3s",
                          vectorEffect: "non-scaling-stroke",
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Nós centrais e periféricos */}
                {ECOSYSTEM_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = activeNode === i;
                  const isCenter = i === 4;

                  return (
                    <div
                      key={i}
                      className="absolute z-20 cursor-pointer"
                      style={{ 
                        ...item.nodePos,
                        transformStyle: "preserve-3d" 
                      } as any}
                      onClick={() => setActiveNode(i)}
                    >
                      {/* A Base (Fica no chão isométrico) */}
                      <div 
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-md shadow-lg border transition-all duration-500 ${isCenter ? 'w-20 h-20' : 'w-16 h-16'} bg-white/10 dark:bg-black/20 border-white/20`}
                        style={{ 
                          boxShadow: isActive ? `0 0 40px ${item.accent}80, inset 0 0 20px ${item.accent}40` : undefined,
                        }} 
                      />

                      {/* O Objeto Flutuante (Fica de pé com contra-rotação) */}
                      <div
                        className="absolute top-1/2 left-1/2 flex flex-col items-center gap-2"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: `translate(-50%, -50%) rotateZ(-45deg) rotateX(-60deg) translateY(${isActive ? '-64px' : '-40px'}) scale(${isActive ? 1.15 : 1})`,
                          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}
                      >
                        <div
                          className={`relative rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCenter ? "w-16 h-16" : "w-14 h-14"
                          } bg-gradient-to-br from-white to-slate-200 dark:from-slate-700 dark:to-slate-900`}
                          style={{
                            border: `2px solid ${isActive ? item.accent : (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)")}`,
                            boxShadow: isActive
                              ? `0 15px 0 ${item.accent}30, 0 25px 40px ${item.accent}40`
                              : `0 10px 0 rgba(255,255,255,0.15), 0 15px 20px rgba(0,0,0,0.15)`,
                          }}
                        >
                          <Icon
                            className={`${isCenter ? "w-7 h-7" : "w-6 h-6"} text-white`}
                            style={{
                              color: isActive ? item.accent : "#ffffff",
                              filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none",
                            }}
                          />
                        </div>
                        
                        {!isCenter && (
                          <span
                            className={`mt-2 text-[11px] text-slate-800 dark:text-slate-300 font-medium tracking-wide transition-all duration-300 ${
                              isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                            }`}
                            style={
                              isActive 
                                ? { color: item.accent, textShadow: `0 0 12px ${item.accent}90` }
                                : undefined
                            }
                          >
                            {item.label}
                          </span>
                        )}
                        {isCenter && (
                          <p className="text-[10px] text-slate-800 dark:text-white text-center mt-1 font-mono uppercase tracking-wider font-bold">ARIANO</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("WARNING: Could not find exactly old_block. Writing manually...")
    with open('graph_not_found.log', 'w') as f:
        f.write("Failed.")

with open('frontend/src/pages/Landing.tsx', 'w') as f:
    f.write(content)

