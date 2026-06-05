import re

with open("frontend/src/pages/Landing.tsx", "r") as f:
    content = f.read()

# 1. Update ECOSYSTEM_ITEMS
old_eco = """const ECOSYSTEM_ITEMS = [
  {
    icon: GitMerge,
    label: "Origem e História",
    title: "DNA Acadêmico e Governamental",
    description: "Nascido na UNINASSAU (Tópicos Integradores), o ARIANO é o motor de matchmaking oficial da plataforma CORETO, da Secretaria de Ciência, Tecnologia e Inovação do Recife (SECTI).",
    cta: "Conhecer a origem",
    link: "/cadastro",
    accent: "#22d3ee",
    // Canto superior-esquerdo
    nodePos: { top: "0%", left: "0%" },
  },
  {
    icon: Users,
    label: "Quádrupla Hélice",
    title: "Conectando a Quádrupla Hélice",
    description: "Nosso objetivo é eliminar silos de informação, conectando Donos de Problemas (Governo e Indústria) a Solucionadores (Academia e Startups) em um ecossistema vivo.",
    cta: "Ver o ecossistema",
    link: "/cadastro",
    accent: "#60a5fa",
    // Canto superior-direito
    nodePos: { top: "0%", right: "0%" },
  },
  {
    icon: Network,
    label: "Grafo de Conhecimento",
    title: "Cérebro em Grafo (Neo4j)",
    description: "Diferente de bancos SQL rígidos, utilizamos Grafos de Conhecimento e adjacência livre de índice para cruzar múltiplas dimensões de perfil e retornar matches instantâneos em tempo O(1).",
    cta: "Explorar o grafo",
    link: "/cadastro",
    accent: "#a78bfa",
    // Canto inferior-esquerdo
    nodePos: { bottom: "0%", left: "0%" },
  },
  {
    icon: Zap,
    label: "IA Precomputada",
    title: "Precomputed Relational Intelligence",
    description: "Nossa IA (NVIDIA Nemotron) não faz o match ao vivo. Ela age nos bastidores configurando o grafo via Graph-CoT, criando Comunidades de Pensamento para recomendações com precisão cirúrgica.",
    cta: "Entender a IA",
    link: "/cadastro",
    accent: "#34d399",
    // Canto inferior-direito
    nodePos: { bottom: "0%", right: "0%" },
  },
  {
    icon: Brain,
    label: "Cérebro do CORETO",
    title: "O Cérebro do CORETO",
    description: "O ARIANO é o núcleo de inteligência artificial que centraliza as conexões, processa as variáveis da quádrupla hélice e distribui insights estratégicos em tempo real para todo o ecossistema.",
    cta: "Ver a plataforma",
    link: "/cadastro",
    accent: "#f43f5e",
    // Centro
    nodePos: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  },
];"""

new_eco = """const ECOSYSTEM_ITEMS = [
  {
    id: "origem",
    icon: GitMerge,
    label: "Origem e História",
    title: "DNA Acadêmico e Governamental",
    description: "Nascido na UNINASSAU (Tópicos Integradores), o ARIANO é o motor de matchmaking oficial da plataforma CORETO, da Secretaria de Ciência, Tecnologia e Inovação do Recife (SECTI).",
    cta: "Conhecer a origem",
    link: "/cadastro",
    accent: "#22d3ee",
    nodePos: { top: "15%", left: "15%" },
  },
  {
    id: "quadrupla",
    icon: Users,
    label: "Quádrupla Hélice",
    title: "Conectando a Quádrupla Hélice",
    description: "Nosso objetivo é eliminar silos de informação, conectando Donos de Problemas (Governo e Indústria) a Solucionadores (Academia e Startups) em um ecossistema vivo.",
    cta: "Ver o ecossistema",
    link: "/cadastro",
    accent: "#60a5fa",
    nodePos: { top: "15%", left: "85%" },
  },
  {
    id: "grafo",
    icon: Network,
    label: "Grafo de Conhecimento",
    title: "Cérebro em Grafo (Neo4j)",
    description: "Diferente de bancos SQL rígidos, utilizamos Grafos de Conhecimento e adjacência livre de índice para cruzar múltiplas dimensões de perfil e retornar matches instantâneos em tempo O(1).",
    cta: "Explorar o grafo",
    link: "/cadastro",
    accent: "#a78bfa",
    nodePos: { top: "85%", left: "15%" },
  },
  {
    id: "ia",
    icon: Zap,
    label: "IA Precomputada",
    title: "Precomputed Relational Intelligence",
    description: "Nossa IA (NVIDIA Nemotron) não faz o match ao vivo. Ela age nos bastidores configurando o grafo via Graph-CoT, criando Comunidades de Pensamento para recomendações com precisão cirúrgica.",
    cta: "Entender a IA",
    link: "/cadastro",
    accent: "#34d399",
    nodePos: { top: "85%", left: "85%" },
  },
  {
    id: "ariano",
    icon: Brain,
    label: "Cérebro do CORETO",
    title: "O Cérebro do CORETO",
    description: "O ARIANO é o núcleo de inteligência artificial que centraliza as conexões, processa as variáveis da quádrupla hélice e distribui insights estratégicos em tempo real para todo o ecossistema.",
    cta: "Ver a plataforma",
    link: "/cadastro",
    accent: "#f43f5e",
    nodePos: { top: "50%", left: "50%" },
  },
];"""

