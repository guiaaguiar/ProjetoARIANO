import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Zap, Network, Search, Settings, ChevronLeft, ChevronRight, Layers, GitMerge, Users, BookOpen } from "lucide-react";
import { Graph3D } from "@/components/Graph3D";
import GuiAguiarImg from "@/assets/gui-aguiar.jpeg";
import logoSecti from "@/assets/logo_secti.png";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

import { StackedLogo } from "@/components/StackedLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

/** Teal accent matched to wallpaper topographic lines */
const TEAL_HSL = "190 80% 38%";
const TEAL_DARK = "188 85% 45%";

/** Wallpaper-derived dark background tokens (deep navy/teal) */
const WP_BG = "205 65% 5%";          // base background ~ rgb(5,12,20)
const WP_CARD = "205 55% 8%";        // card surfaces
const WP_BORDER = "190 40% 18%";     // subtle teal-tinted borders
const WP_MUTED_FG = "195 20% 65%";   // muted text
const WP_FG = "190 25% 92%";         // foreground

const LOGO_VARIANT = 1;
const CUBE_SIZE = 720;
const CUBE_OFFSET_X = -60;
const CUBE_OFFSET_Y = 0;

const TESTIMONIALS = [
  {
    text: "O motor do ARIANO mudou nossa forma de conectar pesquisadores e editais, permitindo uma transparência jamais vista através do grafo interativo.",
    name: "Guilherme Aguiar",
    role: "Product Owner, ARIANO",
    avatar: GuiAguiarImg
  },
  {
    text: "A arquitetura e os pipelines de deploy automatizado transformaram o ciclo de vida do projeto. Temos agora estabilidade garantida em cada release.",
    name: "Pedro Miranda",
    role: "DevOps",
    avatar: "" 
  },
  {
    text: "A integração dos modelos de linguagem e a engenharia de prompts avançada elevaram a precisão dos matches em níveis extraordinários.",
    name: "Ricardo Cezar",
    role: "AI Agent Architect",
    avatar: "" 
  },
  {
    text: "O design do ARIANO foca na usabilidade e na clareza visual, garantindo que cada interação com o grafo seja intuitiva e produtiva.",
    name: "Marcio Maycom",
    role: "UX UI Designer",
    avatar: ""
  },
  {
    text: "Gerenciar a agilidade e o fluxo de trabalho neste projeto é inspirador. A entrega contínua de valor é o nosso norte principal.",
    name: "Thiago Falcão",
    role: "Scrum Master",
    avatar: ""
  }
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" } as any
};

// ─── ECOSYSTEM NODES DATA ─────────────────────────────────────────────────────
const ECOSYSTEM_ITEMS = [
  {
    icon: Layers,
    label: "Matchmaking com IA",
    title: "Matches com precisão cirúrgica",
    description: "Nossos modelos de linguagem analisam seu perfil em múltiplas dimensões — skills, TRL e histórico de colaboração — para gerar recomendações com altíssima taxa de acerto.",
    cta: "Ver meus matches",
    link: "/cadastro",
    accent: "#22d3ee",
    nodePos: { top: "8%", left: "50%", transform: "translateX(-50%)" },
  },
  {
    icon: Network,
    label: "Grafo de Comunidades",
    title: "Visualize o ecossistema em tempo real",
    description: "O motor de grafos exibe as Communities of Trust de forma interativa. Explore conexões, identifique hubs de inovação e descubra onde você se encaixa no ecossistema.",
    cta: "Explorar o grafo",
    link: "/cadastro",
    accent: "#60a5fa",
    nodePos: { top: "50%", left: "10%", transform: "translateY(-50%)" },
  },
  {
    icon: Users,
    label: "Comunidades de Confiança",
    title: "Colabore com quem importa",
    description: "Entre em comunidades temáticas gerenciadas por especialistas. Compartilhe projetos, encontre orientadores e forme equipes que aceleram resultados.",
    cta: "Entrar em uma comunidade",
    link: "/cadastro",
    accent: "#a78bfa",
    nodePos: { top: "50%", right: "10%", transform: "translateY(-50%)" },
  },
  {
    icon: BookOpen,
    label: "Editais Inteligentes",
    title: "Nunca perca um edital relevante",
    description: "A plataforma monitora continuamente editais de fomento, bolsas e programas de inovação. Você recebe apenas os que são realmente relevantes para seu perfil.",
    cta: "Ver editais disponíveis",
    link: "/cadastro",
    accent: "#34d399",
    nodePos: { bottom: "8%", left: "50%", transform: "translateX(-50%)" },
  },
];

