"""Seed data — populate Neo4j with realistic test data for the ARIANO MVP."""

from app.core.database import init_db
from app.models.graph import Student, Researcher, Professor, Edital, Skill, Area


def seed():
    """Seed the database with ~15 academics + ~8 editais."""
    init_db()

    print("🌱 Criando Skills...")
    skills_data = [
        ("Python", "programacao"), ("Machine Learning", "ia"),
        ("Deep Learning", "ia"), ("NLP", "ia"),
        ("React", "programacao"), ("TypeScript", "programacao"),
        ("Neo4j", "banco_de_dados"), ("Graph Databases", "banco_de_dados"),
        ("Data Science", "ciencia_dados"), ("Computer Vision", "ia"),
        ("IoT", "hardware"), ("Embedded Systems", "hardware"),
        ("Docker", "devops"), ("FastAPI", "programacao"),
        ("LangChain", "ia"), ("Cybersecurity", "seguranca"),
        ("Cloud Computing", "devops"), ("TensorFlow", "ia"),
        ("Statistics", "ciencia_dados"), ("R", "ciencia_dados"),
    ]
    skills = {}
    for name, cat in skills_data:
        try:
            sk = Skill.nodes.get(name=name)
        except Skill.DoesNotExist:
            sk = Skill(name=name, category=cat).save()
        skills[name] = sk
    print(f"  ✅ {len(skills)} skills criadas")

    print("🌱 Criando Areas...")
    areas_data = [
        ("Inteligencia Artificial", ""),
        ("Ciencia de Dados", ""),
        ("Engenharia de Software", ""),
        ("Redes de Computadores", ""),
        ("Seguranca da Informacao", ""),
        ("Sistemas Embarcados", ""),
        ("Computacao em Nuvem", ""),
        ("Processamento de Linguagem Natural", "Inteligencia Artificial"),
    ]
    areas = {}
    for name, parent in areas_data:
        try:
            a = Area.nodes.get(name=name)
        except Area.DoesNotExist:
            a = Area(name=name, parent_area=parent).save()
        areas[name] = a
    print(f"  ✅ {len(areas)} areas criadas")

    print("🌱 Criando Students...")
    students_data = [
        {"name": "Ana Carolina Silva", "email": "ana@uninassau.edu.br",
         "institution": "UNINASSAU Gracas", "course": "Ciencia da Computacao",
         "semester": 7, "level": "graduacao",
         "bio": "Estudante focada em IA e processamento de dados",
         "skills": ["Python", "Machine Learning", "Data Science"]},
        {"name": "Bruno Costa Oliveira", "email": "bruno@uninassau.edu.br",
         "institution": "UNINASSAU Gracas", "course": "Ciencia da Computacao",
         "semester": 5, "level": "graduacao",
         "bio": "Desenvolvimento web e sistemas distribuidos",
         "skills": ["React", "TypeScript", "FastAPI", "Docker"]},
        {"name": "Carla Mendes Santos", "email": "carla@ufpe.edu.br",
         "institution": "UFPE", "course": "Engenharia da Computacao",
         "semester": 8, "level": "graduacao",
         "bio": "IoT e sistemas embarcados para cidades inteligentes",
         "skills": ["IoT", "Embedded Systems", "Python"]},
        {"name": "Daniel Ferreira Lima", "email": "daniel@unicap.edu.br",
         "institution": "UNICAP", "course": "Sistemas de Informacao",
         "semester": 6, "level": "graduacao",
         "bio": "Seguranca cibernetica e redes",
         "skills": ["Cybersecurity", "Cloud Computing", "Docker"]},
        {"name": "Elena Rodrigues Pereira", "email": "elena@ufpe.edu.br",
         "institution": "UFPE", "course": "Ciencia da Computacao",
         "semester": 3, "level": "mestrado",
         "bio": "Mestranda em NLP com foco em PLN para portugues",
         "skills": ["Python", "NLP", "Deep Learning", "TensorFlow"]},
    ]
    for sdata in students_data:
        sk_names = sdata.pop("skills")
        try:
            s = Student.nodes.get(email=sdata["email"])
        except Student.DoesNotExist:
            s = Student(**sdata).save()
            for sk_name in sk_names:
                s.skills.connect(skills[sk_name], {"confidence": 0.85, "source": "seed"})
    print(f"  ✅ {len(students_data)} students criados")

    print("🌱 Criando Researchers...")
    researchers_data = [
        {"name": "Dr. Marcos Aurelio Vasconcelos", "email": "marcos@ufpe.edu.br",
         "institution": "UFPE - CIn", "level": "doutorado",
         "lattes_url": "http://lattes.cnpq.br/fake001",
         "bio": "Pesquisador em grafos de conhecimento e IA explicavel",
         "skills": ["Python", "Neo4j", "Graph Databases", "Machine Learning"],
         "areas": ["Inteligencia Artificial", "Ciencia de Dados"]},
        {"name": "Dra. Fernanda Albuquerque", "email": "fernanda@ufpe.edu.br",
         "institution": "UFPE - CIn", "level": "pos-doutorado",
         "lattes_url": "http://lattes.cnpq.br/fake002",
         "bio": "Especialista em NLP e modelos de linguagem",
         "skills": ["Python", "NLP", "Deep Learning", "LangChain"],
         "areas": ["Processamento de Linguagem Natural", "Inteligencia Artificial"]},
        {"name": "MSc. Ricardo Barros Neto", "email": "ricardo@uninassau.edu.br",
         "institution": "UNINASSAU Gracas", "level": "mestrado",
         "lattes_url": "http://lattes.cnpq.br/fake003",
         "bio": "Mestre em Engenharia de Software com foco em arquitetura cloud",
         "skills": ["Docker", "Cloud Computing", "FastAPI", "React"],
         "areas": ["Engenharia de Software", "Computacao em Nuvem"]},
        {"name": "Dr. Paulo Sergio Monteiro", "email": "paulo@unicap.edu.br",
         "institution": "UNICAP", "level": "doutorado",
         "lattes_url": "http://lattes.cnpq.br/fake004",
         "bio": "Pesquisador em seguranca e redes IoT",
         "skills": ["Cybersecurity", "IoT", "Embedded Systems"],
         "areas": ["Seguranca da Informacao", "Redes de Computadores"]},
        {"name": "Dra. Lucia Helena Campos", "email": "lucia@ufpe.edu.br",
         "institution": "UFPE", "level": "pos-doutorado",
         "lattes_url": "http://lattes.cnpq.br/fake005",
         "bio": "Data Science aplicada a politicas publicas",
         "skills": ["Python", "Data Science", "Statistics", "R"],
         "areas": ["Ciencia de Dados"]},
    ]
    for rdata in researchers_data:
        sk_names = rdata.pop("skills")
        area_names = rdata.pop("areas")
        try:
            r = Researcher.nodes.get(email=rdata["email"])
        except Researcher.DoesNotExist:
            r = Researcher(**rdata).save()
            for sk_name in sk_names:
                r.skills.connect(skills[sk_name], {"confidence": 0.9, "source": "seed"})
            for area_name in area_names:
                r.areas.connect(areas[area_name], {"source": "seed"})
    print(f"  ✅ {len(researchers_data)} researchers criados")

    print("🌱 Criando Professors...")
    professors_data = [
        {"name": "Prof. Dr. Antonio Guimaraes", "email": "antonio@ufpe.edu.br",
         "institution": "UFPE - CIn", "department": "Ciencia da Computacao",
         "research_group": "GRIA - Grupo de IA",
         "bio": "Professor titular em IA e Machine Learning",
         "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow"],
         "areas": ["Inteligencia Artificial"]},
        {"name": "Prof. Dra. Maria Beatriz Lopes", "email": "maria@uninassau.edu.br",
         "institution": "UNINASSAU Gracas", "department": "Sistemas de Informacao",
         "research_group": "NuPES - Nucleo de Pesquisa em ES",
         "bio": "Coordenadora de pesquisa em Engenharia de Software",
         "skills": ["React", "TypeScript", "Docker", "FastAPI"],
         "areas": ["Engenharia de Software"]},
        {"name": "Prof. Dr. Roberto Carlos Nascimento", "email": "roberto@unicap.edu.br",
         "institution": "UNICAP", "department": "Computacao",
         "research_group": "LaSSI - Lab de Seguranca",
         "bio": "Pesquisador em seguranca cibernetica e privacidade",
         "skills": ["Cybersecurity", "Cloud Computing"],
         "areas": ["Seguranca da Informacao", "Computacao em Nuvem"]},
        {"name": "Prof. Dra. Sandra Maria Freitas", "email": "sandra@ufpe.edu.br",
         "institution": "UFPE", "department": "Estatistica e Informatica",
         "research_group": "CDLab - Ciencia de Dados Lab",
         "bio": "Professora em ciencia de dados e estatistica aplicada",
         "skills": ["Python", "Data Science", "Statistics", "R"],
         "areas": ["Ciencia de Dados"]},
        {"name": "Prof. Dr. Joao Pedro Cavalcanti", "email": "joao@ufpe.edu.br",
         "institution": "UFPE - CIn", "department": "Ciencia da Computacao",
         "research_group": "GPRT - Redes e Telecomunicacoes",
         "bio": "Especialista em IoT e sistemas embarcados para smart cities",
         "skills": ["IoT", "Embedded Systems", "Python"],
         "areas": ["Sistemas Embarcados", "Redes de Computadores"]},
    ]
    for pdata in professors_data:
        sk_names = pdata.pop("skills")
        area_names = pdata.pop("areas")
        try:
            p = Professor.nodes.get(email=pdata["email"])
        except Professor.DoesNotExist:
            p = Professor(**pdata).save()
            for sk_name in sk_names:
                p.skills.connect(skills[sk_name], {"confidence": 0.95, "source": "seed"})
            for area_name in area_names:
                p.areas.connect(areas[area_name], {"source": "seed"})
    print(f"  ✅ {len(professors_data)} professors criados")

    print("🌱 Criando Editais...")
    editais_data = [
        {"title": "FACEPE - Programa de Iniciacao Cientifica 2026",
         "description": "Bolsas para estudantes de graduacao em projetos de pesquisa",
         "agency": "FACEPE", "edital_type": "iniciacao_cientifica",
         "funding": 4800.0, "deadline": "2026-06-30", "min_level": "graduacao",
         "required_skills": ["Python", "Data Science"],
         "target_areas": ["Ciencia de Dados", "Inteligencia Artificial"]},
        {"title": "CNPq - Universal 2026 - Faixa A",
         "description": "Apoio a projetos de pesquisa em todas as areas do conhecimento",
         "agency": "CNPq", "edital_type": "pesquisa",
         "funding": 30000.0, "deadline": "2026-08-15", "min_level": "doutorado",
         "required_skills": ["Machine Learning", "Deep Learning"],
         "target_areas": ["Inteligencia Artificial"]},
        {"title": "FACEPE - APQ Inovacao Tecnologica",
         "description": "Apoio a projetos de inovacao com aplicacao em governo digital",
         "agency": "FACEPE", "edital_type": "pesquisa",
         "funding": 50000.0, "deadline": "2026-07-20", "min_level": "mestrado",
         "required_skills": ["Neo4j", "Graph Databases", "Python"],
         "target_areas": ["Inteligencia Artificial", "Engenharia de Software"]},
        {"title": "CAPES - Bolsa de Mestrado 2026",
         "description": "Bolsas de mestrado para programas de pos-graduacao",
         "agency": "CAPES", "edital_type": "pesquisa",
         "funding": 24000.0, "deadline": "2026-05-30", "min_level": "mestrado",
         "required_skills": ["Python", "NLP"],
         "target_areas": ["Processamento de Linguagem Natural"]},
        {"title": "Prefeitura do Recife - Smart City Challenge",
         "description": "Chamada para solucoes IoT para mobilidade urbana",
         "agency": "Prefeitura do Recife", "edital_type": "extensao",
         "funding": 100000.0, "deadline": "2026-09-01", "min_level": "graduacao",
         "required_skills": ["IoT", "Embedded Systems", "Cloud Computing"],
         "target_areas": ["Sistemas Embarcados", "Computacao em Nuvem"]},
        {"title": "FACEPE - Programa de Pos-Doc 2026",
         "description": "Bolsas para pesquisadores pos-doutorais em instituicoes de PE",
         "agency": "FACEPE", "edital_type": "pesquisa",
         "funding": 72000.0, "deadline": "2026-10-15", "min_level": "doutorado",
         "required_skills": ["Python", "Machine Learning", "Statistics"],
         "target_areas": ["Ciencia de Dados", "Inteligencia Artificial"]},
        {"title": "CNPq - Seguranca Cibernetica Nacional",
         "description": "Edital tematico em seguranca digital e privacidade",
         "agency": "CNPq", "edital_type": "pesquisa",
         "funding": 80000.0, "deadline": "2026-11-30", "min_level": "doutorado",
         "required_skills": ["Cybersecurity", "Cloud Computing"],
         "target_areas": ["Seguranca da Informacao"]},
        {"title": "FACEPE - Hackathon Governo Digital 2026",
         "description": "Competicao de desenvolvimento de solucoes para servicos publicos",
         "agency": "FACEPE", "edital_type": "extensao",
         "funding": 15000.0, "deadline": "2026-04-30", "min_level": "graduacao",
         "required_skills": ["React", "TypeScript", "FastAPI", "Docker"],
         "target_areas": ["Engenharia de Software"]},
    ]
    for edata in editais_data:
        sk_names = edata.pop("required_skills")
        area_names = edata.pop("target_areas")
        try:
            e = Edital.nodes.get(title=edata["title"])
        except Edital.DoesNotExist:
            e = Edital(**edata).save()
            for sk_name in sk_names:
                e.requires_skills.connect(skills[sk_name], {"priority": "essential", "source": "seed"})
            for area_name in area_names:
                e.targets_areas.connect(areas[area_name], {"source": "seed"})
    print(f"  ✅ {len(editais_data)} editais criados")

    print("")
    print("🎉 Seed completo!")
    print(f"   Total: {len(students_data)} students + {len(researchers_data)} researchers "
          f"+ {len(professors_data)} professors + {len(editais_data)} editais")
    print(f"   Skills: {len(skills_data)} | Areas: {len(areas_data)}")


if __name__ == "__main__":
    seed()
