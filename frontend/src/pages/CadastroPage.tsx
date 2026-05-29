import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, UploadCloud, FileText, Settings, ShieldCheck,
  Mail, Lock, User as UserIcon, Building, GraduationCap, Sparkles, Lock as LockIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { CognitionExperience } from '../components/layout/CognitionExperience';
import { useAuthStore } from '../store/authStore';
import { StackedLogo } from '../components/StackedLogo';
import { TagInput } from '../components/TagInput';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido').or(z.string().min(5)),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Falta letra maiúscula')
    .regex(/[0-9]/, 'Falta um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Falta caractere especial'),
  institution: z.string().min(2, 'Instituição obrigatória'),
  course: z.string().min(2, 'Curso obrigatório'),
  user_type: z.enum(['student', 'researcher', 'professor']),
  bio: z.string().min(10, 'Bio muito curta (min 10 chars)'),
  o_que_busco: z.string().min(10, 'Campo obrigatório'),
  semester: z.string().optional(),
  curriculo_texto: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Tag extraction states ───
type TagState = 'idle' | 'loading' | 'done' | 'error';

export const CadastroPage: React.FC = () => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCognition, setShowCognition] = useState(false);
  const [registeredUid, setRegisteredUid] = useState<string | null>(null);
  const [initialAiData, setInitialAiData] = useState<any>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  // ── Tag state ──
  const [tags, setTags] = useState<string[]>([]);
  const [tagState, setTagState] = useState<TagState>('idle');

  const navigate = useNavigate();

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { user_type: 'student', semester: '1' },
  });

  const userType = watch('user_type');

  useEffect(() => {
    if (!isAuthenticated) {
      fetch('/api/users/reset', { method: 'POST', credentials: 'include' })
        .then(res => res.ok && useAuthStore.getState().logout())
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.type !== 'admin' && !showCognition) {
      navigate('/user');
    }
  }, [isAuthenticated, isLoading, navigate, user, showCognition]);

  // ── Auto-extract tags whenever a file is chosen or we advance to step 3 ──
  const extractTags = useCallback(async (pdfFile?: File | null, text?: string) => {
    const hasContent = pdfFile || (text && text.trim().length > 20);
    if (!hasContent) return;

    setTagState('loading');
    try {
      const fd = new FormData();
      if (pdfFile) fd.append('curriculo_pdf', pdfFile);
      if (text) fd.append('curriculo_texto', text);

      const res = await fetch('/api/users/extract-tags', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setTags((prev) => {
        // Merge: keep user's existing manual tags, add AI tags not already present
        const merged = [...new Set([...prev, ...(data.tags || [])])];
        return merged;
      });
      setTagState('done');
    } catch (e) {
      console.error('Tag extraction failed:', e);
      setTagState('error');
      toast.error('Não foi possível extrair tags automaticamente. Adicione manualmente.');
    }
  }, []);

  // When file changes → extract immediately
  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (f) {
      setTags([]);
      extractTags(f, undefined);
    }
  };

  // When user advances to step 3 with only text → extract from text
  const onNext = async () => {
    let fields: (keyof RegisterFormData)[] = [];
    if (step === 1) fields = ['name', 'email', 'password', 'user_type'];
    if (step === 2) fields = ['institution', 'course', 'bio', 'semester'];

    const isValid = await trigger(fields);
    if (!isValid) {
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) toast.error(String(firstError));
      return;
    }
    setStep(s => s + 1);

    // If advancing to step 3 and no file, try text extraction
    if (step === 2) {
      const text = watch('curriculo_texto');
      if (!file && text && text.trim().length > 20) {
        extractTags(undefined, text);
      }
    }
  };

  // ── Submit ──
  const onSubmit = async (data: RegisterFormData) => {
    if (!file && !data.curriculo_texto) {
      toast.error('Anexe seu currículo PDF ou forneça os dados textuais.');
      return;
    }
    // BUSINESS RULE: block submit until tags are ready
    if (tagState === 'loading') {
      toast.warning('Aguarde a IA terminar de extrair suas competências.');
      return;
    }

    setLoading(true);
    setSubmittedData(data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (file) formData.append('curriculo_pdf', file);
    // Send tags as JSON string
    formData.append('skills', JSON.stringify(tags));

    const promise = fetch('/api/users/register', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(async res => {
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Falha no cadastro.');
      await checkAuth();
      if (result.uid) setRegisteredUid(result.uid);
      if (result.ai_data) setInitialAiData(result.ai_data);
      return result;
    });

    promise.catch(err => toast.error(err.message));
    setShowCognition(true);
    setLoading(false);
  };

  const inputClasses = "w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClasses = "block text-[13px] font-medium text-muted-foreground mb-1.5 ml-1";

  const isSubmitBlocked = step === 3 && tagState === 'loading';

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className={labelClasses}>Tipo de Perfil</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <select {...register('user_type')} className={inputClasses}>
                  <option value="student">Estudante</option>
                  <option value="researcher">Pesquisador / Docente</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('name')} placeholder="Ex: João Silva" className={inputClasses} />
              </div>
            </div>
            <div>
              <label className={labelClasses}>E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('email')} placeholder="usuario@ufpe.br" className={inputClasses} />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" {...register('password')} placeholder="••••••••" className={inputClasses} />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className={labelClasses}>Instituição</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('institution')} placeholder="Ex: UFPE, UPE, Porto Digital" className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Área / Curso</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register('course')} placeholder="Computação" className={inputClasses} />
                </div>
              </div>
              {userType === 'student' && (
                <div>
                  <label className={labelClasses}>Semestre</label>
                  <input type="number" {...register('semester')} className={inputClasses.replace('pl-10', 'pl-4')} />
                </div>
              )}
            </div>
            <div>
              <label className={labelClasses}>Mini-Bio Acadêmica</label>
              <textarea {...register('bio')} rows={3} placeholder="Destaque seus principais interesses..." className={inputClasses.replace('pl-10', 'pl-4') + " resize-none"} />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {/* Objective */}
            <div>
              <label className={labelClasses}>Objetivo no ARIANO</label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-4 w-4 h-4 text-primary" />
                <textarea
                  {...register('o_que_busco')}
                  rows={2}
                  placeholder="Ex: Busco bolsas de pesquisa em IA e Healthtech..."
                  className={inputClasses + " resize-none"}
                />
              </div>
            </div>

            {/* PDF Upload */}
            <div
              className="p-6 border-2 border-dashed rounded-2xl bg-card/30 hover:bg-card/50 transition-all text-center cursor-pointer relative group"
              style={{ borderColor: file ? 'rgba(14,165,233,0.5)' : undefined }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-9 h-9 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[13px] font-semibold text-foreground">
                {file ? 'Trocar PDF' : 'Anexar Currículo (PDF)'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Nossa IA extrai suas competências automaticamente.
              </p>
              {file && (
                <div className="mt-3 p-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 text-[12px] font-medium border border-primary/20">
                  <FileText className="w-4 h-4" /> {file.name}
                </div>
              )}
            </div>

            {/* OR divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border/50" />
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Ou texto</span>
              <div className="flex-grow border-t border-border/50" />
            </div>

            <textarea
              {...register('curriculo_texto')}
              rows={2}
              placeholder="Cole as principais competências do seu currículo..."
              className={inputClasses.replace('pl-10', 'pl-4') + " text-xs resize-none"}
            />

            {/* ── TAGS SECTION ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClasses + " mb-0"}>
                  Competências Identificadas
                </label>
                {tagState === 'error' && (
                  <button
                    type="button"
                    onClick={() => extractTags(file ?? undefined, watch('curriculo_texto'))}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
              <TagInput
                tags={tags}
                onChange={setTags}
                isLoading={tagState === 'loading'}
                placeholder="Digite uma competência e pressione Enter..."
              />
              {tagState === 'idle' && tags.length === 0 && (
                <p className="text-[11px] text-muted-foreground mt-2 ml-1">
                  Faça upload do PDF ou cole seu currículo acima para extração automática.
                </p>
              )}
            </div>

            {/* Lock hint */}
            {isSubmitBlocked && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl border text-[12px]"
                style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}
              >
                <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Aguarde a extração de competências para finalizar o cadastro.</span>
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-background/20 backdrop-blur-3xl">
      <AnimatePresence>
        {showCognition && (
          <CognitionExperience
            userName={watch('name') || 'Acadêmico'}
            userId={registeredUid}
            formData={submittedData}
            onComplete={async () => {
              await checkAuth();
              setTimeout(() => navigate('/user', { replace: true }), 1500);
            }}
          />
        )}
      </AnimatePresence>

      {showCognition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8 }}
          className="fixed bottom-8 right-8 z-[60]"
        >
          <button
            onClick={() => { useAuthStore.getState().checkAuth(); navigate('/user'); }}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[12px] font-bold text-white/40 uppercase tracking-widest transition-all backdrop-blur-md"
          >
            Pular Animação
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {!showCognition && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[440px] space-y-8 z-10"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <StackedLogo size={40} className="text-primary" />
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Portal de Acesso</h1>
                <p className="text-[14px] text-muted-foreground">Inicie sua jornada no ecossistema de inovação.</p>
              </div>
            </div>

            <div className="bg-card/40 border border-border backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Step tabs */}
              <div className="flex bg-muted/20 border-b border-border">
                {['Identidade', 'Perfil', 'Competências'].map((label, i) => {
                  const s = i + 1;
                  return (
                    <div
                      key={s}
                      className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                        step === s ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground/40'
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={step === 3 ? handleSubmit(onSubmit) : e => { e.preventDefault(); onNext(); }}
                className="p-7"
              >
                <div className="min-h-[320px]">
                  <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
                </div>

                <div className="mt-7 flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-muted/30 hover:bg-muted/50 text-foreground text-[14px] font-semibold transition-all flex items-center justify-center gap-2 border border-border"
                    >
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitBlocked || loading}
                    className={`flex-[2] py-3 px-4 rounded-2xl text-[14px] font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                      isSubmitBlocked
                        ? 'bg-muted/30 text-muted-foreground cursor-not-allowed border border-border'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    }`}
                  >
                    {loading ? (
                      <Settings className="h-4 w-4 animate-spin" />
                    ) : isSubmitBlocked ? (
                      <><LockIcon className="h-4 w-4" /> Extraindo Tags...</>
                    ) : step === 3 ? (
                      'Finalizar Cadastro'
                    ) : (
                      <>Avançar <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <p className="text-center text-[13px] text-muted-foreground">
              Já possui conta?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Fazer Login</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