// ─── BENTO BOX DATA ───────────────────────────────────────────────────────────
const BENTO_CARDS = [
  {
    icon: GitMerge,
    title: "Origem do Projeto",
    desc: "Nascido dentro da SECTI-PE, o ARIANO surgiu da necessidade de conectar pesquisadores, empresas e governo de forma estruturada e inteligente, eliminando silos de informação.",
    accent: "#22d3ee",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Network,
    title: "Motor de Grafos",
    desc: "Um grafo de conhecimento conecta entidades — pessoas, projetos, editais e comunidades — revelando padrões invisíveis ao olho humano.",
    accent: "#60a5fa",
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "IA Generativa",
    desc: "LLMs avaliam compatibilidade entre perfis, gerando matches com score de confiança e explicabilidade para cada recomendação.",
    accent: "#a78bfa",
    span: "col-span-1",
  },
  {
    icon: Layers,
    title: "Plataforma Multi-Perfil",
    desc: "Dashboards adaptados para pesquisadores, gestores de governo e setor privado — cada ator vê o que importa para si.",
    accent: "#34d399",
    span: "col-span-1",
  },
];

const radarData = [
  { subject: 'Skills (IA/Data)', score: 95, fullMark: 100 },
  { subject: 'Maturidade TRL', score: 85, fullMark: 100 },
  { subject: 'Aderência a Editais', score: 98, fullMark: 100 },
  { subject: 'Colaboração', score: 80, fullMark: 100 },
  { subject: 'Impacto Social', score: 88, fullMark: 100 },
];

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [cubeZoom, setCubeZoom] = useState(() => {
    const w = window.innerWidth;
    const baseSize = w < 1024 ? 300 : window.innerHeight - 32;
    return baseSize * 0.1;
  });
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const scrollTimeout = useRef<any>(null);

  const handlePrevTestimonial = () => setActiveTestimonial(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  const handleNextTestimonial = () => setActiveTestimonial(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 30) {
      if (scrollTimeout.current) return;
      if (e.deltaX > 0) {
        handleNextTestimonial();
      } else {
        handlePrevTestimonial();
      }
      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
      }, 600);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const baseSize = w < 1024 ? 270 : window.innerHeight - 32;
      setCubeZoom(baseSize * 0.1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDark = theme === "dark";
  const diagonalLineColor = isDark ? "hsl(190 40% 25%)" : "hsl(190 40% 70%)";

  useEffect(() => {
    const root = document.documentElement;
    const dark = theme === "dark";
    const accent = dark ? TEAL_DARK : TEAL_HSL;
    root.style.setProperty("--primary", accent);
    root.style.setProperty("--ring", accent);
    root.style.setProperty("--sidebar-primary", accent);
    root.style.setProperty("--sidebar-ring", accent);

    if (dark) {
      root.style.setProperty("--background", WP_BG);
      root.style.setProperty("--foreground", WP_FG);
      root.style.setProperty("--card", WP_CARD);
      root.style.setProperty("--card-foreground", WP_FG);
      root.style.setProperty("--popover", WP_CARD);
      root.style.setProperty("--popover-foreground", WP_FG);
      root.style.setProperty("--secondary", WP_CARD);
      root.style.setProperty("--muted", WP_CARD);
      root.style.setProperty("--muted-foreground", WP_MUTED_FG);
      root.style.setProperty("--accent", WP_CARD);
      root.style.setProperty("--border", WP_BORDER);
      root.style.setProperty("--input", WP_BORDER);
    }

    return () => {
      [
        "--primary", "--ring", "--sidebar-primary", "--sidebar-ring",
        "--background", "--foreground", "--card", "--card-foreground",
        "--popover", "--popover-foreground", "--secondary", "--muted",
        "--muted-foreground", "--accent", "--border", "--input",
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [theme]);

  // Display content for the active node (default to first item if none hovered)
  const displayedItem = activeNode !== null ? ECOSYSTEM_ITEMS[activeNode] : ECOSYSTEM_ITEMS[0];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] px-6">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between">
          <Link to="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[14px] font-bold text-white tracking-[0.08em] uppercase">ARIANO</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Link to="/login">
              <button className="text-[13px] text-white/60 hover:text-white transition-colors h-8 px-3">
                Entrar
              </button>
            </Link>
            <Link to="/cadastro">
              <button className="text-[13px] h-8 px-3 border border-white/20 text-white hover:bg-white hover:text-black transition-colors">
                Cadastrar-se
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 1 — HERO (INTOCÁVEL)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-16 pb-0 px-6">
        <div className="mx-auto max-w-[1200px] relative">
          {/* Two-column hero: text left, cube right */}
          <div className="pt-[52px] pb-16 relative flex">
            {/* Left column — text */}
            <div className="relative z-[3] flex-1 min-w-0 max-w-[540px]">
              <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-[500] leading-[1.15] tracking-[-0.04em] text-white max-w-[720px]">
                Conexões estratégicas no ecossistema de inovação
              </h1>
              <p className="mt-6 text-base leading-relaxed text-white/50 max-w-[420px]">
                Encontre o seu lugar no ecossistema e faça os matches perfeitos para seu perfil.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link to="/cadastro">
                  <button className="group relative inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-white text-black transition-all duration-200 hover:bg-white/90">
                    Crie sua conta
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right column — 3D animated graph */}
            <div className="hidden md:flex absolute right-[20%] top-[160px] z-[1] pointer-events-none" style={{ width: cubeZoom, height: cubeZoom }}>
              <div className="pointer-events-auto w-full h-full">
                <Graph3D
                  size={cubeZoom}
                  lineHex={theme === "dark" ? "#1aa0b8" : "#0d7a8c"}
                  nodeHex={theme === "dark" ? "#3fd4ec" : "#0d7a8c"}
                  nodeCount={7}
                  connectionRadius={2.4}
                />
              </div>
            </div>
          </div>

          <div className="relative" style={{ overflow: "visible" }}>
            <motion.div 
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 } as any}
              className="relative z-10 rounded-t-xl border border-b-0 border-white/[0.06] bg-[#0d1520] overflow-hidden shadow-2xl"
            >
              {/* MacOS Window Controls */}
              <div className="h-10 bg-[#060c14]/40 border-b border-white/[0.06] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
              </div>
              <div className="flex min-h-[420px]">
                {/* Sidebar mock */}
                <div className="w-[200px] border-r border-white/[0.06] p-3 flex flex-col gap-1 shrink-0 bg-[#0a0f18]">
                  <div className="flex items-center gap-2 px-2 h-8 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img src="/Coreto_LOGO.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[12px] font-bold text-white tracking-tight">ARIANO</span>
                  </div>
                  <div className="h-px bg-white/[0.06] mb-2" />
                  
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-1 px-2">
                    Menu
                  </span>
                  
                  {[
                    { label: 'Dashboard', icon: LayoutDashboard },
                    { label: 'Meus Matches', icon: Zap, active: true },
                    { label: 'Ecossistema', icon: Network },
                    { label: 'Explorar', icon: Search },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-2.5 h-8 rounded-lg cursor-pointer transition-colors ${item.active ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-medium">{item.label}</span>
                    </div>
                  ))}
                  
                  <div className="mt-auto pt-2">
                    <div className="h-px bg-white/[0.06] mb-2" />
                    <div className="flex items-center gap-2.5 px-2.5 h-8 rounded-lg cursor-pointer text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-medium">Configurações</span>
                    </div>
                  </div>
                </div>

                {/* Main content — issue list */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-3 px-4 h-10 border-b border-white/[0.06]">
                    <div className="h-2 w-10 rounded-full bg-white/10" />
                    <div className="h-2 w-8 rounded-full bg-white/[0.07]" />
                    <div className="h-2 w-12 rounded-full bg-white/[0.07]" />
                    <div className="ml-auto flex gap-2">
                      <div className="h-5 w-5 rounded bg-white/5" />
                      <div className="h-5 w-5 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {[
                      { priority: "bg-teal-500", id: "Healthtech", name: "Edital FAPESP: IA na Saúde", area: "Bolsa de Iniciação Científica", score: "98%", status: "bg-teal-500" },
                      { priority: "bg-blue-500", id: "GovTech", name: "Hackathon GovTech 2026", area: "Prêmio: R$ 50.000 + Mentoria", score: "95%", status: "bg-blue-500" },
                      { priority: "bg-purple-500", id: "Machine Learning", name: "Simpósio de Machine Learning", area: "Chamada de Trabalhos (Evento)", score: "92%", status: "bg-purple-500" },
                      { priority: "bg-amber-500", id: "Startups", name: "Programa Centelha PE", area: "Fomento à Inovação e Startups", score: "89%", status: "bg-amber-500" },
                      { priority: "bg-rose-500", id: "Visão Computacional", name: "Prof. Dr. Carlos Mendes", area: "Possível Orientador (Visão Computacional)", score: "85%", status: "bg-rose-500" },
                      { priority: "bg-indigo-500", id: "Data Science", name: "Dra. Ana Silva", area: "Pesquisadora Sênior (Data Science)", score: "82%", status: "bg-indigo-500" },
                      { priority: "bg-cyan-500", id: "Frontend", name: "Mariana Costa", area: "Estudante Parceira (Frontend)", score: "78%", status: "bg-cyan-500" },
                    ].map((row, i) => (
                      <div key={i} className={`relative flex items-center gap-4 px-4 h-9 border-b border-white/[0.06] transition-colors hover:bg-white/[0.03] cursor-pointer`}>
                        <div className="h-3.5 w-3.5 rounded border border-white/10 flex items-center justify-center shrink-0 z-10">
                          <div className={`h-1.5 w-1.5 rounded-sm ${row.priority}`} />
                        </div>
                        <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-400/10 px-1.5 rounded shrink-0 z-10">{row.id}</span>
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0 z-10">
                          <span className="text-[12px] font-medium text-white truncate">{row.name}</span>
                          <span className="text-[12px] text-white/40 truncate hidden sm:inline-block">{row.area}</span>
                        </div>
                        
                        <div className="ml-auto flex items-center gap-3 z-10">
                          <span className="text-[11px] font-mono text-white/40">{row.score}</span>
                          <div className={`h-2 w-2 rounded-full ${row.status}`} />
                          <div className="h-5 w-5 rounded-full bg-white/5 flex items-center justify-center">
                            <ArrowRight className="h-3 w-3 text-white/30" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail panel */}
                <div className="w-[280px] border-l border-white/[0.06] shrink-0 hidden lg:flex flex-col relative z-10 bg-[#0a0f18]">
                  <div className="flex items-center justify-between px-4 h-10 border-b border-white/[0.06]">
                    <span className="text-[12px] font-medium text-white">Detalhes do Match</span>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-4 rounded bg-white/5" />
                      <div className="h-4 w-4 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="font-medium text-[14px] text-white">Edital FAPESP: IA na Saúde</div>
                    <div className="space-y-1.5">
                      <p className="text-[12px] text-white/40 leading-relaxed">
                        Oportunidade perfeita para aplicar seus conhecimentos em modelos preditivos num projeto de impacto social, com bolsa e mentoria.
                      </p>
                    </div>
                    <div className="h-px bg-white/[0.06]" />
                    {[
                      { label: "Comunidade", value: "Healthtech", color: "bg-teal-500" },
                      { label: "Match (%)", value: "98%", color: "bg-teal-500" },
                      { label: "Tipo", value: "Bolsa (R$ 800/mês)", color: "bg-teal-500" },
                      { label: "Data limite", value: "Amanhã", color: "bg-teal-500" },
                    ].map((prop) => (
                      <div key={prop.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-white/40">{prop.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-white">{prop.value}</span>
                          <div className={`h-2.5 w-2.5 rounded-full ${prop.color}`} />
                        </div>
                      </div>
                    ))}
                    <div className="h-px bg-white/[0.06]" />
                    <div className="space-y-3 pt-1">
                      <span className="text-[11px] text-white/40">Skills em Comum</span>
                      {["Python", "Machine Learning"].map((skill, n) => (
                        <div key={n} className="flex gap-2">
                          <div className="h-5 w-5 rounded-full bg-teal-400/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                            {skill.charAt(0)}
                          </div>
                          <div className="flex items-center">
                            <span className="text-[12px] text-white">{skill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full-width divider */}
      <div className="relative z-10 w-full border-t border-white/[0.06]" />

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 2 — O QUE É O ARIANO (NOVA)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 overflow-hidden bg-[#0a0a0a]">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/[0.07] blur-[120px] rounded-full" />
        </div>

        <motion.div {...fadeUp} className="mx-auto max-w-[1200px] relative">
          {/* Section header */}
          <div className="text-center mb-20">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-4">
              Sobre a Plataforma
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] tracking-[-0.04em] leading-[1.1] text-white">
              <span
                className="text-cyan-400"
                style={{ textShadow: "0 0 15px rgba(34,211,238,0.5)" }}
              >
                Inteligência Artificial
              </span>{" "}
              Naturalmente Ordenada.
            </h2>
            <p className="mt-5 text-[16px] text-white/50 max-w-[520px] mx-auto leading-relaxed">
              O ARIANO é uma plataforma de matchmaking científico e tecnológico que conecta pesquisadores, governo e setor privado usando IA e teoria de grafos.
            </p>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 — large, spans 2 cols */}
            <div
              className="md:col-span-2 group relative rounded-2xl p-8 overflow-hidden cursor-default"
              style={{
                background: "rgba(8,16,28,0.7)",
                border: "1px solid rgba(34,211,238,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)" }} />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.25)" }}
              >
                <GitMerge className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-3">Origem do Projeto</h3>
              <p className="text-[14px] leading-[1.8] text-white/50">
                Nascido dentro da <span className="text-cyan-400 font-medium">SECTI-PE</span>, o ARIANO surgiu da necessidade de conectar pesquisadores, empresas e governo de forma estruturada e inteligente, eliminando silos de informação e acelerando a inovação no ecossistema de Pernambuco.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-1 w-8 rounded-full bg-cyan-400/60" />
                <span className="text-[12px] text-cyan-400/80 font-mono">gov_tech · pernambuco</span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="group relative rounded-2xl p-8 overflow-hidden cursor-default"
              style={{
                background: "rgba(8,16,28,0.7)",
                border: "1px solid rgba(96,165,250,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)" }} />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}
              >
                <Network className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">Motor de Grafos</h3>
              <p className="text-[13px] leading-[1.8] text-white/50">
                Um grafo de conhecimento conecta entidades — pessoas, projetos, editais e comunidades — revelando padrões invisíveis ao olho humano.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="group relative rounded-2xl p-8 overflow-hidden cursor-default"
              style={{
                background: "rgba(8,16,28,0.7)",
                border: "1px solid rgba(167,139,250,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)" }} />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">IA Generativa</h3>
              <p className="text-[13px] leading-[1.8] text-white/50">
                LLMs avaliam compatibilidade entre perfis, gerando matches com score de confiança e explicabilidade para cada recomendação.
              </p>
            </div>

            {/* Card 4 */}
            <div
              className="group relative rounded-2xl p-8 overflow-hidden cursor-default"
              style={{
                background: "rgba(8,16,28,0.7)",
                border: "1px solid rgba(52,211,153,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}
              >
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">Multi-Perfil</h3>
              <p className="text-[13px] leading-[1.8] text-white/50">
                Dashboards adaptados para pesquisadores, gestores e setor privado — cada ator vê o que importa para si.
              </p>
            </div>

            {/* Card 5 — stat card */}
            <div
              className="group relative rounded-2xl p-8 overflow-hidden cursor-default flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(8,16,28,0.9) 100%)",
                border: "1px solid rgba(34,211,238,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-4">Em números</p>
                <div className="space-y-4">
                  {[
                    { val: "98%", label: "taxa de acerto dos matches" },
                    { val: "3.2k+", label: "nós no ecossistema" },
                    { val: "360°", label: "visibilidade de perfil" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-[28px] font-bold text-white tracking-tight" style={{ textShadow: "0 0 20px rgba(34,211,238,0.3)" }}>{s.val}</div>
                      <div className="text-[11px] text-white/40 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 3 — ECOSSISTEMA INTERATIVO (GRAFO SVG + CROSSFADE)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 overflow-hidden border-t border-white/[0.06] bg-[#0a0a0a]">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/[0.08] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.05] blur-[100px] rounded-full" />
        </div>

        <motion.div {...fadeUp} className="mx-auto max-w-[1200px] relative">
          {/* Header */}
          <div className="mb-20 text-center">
            <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-4">Plataforma</p>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-[500] tracking-[-0.04em] text-white leading-[1.1]">
              Um ecossistema inteligente{" "}
              <span className="text-white/40">para cada perfil.</span>
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── COLUNA ESQUERDA: Grafo SVG interativo ── */}
            <div className="relative h-[420px] w-full">
              {/* SVG connector lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ overflow: "visible" }}
              >
                {/* Lines from center to each node */}
                {ECOSYSTEM_ITEMS.map((item, i) => {
                  const isActive = activeNode === i;
                  // Center is at 50%, 50% of the container
                  // Node positions:  top=8% → y≈34px, left/right=10% → x≈42px, bottom=8% → y≈386px
                  const centerX = "50%";
                  const centerY = "50%";
                  const nodeCoords = [
                    { x: "50%", y: "8%" },   // top
                    { x: "10%", y: "50%" },   // left
                    { x: "90%", y: "50%" },   // right
                    { x: "50%", y: "92%" },   // bottom
                  ];
                  const nc = nodeCoords[i];
                  return (
                    <line
                      key={i}
                      x1={centerX} y1={centerY}
                      x2={nc.x} y2={nc.y}
                      stroke={isActive ? item.accent : "rgba(255,255,255,0.06)"}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={isActive ? "0" : "4 4"}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 6px ${item.accent})` : "none",
                        transition: "stroke 0.3s, stroke-width 0.3s, filter 0.3s",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Central node */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(34,211,238,0.12)",
                    border: "2px solid rgba(34,211,238,0.4)",
                    boxShadow: "0 0 30px rgba(34,211,238,0.25), 0 0 60px rgba(34,211,238,0.1)",
                  }}
                >
                  <Network className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-[10px] text-cyan-400/60 text-center mt-2 font-mono uppercase tracking-wider">ARIANO</p>
              </div>

              {/* Outer nodes */}
              {ECOSYSTEM_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeNode === i;
                const posStyles = [
                  { top: "8%", left: "50%", transform: "translateX(-50%)" },    // top
                  { top: "50%", left: "10%", transform: "translateY(-50%)" },   // left
                  { top: "50%", right: "10%", transform: "translateY(-50%)" },  // right
                  { bottom: "8%", left: "50%", transform: "translateX(-50%)" }, // bottom
                ][i];

                return (
                  <div
                    key={i}
                    className="absolute z-20 cursor-pointer"
                    style={posStyles}
                    onMouseEnter={() => setActiveNode(i)}
                    onMouseLeave={() => setActiveNode(null)}
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 } as any}
                      transition={{ duration: 0.25 } as any}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: isActive ? `${item.accent}22` : "rgba(8,16,28,0.9)",
                          border: `2px solid ${isActive ? item.accent : "rgba(255,255,255,0.08)"}`,
                          boxShadow: isActive ? `0 0 20px ${item.accent}50, 0 0 40px ${item.accent}20` : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{
                            color: isActive ? item.accent : "rgba(255,255,255,0.4)",
                            transition: "color 0.3s",
                            filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : "none",
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-semibold text-center leading-tight max-w-[80px]"
                        style={{
                          color: isActive ? item.accent : "rgba(255,255,255,0.35)",
                          textShadow: isActive ? `0 0 10px ${item.accent}80` : "none",
                          transition: "color 0.3s",
                        }}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* ── COLUNA DIREITA: Card dinâmico com crossfade ── */}
            <div className="lg:sticky lg:top-28 self-start">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(8,16,28,0.8)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${displayedItem.accent}30`,
                  boxShadow: `0 0 80px ${displayedItem.accent}12, inset 0 0 40px ${displayedItem.accent}05`,
                  transition: "border-color 0.5s, box-shadow 0.5s",
                  minHeight: "380px",
                }}
              >
                {/* Corner glow */}
                <div
                  className="absolute -top-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${displayedItem.accent}18 0%, transparent 65%)`,
                    transition: "background 0.5s",
                  }}
                />

                <div className="relative p-10">
                  {/* Animated icon */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`icon-${activeNode}`}
                      initial={{ opacity: 0, scale: 0.6, rotate: -10 } as any}
                      animate={{ opacity: 1, scale: 1, rotate: 0 } as any}
                      exit={{ opacity: 0, scale: 0.6, rotate: 10 } as any}
                      transition={{ duration: 0.3, ease: "easeOut" } as any}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                      style={{
                        backgroundColor: `${displayedItem.accent}18`,
                        border: `1px solid ${displayedItem.accent}40`,
                        boxShadow: `0 0 30px ${displayedItem.accent}30`,
                      }}
                    >
                      {(() => {
                        const Icon = displayedItem.icon;
                        return <Icon className="w-8 h-8" style={{ color: displayedItem.accent }} />;
                      })()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Animated text content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${activeNode}`}
                      initial={{ opacity: 0, y: 20 } as any}
                      animate={{ opacity: 1, y: 0 } as any}
                      exit={{ opacity: 0, y: -20 } as any}
                      transition={{ duration: 0.35, ease: "easeOut" } as any}
                    >
                      <p
                        className="text-[11px] uppercase tracking-[0.2em] font-bold mb-3"
                        style={{ color: displayedItem.accent }}
                      >
                        {displayedItem.label}
                      </p>
                      <h3 className="text-[clamp(1.4rem,2.5vw,1.9rem)] font-[500] tracking-[-0.03em] text-white leading-[1.2] mb-5">
                        {displayedItem.title}
                      </h3>
                      <p className="text-[14px] leading-[1.8] text-white/50 mb-8">
                        {displayedItem.description}
                      </p>
                      <Link to={displayedItem.link}>
                        <button
                          className="inline-flex items-center gap-2.5 px-6 py-3 text-[13px] font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            backgroundColor: `${displayedItem.accent}18`,
                            color: displayedItem.accent,
                            border: `1px solid ${displayedItem.accent}45`,
                            boxShadow: `0 4px 20px ${displayedItem.accent}18`,
                          }}
                        >
                          {displayedItem.cta}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                      {activeNode === null && (
                        <p className="text-[11px] text-white/20 mt-4 italic">
                          Passe o mouse sobre um nó para explorar →
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 4 — RADAR CHART (PROFILE SIMULATION)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 overflow-hidden border-t border-white/[0.06] bg-[#0a0a0a]">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/[0.06] blur-[100px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.05] blur-[100px] rounded-full" />
        </div>

        <motion.div {...fadeUp} className="mx-auto max-w-[1200px] relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy assertivo */}
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-3">
                Inteligência de Perfil
              </p>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-[500] tracking-[-0.04em] text-white leading-[1.1] mb-8">
                A IA lê o que
                <br />
                <span className="text-cyan-400" style={{ textShadow: "0 0 15px rgba(34,211,238,0.4)" }}>
                  você não consegue ver.
                </span>
              </h2>

              <div className="space-y-6">
                {[
                  {
                    accent: "#22d3ee",
                    title: "Análise Multidimensional",
                    desc: "Skills, TRL, histórico e aderência a editais num único score.",
                  },
                  {
                    accent: "#60a5fa",
                    title: "Predição de Sinergia",
                    desc: "Probabilidade de sucesso calculada antes da colaboração começar.",
                  },
                  {
                    accent: "#a78bfa",
                    title: "Perfil Evolutivo",
                    desc: "Conforme você cresce, o grafo de oportunidades se adapta.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div
                      className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.accent}15`, border: `1px solid ${item.accent}30` }}
                    >
                      <Zap className="h-3.5 w-3.5" style={{ color: item.accent }} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-white mb-0.5">{item.title}</h4>
                      <p className="text-[13px] text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — MacOS window + Radar neon */}
            <div>
              {/* MacOS frame — STRICTLY DARK, no white backgrounds */}
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "#0a0f18",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 0 80px rgba(34,211,238,0.07), 0 32px 80px rgba(0,0,0,0.6)",
                }}
              >
                {/* MacOS title bar */}
                <div
                  className="h-10 flex items-center px-4 gap-2"
                  style={{ background: "#060c14", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" style={{ boxShadow: "0 0 6px #ff5f5660" }} />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" style={{ boxShadow: "0 0 6px #ffbd2e60" }} />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" style={{ boxShadow: "0 0 6px #27c93f60" }} />
                  <div className="mx-auto flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 6px #22d3ee" }} />
                    <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>profile_analysis.ariano</span>
                  </div>
                </div>

                {/* Sidebar + chart layout inside the mock window */}
                <div className="flex" style={{ background: "#0a0f18" }}>
                  {/* Sidebar */}
                  <div
                    className="w-[160px] shrink-0 p-3 flex flex-col gap-1"
                    style={{ borderRight: "1px solid rgba(255,255,255,0.05)", background: "#07111c" }}
                  >
                    <span className="text-[9px] text-white/20 uppercase tracking-wider font-semibold mb-2 px-2 mt-1">Perfil</span>
                    {[
                      { label: "Visão Geral", active: true },
                      { label: "Skills" },
                      { label: "Editais" },
                      { label: "Conexões" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="px-2.5 h-7 rounded-lg flex items-center text-[11px] font-medium cursor-pointer"
                        style={{
                          background: item.active ? "rgba(34,211,238,0.08)" : "transparent",
                          color: item.active ? "#22d3ee" : "rgba(255,255,255,0.3)",
                          border: item.active ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Chart area — FIXED HEIGHT, no white leak */}
                  <div className="flex-1 flex flex-col">
                    <div
                      className="px-4 py-2 flex items-center gap-2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <span className="text-[11px] text-white/30 font-mono">Análise Multidimensional · Perfil IA/Data</span>
                    </div>
                    {/* CRITICAL: Div com altura fixa para o ResponsiveContainer não colapsar */}
                    <div className="h-[350px] w-full relative" style={{ background: "#0a0f18" }}>
                      {/* Neon center glow behind chart */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.05) 0%, transparent 65%)",
                        }}
                      />
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 500 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
                            axisLine={false}
                          />
                          <Radar
                            name="Seu Perfil"
                            dataKey="score"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fill="#22d3ee"
                            fillOpacity={0.2}
                            style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.6))" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0d1520",
                              borderColor: "rgba(34,211,238,0.3)",
                              color: "#e2f8ff",
                              borderRadius: "10px",
                              fontSize: "12px",
                              boxShadow: "0 0 20px rgba(34,211,238,0.2)",
                            }}
                            itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Footer stats bar */}
                    <div
                      className="flex items-center justify-around px-6 py-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#060c14" }}
                    >
                      {[
                        { label: "Skills", value: "95%" },
                        { label: "TRL", value: "85%" },
                        { label: "Editais", value: "98%" },
                        { label: "Colaboração", value: "80%" },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="text-[15px] font-bold"
                            style={{ color: "#22d3ee", textShadow: "0 0 10px rgba(34,211,238,0.6)" }}
                          >
                            {s.value}
                          </div>
                          <div
                            className="text-[9px] uppercase tracking-widest"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 5 — TESTIMONIALS (INTOCÁVEL)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-10 px-6 overflow-hidden my-10 border-y border-white/[0.06]">
        {/* Angular line shading background */}
        <div
          className="absolute inset-0 pointer-events-none bg-[#0a0a0a]/70 backdrop-blur-md"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              rgba(45,212,191,0.03) 0px,
              rgba(45,212,191,0.03) 1px,
              transparent 1px,
              transparent 8px
            )`,
          }}
        />
        <motion.div {...fadeUp} className="w-full relative py-8" onWheel={handleWheel}>
          <div className="relative w-full max-w-[1400px] mx-auto h-[280px] overflow-hidden flex items-center justify-center">
            {TESTIMONIALS.map((t, i) => {
              const isCenter = i === activeTestimonial;
              const isRight = i === (activeTestimonial + 1) % TESTIMONIALS.length;
              const isLeft = i === (activeTestimonial - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
              
              const posClass = 
                isCenter ? "left-1/2 -translate-x-1/2 z-20 scale-100 opacity-100" :
                isLeft ? "left-0 -translate-x-[85%] md:-translate-x-[80%] lg:-translate-x-[75%] z-10 scale-[0.8] opacity-10" :
                isRight ? "right-0 translate-x-[85%] md:translate-x-[80%] lg:translate-x-[75%] z-10 scale-[0.8] opacity-10" :
                (i < activeTestimonial ? "left-0 -translate-x-[150%] opacity-0 pointer-events-none" : "right-0 translate-x-[150%] opacity-0 pointer-events-none");

              const glowClass = isCenter ? "shadow-[0_0_40px_rgba(34,211,238,0.05)] bg-[#0d1520]/70 backdrop-blur-md" : "bg-[#0a0a0a]/20 backdrop-blur-sm pointer-events-none";
              
              return (
                <div 
                  key={i}
                  className={`absolute top-1/2 -translate-y-1/2 w-[85vw] max-w-[720px] transition-all duration-700 ease-in-out border border-white/[0.08] rounded-2xl p-10 cursor-pointer ${posClass} ${glowClass}`}
                  onClick={() => { if (!isCenter) { if (isLeft) handlePrevTestimonial(); else handleNextTestimonial(); } }}
                >
                  <blockquote className={`text-[18px] md:text-[20px] font-[400] leading-[1.5] tracking-[-0.01em] transition-colors duration-700 ${isCenter ? 'text-white/85' : 'text-white/30'}`}>
                    "{t.text}"
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        {t.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <span className="text-[13px] font-medium text-white block">{t.name}</span>
                      <span className="text-[13px] text-white/40 block">{t.role}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8 relative z-20">
            <button onClick={handlePrevTestimonial} className="p-2.5 rounded-full border border-white/[0.08] bg-[#0a0a0a]/50 hover:bg-white/5 text-white/40 hover:text-white transition-colors backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2.5">
              {TESTIMONIALS.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === activeTestimonial ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <button onClick={handleNextTestimonial} className="p-2.5 rounded-full border border-white/[0.08] bg-[#0a0a0a]/50 hover:bg-white/5 text-white/40 hover:text-white transition-colors backdrop-blur-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SEÇÃO 6 — CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-32 pb-40 px-6 overflow-hidden bg-[#0a0a0a]">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/[0.06] blur-[120px] rounded-full" />
        </div>
        <motion.div {...fadeUp} className="mx-auto max-w-[1200px] text-center relative">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] tracking-[-0.035em] text-white leading-[1.1] mx-auto max-w-[560px]">
            Faça parte da revolução tecnológica.
          </h2>
          <p className="mt-5 text-[15px] text-white/50 max-w-[400px] mx-auto">
            Integre-se ao projeto ARIANO e encontre oportunidades que moldam o futuro.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/cadastro">
              <button
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium transition-all duration-200 border border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
              >
                Acessar Plataforma
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 border-t border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <StackedLogo size={16} />
            <span className="text-[12px] font-bold text-white uppercase tracking-[0.08em]">ARIANO</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Realização / Apoio Institucional</span>
            <div className="flex items-center gap-4">
              <img src="/Coreto_LOGO.png" alt="Coreto Logo" className="h-6 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <div className="h-4 w-px bg-white/10" />
              <img
                src={logoSecti}
                alt="SECTI Logo"
                className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <span className="text-[12px] text-white/30">© {new Date().getFullYear()} CORETO</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
