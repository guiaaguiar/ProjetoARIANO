import os
import random
import uuid
from neo4j import GraphDatabase

NEO4J_URI = "neo4j+s://6c999c8d.databases.neo4j.io"
NEO4J_USER = "neo4j" 
NEO4J_PASSWORD = "E0X8r2BoScNgteHtkFwUOKbhdgu955dd6wvbRxVR99c"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Data pools for Computer Science
EDITAIS = [
    ("Bolsa FACEPE IC - Inteligência Artificial Aplicada", "FACEPE"),
    ("Bolsa CNPq IC - Visão Computacional e Robótica", "CNPq"),
    ("Edital FAPESP - Auxílio Pesquisa em Cyber Security", "FAPESP"),
    ("Edital CNPq - Universal em Engenharia de Software", "CNPq"),
    ("Bolsa de Extensão - Desenvolvimento Mobile Social", "UFPE"),
    ("Programa de Trainee R&D - Machine Learning", "Porto Digital"),
    ("Bolsa Mestrado CAPES - Ciência de Dados", "CAPES"),
    ("Edital MCTI - Computação Quântica Nacional", "MCTI"),
    ("Bolsa FAPESP - IoT para Smart Cities", "FAPESP"),
    ("Bolsa IC - Redes Neurais para Saúde", "CNPq"),
    ("Edital FACEPE - Pesquisa em Bioinformática", "FACEPE"),
    ("Bolsa Doutorado CNPq - Processamento de Linguagem Natural", "CNPq"),
    ("Programa de Inovação Aberta em Blockchain", "BNDES"),
    ("Edital de Pesquisa Aplicada - Edge Computing", "CIn/Motorola"),
    ("Bolsa Pós-Doutorado - Arquitetura de Nuvem", "CAPES"),
    ("Edital FAPEMIG - Automação Industrial Inteligente", "FAPEMIG"),
    ("Bolsa FAPERJ - Cidades Inteligentes e Big Data", "FAPERJ"),
    ("Auxílio à Pesquisa - Realidade Virtual e Aumentada", "FACEPE"),
    ("Bolsa de IC - Otimização Combinatória", "CNPq"),
    ("Programa Desenvolvedor Cidadão - Sistemas Web", "Prefeitura"),
    ("Bolsa de Extensão - Inclusão Digital", "UFPE"),
    ("Edital de Game Development", "Ancine"),
    ("Bolsa CNPq - Segurança de Redes e Criptografia", "CNPq"),
    ("Edital de Inovação - Wearables em Esportes", "Softex"),
    ("Bolsa IC - Computação Gráfica e Interação", "CAPES")
]

PROFESSORES = [
    "Dr. Silvio Meira", "Dra. Teresa Ludermir", "Dr. Geber Ramalho", 
    "Dr. Augusto Sampaio", "Dra. Ana Carolina", "Dr. Paulo Borba",
    "Dr. Hermano Moura", "Dra. Edna Barros", "Dr. Tsang Ing Ren",
    "Dr. Carlos Alexandre", "Dr. Marcelo D'Amorim", "Dra. Patricia Tedesco",
    "Dr. Stefan Blauth", "Dr. André Santos", "Dra. Bernadette Lóssio",
    "Dr. Cleber Zanchettin", "Dr. Ruy Guerra", "Dra. Valéria Times",
    "Dr. Nelson Maculan", "Dr. José Augusto Suruagy", "Dra. Rosa Maria",
    "Dr. Carlos Eduardo", "Dr. Renato Cerqueira", "Dra. Claudia Bauzer",
    "Dr. Roberto Ierusalimschy"
]

