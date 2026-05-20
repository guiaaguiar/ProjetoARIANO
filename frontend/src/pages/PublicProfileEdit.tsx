import { useState, useEffect, KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/lib/api';
import { ArrowLeft, Pencil, X, Plus, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    institution: '',
    course: '',
    bio: '',
    o_que_busco: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchFn =
      user.type === 'student' ? api.getStudent :
      user.type === 'researcher' ? api.getResearcher :
      api.getProfessor;

    fetchFn(user.uid)
      .then((data: any) => {
        setForm({
          name: data.name || '',
          email: data.email || '',
          password: '',
          institution: data.institution || data.department || '',
          course: data.course || data.research_group || '',
          bio: data.bio || '',
          o_que_busco: data.o_que_busco || '',
        });
        const skillNames = (data.skills || []).map((s: any) => s.name);
        setTags(skillNames);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        email: form.email,
        institution: form.institution,
        bio: form.bio,
        o_que_busco: form.o_que_busco,
      };
      if (form.course) payload.course = form.course;
      if (form.password) payload.password = form.password;

      const updateFn =
        user.type === 'student' ? api.updateStudent :
        user.type === 'researcher' ? api.updateResearcher :
        api.updateProfessor;

      await updateFn(user.uid, payload);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile', err);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "bg-card/60 border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground h-11 text-[14px]";
  const labelClass = "block text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5";

  return (
    <PublicLayout>
      <div className="px-4 md:px-10 py-8 max-w-[760px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao perfil
          </Link>
          <p className="text-[12px] uppercase tracking-[0.18em] text-primary mb-1 flex items-center gap-2 font-semibold">
            <Pencil className="h-3 w-3" /> Editar Perfil
          </p>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-foreground">
            Atualize suas informações
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Mantenha seu perfil atualizado para receber matches mais precisos.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando seus dados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal info */}
            <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[13px] font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome Completo</label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>E-mail Institucional</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="nome@instituicao.edu.br"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Senha de Acesso</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Nova senha (deixe vazio para manter)"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Instituição</label>
                  <Input
                    value={form.institution}
                    onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
                    placeholder="UFPE, UFPB, Unicamp..."
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Área / Curso</label>
                  <Input
                    value={form.course}
                    onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                    placeholder="Engenharia de Computação, Biologia..."
                    className={fieldClass}
                  />
                </div>
              </div>
            </Card>

            {/* Bio & objective */}
            <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[13px] font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Identidade Acadêmica
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Mini-Bio Acadêmica</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Descreva sua trajetória, experiências e interesses em pesquisa..."
                    rows={4}
                    className={cn(
                      "w-full rounded-md border px-3 py-2.5 text-[14px] resize-none transition-colors outline-none",
                      "bg-card/60 border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <label className={labelClass}>Objetivo no ARIANO</label>
                  <textarea
                    value={form.o_que_busco}
                    onChange={e => setForm(p => ({ ...p, o_que_busco: e.target.value }))}
                    placeholder="O que você busca na plataforma? Ex: editais de fomento, colaboração com professores, grupo de pesquisa..."
                    rows={3}
                    className={cn(
                      "w-full rounded-md border px-3 py-2.5 text-[14px] resize-none transition-colors outline-none",
                      "bg-card/60 border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
                    )}
                  />
                </div>
              </div>
            </Card>

            {/* Tags — Facebook Marketplace style */}
            <Card className="p-6 bg-background/40 backdrop-blur border-border rounded-md">
              <h2 className="text-[13px] font-semibold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Tags Relacionadas
              </h2>
              <p className="text-[11px] text-muted-foreground mb-4">
                Digite uma tag e pressione Enter ou vírgula para adicionar. Essas tags influenciam seus matches.
              </p>

              <div
                className="min-h-[52px] w-full rounded-md border border-border bg-card/60 px-3 py-2 flex flex-wrap gap-2 focus-within:border-primary/60 transition-colors cursor-text"
                onClick={() => document.getElementById('tag-input')?.focus()}
              >
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-primary/15 border border-primary/30 text-[11px] text-foreground font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeTag(tag); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  placeholder={tags.length === 0 ? 'Ex: Machine Learning, Dados, UX... pressione Enter' : ''}
                  className="flex-1 min-w-[140px] bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground py-0.5"
                />
              </div>
              {tagInput.trim() && (
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Pressione Enter para adicionar "{tagInput.trim()}"
                </p>
              )}
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <Link to="/profile">
                <Button variant="outline" className="border-border hover:border-primary/50 gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Cancelar
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={saving || saved}
                className="gap-2 min-w-[160px]"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                ) : saved ? (
                  <><Check className="h-4 w-4" /> Salvo!</>
                ) : (
                  <><Pencil className="h-4 w-4" /> Salvar Alterações</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
