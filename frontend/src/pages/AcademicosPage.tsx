import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GraduationCap, Users, BookOpenText, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, Researcher, Professor } from '../types';
import * as api from '../lib/api';
import { NODE_COLORS } from '../types';

type Tab = 'students' | 'researchers' | 'professors';

export default function AcademicosPage() {
  const [tab, setTab] = useState<Tab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', institution: '', bio: '', skills: '' });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getStudents(), api.getResearchers(), api.getProfessors()])
      .then(([s, r, p]) => { setStudents(s); setResearchers(r); setProfessors(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    const skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...formData, skills };
    try {
      if (tab === 'students') await api.createStudent({ ...payload, course: '', semester: 1, level: 'graduacao' });
      else if (tab === 'researchers') await api.createResearcher({ ...payload, level: 'doutorado', lattes_url: '', areas: [] });
      else await api.createProfessor({ ...payload, department: '', research_group: '', areas: [] });
      toast.success('Cadastro realizado com sucesso!');
      setShowForm(false);
      setFormData({ name: '', email: '', institution: '', bio: '', skills: '' });
      loadData();
    } catch { toast.error('Erro ao cadastrar'); }
  };

  const handleDelete = async (uid: string, type: Tab) => {
    try {
      if (type === 'students') await api.deleteStudent(uid);
      else if (type === 'researchers') await api.deleteResearcher(uid);
      else await api.deleteProfessor(uid);
      toast.success('Removido com sucesso');
      loadData();
    } catch { toast.error('Erro ao remover'); }
  };

  const tabConfig = {
    students: { label: 'Estudantes', icon: GraduationCap, color: NODE_COLORS.student, data: students },
    researchers: { label: 'Pesquisadores', icon: Users, color: NODE_COLORS.researcher, data: researchers },
    professors: { label: 'Professores', icon: BookOpenText, color: NODE_COLORS.professor, data: professors },
  };

  const currentTab = tabConfig[tab];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-text-primary">
            Acadêmicos
          </motion.h1>
          <p className="text-text-secondary mt-1.5">Gerencie estudantes, pesquisadores e professores</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Cadastrar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ paddingBottom: '8px' }}>
        {(Object.entries(tabConfig) as [Tab, typeof currentTab][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'text-white border'
                : 'text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-transparent'
            }`}
            style={tab === key ? { backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}40`, color: cfg.color, paddingLeft: '2px', paddingRight: '2px' } : { paddingLeft: '2px', paddingRight: '2px' }}
          >
            <cfg.icon className="w-4 h-4" /> {cfg.label}
            <span className="text-xs opacity-70">({cfg.data.length})</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={`skel-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glass animate-pulse" style={{ padding: '4px' }}>
                <div className="h-32 bg-surface-hover rounded" />
              </motion.div>
            ))
          ) : (
            currentTab.data.map((entity: Student | Researcher | Professor) => (
              <motion.div
                key={entity.uid}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-glass group" style={{ padding: '4px' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${currentTab.color}20`, color: currentTab.color }}
                    >
                      {entity.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">{entity.name}</h3>
                      <p className="text-text-muted text-xs">{entity.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entity.uid, tab)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {entity.bio && <p className="text-text-secondary text-xs mb-3 line-clamp-2">{entity.bio}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {entity.skills.slice(0, 4).map(sk => (
                    <span
                      key={sk.uid}
                      className="badge text-[11px]"
                      style={{ backgroundColor: `${NODE_COLORS.skill}15`, borderColor: `${NODE_COLORS.skill}30`, color: NODE_COLORS.skill }}
                    >
                      {sk.name}
                    </span>
                  ))}
                  {entity.skills.length > 4 && (
                    <span className="badge text-[11px] bg-surface-hover border-border text-text-muted">
                      +{entity.skills.length - 4}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card-glass w-full max-w-md" style={{ padding: '4px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary px-2 pt-2">
                  Novo {currentTab.label === 'Estudantes' ? 'Estudante' : currentTab.label === 'Pesquisadores' ? 'Pesquisador' : 'Professor'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary pr-2 pt-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 px-2 pb-2">
                <input placeholder="Nome completo" value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
                <input placeholder="Email" value={formData.email}
                  onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} />
                <input placeholder="Instituição" value={formData.institution}
                  onChange={e => setFormData(d => ({ ...d, institution: e.target.value }))} />
                <textarea placeholder="Bio / Descrição" rows={3} value={formData.bio}
                  onChange={e => setFormData(d => ({ ...d, bio: e.target.value }))} />
                <input placeholder="Skills (separadas por vírgula)" value={formData.skills}
                  onChange={e => setFormData(d => ({ ...d, skills: e.target.value }))} />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCreate} className="btn-primary flex-1">Cadastrar</button>
                  <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

