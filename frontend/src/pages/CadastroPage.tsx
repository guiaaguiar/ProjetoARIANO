import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, UploadCloud, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { CognitionExperience } from '../components/layout/CognitionExperience';

export const CadastroPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCognition, setShowCognition] = useState(false);
  const [apiPromise, setApiPromise] = useState<Promise<any> | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    institution: '',
    course: '',
    user_type: 'student',
    bio: '',
    o_que_busco: '',
    semester: '1',
    curriculo_texto: '', // Fallback se não tiver PDF
  });

  const [file, setFile] = useState<File | null>(null);

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Por favor, preencha todos os campos: nome, e-mail e senha.');
        return false;
      }
      if (!formData.email.includes('@')) {
        toast.error('O endereço de e-mail informado é inválido.');
        return false;
      }
      
      const pwd = formData.password;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
      
      if (!hasUpper || !hasNumber || !hasSpecial) {
        toast.error('Sua senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial (ex: !, @, #).');
        return false;
      }
    } else if (s === 2) {
      if (!formData.institution || !formData.course || !formData.bio) {
        toast.error('Preencha instituição, curso e bio.');
        return false;
      }
    } else if (s === 3) {
      if (!formData.o_que_busco) {
        toast.error('Conte-nos o que você busca.');
        return false;
      }
      if (!file && !formData.curriculo_texto) {
        toast.error('Faça upload do seu PDF ou cole o texto do seu currículo no campo de texto alternativo.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    // Preparar dados
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value as string);
    });
    
    if (file) {
      data.append('curriculo_pdf', file);
    }

    // Iniciar a requisição HTTP, mas NÃO "await" aqui. Deixe o CognitionExperience atuar "ENQUANTO" a request rola.
    const promise = fetch('/api/users/register', {
      method: 'POST',
      body: data,
    }).then(async res => {
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Falha ao realizar cadastro.');
      return result;
    });

    setApiPromise(promise);
    setShowCognition(true);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Perfil</label>
              <select
                value={formData.user_type}
                onChange={e => updateForm('user_type', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
              >
                <option value="student">Estudante</option>
                <option value="researcher">Pesquisador</option>
                <option value="professor">Professor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => updateForm('name', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                placeholder="Ex: João da Silva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={e => updateForm('email', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                placeholder="usuario@instituicao.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => updateForm('password', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                placeholder="••••••••"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Instituição</label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={e => updateForm('institution', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                placeholder="Ex: UFPE"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Curso / Depto</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={e => updateForm('course', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                  placeholder="Ciência da Computação"
                />
              </div>
            {formData.user_type === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Semestre</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.semester || '1'}
                  onChange={e => updateForm('semester', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white"
                />
              </div>
            )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mini-Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => updateForm('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">O que você busca?</label>
              <textarea
                value={formData.o_que_busco}
                onChange={e => updateForm('o_que_busco', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white resize-none"
                placeholder="Quero bolsas em Healthtech, procuro experiência em Machine Learning..."
              />
            </div>
            <div className="p-6 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-colors text-center cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <p className="text-white font-medium">Faça upload do seu currículo (PDF)</p>
              <p className="text-xs text-gray-400 mt-1">
                Nossa IA vai extrair e analisar. (O arquivo original é descartado, não salvamos PDF).
              </p>
              {file && (
                <div className="mt-4 p-2 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> {file.name}
                </div>
              )}
            </div>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider">OU (Fallback)</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cole informações textuais aqui</label>
              <textarea
                value={formData.curriculo_texto}
                onChange={e => updateForm('curriculo_texto', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 resize-none"
                placeholder="Exemplo de Fallback: Se não possuir o PDF agora, cole aqui as principais experiências e tecnologias que você domina..."
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden backdrop-blur-3xl bg-opacity-80">
      <AnimatePresence>
        {showCognition && (
          <CognitionExperience 
            userName={formData.name || 'Acadêmico'} 
            apiPromise={apiPromise}
            onComplete={() => {
              window.location.href = '/user/ecossistema';
            }} 
          />
        )}
      </AnimatePresence>
      
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, rgba(20, 184, 166, 0.05), transparent 25%),
                            radial-gradient(circle at 85% 30%, rgba(20, 184, 166, 0.05), transparent 25%)`,
          backgroundSize: '100% 100%'
        }}
      />
      
      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Cadastro CORETO</h2>
          <p className="text-gray-400">Junte-se à revolução do matchmaking para acadêmicos.</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-xl overflow-hidden shadow-teal-900/20 glass-panel">
          
          <div className="flex bg-gray-900/50 border-b border-gray-800">
             {[1, 2, 3].map(s => (
               <div key={s} className={`flex-1 p-3 text-center border-b-2 transition-colors duration-300 ${step === s ? 'border-teal-500 text-teal-400 font-bold' : step > s ? 'border-teal-900 text-teal-900' : 'border-transparent text-gray-600'}`}>
                 Passo {s}
               </div>
             ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit : e => { e.preventDefault(); handleNext(); }} className="p-8">
            
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                 <button type="button" onClick={handlePrev} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-2">
                   <ArrowLeft className="w-4 h-4" /> Voltar
                 </button>
              ) : (
                <div />
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                {loading ? <Settings className="w-5 h-5 animate-spin" /> : step === 3 ? 'Finalizar Cadastro' : 'Avançar'}
                {!loading && step < 3 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            
          </form>
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
           Já possui conta? <Link to="/login" className="text-teal-500 hover:text-teal-400 font-medium">Entrar agora</Link>
        </div>

      </div>
    </div>
  );
};
