import { Link } from "react-router-dom";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { Graph3D } from "@/components/Graph3D";

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

const CUBE_SIZE = 720;
const CUBE_OFFSET_X = -60;
const CUBE_OFFSET_Y = 0;

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [cubeZoom, setCubeZoom] = useState(() => {
    const w = window.innerWidth;
    return w < 1024 ? 270 : 360;
  });

  useEffect(() => {
    const handleResize = () => {
      setCubeZoom(window.innerWidth < 1024 ? 270 : 360);
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
              title="Alternar tema"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Link to="/auth">
              <button className="text-[13px] text-foreground/70 hover:text-foreground transition-colors h-8 px-3">
                Entrar
              </button>
            </Link>
            <Link to="/auth">
              <button className="text-[13px] h-8 px-3 border border-foreground/40 text-foreground hover:bg-foreground hover:text-background transition-colors">
                Cadastrar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-0 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px] relative">
          <div className="pt-[52px] pb-16 relative flex">
            <div className="relative z-[3] flex-1 min-w-0 max-w-[540px]">
              <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-[500] leading-[1.08] tracking-[-0.04em] text-foreground max-w-[540px]">
                Conexões inteligentes para o ecossistema de inovação
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-[420px]">
                O projeto ARIANO une Governo, Academia e Iniciativa Privada através de IA generativa. Construa o seu ecossistema e encontre os matches perfeitos.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link to="/auth">
                  <button className="group relative inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-foreground text-background transition-all duration-200 hover:bg-foreground/90">
                    Conhecer o Grafo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block flex-1 relative z-[1]" style={{ minWidth: 0 }}>
              <div className="absolute top-1/2 right-0 -translate-y-1/2" style={{ width: CUBE_SIZE, height: CUBE_SIZE, transform: `translate(${-CUBE_OFFSET_X}px, calc(-50% + ${CUBE_OFFSET_Y}px))` }}>
                <Graph3D
                  size={CUBE_SIZE}
                  lineHex={theme === "dark" ? "#1aa0b8" : "#0d7a8c"}
                  nodeHex={theme === "dark" ? "#3fd4ec" : "#0d7a8c"}
                  nodeCount={7}
                  connectionRadius={2.4}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  title: "Grafo de Comunidades",
                  desc: "Visualize todas as conexões em um ambiente 2D de alta performance. Identifique as CoT (Communities of Trust) com facilidade.",
                  graphic: "flow",
                },
                {
                  title: "Matchmaking de IA",
                  desc: "Agentes especializados da NVIDIA analisam currículos e editais para recomendar parcerias de alto impacto.",
                  graphic: "bars",
                },
                {
                  title: "Gestão Descentralizada",
                  desc: "Dashboards voltados para o CORETO e usuários finais. Monitore o desenvolvimento tecnológico com transparência.",
                  graphic: "chart",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`p-8 bg-background/70 backdrop-blur-md ${i < 2 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0 border-border" : ""}`}
                >
                  <h3 className="text-[15px] font-medium text-foreground mb-2 mt-4">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
            <Link to="/auth">
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
