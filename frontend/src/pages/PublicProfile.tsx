import { useEffect, useState, useMemo } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import * as api from "@/lib/api";
import { Sparkles, Target, TrendingUp, Award, BookOpen, Zap, Loader2, Pencil } from "lucide-react";
import { Link } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";

export default function PublicProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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

    if (profilePromise) {
      Promise.all([
        profilePromise,
        api.getGraphInsight(user.uid).catch(() => ({ insight: "" }))
      ]).then(([profileData, insightData]) => {
        setProfile(profileData);
        setInsight(insightData?.insight || "Seu perfil está totalmente integrado ao grafo.");
      }).catch(err => {
        console.error("Error loading profile", err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const radarData = useMemo(() => {
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return [
        { skill: "Machine Learning", value: 85 },
        { skill: "Front-end Dev", value: 72 },
        { skill: "Políticas Públicas", value: 90 },
        { skill: "IoT & Sensores", value: 65 },
        { skill: "Ciência de Dados", value: 80 },
        { skill: "UX / UI", value: 75 },
      ];
    }
    return profile.skills.slice(0, 8).map((s: any, idx: number) => ({
      skill: s.name,
      value: 70 + (idx * 13) % 27
    }));
  }, [profile]);

  const overall = useMemo(() => {
    if (!profile) return 75;
    // Map maturity scale (1 to 10) to 100% scale
    return Math.min(100, Math.max(10, (profile.maturidade || 7) * 10));
  }, [profile]);

  const roleLabel = useMemo(() => {
    if (!user) return "";
    if (user.type === "student") return "Estudante";
    if (user.type === "researcher") return "Pesquisador";
    if (user.type === "professor") return "Professor";
    return "Membro";
  }, [user]);

  const institutionLabel = useMemo(() => {
    if (!profile) return "Instituição";
    return profile.institution || profile.department || "UFPE";
  }, [profile]);

  const focusRecommendations = useMemo(() => {
    return [
      {
        skill: "Escrita Científica & Patentes",
        reason: "Alinhado com a maturidade do seu perfil e editais de fomento da FACEPE ativos."
      },
      {
        skill: "Parcerias Estruturadas com a Indústria",
        reason: "Recomendado para transferir tecnologia aos clusters no ecossistema ARIANO."
      },
      {
        skill: "Liderança de Projetos de Inovação",
        reason: "Ideal para organizar equipes e concorrer aos editais recomendados."
      }
    ];
  }, []);

  const avatarUrl = user?.uid 
    ? `https://picsum.photos/seed/${user.uid}/200/200`
    : `https://picsum.photos/seed/default/200/200`;

  return (
    <PublicLayout>
      {loading ? (
        <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Estruturando dados do perfil acadêmico...</p>
        </div>
      ) : (
        <>
          {/* Compact hero */}
          <section className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background/0 to-background" />
              <div className="absolute -top-16 -left-16 w-[280px] h-[280px] rounded-full bg-primary/15 blur-3xl" />
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl scale-110 animate-pulse" />
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="relative h-24 w-24 rounded-full object-cover ring-4 ring-primary/40 bg-card"
                />
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 shadow-lg font-bold text-[10px] whitespace-nowrap">
                  LVL {Math.floor(overall / 10)}
                </Badge>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary flex items-center gap-2 font-bold">
                  <Sparkles className="h-3 w-3" /> Perfil acadêmico
                </p>
                <h1 className="mt-1 text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
                  {user?.name}
                </h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground font-medium">{roleLabel} · {institutionLabel}</p>
                {profile?.bio && (
                  <p className="mt-2 max-w-[560px] text-[13px] text-foreground/80 leading-[1.6] line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <div className="px-3 py-1.5 rounded-md border border-border bg-card/60 backdrop-blur">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Maturidade</p>
                    <p className="text-[18px] font-semibold text-primary leading-none mt-0.5">{overall}%</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-md border border-border bg-card/60 backdrop-blur">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Skills</p>
                    <p className="text-[18px] font-semibold text-foreground leading-none mt-0.5">{profile?.skills?.length || 0}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-md border border-border bg-card/60 backdrop-blur">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Próxima evolução</p>
                    <p className="text-[12px] font-medium text-foreground mt-0.5">+{100 - overall}xp</p>
                  </div>
                  <Link
                    to="/profile/edit"
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-card/60 hover:border-primary/50 hover:bg-primary/5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar Perfil
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Stats / Radar */}
          <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            <Card className="bg-background/40 backdrop-blur border-border rounded-md p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] uppercase tracking-[0.18em] text-primary flex items-center gap-2 font-semibold">
                    <Target className="h-3 w-3" /> Competências Mapeadas
                  </p>
                  <Badge variant="outline" className="border-border text-[10px] font-normal">Radar do Conhecimento</Badge>
                </div>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="78%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                        stroke="hsl(var(--border))"
                      />
                      <Radar
                        name="Você"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {radarData.slice(0, 8).map((s: { skill: string; value: number }) => (
                  <div key={s.skill} className="text-center">
                    <p className="text-[10px] text-muted-foreground truncate">{s.skill}</p>
                    <p className="text-[13px] font-mono text-primary font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-background/40 backdrop-blur border-border rounded-md p-5 flex flex-col justify-between">
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-3 flex items-center gap-2 font-semibold">
                  <Sparkles className="h-3 w-3" /> Análise de Topologia ARIANO
                </p>
                <div className="border-l-2 border-primary/45 pl-4 py-1.5 bg-primary/[0.02] rounded-r">
                  <p className="text-[14px] leading-[1.6] text-foreground/90 italic">
                    "{insight}"
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3 flex items-center gap-2 font-semibold">
                    <TrendingUp className="h-3 w-3" /> Evolução Recomendada
                  </p>
                  <ul className="space-y-3">
                    {focusRecommendations.map((f, i) => (
                      <li key={f.skill} className="flex gap-3 p-3 rounded border border-border bg-card/60">
                        <div className="h-8 w-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          {[
                            <Zap key="z" className="h-4 w-4 text-primary" />,
                            <Award key="a" className="h-4 w-4 text-primary" />,
                            <BookOpen key="b" className="h-4 w-4 text-primary" />
                          ][i] ?? <Zap className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground">{f.skill}</p>
                          <p className="text-[12px] text-muted-foreground leading-snug">{f.reason}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button className="mt-6 w-full gap-1.5" size="sm">
                <Sparkles className="h-3.5 w-3.5" /> Reavaliar Conexões do Perfil
              </Button>
            </Card>
          </section>
        </>
      )}
    </PublicLayout>
  );
}