content = content.replace(old_eco, new_eco)

# 2. Update state
old_state = "const [activeNode, setActiveNode] = useState<number>(4);"
new_state = "const [activeNode, setActiveNode] = useState<string>('ariano');"
content = content.replace(old_state, new_state)

# 3. Update displayedItem
old_disp = "const displayedItem = activeNode !== null ? ECOSYSTEM_ITEMS[activeNode] : ECOSYSTEM_ITEMS[0];"
new_disp = "const displayedItem = ECOSYSTEM_ITEMS.find(item => item.id === activeNode) || ECOSYSTEM_ITEMS[4];"
content = content.replace(old_disp, new_disp)

# 4. Update the Meus Matches window container
# The exact string from line 321 to 464 is a bit long, let's use regex for parts.
# Container principal
content = re.sub(
    r'className="relative z-10 rounded-t-xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl dark:bg-\[#1a1a1a\]/60 dark:border-white/10 dark:shadow-2xl"',
    r'className="relative z-10 rounded-t-xl overflow-hidden bg-white/70 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl"',
    content
)

# Header mock
content = re.sub(
    r'className="h-10 border-b flex items-center px-4 gap-2 bg-white/40 border-white/50 dark:bg-\[#060c14\]/40 dark:border-white/\[0\.06\]"',
    r'className="h-10 flex items-center px-4 gap-2"\n                style={{ background: isDark ? "#060c14" : "rgba(248,250,252,0.9)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)" }}',
    content
)

# Body mock (the flex min-h-[420px])
content = re.sub(
    r'<div className="flex min-h-\[420px\]">',
    r'<div className="flex min-h-[420px]" style={{ background: isDark ? "#0a0f18" : "rgba(255,255,255,0.8)" }}>',
    content
)

# Sidebar mock
content = re.sub(
    r'className="w-\[200px\] border-r p-3 flex flex-col gap-1 shrink-0 border-white/50 bg-white/40 dark:border-white/\[0\.06\] dark:bg-\[#0a0f18\]/40"',
    r'className="w-[200px] p-3 flex flex-col gap-1 shrink-0"\n                  style={{ borderRight: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)", background: isDark ? "#07111c" : "rgba(248,250,252,0.9)" }}',
    content
)

# Main content list
content = re.sub(
    r'className="flex-1 flex flex-col min-w-0"',
    r'className="flex-1 flex flex-col min-w-0" style={{ background: isDark ? "#0a0f18" : "rgba(255,255,255,0.7)" }}',
    content
)

# Main content header
content = re.sub(
    r'className="flex items-center gap-3 px-4 h-10 border-b border-slate-200 dark:border-white/\[0\.06\]"',
    r'className="flex items-center gap-3 px-4 h-10" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)" }}',
    content
)

# Main content list items
content = re.sub(
    r'className="relative flex items-center gap-4 px-4 h-9 border-b transition-colors cursor-pointer border-slate-200/50 hover:bg-slate-200/50 dark:border-white/\[0\.06\] dark:hover:bg-white/5"',
    r'className="relative flex items-center gap-4 px-4 h-9 transition-colors cursor-pointer hover:bg-slate-200/50 dark:hover:bg-white/5" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)" }}',
    content
)

content = re.sub(
    r'<span className="text-\[12px\] font-medium truncate text-slate-900 dark:text-white">\{row\.name\}</span>',
    r'<span className="text-[12px] font-medium truncate text-slate-700 dark:text-slate-300">{row.name}</span>',
    content
)

content = re.sub(
    r'<span className="text-\[12px\] truncate hidden sm:inline-block text-slate-400 dark:text-white/40">\{row\.area\}</span>',
    r'<span className="text-[12px] truncate hidden sm:inline-block text-slate-500 dark:text-slate-400">{row.area}</span>',
    content
)

content = re.sub(
    r'<span className="text-\[11px\] font-mono text-slate-400 dark:text-white/40">\{row\.score\}</span>',
    r'<span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{row.score}</span>',
    content
)

