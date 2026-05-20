import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import * as api from "@/lib/api";
import type { Edital } from "@/types";
import { 
  Search, 
  Filter, 
  FileText, 
  X, 
  Calendar, 
  Infinity as InfinityIcon, 
  CornerDownLeft,
  Loader2,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Urgency logic ---------- */

type Urgency =
  | { kind: "continuous"; color: string; ringHsl: string; label: string }
  | { kind: "safe"; color: string; ringHsl: string; label: string }
  | { kind: "soft"; color: string; ringHsl: string; label: string; pulse: true }
  | { kind: "warn"; color: string; ringHsl: string; label: string; pulse: true }
  | { kind: "critical"; color: string; ringHsl: string; label: string; pulse: true; countdown: true };

function getUrgency(deadlineAt: string | null): Urgency {
  if (!deadlineAt) {
    return {
      kind: "continuous",
      color: "text-info border-info/50 bg-info/10",
      ringHsl: "var(--info)",
      label: "Fluxo contínuo",
    };
  }
  const ms = new Date(deadlineAt).getTime() - Date.now();
  const hours = ms / 3_600_000;
  const days = hours / 24;

  if (days > 14) {
    return {
      kind: "safe",
      color: "text-success border-success/50 bg-success/10",
      ringHsl: "var(--success)",
      label: `${Math.ceil(days)} dias restantes`,
    };
  }
  if (days > 7) {
    return {
      kind: "soft",
      color: "text-warning border-warning/50 bg-warning/10",
      ringHsl: "var(--warning)",
      label: `${Math.ceil(days)} dias restantes`,
      pulse: true,
    };
  }
  if (hours > 24) {
    return {
      kind: "warn",
      color: "text-[hsl(25_95%_53%)] border-[hsl(25_95%_53%/0.5)] bg-[hsl(25_95%_53%/0.1)]",
      ringHsl: "25 95% 53%",
      label: `${Math.ceil(hours / 24)} dias restantes`,
      pulse: true,
    };
  }
  return {
    kind: "critical",
    color: "text-destructive border-destructive/60 bg-destructive/15",
    ringHsl: "var(--destructive)",
    label: "Encerra em breve",
    pulse: true,
    countdown: true,
  };
}

function useCountdown(deadlineAt: string | null) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!deadlineAt) return;
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);
  if (!deadlineAt) return null;
  const ms = Math.max(0, new Date(deadlineAt).getTime() - Date.now());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ---------- Card Component ---------- */

