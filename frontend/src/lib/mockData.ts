/**
 * Mock data for development without backend.
 * ~50 nodes per group for a rich graph visualization.
 */
import type { GraphData, DashboardStats, Student, Researcher, Professor, Edital, Match } from '../types';
import { NODE_COLORS } from '../types';

// ═══════════════════════════════════════════
// HELPER: generate deterministic data
// ═══════════════════════════════════════════

const institutions = ['UFPE', 'UNINASSAU', 'UNICAP', 'IFPE', 'UPE', 'UFRPE', 'FBV', 'CESAR School', 'Estácio Recife', 'UFPB', 'UFRN', 'UFC'];
const departments = ['Ciência da Computação', 'Sistemas de Informação', 'Engenharia da Computação', 'Estatística e Informática', 'Eng. Elétrica', 'Matemática Aplicada', 'Design Digital'];
const courses = ['Ciência da Computação', 'Engenharia da Computação', 'Sistemas de Informação', 'Análise de Dados', 'Engenharia de Software', 'Design Digital', 'Matemática Computacional'];
const levels = ['graduacao', 'mestrado', 'doutorado'] as const;
const researchGroups = ['GRIA', 'NuPES', 'LaSSI', 'CDLab', 'GPRT', 'LIKA', 'CIoT', 'NESC', 'LabSEC', 'VIISAR', 'SPG', 'INES'];

const studentNames = [
  'Ana Carolina Silva', 'Bruno Costa', 'Carla Mendes', 'Daniel Ferreira', 'Elena Rodrigues',
  'Felipe Santos', 'Gabriela Lima', 'Hugo Oliveira', 'Isabela Martins', 'João Pedro Souza',
  'Karina Ribeiro', 'Lucas Almeida', 'Mariana Pereira', 'Nathan Barbosa', 'Olívia Torres',
  'Pedro Henrique Gomes', 'Quésia Duarte', 'Rafael Moreira', 'Sofia Araújo', 'Thiago Carvalho',
  'Ursula Nascimento', 'Vinícius Braga', 'Wanessa Correia', 'Xavier Fonseca', 'Yasmin Medeiros',
  'Arthur Vieira', 'Bianca Ramos', 'Caio Montenegro', 'Diana Cavalcanti', 'Eduardo Lins',
  'Fernanda Queiroz', 'Gustavo Pinto', 'Helena Bezerra', 'Igor Andrade', 'Juliana Campos',
  'Kevin Melo', 'Larissa Freitas', 'Matheus Alencar', 'Natália Costa', 'Otávio Rangel',
  'Priscila Dantas', 'Ricardo Neves', 'Samara Leite', 'Tainá Monteiro', 'Ulisses Brito',
  'Valeria Pacheco', 'Wesley Tavares', 'Ximena Cruz', 'Yago Figueiredo', 'Zara Nogueira',
].slice(0, 20);

const researcherNames = [
  'Dr. Marcos Vasconcelos', 'Dra. Fernanda Albuquerque', 'MSc. Ricardo Barros', 'Dr. Paulo Monteiro', 'Dra. Lucia Campos',
  'Dr. André Costa Neto', 'Dra. Cristina Menezes', 'MSc. Rafael Drummond', 'Dr. Patricia Lemos', 'Dra. Juliana Xavier',
  'Dr. Fernando Augusto', 'MSc. Camila Rocha', 'Dr. Henrique Bastos', 'Dra. Renata Pires', 'MSc. Thiago Moura',
  'Dr. Vanessa Oliveira', 'Dra. Marcos Teixeira', 'MSc. Aline Sampaio', 'Dr. Roberto Farias', 'Dra. Simone Cardoso',
  'Dr. Leonardo Dias', 'MSc. Marina Coelho', 'Dr. Gustavo Saraiva', 'Dra. Carla Novaes', 'MSc. Diego Azevedo',
  'Dr. Amanda Portela', 'Dra. Sérgio Matos', 'MSc. Eliane Borges', 'Dr. Bruno Guimarães', 'Dra. Tatiana Leal',
  'Dr. Rodrigo Cunha', 'MSc. Priscila Barreto', 'Dr. Fabiano Lira', 'Dra. Daniela Sá', 'MSc. Carlos Eduardo Lima',
  'Dr. Marta Ventura', 'Dra. João Marcos Reis', 'MSc. Luiza Helena Castro', 'Dr. Victor Hugo Prado', 'Dra. Natasha Ferraz',
  'Dr. Otávio Mendes', 'MSc. Gabriela Rocha', 'Dr. Cláudio Vargas', 'Dra. Bianca Fontes', 'MSc. Eduardo Britto',
  'Dr. Paula Andrea Silva', 'Dra. Miguel Ângelo Torres', 'MSc. Raquel Duarte', 'Dr. Alex Sandro Melo', 'Dra. Flávia Montenegro',
].slice(0, 20);

