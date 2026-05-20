import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import * as api from "@/lib/api";
import type { Edital, Match } from "@/types";
import { 
  ArrowUpRight, 
  Sparkles, 
  Filter, 
  TrendingUp, 
  Search, 
  FileText, 
  CornerDownLeft, 
  ArrowRight,
  Loader2
} from "lucide-react";

function scoreColor(s: number) {
  if (s >= 85) return "text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (s >= 70) return "text-primary border-primary/30 bg-primary/10";
  if (s >= 50) return "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-muted-foreground border-border bg-card";
}

function getDeadlineStyle(deadlineStr: string): { label: string; className: string; glow: boolean } {
  if (!deadlineStr || deadlineStr === 'Fluxo Contínuo') {
    return { label: deadlineStr || 'Fluxo Contínuo', className: 'text-muted-foreground', glow: false };
  }
  // parse pt-BR date
  const parts = deadlineStr.split('/');
  if (parts.length !== 3) return { label: deadlineStr, className: 'text-muted-foreground', glow: false };
  const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const diff = d.getTime() - Date.now();
  const days = diff / 86400000;
  if (days <= 0) return { label: `Encerrado`, className: 'text-red-600 font-semibold', glow: false };
  if (days <= 7) return { label: `Prazo: ${deadlineStr}`, className: 'text-red-500 font-semibold', glow: true };
  return { label: `Prazo: ${deadlineStr}`, className: 'text-muted-foreground', glow: false };
}