content = re.sub(
    r'<ArrowRight className="h-3 w-3 text-slate-400 dark:text-white/30" />',
    r'<ArrowRight className="h-3 w-3 text-slate-500 dark:text-slate-400" />',
    content
)

# Details panel
content = re.sub(
    r'className="w-\[280px\] border-l shrink-0 hidden lg:flex flex-col relative z-10 border-white/50 bg-white/40 dark:border-white/\[0\.06\] dark:bg-\[#0a0f18\]/40"',
    r'className="w-[280px] shrink-0 hidden lg:flex flex-col relative z-10"\n                  style={{ borderLeft: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)", background: isDark ? "#07111c" : "rgba(248,250,252,0.9)" }}',
    content
)

content = re.sub(
    r'className="flex items-center justify-between px-4 h-10 border-b border-slate-200 dark:border-white/\[0\.06\]"',
    r'className="flex items-center justify-between px-4 h-10" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)" }}',
    content
)

# 5. Fix Graph3D
old_graph_start = r'<div className="relative w-full aspect-square" style={{ perspective: "1200px" }}>'
old_graph_end = r'              </div>\n            </div>'
old_graph_regex = re.compile(old_graph_start + r'.*?' + old_graph_end, re.DOTALL)

new_graph = """<div className="relative w-full aspect-square perspective-[1500px]">
              <div className="absolute inset-0 transform rotate-x-[60deg] rotate-z-[45deg] preserve-3d">
                {/* SVG Lines connecting the nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible", transform: "translateZ(-1px)" }}>
                  {ECOSYSTEM_ITEMS.map((item, i) => {
                    if (item.id === "ariano") return null;
                    const isActive = activeNode === item.id;
                    const endX = parseInt(item.nodePos.left);
                    const endY = parseInt(item.nodePos.top);
                    return (
                      <line
                        key={item.id}
                        x1="50" y1="50"
                        x2={endX} y2={endY}
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

                {ECOSYSTEM_ITEMS.map((item) => {
                  const isActive = activeNode === item.id;
                  const Icon = item.icon;
                  const isCenter = item.id === "ariano";

                  return (
                    <button
                      key={item.id}
                      className="absolute z-20 group"
                      style={{ ...item.nodePos, transformStyle: "preserve-3d" } as any}
                      onClick={() => setActiveNode(item.id)}
                    >
                      {/* Base no chão */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${isCenter ? 'w-20 h-20' : 'w-16 h-16'} ${isActive ? 'bg-white/20 dark:bg-black/40 scale-110' : 'bg-white/10 dark:bg-black/20 group-hover:scale-105'} ${isDark ? 'border-white/20' : 'border-slate-300'}`}
                           style={{ boxShadow: isActive ? `0 0 30px ${item.accent}60` : undefined }} />

                      {/* Elemento flutuante contra-rotacionado */}
                      <div className="absolute top-1/2 left-1/2 flex flex-col items-center gap-2 transition-all duration-500"
                           style={{
                             transform: `translate(-50%, -50%) rotateZ(-45deg) rotateX(-60deg) translateY(${isActive ? '-60px' : '-40px'}) scale(${isActive ? 1.15 : 1})`,
                             transformStyle: "preserve-3d"
                           }}>
                        <div className={`relative flex items-center justify-center transition-all duration-300 ${isCenter ? 'w-16 h-16 rounded-2xl' : 'w-14 h-14 rounded-2xl'} bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-900`}
                             style={{
                               border: `2px solid ${isActive ? item.accent : (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.1)")}`,
                               boxShadow: isActive ? `0 15px 30px ${item.accent}40, inset 0 0 20px ${item.accent}20` : (isDark ? "0 10px 20px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.1)")
                             }}>
                          <Icon className={`${isCenter ? 'w-7 h-7' : 'w-6 h-6'}`} style={{ color: isActive ? item.accent : (isDark ? "#ffffff" : "#1e293b"), filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none" }} />
                        </div>
                        
                        {!isCenter && (
                          <span className={`text-[11px] font-medium tracking-wide text-center leading-tight max-w-[80px] transition-all duration-300 text-slate-800 dark:text-slate-300 ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                                style={isActive ? { color: item.accent, textShadow: `0 0 12px ${item.accent}90` } : undefined}>
                            {item.label}
                          </span>
                        )}
                        {isCenter && (
                          <p className={`text-[10px] text-center mt-1 font-mono uppercase tracking-wider font-bold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'} text-slate-800 dark:text-white`} style={isActive ? { color: item.accent } : undefined}>ARIANO</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>"""

content = old_graph_regex.sub(new_graph, content)

with open("frontend/src/pages/Landing.tsx", "w") as f:
    f.write(content)

