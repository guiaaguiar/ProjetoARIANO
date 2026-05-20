import { useMemo, useRef, useState, useEffect } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import * as api from "@/lib/api";
import { Send, Hash, Sparkles, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  clusterId: number;
  name: string;
  topic: string;
  members: number;
  matchedBy: string;
  unread?: number;
}

interface Message {
  id: string;
  author: string;
  initials: string;
  time: string;
  content: string;
  isMe?: boolean;
  isAI?: boolean;
}

export default function PublicComunidades() {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState<Record<string, Message[]>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const userFirstName = user?.name ? user.name.split(" ")[0] : "Você";
  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : "ME";

  useEffect(() => {
    setLoading(true);
    api.getEnrichedGraph()
      .then(data => {
        if (!data || !data.nodes) return;

        // Group nodes by cluster_id
        const groups: Record<number, any[]> = {};
        data.nodes.forEach((n: any) => {
          if (n.cluster_id !== undefined) {
            if (!groups[n.cluster_id]) groups[n.cluster_id] = [];
            groups[n.cluster_id].push(n);
          }
        });

        // Find current user node to know their cluster
        const userNode = data.nodes.find((n: any) => n.id === user?.uid);
        const userClusterId = userNode?.cluster_id;

        // Map cluster metadata
        const clustersList = data.summary?.clusters || [];
        const mappedComms: Community[] = clustersList.map((c: any) => {
          const clusterId = c.id;
          const clusterTheme = c.theme || `Grupo ${clusterId + 1}`;
          const membersList = groups[clusterId] || [];
          
          // Get some skills from the cluster to show as sub-topic
          const topSkills = membersList
            .filter((m: any) => m.type === "skill")
            .slice(0, 3)
            .map((m: any) => m.label);

          const topic = topSkills.length > 0
            ? `Interesses em: ${topSkills.join(", ")}`
            : `Colaboração científica em ${clusterTheme}`;

          // Count human members
          const membersCount = membersList.filter((m: any) => 
            ["student", "researcher", "professor"].includes(m.type)
          ).length || 1;

          const isUserCluster = clusterId === userClusterId;

          return {
            id: `cluster_${clusterId}`,
            clusterId,
            name: clusterTheme,
            topic,
            members: membersCount,
            matchedBy: isUserCluster ? "Seu Cluster Principal" : "Alinhamento de Perfil",
            unread: isUserCluster ? 2 : undefined
          };
        });

        setCommunities(mappedComms);

        // Set active community
        if (mappedComms.length > 0) {
          const defaultActive = mappedComms.find(c => c.clusterId === userClusterId) || mappedComms[0];
          setActiveId(defaultActive.id);
        }

        // Build default threads
        const initialThreads: Record<string, Message[]> = {};
        mappedComms.forEach(c => {
          const theme = c.name;
          
          // Seed typical messages
          if (theme.toLowerCase().includes("cidad") || theme.toLowerCase().includes("smart") || theme.toLowerCase().includes("cidadania")) {
            initialThreads[c.id] = [
              {
                id: "m1",
                author: "Ana Paula",
                initials: "AP",
                time: "10:24",
                content: "Olá grupo! Alguém interessado em montar uma proposta de IoT para mobilidade ativa em Recife?",
              },
              {
                id: "m2",
                author: "ARIANO",
                initials: "AI",
                time: "10:25",
                isAI: true,
                content: `Sugestão: As competências em Python e dados urbanos de ${userFirstName} se alinham em 92% a essa demanda!`,
              },
              {
                id: "m3",
                author: "Ricardo",
                initials: "RC",
                time: "10:33",
                content: "Eu topo participar. Tenho experiência com datasets públicos da prefeitura de Recife.",
              }
            ];
          } else if (theme.toLowerCase().includes("saúde") || theme.toLowerCase().includes("ia") || theme.toLowerCase().includes("médica")) {
            initialThreads[c.id] = [
              {
                id: "m1",
                author: "Dr. Roberto",
                initials: "RB",
                time: "Ontem",
                content: "Alguém viu o novo edital do SUS para telessaúde com IA? O prazo encerra no fim do mês.",
              },
              {
                id: "m2",
                author: "Karina",
                initials: "KN",
                time: "Ontem",
                content: "Estamos escrevendo um pré-projeto de NLP clínico. Roberto, vamos conversar?",
              }
            ];
          } else {
            // General / Default thread
            initialThreads[c.id] = [
              {
                id: "m1",
                author: "ARIANO",
                initials: "AI",
                time: "Hoje",
                isAI: true,
                content: `Olá, ${userFirstName}! Este canal conecta os pesquisadores do grupo de "${theme}". Compartilhe ideias, artigos ou chame outros integrantes para colaborar em editais!`,
              }
            ];
          }
        });
        
        setThreads(initialThreads);
      })
      .catch(err => {
        console.error("Error loading communities data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid, userFirstName]);

  const active = useMemo(() => {
    return communities.find((c) => c.id === activeId);
  }, [communities, activeId]);

  const messages = useMemo(() => {
    return active ? threads[active.id] || [] : [];
  }, [threads, active]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const send = () => {
    if (!draft.trim() || !active) return;
    const msg: Message = {
      id: String(Date.now()),
      author: userFirstName,
      initials: userInitials,
      isMe: true,
      time: "agora",
      content: draft.trim(),
    };
    
    setThreads((t) => ({ ...t, [active.id]: [...(t[active.id] ?? []), msg] }));
    setDraft("");
  };

  return (
    <PublicLayout>
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1280px] mx-auto h-[calc(100vh-56px)] flex flex-col">
        <header className="mb-5 flex-shrink-0">
          <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-2 flex items-center gap-2 font-semibold">
            <Users className="h-3 w-3" /> Comunidades
          </p>
          <h1 className="text-[24px] md:text-[28px] font-medium tracking-tight text-foreground">
            Fóruns de Pensamento (CoT) recomendados pelo ARIANO
          </h1>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando canais de afinidade...</p>
          </div>
        ) : communities.length === 0 ? (
          <Card className="flex-1 p-10 flex flex-col items-center justify-center text-center bg-background/40 backdrop-blur border-dashed border-border">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-[14px]">
              Nenhuma comunidade detectada. Atualize seu cadastro para indexar conexões.
            </p>
          </Card>
        ) : active ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3 min-h-0">
            {/* Community list */}
            <Card className="bg-background/40 backdrop-blur border-border rounded-md flex flex-col min-h-0">
              <div className="px-3 h-11 border-b border-border flex items-center">
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                  Suas comunidades
                </span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-1.5 space-y-0.5">
                  {communities.map((c) => {
                    const isActive = c.id === activeId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded transition-all border",
                          isActive
                            ? "bg-primary/10 border-primary/30"
                            : "border-transparent hover:bg-card hover:border-border",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Hash
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isActive ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                          <span className="text-[13px] font-medium text-foreground truncate flex-1">
                            {c.name}
                          </span>
                          {c.unread && (
                            <span className="text-[10px] bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 pl-5">
                          {c.topic}
                        </p>
                        <p className="text-[10px] text-primary/80 pl-5 mt-1 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5 shrink-0" /> {c.matchedBy}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat panel */}
            <Card className="bg-background/40 backdrop-blur border-border rounded-md flex flex-col min-h-0">
              <div className="px-4 h-14 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-medium text-foreground truncate">{active.name}</h2>
                    <p className="text-[11px] text-muted-foreground truncate">{active.topic}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-border text-[10px] uppercase tracking-[0.1em] font-normal"
                >
                  {active.members} membros
                </Badge>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex gap-3 max-w-[85%]", m.isMe && "ml-auto flex-row-reverse")}
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback
                        className={cn(
                          "text-[10px] font-medium",
                          m.isAI
                            ? "bg-primary text-primary-foreground"
                            : m.isMe
                              ? "bg-foreground text-background"
                              : "bg-card text-foreground border border-border",
                        )}
                      >
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("min-w-0", m.isMe && "text-right")}>
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1",
                          m.isMe && "justify-end",
                        )}
                      >
                        <span className="text-[12px] font-medium text-foreground flex items-center gap-1">
                          {m.isAI && <Sparkles className="h-3 w-3 text-primary" />}
                          {m.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{m.time}</span>
                      </div>
                      <div
                        className={cn(
                          "px-3.5 py-2.5 rounded-md text-[13px] leading-[1.55] inline-block text-left",
                          m.isAI
                            ? "bg-primary/10 border border-primary/30 text-foreground"
                            : m.isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border text-foreground",
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-border flex gap-2 flex-shrink-0">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder={`Mensagem para #${active.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="bg-background/60 border-border h-10 text-[13px]"
                />
                <Button onClick={send} disabled={!draft.trim()} className="h-10 px-4">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}