export default function PublicHome() {
  const { user } = useAuthStore();
  const [minScore, setMinScore] = useState<number>(60);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [totalCommunities, setTotalCommunities] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    
    setLoading(true);
    let profilePromise;
    if (user.type === "student") {
      profilePromise = api.getStudent(user.uid);
    } else if (user.type === "researcher") {
      profilePromise = api.getResearcher(user.uid);
    } else if (user.type === "professor") {
      profilePromise = api.getProfessor(user.uid);
    }

    Promise.all([
      api.getEditais(),
      api.getMatches(user.uid),
      api.getEnrichedGraph().catch(() => null),
      profilePromise ? profilePromise.catch(() => null) : Promise.resolve(null)
    ]).then(([editaisData, matchesData, graphData, profileData]) => {
      setEditais(editaisData);
      setMatches(matchesData);
      if (graphData && graphData.summary) {
        setTotalCommunities(graphData.summary.total_communities || 4);
      }
      if (profileData) {
        setProfile(profileData);
      }
    }).catch(err => {
      console.error("Error loading home data", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    // Find matching editais, and map to matches if possible
    return editais
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.instituicao.toLowerCase().includes(q)
      )
      .map(e => {
        const match = matches.find(m => m.edital_uid === e.uid);
        return {
          uid: e.uid,
          title: e.title,
          instituicao: e.instituicao,
          score: match ? Math.round(match.score * 100) : 0,
          area: e.target_areas?.[0]?.name || "Geral"
        };
      })
      .slice(0, 6);
  }, [query, editais, matches]);

  const goToNode = (uid: string) => {
    navigate(`/ecossistema?focus=${uid}`);
  };

  const enrichedMatches = useMemo(() => {
    return matches.map(m => {
      const edital = editais.find(e => e.uid === m.edital_uid);
      const scorePct = Math.round(m.score * 100);
      return {
        ...m,
        scorePct,
        deadline: edital?.deadline ? new Date(edital.deadline).toLocaleDateString("pt-BR") : "Fluxo Contínuo",
        area: edital?.target_areas?.[0]?.name || "Tecnologia",
        image: `https://picsum.photos/seed/${m.edital_uid}/300/200`
      };
    });
  }, [matches, editais]);

  const filtered = useMemo(() => {
    return enrichedMatches
      .filter((m) => m.scorePct >= minScore)
      .sort((a, b) => b.scorePct - a.scorePct);
  }, [enrichedMatches, minScore]);

  const stats = useMemo(() => {
    const totalMatches = matches.length;
    const scores = matches.map(m => m.score * 100);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;

    return [
      { label: "Matches ativos", value: totalMatches },
      { label: "Score médio", value: `${avgScore}%` },
      { label: "Comunidades", value: totalCommunities },
      { label: "Skills mapeadas", value: profile?.skills?.length || 0 },
    ];
  }, [matches, totalCommunities, profile]);

  const firstName = user?.name ? user.name.split(" ")[0] : "Usuário";

  return (
    <PublicLayout>
      <div className="px-4 md:px-10 py-10 max-w-[1200px] mx-auto">
        {/* Greeting */}
        <section className="mb-10 text-center">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-foreground">
            Olá, {firstName}!{" "}
            <span className="text-muted-foreground">Como podemos te ajudar?</span>
          </h1>
          <p className="mt-5 max-w-[640px] mx-auto text-[15px] leading-[1.65] text-muted-foreground">
            Bem-vindo ao ARIANO! Aqui você pode descobrir editais, conexões estratégicas com seu
            perfil, métricas de evolução e muito mais. Tudo reunido num só lugar para facilitar sua
            jornada e alavancar sua carreira científica ou de inovação.
          </p>
        </section>

        {/* Search */}
        <section className="mb-12 max-w-[720px] mx-auto" ref={wrapRef}>
          <div className="relative">
            <div className="relative flex items-center bg-card/75 backdrop-blur border border-border rounded-2xl px-4 py-3 shadow-[0_0_40px_-15px_rgba(var(--primary-rgb),0.3)] focus-within:border-primary/60 transition-all">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) goToNode(results[0].uid);
                }}
                placeholder="Pergunte ao ARIANO ou busque um edital do seu match..."
                className="flex-1 bg-transparent border-0 outline-none px-3 text-[14px] text-foreground placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                <CornerDownLeft className="h-3 w-3" /> Enter
              </kbd>
            </div>

            {/* Results dropdown */}
            {open && query.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-xl overflow-hidden z-30 shadow-xl">
                {results.length === 0 ? (
                  <div className="p-4 text-[13px] text-muted-foreground text-center">
                    Nenhum edital correspondente encontrado.
                  </div>
                ) : (
                  <ul className="max-h-[320px] overflow-auto">
                    {results.map((e) => (
                      <li key={e.uid}>
                        <button
                          onClick={() => goToNode(e.uid)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 transition-colors text-left border-b border-border/50 last:border-0"
                        >
                          <img src={`https://picsum.photos/seed/${e.uid}/100/100`} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-primary">{e.area}</span>
                            </div>
                            <p className="text-[13px] text-foreground truncate font-medium">{e.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{e.instituicao}</p>
                          </div>
                          {e.score > 0 && (
                            <span className="text-[11px] font-mono text-emerald-400 shrink-0">{e.score}% Match</span>
                          )}
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quick action */}
          <div className="mt-4 flex items-center justify-center">
            <Link to="/editais">
              <Button variant="outline" size="sm" className="border-border hover:border-primary hover:text-primary gap-1 group">
                <FileText className="h-3.5 w-3.5" /> Ver todos os Editais
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando painel ARIANO...</p>
          </div>
        ) : (
          <>
            {/* Quick stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {stats.map((s) => (
                <Card key={s.label} className="p-4 bg-background/40 backdrop-blur border-border rounded-md">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-[22px] font-medium text-foreground tracking-tight">{s.value}</p>
                </Card>
              ))}
            </section>

            {/* Matches section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-2 flex items-center gap-2 font-semibold">
                    <TrendingUp className="h-3 w-3" /> Matches sugeridos
                  </p>
                  <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-tight text-foreground leading-[1.1]">
                    Editais conectados ao seu perfil
                  </h2>
                </div>

                <Card className="p-5 bg-background/40 backdrop-blur border-border rounded-md w-full md:w-[380px] shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      <Filter className="h-3 w-3" /> Score mínimo
                    </span>
                    <span className="text-[13px] font-medium text-primary">{minScore}%</span>
                  </div>
                  <Slider value={[minScore]} onValueChange={(v) => setMinScore(v[0])} min={0} max={100} step={5} />
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span>{filtered.length} resultado(s)</span>
                    <span>100%</span>
                  </div>
                </Card>
              </div>

              <div className="grid gap-3">
                {filtered.length === 0 && (
                  <Card className="p-10 text-center bg-background/40 backdrop-blur border-dashed border-border">
                    <p className="text-muted-foreground text-[13px]">
                      Nenhum match acima de {minScore}%. Reduza o filtro para ver mais resultados.
                    </p>
                  </Card>
                )}

                {filtered.map((m) => (
                  <Card key={m.edital_uid} className="group p-0 overflow-hidden bg-background/40 backdrop-blur border-border rounded-md hover:border-primary/40 transition-all">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-[180px] shrink-0 h-32 sm:h-auto overflow-hidden">
                        <img src={m.image} alt={m.edital_title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-background/80 sm:bg-gradient-to-r sm:from-transparent sm:to-background/90" />
                        <div className={`absolute top-2 left-2 w-12 h-12 rounded-md border flex flex-col items-center justify-center backdrop-blur ${scoreColor(m.scorePct)}`}>
                          <span className="text-[16px] font-semibold leading-none">{m.scorePct}</span>
                          <span className="text-[8px] uppercase tracking-[0.1em] mt-0.5 opacity-70">score</span>
                        </div>
                      </div>

                      <div className="flex-1 p-5 flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <Badge variant="outline" className="border-border text-[10px] uppercase tracking-[0.1em] font-normal">{m.area}</Badge>
                            {(() => {
                              const ds = getDeadlineStyle(m.deadline);
                              return (
                                <span
                                  className={`text-[10px] ml-auto ${ds.className}`}
                                  style={ds.glow ? {
                                    textShadow: '0 0 8px rgba(239,68,68,0.8)',
                                  } : undefined}
                                >
                                  {ds.label}
                                </span>
                              );
                            })()}
                          </div>
                          <h3 className="text-[15px] font-medium text-foreground leading-snug">{m.edital_title}</h3>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{m.agency}</p>

                          {m.justification && (
                            <div className="mt-3 flex gap-2.5 items-start border-l-2 border-primary/45 pl-3 py-1 bg-primary/[0.02] rounded-r">
                              <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <p className="text-[12.5px] leading-[1.55] text-foreground/80 italic">{m.justification}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/editais/${m.edital_uid}`)}
                            className="border-border hover:border-primary hover:text-primary gap-1 group-hover:translate-x-0.5 transition-all"
                          >
                            Detalhes
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goToNode(m.edital_uid)}
                            className="text-muted-foreground hover:text-foreground text-[10px] h-7"
                          >
                            Ver no Grafo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
