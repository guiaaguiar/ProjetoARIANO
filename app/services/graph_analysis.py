import networkx as nx
import matplotlib.pyplot as plt
import io
import base64
import logging
from collections import Counter
from app.core.neo4j_driver import run_query

# Configura o backend do Matplotlib para modo não-interativo
plt.switch_backend('Agg')

logger = logging.getLogger(__name__)

class GraphAnalysisService:
    @staticmethod
    async def get_enriched_graph():
        """
        Consome o grafo, calcula métricas e detecta Comunidades de Pensamento (CoT)
        com identificação de temas-chave.
        """
        try:
            # 1. Fetch data with more metadata for theme extraction
            nodes_data = await run_query("MATCH (n) RETURN n.uid as uid, labels(n)[0] as type, n.name as name, n.bio as bio, n.o_que_busco as goals, n.description as description")
            edges_data = await run_query("MATCH (s)-[r]->(t) RETURN s.uid as source, t.uid as target, type(r) as label")

            G = nx.Graph()
            node_metadata = {}
            for node in nodes_data:
                uid = node['uid']
                G.add_node(uid, name=node['name'], type=node['type'])
                # Coleta palavras-chave para o tema do cluster
                text_content = f"{node.get('name', '')} {node.get('bio', '')} {node.get('goals', '')} {node.get('description', '')}"
                node_metadata[uid] = {
                    "name": node['name'],
                    "type": node['type'],
                    "text": text_content.lower()
                }

            for edge in edges_data:
                G.add_edge(edge['source'], edge['target'], label=edge['label'])

            if len(G) == 0:
                return {"nodes": [], "edges": [], "summary": {"total_communities": 0}}

            # 2. Community Detection (Louvain)
            communities = list(nx.community.louvain_communities(G, seed=42))
            
            # 3. Cluster Naming Logic (Graph-CoT Contextualization)
            cluster_themes = {}
            stop_words = {'de', 'o', 'a', 'e', 'do', 'da', 'em', 'um', 'uma', 'com', 'para', 'os', 'as', 'dos', 'das', 'no', 'na', 'para', 'pelo', 'pela', 'sobre'}
            
            for cluster_id, community in enumerate(communities):
                words = []
                for node_uid in community:
                    meta = node_metadata.get(node_uid, {})
                    # Extrair palavras significativas
                    raw_words = meta.get('text', '').split()
                    words.extend([w for w in raw_words if len(w) > 3 and w not in stop_words])
                
                # Pegar as 2 palavras mais frequentes para o tema
                top_words = [w[0] for w in Counter(words).most_common(2)]
                theme = " & ".join(top_words).title() if top_words else "Pesquisa Geral"
                cluster_themes[cluster_id] = theme

            node_communities = {}
            for cluster_id, community in enumerate(communities):
                for node_uid in community:
                    node_communities[node_uid] = {
                        "id": cluster_id,
                        "theme": cluster_themes[cluster_id]
                    }

            # 4. Centrality Metrics
            pagerank = nx.pagerank(G)
            degree_cent = nx.degree_centrality(G)

            # 5. Build Result (Sem X/Y fixos para permitir simulação fluida no frontend)
            enriched_nodes = []
            for node in nodes_data:
                uid = node['uid']
                comm_info = node_communities.get(uid, {"id": 0, "theme": "Indefinido"})
                enriched_nodes.append({
                    "id": uid,
                    "label": node['name'],
                    "type": str(node['type']).lower(),
                    "cluster_id": comm_info["id"],
                    "cluster_theme": comm_info["theme"],
                    "influence": round(pagerank.get(uid, 0) * 1000, 2),
                    "connectivity": round(degree_cent.get(uid, 0), 2),
                })

            return {
                "nodes": enriched_nodes,
                "edges": edges_data,
                "summary": {
                    "total_communities": len(communities),
                    "clusters": [{"id": k, "theme": v} for k, v in cluster_themes.items()]
                }
            }
        except Exception as e:
            logger.error(f"❌ Error in get_enriched_graph: {str(e)}")
            return {"nodes": [], "edges": [], "error": str(e)}

    @staticmethod
    async def get_networkx_drawing():
        # Método mantido para compatibilidade, mas o interativo é o foco
        return {"image": None, "error": "Use get_enriched_graph para visualização interativa"}

    @staticmethod
    async def get_user_insight(user_uid: str):
        graph = await GraphAnalysisService.get_enriched_graph()
        if "error" in graph: return "Processando..."
        user_node = next((n for n in graph["nodes"] if n["id"] == user_uid), None)
        if not user_node: return "Perfil em indexação."
        return f"Você está no cluster '{user_node.get('cluster_theme', 'Geral')}', com influência de {user_node['influence']}."
