import networkx as nx
import matplotlib.pyplot as plt
import io
import base64
import logging
from app.core.neo4j_driver import run_query

# Configura o backend do Matplotlib para modo não-interativo (essencial para Vercel/Serverless)
plt.switch_backend('Agg')

logger = logging.getLogger(__name__)

class GraphAnalysisService:
    @staticmethod
    async def get_enriched_graph():
        """
        Consome o grafo, calcula métricas via NetworkX e retorna dados brutos + metadados.
        """
        try:
            nodes_data = await run_query("MATCH (n) RETURN n.uid as uid, labels(n)[0] as type, n.name as name")
            edges_data = await run_query("MATCH (s)-[r]->(t) RETURN s.uid as source, t.uid as target, type(r) as label")

            G = nx.Graph()
            for node in nodes_data:
                G.add_node(node['uid'], name=node['name'], type=node['type'])
            for edge in edges_data:
                G.add_edge(edge['source'], edge['target'], label=edge['label'])

            communities = list(nx.community.louvain_communities(G, seed=42))
            node_communities = {}
            for cluster_id, community in enumerate(communities):
                for node_uid in community:
                    node_communities[node_uid] = cluster_id

            pagerank = nx.pagerank(G) if len(G) > 0 else {}
            degree_cent = nx.degree_centrality(G) if len(G) > 0 else {}
            pos = nx.spring_layout(G, k=1.0, iterations=50, seed=42)

            enriched_nodes = []
            for node in nodes_data:
                uid = node['uid']
                coords = pos.get(uid, [0, 0])
                enriched_nodes.append({
                    "id": uid,
                    "label": node['name'],
                    "type": node['type'],
                    "cluster_id": node_communities.get(uid, 0),
                    "influence": round(pagerank.get(uid, 0) * 1000, 2),
                    "connectivity": round(degree_cent.get(uid, 0), 2),
                    "x": float(coords[0]),
                    "y": float(coords[1]),
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
            logger.error(f"❌ Error in get_enriched_graph: {str(e)}")
            return {"nodes": [], "edges": [], "error": str(e)}

    @staticmethod
    async def get_networkx_drawing():
        """
        Gera uma visualização 100% nativa do NetworkX usando Matplotlib.
        Retorna a imagem em Base64 para exibição direta no frontend.
        """
        try:
            # 1. Obter dados e montar o grafo NetworkX
            nodes_data = await run_query("MATCH (n) RETURN n.uid as uid, labels(n)[0] as type, n.name as name")
            edges_data = await run_query("MATCH (s)-[r]->(t) RETURN s.uid as source, t.uid as target, type(r) as label")

            G = nx.Graph()
            node_types = {}
            for node in nodes_data:
                G.add_node(node['uid'], label=node['name'])
                node_types[node['uid']] = node['type']
            for edge in edges_data:
                G.add_edge(edge['source'], edge['target'])

            if len(G) == 0:
                return {"image": None, "error": "Grafo vazio"}

            # 2. Cálculos de Comunidades para coloração (Graph Of Thoughts)
            communities = list(nx.community.louvain_communities(G, seed=42))
            color_map = []
            palette = ['#2dd4bf', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899']
            
            node_colors = {}
            for i, comm in enumerate(communities):
                color = palette[i % len(palette)]
                for node_id in comm:
                    node_colors[node_id] = color
            
            for node in G.nodes():
                color_map.append(node_colors.get(node, '#64748b'))

            # 3. Desenho Nativo NetworkX
            plt.figure(figsize=(14, 10), facecolor='#020810')
            ax = plt.gca()
            ax.set_facecolor('#020810')
            
            # Garante que todos os nós adicionados via arestas também tenham um label padrão
            for node in G.nodes():
                if 'label' not in G.nodes[node]:
                    G.nodes[node]['label'] = str(node)[:8]
            
            pos = nx.spring_layout(G, k=0.6, iterations=60, seed=42)
            
            # Nodes
            nx.draw_networkx_nodes(G, pos, 
                                 node_color=color_map, 
                                 node_size=1000, 
                                 alpha=0.95,
                                 linewidths=1.5,
                                 edgecolors='#1e293b')
            
            # Edges
            nx.draw_networkx_edges(G, pos, width=1.2, alpha=0.25, edge_color='#475569')
            
            # Labels (Nativo NetworkX)
            labels = {node: G.nodes[node].get('label', str(node)) for node in G.nodes()}
            nx.draw_networkx_labels(G, pos, labels, 
                                   font_size=7, 
                                   font_color='#f1f5f9', 
                                   font_family='sans-serif',
                                   font_weight='bold')

            plt.title("ARIANO BRAIN — Native NetworkX 3.6.1 Engine", color='#2dd4bf', pad=25, fontsize=16, fontweight='bold')
            plt.axis('off')

            # 4. Converter para Base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=200, bbox_inches='tight', facecolor='#020810', transparent=False)
            plt.close('all') # Fecha todas as figuras para liberar memória
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode('utf-8')
            
            return {"image": f"data:image/png;base64,{img_base64}"}

        except Exception as e:
            logger.error(f"❌ Error in get_networkx_drawing: {str(e)}")
            return {"image": None, "error": str(e)}

    @staticmethod
    async def get_user_insight(user_uid: str):
        graph = await GraphAnalysisService.get_enriched_graph()
        if "error" in graph: return "Processando..."
        user_node = next((n for n in graph["nodes"] if n["id"] == user_uid), None)
        if not user_node: return "Perfil em indexação."
        insight = f"Você faz parte do Cluster CoT #{user_node['cluster_id']}."
        return insight
