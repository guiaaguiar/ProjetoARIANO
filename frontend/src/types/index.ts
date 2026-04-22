export interface Skill {
  uid: string;
  name: string;
  category: string;
}

export interface Area {
  uid: string;
  name: string;
  parent_area: string;
}

export interface Student {
  uid: string;
  name: string;
  email: string;
  institution: string;
  course: string;
  semester: number;
  bio: string;
  curriculo_texto: string;
  maturidade: number;
  o_que_busco: string;
  skills: Skill[];
  node_type: 'student';
}

export interface Researcher {
  uid: string;
  name: string;
  email: string;
  institution: string;
  bio: string;
  curriculo_texto: string;
  maturidade: number;
  o_que_busco: string;
  skills: Skill[];
  areas: Area[];
  node_type: 'researcher';
}

export interface Professor {
  uid: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  research_group: string;
  bio: string;
  curriculo_texto: string;
  maturidade: number;
  o_que_busco: string;
  skills: Skill[];
  areas: Area[];
  node_type: 'professor';
}

export interface Edital {
  uid: string;
  title: string;
  description: string;
  instituicao: string;
  edital_type: string;
  funding: number;
  deadline: string;
  min_maturidade: number;
  status: string;
  required_skills: Skill[];
  target_areas: Area[];
  node_type: 'edital';
}

export interface Match {
  entity_uid: string;
  entity_name: string;
  entity_type: string;
  edital_uid: string;
  edital_title: string;
  score: number;
  matched_skills: string[];
  matched_areas: string[];
  justification: string;
  agency: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  color: string;
  cluster_id?: number;
  influence?: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
  color: string;
  metadata: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DashboardStats {
  total_students: number;
  total_researchers: number;
  total_professors: number;
  total_editais: number;
  total_skills: number;
  total_areas: number;
  total_matches: number;
  avg_match_score: number;
  graph_mode: string;
  is_connected: boolean;
}

export type EntityType = 'student' | 'researcher' | 'professor' | 'edital' | 'skill' | 'area';

export const NODE_COLORS: Record<EntityType, string> = {
  edital: '#38bdf8',
  student: '#2dd4bf',
  researcher: '#34d399',
  professor: '#fbbf24',
  skill: '#a78bfa',
  area: '#818cf8',
};

export const NODE_LABELS: Record<EntityType, string> = {
  edital: 'Edital',
  student: 'Estudante',
  researcher: 'Pesquisador',
  professor: 'Professor',
  skill: 'Skill',
  area: 'Área',
};
