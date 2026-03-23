import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2, X, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Edital } from '../types';
import * as api from '../lib/api';
import { NODE_COLORS } from '../types';

export default function EditaisPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', agency: '', edital_type: 'pesquisa',
    funding: '', deadline: '', min_level: 'graduacao',
    required_skills: '', target_areas: '',
  });

  const loadData = () => {
    setLoading(true);
    api.getEditais()
      .then(setEditais)
      .catch(() => toast.error('Erro ao carregar editais'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    try {
      await api.createEdital({
        ...formData,
        funding: parseFloat(formData.funding) || 0,
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        target_areas: formData.target_areas.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Edital cadastrado!');
      setShowForm(false);
      setFormData({ title: '', description: '', agency: '', edital_type: 'pesquisa', funding: '', deadline: '', min_level: 'graduacao', required_skills: '', target_areas: '' });
      loadData();
    } catch { toast.error('Erro ao cadastrar'); }
  };

  const handleDelete = async (uid: string) => {
    try {
      await api.deleteEdital(uid);
      toast.success('Edital removido');
      loadData();
    } catch { toast.error('Erro ao remover'); }
  };

  const agencyColors: Record<string, string> = {
    FACEPE: '#0ea5e9', CNPq: '#10b981', CAPES: '#8b5cf6',
    'Prefeitura do Recife': '#f59e0b',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold text-text-primary">
            Editais
          </motion.h1>
          <p className="text-text-secondary mt-1">Chamadas públicas e oportunidades de financiamento</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Edital
        </button>
      </div>

      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={`skel-${i}`} className="card-glass p-5 animate-pulse">
                <div className="h-40 bg-surface-hover rounded" />
              </motion.div>
            ))
          ) : (
            editais.map(edital => {
              const agencyColor = agencyColors[edital.agency] || '#64748b';
              return (
                <motion.div
                  key={edital.uid} layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card-glass p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="badge text-[11px]"
                          style={{ backgroundColor: `${agencyColor}15`, borderColor: `${agencyColor}30`, color: agencyColor }}
                        >
                          {edital.agency}
                        </span>
                        <span className="badge text-[11px] bg-surface-hover border-border text-text-muted">
                          {edital.edital_type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-text-primary text-sm leading-tight">{edital.title}</h3>
                    </div>
                    <button onClick={() => handleDelete(edital.uid)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {edital.description && (
                    <p className="text-text-secondary text-xs mb-3 line-clamp-2">{edital.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      R$ {edital.funding.toLocaleString('pt-BR')}
                    </span>
                    {edital.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {edital.deadline}
                      </span>
                    )}
                    <span className="badge text-[10px] bg-surface-hover border-border text-text-muted">
                      min: {edital.min_level}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {edital.required_skills.map(sk => (
                      <span key={sk.uid} className="badge text-[11px]"
                        style={{ backgroundColor: `${NODE_COLORS.skill}15`, borderColor: `${NODE_COLORS.skill}30`, color: NODE_COLORS.skill }}>
                        {sk.name}
                      </span>
                    ))}
                    {edital.target_areas.map(a => (
                      <span key={a.uid} className="badge text-[11px]"
                        style={{ backgroundColor: `${NODE_COLORS.area}15`, borderColor: `${NODE_COLORS.area}30`, color: NODE_COLORS.area }}>
                        {a.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
            onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="card-glass p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Novo Edital</h2>
                <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Título do edital" value={formData.title}
                  onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} />
                <textarea placeholder="Descrição" rows={3} value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Agência (FACEPE, CNPq...)" value={formData.agency}
                    onChange={e => setFormData(d => ({ ...d, agency: e.target.value }))} />
                  <select value={formData.edital_type}
                    onChange={e => setFormData(d => ({ ...d, edital_type: e.target.value }))}>
                    <option value="pesquisa">Pesquisa</option>
                    <option value="extensao">Extensão</option>
                    <option value="iniciacao_cientifica">Iniciação Científica</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Valor (R$)" value={formData.funding}
                    onChange={e => setFormData(d => ({ ...d, funding: e.target.value }))} />
                  <input type="date" value={formData.deadline}
                    onChange={e => setFormData(d => ({ ...d, deadline: e.target.value }))} />
                </div>
                <select value={formData.min_level}
                  onChange={e => setFormData(d => ({ ...d, min_level: e.target.value }))}>
                  <option value="graduacao">Graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
                <input placeholder="Skills necessárias (separadas por vírgula)" value={formData.required_skills}
                  onChange={e => setFormData(d => ({ ...d, required_skills: e.target.value }))} />
                <input placeholder="Áreas alvo (separadas por vírgula)" value={formData.target_areas}
                  onChange={e => setFormData(d => ({ ...d, target_areas: e.target.value }))} />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCreate} className="btn-primary flex-1">Cadastrar Edital</button>
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