const professorNames = [
  'Prof. Antonio Guimarães', 'Prof. Maria Beatriz', 'Prof. Roberto Nascimento', 'Prof. Sandra Freitas', 'Prof. João Cavalcanti',
  'Prof. Luciana Meira', 'Prof. Carlos Henrique', 'Prof. Regina Barros', 'Prof. Eduardo Tavares', 'Prof. Ana Paula Santos',
  'Prof. Pedro Rangel', 'Prof. Fátima Andrade', 'Prof. Alexandre Nunes', 'Prof. Marta Oliveira', 'Prof. Sérgio Costa',
  'Prof. Teresa Almeida', 'Prof. Marcos Vinícius', 'Prof. Cláudia Lima', 'Prof. Rogério Mendes', 'Prof. Adriana Farias',
  'Prof. Nelson Pereira', 'Prof. Denise Ribeiro', 'Prof. Gustavo Lemos', 'Prof. Silvana Queiroz', 'Prof. Arnaldo Pinto',
  'Prof. Elisa Correia', 'Prof. Osvaldo Braga', 'Prof. Cynthia Moreira', 'Prof. Waldemar Cruz', 'Prof. Lúcia Helena Silva',
  'Prof. Raimundo Souza', 'Prof. Cristiane Ferreira', 'Prof. Fabrício Gomes', 'Prof. Monica Alencar', 'Prof. Antônio Carlos',
  'Prof. Vera Dantas', 'Prof. Flávio Xavier', 'Prof. Patrícia Bezerra', 'Prof. Álvaro Monteiro', 'Prof. Sueli Campos',
  'Prof. Geraldo Matos', 'Prof. Helena Cavalcanti', 'Prof. Rubens Araújo', 'Prof. Simone Rodrigues', 'Prof. Tarcísio Lins',
  'Prof. Iracema Borges', 'Prof. Valmir Carvalho', 'Prof. Joana Medeiros', 'Prof. Cássio Nogueira', 'Prof. Débora Fonseca',
].slice(0, 20);

const editalNames = [
  'FACEPE - IC 2026', 'CNPq Universal 2026', 'FACEPE - Inovação Tech', 'CAPES - Mestrado 2026', 'Smart City Challenge',
  'FACEPE - Pós-Doc 2026', 'CNPq Cybersec', 'Hackathon Gov Digital', 'FINEP - Startups NE', 'FACEPE - BIC Júnior',
  'CNPq - PIBIC 2026', 'CAPES - PROEX', 'FACEPE - ATP', 'Pref. Recife - Inova', 'CNPq - DTI',
  'CAPES - PDSE Exterior', 'FACEPE - Fixação Pesq.', 'MCTI - Semicondutores', 'CNPq - PQ Produtividade', 'FACEPE - APQ',
  'Gov PE - TransformaDigital', 'SEBRAE - InovaTech', 'Embrapa - AgriDigital', 'BNDES - DeepTech', 'RNP - GT Redes',
  'FAPESP Collab PE', 'Min. Saúde - IA Saúde', 'CNPq - RHAE Inovação', 'FACEPE - Mestrado 2026', 'Porto Digital Grant',
  'ANP - P&D Energia', 'CAPES - PrInt Inter.', 'CNPq - INCT Programa', 'FACEPE - Doutorado 2026', 'Itaú Social - EdTech',
  'FACEPE - Pós-Mestrado', 'CNPq - Universal Faixa C', 'CAPES - PROSUC', 'Gov Federal - BrazilAI', 'FACEPE - IC Inovação',
  'Samsung Ocean Grant', 'Google Research Latin', 'AWS EdStart Brasil', 'Microsoft AI 4 Good', 'Meta Research NE',
  'Motorola Innov. Fund', 'Intel AcadCloud', 'NVIDIA GPU Grant', 'Huawei Seeds', 'IBM Quantum Brasil',
].slice(0, 20);

