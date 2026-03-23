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
  level: string;
  bio: string;
  skills: Skill[];
  node_type: 'student';
}

export interface Researcher {
  uid: string;
  name: string;
  email: string;
  institution: string;
  level: string;
  lattes_url: string;
  bio: string;
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
  skills: Skill[];
  areas: Area[];
  node_type: 'professor';
}

export interface Edital {
  uid: string;
  title: string;
  description: string;
  agency: string;
  edital_type: string;
  funding: number;
  deadline: string;
  min_level: string;
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
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  color: string;
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
}

export type EntityType = 'student' | 'researcher' | 'professor' | 'edital' | 'skill' | 'area';

export const NODE_COLORS: Record<EntityType, string> = {
  edital: '#2563eb',
  student: '#00e5ff',
  researcher: '#10b981',
  professor: '#f59e0b',
  skill: '#8b5cf6',
  area: '#6366f1',
};

export const NODE_LABELS: Record<EntityType, string> = {
  edital: 'Edital',
  student: 'Estudante',
  researcher: 'Pesquisador',
  professor: 'Professor',
  skill: 'Skill',
  area: 'Área',
};