function EditalCard({ e }: { e: Edital }) {
  const navigate = useNavigate();
  const u = getUrgency(e.deadline);
  const countdown = useCountdown(u.kind === "critical" ? e.deadline : null);

  const colorExpr = u.ringHsl.includes(" ") ? `hsl(${u.ringHsl})` : `hsl(${u.ringHsl})`;

  const pulseStyle =
    "pulse" in u && u.pulse
      ? ({
          ["--urgent" as never]: colorExpr,
          animation: "urgent-pulse 2.2s ease-in-out infinite",
        } as React.CSSProperties)
      : undefined;

  const imageUrl = `https://picsum.photos/seed/${e.uid}/400/225`;
  const summary = e.description.length > 120 ? e.description.slice(0, 120) + "..." : e.description;
  const areaName = e.target_areas?.[0]?.name || "Geral";

  return (
    <Card className="group relative overflow-hidden bg-background/40 backdrop-blur border-border rounded-md hover:border-primary/40 transition-all flex flex-col h-full">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt={e.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        <Badge
          variant="outline"
          className="absolute top-2.5 left-2.5 bg-background/70 backdrop-blur border-border text-[10px] uppercase tracking-[0.1em] font-normal"
        >
          {e.edital_type || "Edital"}
        </Badge>
        {e.funding > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-500/20 backdrop-blur border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span>R$ {e.funding.toLocaleString("pt-BR")}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground">{e.instituicao}</p>
          <h3 className="text-[15px] font-medium text-foreground leading-snug mt-1 line-clamp-2">
            {e.title}
          </h3>
        </div>

        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{summary}</p>

        <div className="flex flex-wrap gap-1 mt-auto">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-normal">
            {areaName}
          </Badge>
          {e.min_maturidade > 0 && (
            <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-normal">
              Maturidade Mínima: {e.min_maturidade}
            </Badge>
          )}
        </div>

        <div className="pt-2">
          <div
            className={cn(
              "rounded-md border px-2.5 py-2 flex items-center gap-2 text-[11.5px]",
              u.color,
            )}
            style={pulseStyle}
          >
            {u.kind === "continuous" ? (
              <InfinityIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Calendar className="h-3.5 w-3.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {u.kind === "continuous" ? (
                <span className="font-medium">Fluxo contínuo · sem prazo final</span>
              ) : u.kind === "critical" && countdown ? (
                <span>
                  <span className="font-mono font-semibold tabular-nums">{countdown}</span>{" "}
                  <span className="opacity-70">até encerrar</span>
                </span>
              ) : (
                <span>
                  <span className="font-medium">{u.label}</span>{" "}
                  {e.deadline && (
                    <span className="opacity-70">· {formatDate(e.deadline)}</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => navigate(`/ecossistema?focus=${e.uid}`)}
          variant="outline"
          className="w-full text-xs font-semibold py-2 h-9 border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground mt-2"
        >
          Visualizar Conexões
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Page Component ---------- */

export default function PublicEditais() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openResults, setOpenResults] = useState(false);
  const [tipos, setTipos] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getEditais()
      .then(data => {
        setEditais(data);
      })
      .catch(err => {
        console.error("Error fetching editais list", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setOpenResults(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Compute filters dynamically from loaded editais
  const TIPOS = useMemo(() => {
    return Array.from(new Set(editais.map(e => e.edital_type).filter(Boolean))) as string[];
  }, [editais]);

  const AREAS = useMemo(() => {
    return Array.from(new Set(editais.flatMap(e => e.target_areas?.map(a => a.name) || []).filter(Boolean))) as string[];
  }, [editais]);

  const TAGS = useMemo(() => {
    return Array.from(new Set(editais.flatMap(e => e.required_skills?.map(s => s.name) || []).filter(Boolean))).slice(0, 15) as string[];
  }, [editais]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return editais.filter((e) => {
      if (q && !(
        e.title.toLowerCase().includes(q) || 
        e.instituicao.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q)
      )) {
        return false;
      }
      if (tipos.length && !tipos.includes(e.edital_type)) return false;
      
      if (areas.length) {
        const hasArea = e.target_areas?.some(a => areas.includes(a.name));
        if (!hasArea) return false;
      }

      if (tags.length) {
        const hasTag = e.required_skills?.some(s => tags.includes(s.name));
        if (!hasTag) return false;
      }
      
      return true;
    });
  }, [editais, query, tipos, areas, tags]);

  const quickResults = useMemo(() => {
    if (!query.trim()) return [];
    return filtered.slice(0, 6);
  }, [query, filtered]);

  const totalFilters = tipos.length + areas.length + tags.length;
  const clearFilters = () => { setTipos([]); setAreas([]); setTags([]); };

  return (
    <PublicLayout>
      {/* Local keyframes for urgent pulse */}
      <style>{`
        @keyframes urgent-pulse {
          0%, 100% { box-shadow: 0 0 0px 0px var(--urgent, transparent), 0 0 0px 0px var(--urgent, transparent) inset; }
          50% { box-shadow: 0 0 18px 2px var(--urgent, transparent), 0 0 6px 0px var(--urgent, transparent) inset; }
        }
      `}</style>

      <div className="px-4 md:px-10 py-8 max-w-[1280px] mx-auto">
        <header className="mb-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-2 flex items-center gap-2 font-semibold">
            <FileText className="h-3 w-3" /> Catálogo
          </p>
          <h1 className="text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium tracking-tight text-foreground leading-[1.1]">
            Editais
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground max-w-[640px]">
            Todas as oportunidades de editais e financiamentos cadastradas na plataforma ARIANO.
            Filtre por tipo de fomento, área temática ou competências requeridas.
          </p>
        </header>

        {/* Search + Filters row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative flex items-center bg-card/70 backdrop-blur border border-border rounded-2xl px-4 py-3 shadow-[0_0_40px_-15px_rgba(var(--primary-rgb),0.3)] focus-within:border-primary/60 transition-all">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenResults(true); }}
                onFocus={() => setOpenResults(true)}
                placeholder="Pesquisar editais por título, órgão ou área..."
                className="flex-1 bg-transparent border-0 outline-none px-3 text-[14px] text-foreground placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
                <CornerDownLeft className="h-3 w-3" /> Enter
              </kbd>
            </div>

            {openResults && query.trim() && quickResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border rounded-xl overflow-hidden z-30 shadow-xl">
                <ul className="max-h-[320px] overflow-auto">
                  {quickResults.map((e) => (
                    <li key={e.uid}>
                      <button
                        onClick={() => { setQuery(e.title); setOpenResults(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 transition-colors text-left border-b border-border/50 last:border-0"
                      >
                        <img src={`https://picsum.photos/seed/${e.uid}/100/100`} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-primary truncate font-mono">
                              {e.target_areas?.[0]?.name || "Geral"}
                            </span>
                          </div>
                          <p className="text-[13px] text-foreground truncate font-medium">{e.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{e.instituicao}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-border hover:border-primary hover:text-primary h-auto py-3 px-4 rounded-2xl">
                <Filter className="h-4 w-4" />
                Filtros
                {totalFilters > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {totalFilters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[320px] p-0 bg-popover/95 backdrop-blur border-border">
              <div className="flex items-center justify-between px-4 h-11 border-b border-border">
                <span className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">Filtros</span>
                {totalFilters > 0 && (
                  <button onClick={clearFilters} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                    <X className="h-3 w-3" /> Limpar
                  </button>
                )}
              </div>
              <ScrollArea className="h-[420px]">
                {TIPOS.length > 0 && (
                  <FilterGroup title="Tipo de oportunidade" options={TIPOS} selected={tipos} onToggle={(v) => setTipos((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])} />
                )}
                {AREAS.length > 0 && (
                  <FilterGroup title="Área temática" options={AREAS} selected={areas} onToggle={(v) => setAreas((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])} />
                )}
                {TAGS.length > 0 && (
                  <FilterGroup title="Competências" options={TAGS} selected={tags} onToggle={(v) => setTags((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])} />
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filter chips */}
        {totalFilters > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {[...tipos.map((v) => ({ v, kind: "tipo" as const })), ...areas.map((v) => ({ v, kind: "area" as const })), ...tags.map((v) => ({ v, kind: "tag" as const }))].map(({ v, kind }) => (
              <button
                key={kind + v}
                onClick={() => {
                  if (kind === "tipo") setTipos((p) => p.filter((x) => x !== v));
                  if (kind === "area") setAreas((p) => p.filter((x) => x !== v));
                  if (kind === "tag") setTags((p) => p.filter((x) => x !== v));
                }}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-primary/40 bg-primary/10 text-[11px] text-foreground hover:bg-primary/20"
              >
                {v}
                <X className="h-3 w-3 opacity-70" />
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando catálogo de editais...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4">
              {filtered.length} edita{filtered.length === 1 ? "l" : "is"} encontrado{filtered.length === 1 ? "" : "s"}
            </p>

            {filtered.length === 0 ? (
              <Card className="p-10 text-center bg-background/40 backdrop-blur border-dashed border-border">
                <p className="text-muted-foreground text-[13px]">
                  Nenhum edital atende aos critérios. Ajuste a busca ou os filtros.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((e) => <EditalCard key={e.uid} e={e} />)}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

function FilterGroup({
  title, options, selected, onToggle,
}: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="p-3 border-b border-border last:border-0">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2 px-1 font-semibold">{title}</p>
      <div className="space-y-1">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label key={opt} className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-card transition-colors",
              checked && "bg-primary/10",
            )}>
              <Checkbox checked={checked} onCheckedChange={() => onToggle(opt)} />
              <span className="text-[12px] text-foreground leading-tight">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