const agencies = ['FACEPE', 'CNPq', 'CAPES', 'Pref. Recife', 'FINEP', 'MCTI', 'SEBRAE', 'Embrapa', 'BNDES', 'RNP', 'FAPESP', 'Min. Saúde', 'ANP', 'Porto Digital', 'Gov PE', 'Gov Federal', 'Samsung', 'Google', 'AWS', 'Microsoft', 'Meta', 'Motorola', 'Intel', 'NVIDIA', 'Huawei', 'IBM'];

const skillNames = [
  'Python', 'Machine Learning', 'Deep Learning', 'NLP', 'React', 'TypeScript', 'Neo4j', 'Docker',
  'IoT', 'Cybersecurity', 'FastAPI', 'Data Science', 'Cloud Computing', 'TensorFlow', 'Statistics',
  'LangChain', 'Graph DBs', 'Kubernetes', 'Computer Vision', 'Reinforcement Learning',
  'PostgreSQL', 'MongoDB', 'Redis', 'Spark', 'Hadoop', 'Airflow', 'MLOps', 'DevOps',
  'Rust', 'Go', 'Java', 'C++', 'Swift', 'Kotlin', 'Flutter', 'React Native',
  'GraphQL', 'REST API', 'WebSockets', 'MQTT', 'Blockchain', 'Smart Contracts',
  'Data Engineering', 'ETL', 'Power BI', 'Tableau', 'R', 'MATLAB', 'Julia', 'Scikit-learn',
].slice(0, 20);

const areaNames = [
  'Inteligência Artificial', 'Ciência de Dados', 'Eng. de Software', 'Segurança da Informação',
  'Sistemas Embarcados', 'Computação em Nuvem', 'NLP', 'Redes de Computadores',
  'Visão Computacional', 'Robótica', 'Bioinformática', 'Computação Quântica',
  'Realidade Virtual/AR', 'Interação Humano-Computador', 'Internet das Coisas',
  'Sistemas Distribuídos', 'Bancos de Dados', 'Computação Gráfica',
  'Teoria da Computação', 'Otimização Combinatória', 'Processamento de Sinais',
  'Telecomunicações', 'Microeletrônica', 'Automação Industrial',
  'Saúde Digital', 'FinTech', 'EdTech', 'AgriTech', 'GovTech', 'LegalTech',
].slice(0, 20);

// ═══════════════════════════════════════════
// BUILD NODES
// ═══════════════════════════════════════════

type GraphNode = GraphData['nodes'][0];
type GraphEdge = GraphData['edges'][0];

const nodes: GraphNode[] = [];
const edges: GraphEdge[] = [];
let edgeId = 1;

// Students (50)
studentNames.forEach((name, i) => {
  nodes.push({
    id: `s${i + 1}`, label: name, type: 'student', size: 8,
    color: NODE_COLORS.student,
    metadata: {
      institution: institutions[i % institutions.length],
      level: levels[i % levels.length],
      course: courses[i % courses.length],
      email: `${name.split(' ')[0].toLowerCase()}@${institutions[i % institutions.length].toLowerCase().replace(/\s/g, '')}.edu.br`,
    },
  });
});

