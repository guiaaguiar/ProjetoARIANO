<p align="center">
  <img src="https://img.shields.io/badge/status-MVP_v1_Online-green?style=for-the-badge" alt="Status: MVP v1 Online" />
  <img src="https://img.shields.io/badge/versão-v1.0.0-informational?style=for-the-badge" alt="Versão: v1.0.0" />
  <img src="https://img.shields.io/badge/UNINASSAU-Tópicos_Integradores-purple?style=for-the-badge" alt="UNINASSAU" />
</p>

<h1 align="center">AR.I.A.N.O</h1>

<p align="center">
  <strong><b>AR</b>quitetura de <b>I</b>nteligência <b>A</b>rtificial <b>N</b>aturalmente <b>O</b>rdenada</strong><br/>
  O Core do Matchmaking Inteligente para a plataforma <strong>CORETO</strong>
</p>

<p align="center">
  <em>Conectando Academia e Governo através de grafos de conhecimento e agentes de IA</em>
</p>

---

## 📋 Sobre o Projeto

O **ARIANO** é o módulo de **matchmaking inteligente** da plataforma **CORETO** — uma plataforma digital da Prefeitura do Recife (SECTI Recife) que conecta os quatro pilares da **quádrupla hélice da inovação**: Academia, Governo, Indústria e Sociedade Civil.

Este repositório contém o **MVP (Minimum Viable Product)** do ARIANO, focado exclusivamente no matchmaking entre **Academia ↔ Governo**.

### 🎯 O que o ARIANO faz?

1. **Recebe** perfis acadêmicos (alunos, pesquisadores, professores) e editais governamentais.
2. **Agentes de IA** interpretam, classificam e enriquecem esses dados.
3. **Configuram um grafo** de conhecimento com relacionamentos ponderados.
4. **Matches instantâneos** via busca O(1) sobre o grafo pré-configurado.

> **Filosofia-chave:** Os agentes de IA **não fazem** o match diretamente. Eles **preparam o grafo** — o match é apenas uma query sobre adjacência livre de índice.

<div align="center">
  <img src="https://img.shields.io/badge/STACK_ARIANO-MVP-E91E63?style=for-the-badge&logo=rocket" alt="Stack Ariano MVP">
</div>

<br />

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>🎨 Frontend</h3>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
      <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" />
      <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=recharts&logoColor=white" />
      <img src="https://img.shields.io/badge/SVG_Force_Graph-FFB13B?style=flat-square&logo=svg&logoColor=white" />
      <ul>
        <li><b>Visualização:</b> Grafo Interativo (SVG + Force Graph)</li>
        <li><b>UI:</b> Animações avançadas (Framer Motion) e Gráficos (Recharts)</li>
        <li><b>Tipografia:</b> Outfit + JetBrains Mono</li>
        <li><b>Experiência:</b> Cinematográfica (Dark/Light mode)</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>⚙️ Backend & Dados</h3>
      <img src="https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white" />
      <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
      <br />
      <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white" />
      <img src="https://img.shields.io/badge/NVIDIA_Nemotron-76B900?style=flat-square&logo=nvidia&logoColor=white" />
      <img src="https://img.shields.io/badge/Vercel_KV_(Redis)-000000?style=flat-square&logo=vercel&logoColor=white" />
      <ul>
        <li><b>Orquestração:</b> LangGraph (Agentes IA)</li>
        <li><b>LLM:</b> NVIDIA Nemotron 3 Super (via OpenRouter)</li>
        <li><b>Persistência:</b> Híbrida Vercel KV (resolvendo stateless)</li>
        <li><b>Deploy:</b> Vercel Fullstack Serverless</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Python (3.12+)
- Variáveis de ambiente configuradas (`.env` no backend para OpenRouter API Key e Vercel KV)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd app
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r ../requirements.txt
uvicorn api.index:app --reload
```

---

## 🏗️ Status Atual

O MVP está concluído (Sprint Definitiva), operando com **UX Premium, Deploy Fullstack na Vercel e Resiliência Serverless** (graças ao Vercel KV). O sistema foi validado em produção como motor do CORETO.

---

## 📚 Documentação

| Documento | Descrição | Link |
|-----------|-----------|------|
| **Documento do Projeto** | Histórico consolidado do MVP, arquitetura e design vision. | [`Docs/01_DOCUMENTO_PROJETO_ARIANO.md`](Prototype%20v0/Docs/01_DOCUMENTO_PROJETO_ARIANO.md) |
| **Relatório Final Acadêmico** | Relatório de entrega rigoroso para a banca da UNINASSAU. | [`Docs/02_RELATORIO_FINAL_ACADEMICO.md`](Prototype%20v0/Docs/02_RELATORIO_FINAL_ACADEMICO.md) |

---

## 👥 Equipe e Instituição

**Instituição:** UNINASSAU Graças — Recife/PE (Tópicos Integradores)

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Guilherme Andrade de Aguiar | 01606498 | Product Owner / Tech Lead / Product Manager |
| Pedro Miranda | 01607408 | DevOps / Back-End Developer |
| Ricardo Cezar O. A. de Almeida | 01606498 | AI Agent Architect / Graph Data Engineer |
| Marcio Maycom | 01607574 | UX UI Designer / Front-End Developer |
| Thiago José Falcão de Freitas | 01597267 | Scrum Master / QA |

---

## 📄 Licença
Este projeto é desenvolvido no contexto acadêmico da UNINASSAU Graças.
