import networkx as nx
from app.core.neo4j_driver import run_query
import logging

logger = logging.getLogger(__name__)

class GraphAnalysisService:
    @staticmethod
    async def get_enriched_graph():
        """
        Consome o grafo do banco (ou memória), converte para NetworkX e calcula 
        insights relacionais avançados (Comunidades e Centralidade).
        """
        try:
            # 1. Fetch all nodes and edges
            # Usamos run_query para abstrair se é Neo4j real ou Memory
            nodes_data = await run_query("MATCH (n) RETURN n.uid as uid, labels(n)[0] as type, n.name as name")
            edges_data = await run_query("MATCH (s)-[r]->(t) RETURN s.uid as source, t.uid as target, type(r) as label")

            # 2. Build NetworkX Graph
            G = nx.Graph() # Undirected for community detection

            for node in nodes_data:
                G.add_node(node['uid'], name=node['name'], type=node['type'])

            for edge in edges_data:
                G.add_edge(edge['source'], edge['target'], label=edge['label'])

            # 3. Community Detection (Louvain Algorithm)
            # Retorna uma lista de sets de nós
            communities = list(nx.community.louvain_communities(G, seed=42))
            
            # Mapear cluster_id para cada nó
            node_communities = {}
            for cluster_id, community in enumerate(communities):
                for node_uid in community:
                    node_communities[node_uid] = cluster_id

            # 4. Centrality (Influência Estratégica)
            pagerank = nx.pagerank(G) if len(G) > 0 else {}
            degree_cent = nx.degree_centrality(G) if len(G) > 0 else {}

            # 5. Layout Calculation (NetworkX Spring Layout)
            # Isso garante que a visualização seja gerada inteiramente pela lógica da biblioteca NetworkX
            pos = nx.spring_layout(G, k=1.0, iterations=50, seed=42)

            # 6. Prepare Enriched Result
            enriched_nodes = []
            for node in nodes_data:
                uid = node['uid']
                coords = pos.get(uid, [0, 0])
                enriched_nodes.append({
                    "id": uid,
                    "label": node['name'],
                    "type": node['type'],
                    "cluster_id": node_communities.get(uid, 0),
                    "influence": round(pagerank.get(uid, 0) * 1000, 2), # Scale for visibility
                    "connectivity": round(degree_cent.get(uid, 0), 2),
                    "x": float(coords[0]) * 1500, # Escala ampliada para o frontend
                    "y": float(coords[1]) * 1500,
                })

            return {
                "nodes": enriched_nodes,
                "edges": edges_data,
                "summary": {
                    "total_communities": len(communities),
                    "avg_connectivity": sum(degree_cent.values()) / len(G) if len(G) > 0 else 0
                }
            }

        except Exception as e:
            logger.error(f"❌ Error in GraphAnalysisService: {str(e)}")
            # Fallback para dados básicos (vazio mas com estrutura correta)
            return {
                "nodes": [],
                "edges": [],
                "summary": {"total_communities": 0, "avg_connectivity": 0},
                "error": str(e)
            }

    @staticmethod
    async def get_user_insight(user_uid: str):
        """
        Gera um insight em linguagem natural sobre a posição do usuário no grafo.
        """
        graph = await GraphAnalysisService.get_enriched_graph()
        if "error" in graph:
            return "O Orquestrador está processando sua posição..."

        user_node = next((n for n in graph["nodes"] if n["id"] == user_uid), None)
        if not user_node:
            return "Perfil em fase de indexação."

        cluster_members = [n["label"] for n in graph["nodes"] if n["cluster_id"] == user_node["cluster_id"] and n["id"] != user_uid]
        
        influence = user_node["influence"]
        insight = f"Você faz parte do Cluster {user_node['cluster_id']}. "
        
        if influence > 5:
            insight += "Sua posição é altamente estratégica, atuando como um nó influente nesta rede."
        else:
            insight += "Você está bem conectado a especialistas em áreas adjacentes."
            
        if cluster_members:
            insight += f" Seus pares mais próximos incluem: {', '.join(cluster_members[:2])}."

        return insight