PESQUISADORES = [
    "João Silva (Visão Computacional)", "Maria Souza (NLP)", "Carlos Costa (Deep Learning)",
    "Ana Beatriz (Cloud Computing)", "Pedro Santos (Cybersecurity)", "Juliana Lima (IoT)",
    "Lucas Oliveira (Blockchain)", "Camila Alves (Software Eng)", "Gabriel Costa (Robótica)",
    "Sofia Mendes (Bioinformática)", "Rafael Dias (HCI)", "Beatriz Rocha (Data Science)",
    "Matheus Gomes (Edge Computing)", "Mariana Carvalho (XR)", "Thiago Ribeiro (Smart Cities)",
    "Laura Ferreira (Redes 5G)", "Diego Martins (Web3)", "Fernanda Castro (AI Ethics)",
    "Rodrigo Barbosa (Games)", "Amanda Pinto (Comp. Quântica)", "Gustavo Melo (Sistemas Distribuídos)",
    "Letícia Monteiro (Otimização)", "Felipe Correia (Data Mining)", "Bruna Moraes (Eng. de Requisitos)",
    "Daniel Azevedo (Testes de Software)"
]

ALUNOS = [
    "Aluno A1", "Aluno A2", "Aluno A3", "Aluno A4", "Aluno A5",
    "Aluno A6", "Aluno A7", "Aluno A8", "Aluno A9", "Aluno A10",
    "Aluno A11", "Aluno A12", "Aluno A13", "Aluno A14", "Aluno A15",
    "Aluno A16", "Aluno A17", "Aluno A18", "Aluno A19", "Aluno A20",
    "Aluno A21", "Aluno A22", "Aluno A23", "Aluno A24", "Aluno A25"
]

def generate_uid(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def seed_db():
    print("Cleaning Neo4j Database...")
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        
    print("Inserting Editais...")
    with driver.session() as session:
        for name, inst in EDITAIS:
            uid = generate_uid("edital")
            session.run("""
                CREATE (e:Edital {
                    uid: $uid,
                    name: $name,
                    institution: $inst,
                    theme: 'Computer Science'
                })
            """, {"uid": uid, "name": name, "inst": inst})
            
    print("Inserting Professores...")
    with driver.session() as session:
        for name in PROFESSORES:
            uid = generate_uid("prof")
            session.run("""
                CREATE (p:Professor {
                    uid: $uid,
                    name: $name,
                    institution: 'UFPE',
                    department: 'Centro de Informática'
                })
            """, {"uid": uid, "name": name})

    print("Inserting Pesquisadores...")
    with driver.session() as session:
        for name in PESQUISADORES:
            uid = generate_uid("researcher")
            session.run("""
                CREATE (p:Researcher {
                    uid: $uid,
                    name: $name,
                    institution: 'Porto Digital',
                    research_area: 'Tecnologia'
                })
            """, {"uid": uid, "name": name})

    print("Inserting Alunos...")
    with driver.session() as session:
        for name in ALUNOS:
            uid = generate_uid("student")
            session.run("""
                CREATE (p:Student {
                    uid: $uid,
                    name: $name,
                    course: 'Ciência da Computação',
                    semester: 3
                })
            """, {"uid": uid, "name": name})

    print("Creating random connections...")
    with driver.session() as session:
        # Match random students to random editais
        session.run("""
            MATCH (s:Student), (e:Edital)
            WITH s, e, rand() as r ORDER BY r
            WITH s, collect(e)[0..2] as random_editais
            UNWIND random_editais as e
            CREATE (s)-[:ELIGIBLE_FOR {score: rand(), source: 'mock'}]->(e)
        """)
        # Match researchers to editais
        session.run("""
            MATCH (r:Researcher), (e:Edital)
            WITH r, e, rand() as rnd ORDER BY rnd
            WITH r, collect(e)[0..3] as random_editais
            UNWIND random_editais as e
            CREATE (r)-[:LEADS_PROJECT {status: 'active'}]->(e)
        """)
        # Match professors to researchers
        session.run("""
            MATCH (p:Professor), (r:Researcher)
            WITH p, r, rand() as rnd ORDER BY rnd
            WITH p, collect(r)[0..2] as random_res
            UNWIND random_res as r
            CREATE (p)-[:MENTORS]->(r)
        """)
        
    print("Database Seeded Successfully.")

if __name__ == "__main__":
    seed_db()
