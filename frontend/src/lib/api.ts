import axios from 'axios';
import type {
  Student, Researcher, Professor, Edital, Skill, Area,
  GraphData, DashboardStats, Match,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Impede que o SPA fallback da Vercel (que converte 404s da API em index.html) quebre o app
api.interceptors.response.use((response) => {
  if (typeof response.data === 'string' && response.data.toLowerCase().includes('<!doctype html>')) {
    return Promise.reject(new Error('API indisponível, caiu no SPA fallback'));
  }
  return response;
});

// ── Dashboard ──
export const getStats = () => api.get<DashboardStats>('/stats').then(r => r.data);

// ── Skills ──
export const getSkills = () => api.get<Skill[]>('/skills').then(r => r.data);
export const createSkill = (data: { name: string; category?: string }) =>
  api.post<Skill>('/skills', data).then(r => r.data);
export const deleteSkill = (uid: string) => api.delete(`/skills/${uid}`);

// ── Areas ──
export const getAreas = () => api.get<Area[]>('/areas').then(r => r.data);
export const createArea = (data: { name: string; parent_area?: string }) =>
  api.post<Area>('/areas', data).then(r => r.data);
export const deleteArea = (uid: string) => api.delete(`/areas/${uid}`);

// ── Students ──
export const getStudents = () => api.get<Student[]>('/students').then(r => r.data);
export const getStudent = (uid: string) => api.get<Student>(`/students/${uid}`).then(r => r.data);
export const createStudent = (data: Record<string, unknown>) =>
  api.post<Student>('/students', data).then(r => r.data);
export const updateStudent = (uid: string, data: Record<string, unknown>) =>
  api.put<Student>(`/students/${uid}`, data).then(r => r.data);
export const deleteStudent = (uid: string) => api.delete(`/students/${uid}`);

// ── Researchers ──
export const getResearchers = () => api.get<Researcher[]>('/researchers').then(r => r.data);
export const getResearcher = (uid: string) => api.get<Researcher>(`/researchers/${uid}`).then(r => r.data);
export const createResearcher = (data: Record<string, unknown>) =>
  api.post<Researcher>('/researchers', data).then(r => r.data);
export const updateResearcher = (uid: string, data: Record<string, unknown>) =>
  api.put<Researcher>(`/researchers/${uid}`, data).then(r => r.data);
export const deleteResearcher = (uid: string) => api.delete(`/researchers/${uid}`);

// ── Professors ──
export const getProfessors = () => api.get<Professor[]>('/professors').then(r => r.data);
export const getProfessor = (uid: string) => api.get<Professor>(`/professors/${uid}`).then(r => r.data);
export const createProfessor = (data: Record<string, unknown>) =>
  api.post<Professor>('/professors', data).then(r => r.data);
export const updateProfessor = (uid: string, data: Record<string, unknown>) =>
  api.put<Professor>(`/professors/${uid}`, data).then(r => r.data);
export const deleteProfessor = (uid: string) => api.delete(`/professors/${uid}`);

// ── Editais ──
export const getEditais = () => api.get<Edital[]>('/editais').then(r => r.data);
export const getEdital = (uid: string) => api.get<Edital>(`/editais/${uid}`).then(r => r.data);
export const createEdital = (data: Record<string, unknown>) =>
  api.post<Edital>('/editais', data).then(r => r.data);
export const updateEdital = (uid: string, data: Record<string, unknown>) =>
  api.put<Edital>(`/editais/${uid}`, data).then(r => r.data);
export const deleteEdital = (uid: string) => api.delete(`/editais/${uid}`);

// ── Matches ──
export const getMatches = (entityUid?: string, threshold?: number) =>
  api.get<Match[]>('/matches', { params: { entity_uid: entityUid, threshold } }).then(r => r.data);

// ── Graph ──
export const getGraphData = () => api.get<GraphData>('/graph').then(r => r.data);
export const getEnrichedGraph = () => api.get<any>('/graph/enriched').then(r => r.data);
export const getGraphInsight = (uid: string) => api.get<{ insight: string }>(`/graph/insight/${uid}`).then(r => r.data);

// ═══════════════════════════════════════════
// AI AGENTS (Sprint 2)
// ═══════════════════════════════════════════

export interface AgentResponse {
  status: string;
  message: string;
  data: Record<string, unknown>;
}

// Agent status
export const getAgentStatus = () =>
  api.get<AgentResponse>('/agents/status').then(r => r.data);

// Profile analysis
export const analyzeProfile = (data: {
  entity_uid: string;
  entity_type: string;
  name?: string;
  bio?: string;
  institution?: string;
  course?: string;
  level?: string;
  skills?: string[];
}) => api.post<AgentResponse>('/agents/analyze-profile', data).then(r => r.data);

// Edital interpretation
export const interpretEdital = (data: {
  edital_uid: string;
  title?: string;
  description?: string;
  agency?: string;
}) => api.post<AgentResponse>('/agents/interpret-edital', data).then(r => r.data);

// Match calculation
export const calculateMatches = (data?: {
  entity_uid?: string;
  edital_uid?: string;
}) => api.post<AgentResponse>('/agents/calculate-matches', data || {}).then(r => r.data);

// Recalculate all matches
export const recalculateAllMatches = () =>
  api.post<AgentResponse>('/agents/recalculate-all').then(r => r.data);

// Run full pipeline
export const runPipeline = () =>
  api.post<AgentResponse>('/agents/run-pipeline').then(r => r.data);

// Match statistics
export const getMatchStats = () =>
  api.get<AgentResponse>('/agents/match-stats').then(r => r.data);

// Entity connections
export const getEntityConnections = (uid: string) =>
  api.get<AgentResponse>(`/agents/connections/${uid}`).then(r => r.data);

// ── Admin ──
export const seedDatabase = () => api.post('/seed').then(r => r.data);
export const seedAndConfigure = () => api.post('/seed-and-configure').then(r => r.data);

export default api;
