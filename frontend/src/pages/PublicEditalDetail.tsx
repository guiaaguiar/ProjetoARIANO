import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import type { Edital, Match } from '@/types';
import {
  ArrowLeft, ExternalLink, FileText, Download, Calendar,
  Building2, DollarSign, Layers, Sparkles, Users, Loader2,
  AlertCircle, BookOpen, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(iso: string | null) {
  if (!iso) return 'Sem prazo definido';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function getDaysLeft(deadline: string | null) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

export default function PublicEditalDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [edital, setEdital] = useState<Edital | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);

    const promises: Promise<any>[] = [api.getEdital(uid)];
    if (user?.uid) {
      promises.push(
        api.getMatches(user.uid)
          .then(matches => matches.find(m => m.edital_uid === uid) || null)
          .catch(() => null)
      );
    }

    Promise.all(promises)
      .then(([editalData, matchData]) => {
        setEdital(editalData);
        setMatch(matchData || null);
      })
      .catch(err => {
        console.error('Error fetching edital detail', err);
      })
      .finally(() => setLoading(false));
  }, [uid, user?.uid]);

  const daysLeft = edital?.deadline ? getDaysLeft(edital.deadline) : null;
  const scorePct = match ? Math.round(match.score * 100) : null;

  const deadlineColor = useMemo(() => {
    if (daysLeft === null) return 'text-muted-foreground';
    if (daysLeft === 0) return 'text-red-600';
    if (daysLeft <= 7) return 'text-red-500';
    if (daysLeft <= 14) return 'text-amber-500';
    return 'text-emerald-500';
  }, [daysLeft]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando edital...</p>
        </div>
      </PublicLayout>
    );
  }

  if (!edital) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Edital não encontrado</h1>
          <p className="text-muted-foreground text-sm">O edital solicitado não foi encontrado ou está indisponível.</p>
          <Button onClick={() => navigate('/editais')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos editais
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const heroImage = `https://picsum.photos/seed/${edital.uid}/1200/400`;

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative h-[220px] overflow-hidden">
        <img src={heroImage} alt={edital.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 py-6 max-w-[1200px] mx-auto">
          <Link to="/editais" className="inline-flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white transition-colors mb-3">
            <ArrowLeft className="h-3 w-3" /> Voltar ao catálogo
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background/70 backdrop-blur border-border text-[10px] uppercase tracking-[0.1em]">
              {edital.edital_type || 'Edital'}
            </Badge>
            {edital.status && (
              <Badge className={cn(
                'text-[10px] font-semibold',
                edital.status === 'aberto' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-muted text-muted-foreground'
              )}>
                {edital.status.charAt(0).toUpperCase() + edital.status.slice(1)}
              </Badge>
            )}
          </div>
          <h1 className="text-[clamp(1.3rem,3vw,2rem)] font-semibold text-foreground leading-[1.2] max-w-[800px]">
            {edital.title}
          </h1>
        </div>
      </div>

      <div className="px-4 md:px-10 py-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* ── Left column ── */}
          <div className="space-y-6">

            {/* Description */}
            <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[12px] uppercase tracking-[0.18em] text-primary mb-4 flex items-center gap-2 font-semibold">
                <BookOpen className="h-3 w-3" /> Sobre o Edital
              </h2>
              <p className="text-[14px] text-foreground/85 leading-[1.7] whitespace-pre-line">
                {edital.description}
              </p>
            </Card>

            {/* Tags / Skills / Areas */}
            {(edital.required_skills?.length > 0 || edital.target_areas?.length > 0) && (
              <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
                <h2 className="text-[12px] uppercase tracking-[0.18em] text-primary mb-4 flex items-center gap-2 font-semibold">
                  <Tag className="h-3 w-3" /> Competências & Áreas
                </h2>
                {edital.target_areas?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2 font-semibold">Áreas Temáticas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {edital.target_areas.map(a => (
                        <Badge key={a.uid} variant="outline" className="border-primary/30 text-primary text-[11px] font-normal">
                          {a.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {edital.required_skills?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2 font-semibold">Competências Requeridas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {edital.required_skills.map(s => (
                        <Badge key={s.uid} variant="outline" className="border-border text-muted-foreground text-[11px] font-normal">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Why this matches you */}
            {user && (
              <Card className="p-6 bg-background/40 backdrop-blur border-primary/20 rounded-md">
                <h2 className="text-[12px] uppercase tracking-[0.18em] text-primary mb-4 flex items-center gap-2 font-semibold">
                  <Sparkles className="h-3 w-3" /> Entenda por que esta oportunidade combina com você
                </h2>
                {scorePct !== null ? (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className={cn(
                        'w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center shrink-0',
                        scorePct >= 85 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500' :
                        scorePct >= 70 ? 'border-primary/50 bg-primary/10 text-primary' :
                        scorePct >= 50 ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' :
                        'border-border bg-card text-muted-foreground'
                      )}>
                        <span className="text-[22px] font-bold leading-none">{scorePct}</span>
                        <span className="text-[8px] uppercase tracking-widest opacity-70 mt-0.5">match</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">
                          {scorePct >= 85 ? 'Excelente compatibilidade!' :
                           scorePct >= 70 ? 'Boa compatibilidade' :
                           scorePct >= 50 ? 'Compatibilidade moderada' :
                           'Compatibilidade baixa'}
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          Baseado no seu perfil, skills e áreas de interesse
                        </p>
                      </div>
                    </div>

                    {match?.justification && (
                      <div className="border-l-2 border-primary/45 pl-4 py-2 bg-primary/[0.03] rounded-r mb-4">
                        <p className="text-[13px] leading-[1.6] text-foreground/85 italic">
                          "{match.justification}"
                        </p>
                      </div>
                    )}

                    {(() => {
                      const m = match;
                      const hasSkills = (m?.matched_skills?.length ?? 0) > 0;
                      const hasAreas = (m?.matched_areas?.length ?? 0) > 0;
                      if (!m || (!hasSkills && !hasAreas)) return null;
                      return (
                        <div className="space-y-3">
                          {hasSkills && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2 font-semibold">Skills compatíveis</p>
                              <div className="flex flex-wrap gap-1.5">
                                {m.matched_skills.map(s => (
                                  <span key={s} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] text-primary font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasAreas && (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2 font-semibold">Áreas em comum</p>
                              <div className="flex flex-wrap gap-1.5">
                                {m.matched_areas.map(a => (
                                  <span key={a} className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-medium">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-md bg-card/60 border border-border">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      Nenhum match calculado ainda para este edital. Complete seu perfil e execute a análise de compatibilidade.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Attachments */}
            <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[12px] uppercase tracking-[0.18em] text-primary mb-4 flex items-center gap-2 font-semibold">
                <Download className="h-3 w-3" /> Anexos e Documentos
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'Edital Completo.pdf', size: '2.4 MB', icon: FileText },
                  { name: 'Formulário de Inscrição.docx', size: '1.1 MB', icon: FileText },
                  { name: 'Regulamento e Critérios.pdf', size: '890 KB', icon: FileText },
                ].map((file) => (
                  <div key={file.name} className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/60 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
                    <file.icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.size}</p>
                    </div>
                    <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 italic">
                Os anexos acima são exemplos. Acesse o portal oficial para documentos atualizados.
              </p>
            </Card>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* CTA card */}
            <Card className="p-6 bg-background/40 backdrop-blur border-primary/30 rounded-md">
              <h2 className="text-[13px] font-semibold text-foreground mb-4">Participar deste edital</h2>

              <Button className="w-full gap-2 font-semibold mb-3" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Quero Participar
                </a>
              </Button>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Você será direcionado para a página oficial do edital em um portal externo.
                Verifique todos os requisitos antes de se inscrever.
              </p>

              <div className="mt-5 pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Organização</p>
                    <p className="text-[13px] text-foreground font-medium">{edital.instituicao}</p>
                  </div>
                </div>

                {edital.funding > 0 && (
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Financiamento</p>
                      <p className="text-[13px] text-emerald-500 font-semibold">
                        R$ {edital.funding.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <Calendar className={cn('h-4 w-4 shrink-0', deadlineColor)} />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Prazo de Inscrição</p>
                    <p className={cn('text-[13px] font-semibold', deadlineColor)}>
                      {formatDate(edital.deadline)}
                    </p>
                    {daysLeft !== null && daysLeft > 0 && (
                      <p className="text-[10px] text-muted-foreground">{daysLeft} dias restantes</p>
                    )}
                    {daysLeft === 0 && (
                      <p className="text-[10px] text-red-500 font-semibold">Encerrado</p>
                    )}
                  </div>
                </div>

                {edital.min_maturidade > 0 && (
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Maturidade Mínima</p>
                      <p className="text-[13px] text-foreground font-medium">{edital.min_maturidade} / 10</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Organizers */}
            <Card className="p-5 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground mb-3 flex items-center gap-2 font-semibold">
                <Users className="h-3 w-3" /> Organização
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{edital.instituicao}</p>
                  <p className="text-[11px] text-muted-foreground">{edital.edital_type}</p>
                </div>
              </div>
            </Card>

            {/* Back link */}
            <Button
              variant="outline"
              className="w-full border-border hover:border-primary/50 gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/editais')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao catálogo
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
