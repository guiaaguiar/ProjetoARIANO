import os
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches

def create_document():
    doc = Document()
    
    # Configure styles
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Arial'
    font.size = Pt(12)

    # 1. CAPA
    for _ in range(5):
        doc.add_paragraph()
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("CENTRO UNIVERSITÁRIO MAURÍCIO DE NASSAU (UNINASSAU)\nCURSO DE CIÊNCIA DA COMPUTAÇÃO\nDISCIPLINA DE TÓPICOS INTEGRADORES")
    run.bold = True

    for _ in range(8):
        doc.add_paragraph()

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("ARIANO\nARQUITETURA DE INTELIGÊNCIA ARTIFICIAL NATURALMENTE ORDENADA")
    run.bold = True
    font_title = run.font
    font_title.size = Pt(16)

    for _ in range(8):
        doc.add_paragraph()

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.add_run("Guilherme Andrade de Aguiar\nPedro Miranda\nRicardo Cezar O. A. de Almeida\nMarcio Maycom\nThiago José Falcão de Freitas")

    for _ in range(5):
        doc.add_paragraph()

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("Recife/PE\n2026")

    doc.add_page_break()

    # 2. RESUMO EXECUTIVO
    p_title = doc.add_heading("RESUMO EXECUTIVO", level=1)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p = doc.add_paragraph("A inovação em âmbito municipal historicamente esbarra em silos informacionais: talentos na academia frequentemente desenvolvem projetos científicos que não alcançam ou endereçam as demandas reais da indústria e do governo, enquanto o poder público, como principal fomentador através de editais (ex. Prefeitura do Recife), tem dificuldades em conectar esses incentivos aos pesquisadores mais capacitados de maneira eficiente. O ARIANO (Arquitetura de Inteligência Artificial Naturalmente Ordenada) é o motor cognitivo digital criado para a plataforma municipal CORETO, com o intuito de mitigar essa disparidade por intermédio de matchmaking inteligente. O sistema ingere, lê e processa currículos acadêmicos, interpreta editais e demandas em formato livre e preconfigura uma complexa rede de relacionamentos de forma assíncrona utilizando Modelos de Linguagem de Larga Escala (LLM) atuando em um paradigma de Graph Chain-of-Thought (Graph-CoT). Através de uma arquitetura baseada em Grafos de Conhecimento com persistência Serverless híbrida, a plataforma descarta as altas latências de consultas SQL tradicionais, possibilitando buscas de compatibilidade de ordem O(1) em tempo real. O Minimum Viable Product (MVP) alcançou pleno êxito em sua Sprint Definitiva, entregando uma interface de usuário de excelência e conectando de maneira automatizada a Academia e o Governo no ecossistema de inovação local.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_page_break()

    # 3. INTRODUÇÃO
    doc.add_heading("1. INTRODUÇÃO", level=1)
    p = doc.add_paragraph("A inovação aberta e o desenvolvimento tecnológico regional dependem da conexão eficiente entre diferentes atores sociais. No contexto do ecossistema de Recife/PE, o projeto CORETO surge como uma plataforma digital promovida pela Secretaria de Ciência, Tecnologia e Inovação (SECTI Recife), voltada à integração proativa dos pilares da inovação.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Contudo, dados acadêmicos e governamentais geralmente encontram-se isolados em silos informacionais, impedindo a aderência de talentos às oportunidades reais de fomento. Diante desse cenário, o presente projeto apresenta o ARIANO, um módulo concebido para ser o motor inteligente de matchmaking desta plataforma. O objetivo primário do ARIANO é extrair as capacidades latentes de perfis profissionais, currículos em PDF e oportunidades estruturadas, transformando essa massa de dados em recomendações de compatibilidade cirúrgicas entre a Academia e o Governo.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 4. FUNDAMENTAÇÃO TEÓRICA
    doc.add_heading("2. FUNDAMENTAÇÃO TEÓRICA", level=1)
    p = doc.add_paragraph("O alicerce do ecossistema mapeado pelo ARIANO baseia-se no modelo de inovação em Quádrupla Hélice proposto por Carayannis e Campbell (2009), que expande a clássica Tríplice Hélice (Universidade-Indústria-Governo) adicionando a Sociedade Civil como ator participativo.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Para solucionar a ineficiência intrínseca de consultas relacionais (SQL) ao processar grandes redes de ligações heterogêneas (perfil -> skill -> edital -> requisito), a plataforma adota o conceito de Grafos de Conhecimento. Essa estrutura permite uma modelagem orgânica das conexões com a propriedade matemática de adjacência livre de índice, o que garante escalabilidade onde o tempo de travessia não é penalizado pelo volume total de dados armazenados.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Somado à modelagem de grafos, o sistema emprega o paradigma emergente de Inteligência Artificial conhecido como Graph Chain-of-Thought (Graph-CoT) (Reddy, 2024). Nesta abordagem, os Agentes de IA são orquestrados para raciocinar iterativamente sobre a topologia do grafo. Em vez de utilizar processamento on-the-fly massivo do LLM no instante de busca do usuário (como no método tradicional Retrieval-Augmented Generation - RAG), o sistema precomputa e mapeia as relações de afinidade de antemão, configurando uma inteligência relacional latente.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 5. METODOLOGIA
    doc.add_heading("3. METODOLOGIA", level=1)
    p = doc.add_paragraph("A condução do desenvolvimento de software pautou-se por uma adaptação do framework ágil SCRUM, otimizada para as restrições e dinâmicas de um projeto de conclusão de curso acadêmico, compreendendo ciclos iterativos contínuos até a conclusão do MVP na Sprint Definitiva.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Do ponto de vista tecnológico, a arquitetura foi estruturada em três frentes altamente desacopladas:")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("a) Frontend: Uma interface de usuário responsiva e imersiva construída com React 18 e Vite 5. Foi utilizado Tailwind CSS v4 para o design system estrutural, com o incremento do Framer Motion para transições e animações fluidas.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("b) Backend: Um microsserviço lógico Serverless provido pela linguagem Python e framework FastAPI, responsável pelo roteamento das inferências. Este componente emprega a biblioteca LangChain para a orquestração de Agentes IA que consomem o modelo LLM NVIDIA Nemotron 3 Super.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("c) Persistência: Devido à natureza stateless do ambiente Serverless (Vercel), adotou-se o processamento lógico em memória (representação de Neo4j Local Concept) aliado à sincronização em nuvem pelo Vercel KV (Redis), resolvendo a resiliência persistente do grafo relacional.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 6. DESENVOLVIMENTO E ARQUITETURA DO SISTEMA
    doc.add_heading("4. DESENVOLVIMENTO E ARQUITETURA DO SISTEMA", level=1)
    p = doc.add_paragraph("O ciclo de vida da informação e os métodos de processamento de dados propostos pelo ARIANO dividem-se em três grandes fases arquiteturais consecutivas:")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("I. Fase de Ingresso e Extração: Documentos em formato livre, como currículos acadêmicos em formato PDF, são ingeridos velozmente via PyMuPDF e submetidos a agentes estruturadores que convertem descrições literais em atributos sistêmicos.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("II. Fase de Enriquecimento e Formação de Comunidades de Pensamento: Os Large Language Models processam semanticamente as lacunas entre as capacidades identificadas em pesquisadores e os rígidos requisitos em editais fomentados pelo governo. Nesta etapa, arestas e ligações são ponderadas (com scores de compatibilidade) e criadas dinamicamente entre os nós no grafo.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("III. Fase de Consulta O(1): Quando o usuário acessa seu painel, os matches e as justificativas cognitivas do LLM, que já foram previamente avaliadas e precomputadas na fase anterior, são recuperadas do repositório em Vercel KV e dispostas em tela de forma quase instantânea. Não ocorre dependência de execução do LLM em tempo de leitura, provendo latência O(1).")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 7. RESULTADOS OBTIDOS
    doc.add_heading("5. RESULTADOS OBTIDOS", level=1)
    p = doc.add_paragraph("O ecossistema implementado na versão de Minimum Viable Product (MVP) alcançou a maturidade técnica exigida, culminando num Deploy Fullstack bem-sucedido sobre a infraestrutura da Vercel. O uso combinado da computação Python em nuvem provou-se altamente tolerante a falhas (resiliência Serverless).")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Sob a ótica de usabilidade, a plataforma forneceu transparência cognitiva (explicabilidade do raciocínio da máquina) ao usuário através de gráficos poligonais bidimensionais (Radar Charts criados com Recharts) representativos da maturidade técnica, bem como layouts com nós interativos de força via SVG Force Graphs.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 8. CONCLUSÃO E TRABALHOS FUTUROS
    doc.add_heading("6. CONCLUSÃO E TRABALHOS FUTUROS", level=1)
    p = doc.add_paragraph("O projeto ARIANO concretizou com mérito seus objetivos como motor de matchmaking, comprovando cientificamente a viabilidade de orquestrar algoritmos de Grafos e Modelos de Linguagem em ambientes Serverless assíncronos. A proposta rompe paradigmas do uso tradicional de bancos de dados relacionais e aponta caminhos viáveis para a interoperabilidade governamental.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p = doc.add_paragraph("Como direcionamentos de pesquisa e Trabalhos Futuros, projeta-se: expandir as malhas informacionais para acolher também a Hélice da Indústria (absorvendo necessidades tecnológicas de empresas atuantes no ecossistema local), implementar algoritmos sofisticados de detecção de agrupamento da biblioteca NetworkX para sugerir coautorias entre perfis congêneres, e unificar o mecanismo de autenticação via Single Sign-On (SSO) utilizando os acessos cidadãos (Conecta Recife) do município.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # 9. REFERÊNCIAS
    doc.add_page_break()
    p_ref = doc.add_heading("REFERÊNCIAS", level=1)
    p_ref.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    references = [
        "BADDELEY, A. D.; HITCH, G. Working Memory. Psychology of Learning and Motivation, v. 8, p. 47–89, 1974.",
        "CARAYANNIS, E. G.; CAMPBELL, D. F. J. Mode 3 and Quadruple Helix: toward a 21st century fractal innovation ecosystem. International Journal of Technology Management, v. 46, n. 3/4, p. 201–234, 2009.",
        "ETZKOWITZ, H.; LEYDESDORFF, L. The Triple Helix: University-Industry-Government Relations. EASST Review, v. 14, n. 1, p. 14–19, 1995.",
        "MAYNEZ, J. et al. On Faithfulness and Factuality in Abstractive Summarization. In: Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics (ACL), 2020.",
        "REDDY, N. Cognitive-RAG: A RAG model using graph data for improved question answering through cognition. 2024. Disponível em: <https://github.com/Nikhilreddy024/Cognitive-RAG>. Acesso em: 02 jun. 2026.",
        "YAO, S. et al. ReAct: Synergizing Reasoning and Acting in Language Models. arXiv preprint arXiv:2210.03629, 2023."
    ]
    
    for ref in references:
        p = doc.add_paragraph(ref)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(12)

    doc.save("Prototype v0/Docs/Relatorio_Final_ARIANO.docx")

if __name__ == "__main__":
    create_document()