// Researchers (50)
researcherNames.forEach((name, i) => {
  nodes.push({
    id: `r${i + 1}`, label: name, type: 'researcher', size: 9,
    color: NODE_COLORS.researcher,
    metadata: {
      institution: institutions[i % institutions.length],
      level: i % 3 === 0 ? 'doutorado' : i % 3 === 1 ? 'pos-doutorado' : 'mestrado',
      bio: `Pesquisador em ${areaNames[i % areaNames.length]}`,
    },
  });
});

// Professors (50)
professorNames.forEach((name, i) => {
  nodes.push({
    id: `p${i + 1}`, label: name, type: 'professor', size: 11,
    color: NODE_COLORS.professor,
    metadata: {
      institution: institutions[i % institutions.length],
      department: departments[i % departments.length],
      research_group: researchGroups[i % researchGroups.length],
    },
  });
});

// Editais (50)
editalNames.forEach((name, i) => {
  const agency = name.includes('-') ? name.split('-')[0].trim() : agencies[i % agencies.length];
  nodes.push({
    id: `e${i + 1}`, label: name, type: 'edital', size: 14,
    color: NODE_COLORS.edital,
    metadata: {
      agency,
      funding: [4800, 12000, 24000, 30000, 50000, 72000, 80000, 100000, 150000, 200000][i % 10],
      deadline: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String(((i * 7) % 28) + 1).padStart(2, '0')}`,
      min_level: levels[i % levels.length],
    },
  });
});

// Skills (50)
skillNames.forEach((name, i) => {
  nodes.push({
    id: `sk${i + 1}`, label: name, type: 'skill', size: 6,
    color: NODE_COLORS.skill,
    metadata: { category: ['programacao', 'ia', 'banco_de_dados', 'devops', 'ciencia_dados', 'hardware', 'seguranca'][i % 7] },
  });
});

// Areas (30)
areaNames.forEach((name, i) => {
  nodes.push({
    id: `a${i + 1}`, label: name, type: 'area', size: 7,
    color: NODE_COLORS.area,
    metadata: {},
  });
});

// ═══════════════════════════════════════════
// BUILD EDGES (deterministic, seeded)
// ═══════════════════════════════════════════

function addEdge(source: string, target: string, label: string, weight: number, color: string) {
  edges.push({ id: `e_${edgeId++}`, source, target, label, weight, color, metadata: {} });
}

// Each student → 2-4 skills
studentNames.forEach((_, i) => {
  const base = (i * 3) % skillNames.length;
  addEdge(`s${i + 1}`, `sk${base + 1}`, 'possui', 0.7 + (i % 3) * 0.1, NODE_COLORS.skill);
  addEdge(`s${i + 1}`, `sk${(base + 5) % skillNames.length + 1}`, 'possui', 0.65 + (i % 4) * 0.08, NODE_COLORS.skill);
  if (i % 2 === 0) addEdge(`s${i + 1}`, `sk${(base + 11) % skillNames.length + 1}`, 'possui', 0.6 + (i % 5) * 0.07, NODE_COLORS.skill);
  if (i % 3 === 0) addEdge(`s${i + 1}`, `sk${(base + 17) % skillNames.length + 1}`, 'possui', 0.55 + (i % 6) * 0.06, NODE_COLORS.skill);
});

// Each researcher → 3-5 skills
researcherNames.forEach((_, i) => {
  const base = (i * 7 + 2) % skillNames.length;
  addEdge(`r${i + 1}`, `sk${base + 1}`, 'possui', 0.85 + (i % 3) * 0.05, NODE_COLORS.skill);
  addEdge(`r${i + 1}`, `sk${(base + 4) % skillNames.length + 1}`, 'possui', 0.80 + (i % 4) * 0.04, NODE_COLORS.skill);
  addEdge(`r${i + 1}`, `sk${(base + 9) % skillNames.length + 1}`, 'possui', 0.75 + (i % 5) * 0.05, NODE_COLORS.skill);
  if (i % 2 === 0) addEdge(`r${i + 1}`, `sk${(base + 15) % skillNames.length + 1}`, 'possui', 0.70, NODE_COLORS.skill);
  if (i % 3 === 0) addEdge(`r${i + 1}`, `sk${(base + 20) % skillNames.length + 1}`, 'possui', 0.68, NODE_COLORS.skill);
});

// Each professor → 2-4 skills
professorNames.forEach((_, i) => {
  const base = (i * 5 + 1) % skillNames.length;
  addEdge(`p${i + 1}`, `sk${base + 1}`, 'possui', 0.90 + (i % 2) * 0.05, NODE_COLORS.skill);
  addEdge(`p${i + 1}`, `sk${(base + 6) % skillNames.length + 1}`, 'possui', 0.85, NODE_COLORS.skill);
  if (i % 2 === 0) addEdge(`p${i + 1}`, `sk${(base + 12) % skillNames.length + 1}`, 'possui', 0.80, NODE_COLORS.skill);
  if (i % 3 === 0) addEdge(`p${i + 1}`, `sk${(base + 18) % skillNames.length + 1}`, 'possui', 0.78, NODE_COLORS.skill);
});

// Researchers → 1-2 areas
researcherNames.forEach((_, i) => {
  addEdge(`r${i + 1}`, `a${(i % areaNames.length) + 1}`, 'pesquisa', 1, NODE_COLORS.area);
  if (i % 2 === 0) addEdge(`r${i + 1}`, `a${((i + 7) % areaNames.length) + 1}`, 'pesquisa', 1, NODE_COLORS.area);
});

// Professors → 1-2 areas
professorNames.forEach((_, i) => {
  addEdge(`p${i + 1}`, `a${((i + 3) % areaNames.length) + 1}`, 'pesquisa', 1, NODE_COLORS.area);
  if (i % 3 === 0) addEdge(`p${i + 1}`, `a${((i + 11) % areaNames.length) + 1}`, 'pesquisa', 1, NODE_COLORS.area);
});

// Editais → 2-3 required skills
editalNames.forEach((_, i) => {
  const base = (i * 4 + 3) % skillNames.length;
  addEdge(`e${i + 1}`, `sk${base + 1}`, 'requer', 1, '#8b5cf6');
  addEdge(`e${i + 1}`, `sk${(base + 7) % skillNames.length + 1}`, 'requer', 1, '#8b5cf6');
  if (i % 2 === 0) addEdge(`e${i + 1}`, `sk${(base + 14) % skillNames.length + 1}`, 'requer', 1, '#8b5cf6');
});

// Editais → 1-2 target areas
editalNames.forEach((_, i) => {
  addEdge(`e${i + 1}`, `a${(i % areaNames.length) + 1}`, 'foca_em', 1, NODE_COLORS.area);
  if (i % 3 === 0) addEdge(`e${i + 1}`, `a${((i + 5) % areaNames.length) + 1}`, 'foca_em', 1, NODE_COLORS.area);
});

// Professors advise students (1-2 each)
professorNames.forEach((_, i) => {
  addEdge(`p${i + 1}`, `s${(i % studentNames.length) + 1}`, 'orienta', 1, NODE_COLORS.professor);
  if (i % 3 === 0) addEdge(`p${i + 1}`, `s${((i + 13) % studentNames.length) + 1}`, 'orienta', 1, NODE_COLORS.professor);
});

// Professors collaborate with researchers
professorNames.forEach((_, i) => {
  if (i % 2 === 0) addEdge(`p${i + 1}`, `r${(i % researcherNames.length) + 1}`, 'colabora', 1, NODE_COLORS.professor);
});

// ELIGIBLE_FOR matches — students get ~10 editais each, researchers 1-2, professors 1-2
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 10; j++) {
    addEdge(`s${i + 1}`, `e${((i + j * 3) % editalNames.length) + 1}`, 'elegível', 0.60 + ((i + j) % 4) * 0.1, '#0ea5e9');
  }
}
for (let i = 0; i < 20; i++) {
  addEdge(`r${i + 1}`, `e${(i * 2 + 1) % editalNames.length + 1}`, 'elegível', 0.75 + (i % 4) * 0.06, '#0ea5e9');
  if (i % 2 === 0) addEdge(`r${i + 1}`, `e${(i * 5 + 8) % editalNames.length + 1}`, 'elegível', 0.70 + (i % 3) * 0.08, '#0ea5e9');
}
for (let i = 0; i < 20; i++) {
  addEdge(`p${i + 1}`, `e${(i * 4 + 2) % editalNames.length + 1}`, 'elegível', 0.80 + (i % 3) * 0.07, '#0ea5e9');
  if (i % 3 === 0) addEdge(`p${i + 1}`, `e${(i * 6 + 10) % editalNames.length + 1}`, 'elegível', 0.78 + (i % 4) * 0.05, '#0ea5e9');
}

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════

export const MOCK_GRAPH: GraphData = { nodes, edges };

export const MOCK_STATS: DashboardStats = {
  total_students: studentNames.length,
  total_researchers: researcherNames.length,
  total_professors: professorNames.length,
  total_editais: editalNames.length,
  total_skills: skillNames.length,
  total_areas: areaNames.length,
  total_matches: 40,
  avg_match_score: 0.84,
};

// ═══════════════════════════════════════════
// MOCK ENTITY LISTS (for CRUD pages)
// ═══════════════════════════════════════════

const makeSkillObjects = (ids: number[]) => ids.map(i => ({ uid: `sk${i}`, name: skillNames[i - 1], category: ['programacao', 'ia', 'banco_de_dados', 'devops', 'ciencia_dados', 'hardware', 'seguranca'][(i - 1) % 7] }));

export const MOCK_STUDENTS: Student[] = studentNames.map((name, i) => ({
  uid: `s${i + 1}`, name, node_type: 'student' as const,
  email: `${name.split(' ')[0].toLowerCase()}@${institutions[i % institutions.length].toLowerCase().replace(/\s/g, '')}.edu.br`,
  institution: institutions[i % institutions.length],
  bio: `Estudante de ${courses[i % courses.length]} com interesse em ${areaNames[i % areaNames.length]}`,
  level: levels[i % levels.length] as string,
  course: courses[i % courses.length],
  semester: (i % 8) + 1,
  skills: makeSkillObjects([(i * 3) % skillNames.length + 1, ((i * 3 + 5) % skillNames.length) + 1]),
}));

export const MOCK_RESEARCHERS: Researcher[] = researcherNames.map((name, i) => ({
  uid: `r${i + 1}`, name, node_type: 'researcher' as const,
  email: `${name.split(' ').pop()!.toLowerCase()}@${institutions[i % institutions.length].toLowerCase().replace(/\s/g, '')}.edu.br`,
  institution: institutions[i % institutions.length],
  bio: `Pesquisador em ${areaNames[i % areaNames.length]} com foco em ${skillNames[(i * 7 + 2) % skillNames.length]}`,
  level: i % 3 === 0 ? 'doutorado' : i % 3 === 1 ? 'pos-doutorado' : 'mestrado',
  lattes_url: `http://lattes.cnpq.br/${String(i + 1000).padStart(16, '0')}`,
  skills: makeSkillObjects([(i * 7 + 2) % skillNames.length + 1, ((i * 7 + 6) % skillNames.length) + 1, ((i * 7 + 11) % skillNames.length) + 1]),
  areas: [{ uid: `a${(i % areaNames.length) + 1}`, name: areaNames[i % areaNames.length], parent_area: '' }],
}));

export const MOCK_PROFESSORS: Professor[] = professorNames.map((name, i) => ({
  uid: `p${i + 1}`, name, node_type: 'professor' as const,
  email: `${name.split(' ').pop()!.toLowerCase()}@${institutions[i % institutions.length].toLowerCase().replace(/\s/g, '')}.edu.br`,
  institution: institutions[i % institutions.length],
  bio: `Professor de ${departments[i % departments.length]} com pesquisa em ${areaNames[(i + 3) % areaNames.length]}`,
  department: departments[i % departments.length],
  research_group: researchGroups[i % researchGroups.length],
  skills: makeSkillObjects([(i * 5 + 1) % skillNames.length + 1, ((i * 5 + 7) % skillNames.length) + 1]),
  areas: [{ uid: `a${((i + 3) % areaNames.length) + 1}`, name: areaNames[(i + 3) % areaNames.length], parent_area: '' }],
}));

export const MOCK_EDITAIS: Edital[] = editalNames.map((title, i) => {
  const agency = title.includes('-') ? title.split('-')[0].trim() : agencies[i % agencies.length];
  return {
    uid: `e${i + 1}`, title, node_type: 'edital' as const, status: 'aberto' as const,
    description: `Edital para fomento de pesquisa em ${areaNames[i % areaNames.length]}`,
    agency, edital_type: ['pesquisa', 'extensao', 'iniciacao_cientifica', 'inovacao'][i % 4],
    funding: [4800, 12000, 24000, 30000, 50000, 72000, 80000, 100000, 150000, 200000][i % 10],
    deadline: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String(((i * 7) % 28) + 1).padStart(2, '0')}`,
    min_level: levels[i % levels.length] as string,
    required_skills: makeSkillObjects([(i * 4 + 3) % skillNames.length + 1, ((i * 4 + 10) % skillNames.length) + 1]),
    target_areas: [{ uid: `a${(i % areaNames.length) + 1}`, name: areaNames[i % areaNames.length], parent_area: '' }],
  };
});

export const MOCK_MATCHES: Match[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    entity_uid: `s${i + 1}`, entity_name: studentNames[i], entity_type: 'student' as const,
    edital_uid: `e${(i * 3) % editalNames.length + 1}`, edital_title: editalNames[(i * 3) % editalNames.length],
    score: 0.70 + (i % 3) * 0.1,
    matched_skills: [skillNames[(i * 3) % skillNames.length], skillNames[((i * 3 + 5) % skillNames.length)]],
    matched_areas: [areaNames[i % areaNames.length]],
    justification: `Perfil compatível com as exigências do edital em ${areaNames[i % areaNames.length]}`,
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    entity_uid: `r${i + 1}`, entity_name: researcherNames[i], entity_type: 'researcher' as const,
    edital_uid: `e${(i * 2 + 1) % editalNames.length + 1}`, edital_title: editalNames[(i * 2 + 1) % editalNames.length],
    score: 0.75 + (i % 4) * 0.06,
    matched_skills: [skillNames[(i * 7 + 2) % skillNames.length], skillNames[((i * 7 + 6) % skillNames.length)]],
    matched_areas: [areaNames[i % areaNames.length]],
    justification: `Pesquisador com expertise em ${areaNames[i % areaNames.length]}`,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    entity_uid: `p${i + 1}`, entity_name: professorNames[i], entity_type: 'professor' as const,
    edital_uid: `e${(i * 4 + 2) % editalNames.length + 1}`, edital_title: editalNames[(i * 4 + 2) % editalNames.length],
    score: 0.80 + (i % 3) * 0.07,
    matched_skills: [skillNames[(i * 5 + 1) % skillNames.length], skillNames[((i * 5 + 7) % skillNames.length)]],
    matched_areas: [areaNames[(i + 3) % areaNames.length]],
    justification: `Professor com pesquisa consolidada em ${areaNames[(i + 3) % areaNames.length]}`,
  })),
].sort((a, b) => b.score - a.score);
