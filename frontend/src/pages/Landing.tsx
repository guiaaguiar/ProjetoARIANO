import { Link } from "react-router-dom";
import { ArrowRight, Moon, Sun, LayoutDashboard, Zap, Network, Search, Settings } from "lucide-react";
import { Graph3D } from "@/components/Graph3D";
import GuiAguiarImg from "@/assets/gui-aguiar.jpeg";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { StackedLogo } from "@/components/StackedLogo";

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

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [cubeZoom, setCubeZoom] = useState(() => {
    const w = window.innerWidth;
    return w < 1024 ? 300 : window.innerHeight - 32;
  });

  useEffect(() => {
    const handleResize = () => {
      setCubeZoom(window.innerWidth < 1024 ? 270 : window.innerHeight - 32);
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

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border px-6">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[14px] font-bold text-foreground tracking-[0.08em] uppercase">ARIANO</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link to="/login">
              <button className="text-[13px] text-foreground/70 hover:text-foreground transition-colors h-8 px-3">
                Log in
              </button>
            </Link>
            <Link to="/cadastro">
              <button className="text-[13px] h-8 px-3 border border-foreground/40 text-foreground hover:bg-foreground hover:text-background transition-colors">
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-0 px-6">
        <div className="mx-auto max-w-[1200px] relative">
          {/* Two-column hero: text left, cube right */}
          <div className="pt-[52px] pb-16 relative flex">
            {/* Left column — text */}
            <div className="relative z-[3] flex-1 min-w-0 max-w-[540px]">
              <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] leading-[1.08] tracking-[-0.04em] text-foreground max-w-[540px]">
                Conexões inteligentes para o ecossistema de inovação
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-[420px]">
                O projeto ARIANO une Governo, Academia e Iniciativa Privada através de IA generativa. Construa o seu ecossistema e encontre os matches perfeitos.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link to="/admin/grafo">
                  <button className="group relative inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-foreground text-background transition-all duration-200 hover:bg-foreground/90">
                    Conhecer o Grafo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right column — 3D animated graph */}
            <div className="hidden md:flex absolute right-0 top-[-60px] z-[1] w-[60%] pointer-events-none items-center justify-end" style={{ height: 'calc(100vh - 80px)' }}>
              <div className="pointer-events-auto" style={{ width: cubeZoom, height: cubeZoom, transform: 'translate(35%, -15%)' }}>
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
            <div className="relative z-10 rounded-t-xl border border-b-0 border-border bg-card overflow-hidden">
              <div className="flex min-h-[420px]">
                {/* Sidebar mock */}
                <div className="w-[200px] border-r border-border p-3 flex flex-col gap-1 shrink-0 bg-card">
                  <div className="flex items-center gap-2 px-2 h-8 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img src="/Coreto_LOGO.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[12px] font-bold text-foreground tracking-tight">ARIANO</span>
                  </div>
                  <div className="h-px bg-border mb-2" />
                  
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 px-2">
                    Menu
                  </span>
                  
                  {[
                    { label: 'Dashboard', icon: LayoutDashboard },
                    { label: 'Meus Matches', icon: Zap, active: true },
                    { label: 'Ecossistema', icon: Network },
                    { label: 'Explorar', icon: Search },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-2.5 h-8 rounded-lg cursor-pointer transition-colors ${item.active ? "bg-accent/20 text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"}`}>
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-medium">{item.label}</span>
                    </div>
                  ))}
                  
                  <div className="mt-auto pt-2">
                    <div className="h-px bg-border mb-2" />
                    <div className="flex items-center gap-2.5 px-2.5 h-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-medium">Configurações</span>
                    </div>
                  </div>
                </div>

                {/* Main content — issue list */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-3 px-4 h-10 border-b border-border">
                    <div className="h-2 w-10 rounded-full bg-muted-foreground/15" />
                    <div className="h-2 w-8 rounded-full bg-muted-foreground/10" />
                    <div className="h-2 w-12 rounded-full bg-muted-foreground/10" />
                    <div className="ml-auto flex gap-2">
                      <div className="h-5 w-5 rounded bg-muted-foreground/8" />
                      <div className="h-5 w-5 rounded bg-muted-foreground/8" />
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
                      <div key={i} className={`relative flex items-center gap-4 px-4 h-9 border-b border-border transition-colors hover:bg-accent/30 cursor-pointer`}>
                        {i === 0 && (
                          <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(-45deg, ${diagonalLineColor} / 0.3) 0px, ${diagonalLineColor} / 0.3) 1px, transparent 1px, transparent 6px)`,
                          }} />
                        )}
                        <div className="h-3.5 w-3.5 rounded border border-border flex items-center justify-center shrink-0 z-10">
                          <div className={`h-1.5 w-1.5 rounded-sm ${row.priority}`} />
                        </div>
                        <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-400/10 px-1.5 rounded shrink-0 z-10">{row.id}</span>
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0 z-10">
                          <span className="text-[12px] font-medium text-foreground truncate">{row.name}</span>
                          <span className="text-[12px] text-muted-foreground truncate hidden sm:inline-block">{row.area}</span>
                        </div>
                        
                        <div className="ml-auto flex items-center gap-3 z-10">
                          <span className="text-[11px] font-mono text-muted-foreground">{row.score}</span>
                          <div className={`h-2 w-2 rounded-full ${row.status}`} />
                          <div className="h-5 w-5 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-50" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail panel */}
                <div className="w-[280px] border-l border-border shrink-0 hidden lg:flex flex-col relative z-10 bg-card">
                  <div className="flex items-center justify-between px-4 h-10 border-b border-border">
                    <span className="text-[12px] font-medium text-foreground">Detalhes do Match</span>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-4 rounded bg-muted-foreground/10" />
                      <div className="h-4 w-4 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="font-medium text-[14px]">Edital FAPESP: IA na Saúde</div>
                    <div className="space-y-1.5">
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        Oportunidade perfeita para aplicar seus conhecimentos em modelos preditivos num projeto de impacto social, com bolsa e mentoria.
                      </p>
                    </div>
                    <div className="h-px bg-border" />
                    {[
                      { label: "Comunidade", value: "Healthtech", color: "bg-teal-500" },
                      { label: "Match (%)", value: "98%", color: "bg-teal-500" },
                      { label: "Tipo", value: "Bolsa (R$ 800/mês)", color: "bg-teal-500" },
                      { label: "Data limite", value: "Amanhã", color: "bg-teal-500" },
                    ].map((prop) => (
                      <div key={prop.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{prop.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium">{prop.value}</span>
                          <div className={`h-2.5 w-2.5 rounded-full ${prop.color}`} />
                        </div>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="space-y-3 pt-1">
                      <span className="text-[11px] text-muted-foreground">Skills em Comum</span>
                      {["Python", "Machine Learning"].map((skill, n) => (
                        <div key={n} className="flex gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                            {skill.charAt(0)}
                          </div>
                          <div className="flex items-center">
                            <span className="text-[12px] text-foreground">{skill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Full-width divider */}
      <div className="relative z-10 w-full border-t border-border" />

      {/* Features */}
      <section className="relative z-10 pt-24 pb-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] relative">
          <p className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Construído para o Futuro
          </p>
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-[500] tracking-[-0.03em] text-foreground max-w-[500px] leading-[1.15]">
            Mais conexões.<br />Menos fricção.
          </h2>

          <div className="mt-16 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                {
                  title: "Matchmaking de IA",
                  desc: "Identifique sinergias. Matches inteligentes para impulsionar a inovação tecnológica no estado.",
                  graphic: "bars",
                },
                {
                  title: "Grafo de Comunidades",
                  desc: "Visualize conexões complexas. O motor de grafos exibe as Communities of Trust de forma intuitiva.",
                  graphic: "flow",
                },
                {
                  title: "Gestão Descentralizada",
                  desc: "Dashboards inteligentes para pesquisadores, governo e setor privado.",
                  graphic: "chart",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`p-8 bg-background/70 backdrop-blur-md ${i < 2 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
                >
                  <div className="mb-6 h-32 rounded-lg border border-border bg-card/30 flex items-center justify-center">
                    <div className="space-y-2 w-full px-6">
                      {feature.graphic === "bars" && (
                        <>
                          {[
                            { w: "w-full", color: "bg-destructive" },
                            { w: "w-3/4", color: "bg-warning" },
                            { w: "w-1/2", color: "bg-primary" },
                            { w: "w-1/4", color: "bg-success" },
                          ].map((bar, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className={`h-2 ${bar.w} rounded-full ${bar.color}`} />
                            </div>
                          ))}
                        </>
                      )}
                      {feature.graphic === "flow" && (
                        <div className="flex items-center justify-between px-2">
                          {["bg-info", "bg-warning", "bg-success"].map((c, j) => (
                            <div key={j} className="flex flex-col items-center gap-2">
                              <div className={`h-8 w-8 rounded-full ${c}`} />
                              <div className="h-1 w-8 rounded-full bg-muted-foreground/10" />
                            </div>
                          ))}
                        </div>
                      )}
                      {feature.graphic === "chart" && (
                        <div className="flex items-end gap-1.5 h-16 px-2">
                          {[40, 65, 45, 80, 55, 70, 90].map((h, j) => (
                            <div key={j} className="relative flex-1 rounded-t border border-border overflow-hidden" style={{ height: `${h}%` }}>
                              <div className="absolute inset-0" style={{
                                backgroundImage: `repeating-linear-gradient(-45deg, ${diagonalLineColor} / 0.5) 0px, ${diagonalLineColor} / 0.5) 1px, transparent 1px, transparent 5px)`,
                              }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-[15px] font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-width divider */}
      <div className="relative z-10 w-full border-t border-border" />

      {/* Social proof */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        {/* Angular line shading background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              ${diagonalLineColor} / 0.55) 0px,
              ${diagonalLineColor} / 0.55) 1px,
              transparent 1px,
              transparent 8px
            )`,
            backgroundSize: "100% 100%",
          }}
        />
        <div className="mx-auto max-w-[1200px] relative">
          <div className="border border-border bg-background/50 backdrop-blur-md rounded-2xl p-10 max-w-[720px] mx-auto shadow-[0_0_40px_rgba(45,212,191,0.05)]">
            <blockquote className="text-[20px] font-[400] leading-[1.5] tracking-[-0.01em] text-foreground/85">
              "O motor do ARIANO mudou nossa forma de conectar pesquisadores e editais, permitindo uma transparência jamais vista através do grafo interativo."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <img src={GuiAguiarImg} alt="Guilherme Aguiar" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <span className="text-[13px] font-medium text-foreground">Guilherme Aguiar</span>
                <span className="text-[13px] text-muted-foreground ml-2">Product Owner, ARIANO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width divider */}
      <div className="relative z-10 w-full border-t border-border" />

      {/* CTA */}
      <section className="relative z-10 pt-32 pb-40 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] text-center relative">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] tracking-[-0.035em] text-foreground leading-[1.1] mx-auto max-w-[560px]">
            Faça parte da revolução tecnológica.
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-[400px] mx-auto">
            Integre-se ao projeto ARIANO e encontre oportunidades que moldam o futuro.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/cadastro">
              <button
                className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium transition-all duration-200 border border-foreground/40 text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
              >
                Acessar Plataforma
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 -ml-0.5">
            <StackedLogo size={16} />
            <span className="text-[12px] font-bold text-foreground uppercase tracking-[0.08em]">ARIANO</span>
          </div>
          <span className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} CORETO</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
