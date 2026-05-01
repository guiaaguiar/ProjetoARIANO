import networkx as nx
import matplotlib.pyplot as plt
import logging
from collections import Counter, defaultdict
from app.core.neo4j_driver import run_query

plt.switch_backend('Agg')
logger = logging.getLogger(__name__)


class GraphAnalysisService:
    @staticmethod
    async def get_enriched_graph():
        """
        Consome o grafo, calcula métricas e detecta Comunidades de Pensamento (CoT).
        Retorna nós enriquecidos com metadata, conexões diretas e métricas NetworkX.
        """
        try:
            nodes_data = await run_query(
                "MATCH (n) RETURN n.uid as uid, labels(n)[0] as type, n.name as name, "
                "n.bio as bio, n.o_que_busco as goals, n.description as description"
            )
            edges_data = await run_query(
                "MATCH (s)-[r]->(t) RETURN s.uid as source, t.uid as target, type(r) as label"
            )

            G = nx.Graph()
            node_metadata = {}
            nodes_map = {}

            for node in nodes_data:
                uid = node.get('uid')
                if not uid:
                    continue
                G.add_node(uid, name=node.get('name'), type=node.get('type'))
                text_content = " ".join(filter(None, [
                    node.get('name', ''),
                    node.get('bio', ''),
                    node.get('goals', ''),
                    node.get('description', ''),
                ]))
                node_metadata[uid] = {"name": node.get('name'), "type": node.get('type'), "text": text_content.lower()}
                nodes_map[uid] = node

            for edge in edges_data:
                src, tgt = edge.get('source'), edge.get('target')
                if src and tgt:
                    G.add_edge(src, tgt, label=edge.get('label'))

            if len(G) == 0:
                return {"nodes": [], "edges": [], "summary": {"total_communities": 0, "clusters": []}}

            # 2. Community Detection (Louvain)
            communities = list(nx.community.louvain_communities(G, seed=42))
            logger.info(f"🔍 Contextualizando {len(communities)} comunidades de pensamento...")

            # 3. Cluster Naming
            cluster_themes = {}
            stop_words = {'de', 'o', 'a', 'e', 'do', 'da', 'em', 'um', 'uma', 'com', 'para',
                          'os', 'as', 'dos', 'das', 'no', 'na', 'pelo', 'pela', 'sobre', 'que', 'se'}

            for cluster_id, community in enumerate(communities):
                words = []
                for node_uid in community:
                    meta = node_metadata.get(node_uid, {})
                    raw = meta.get('text', '').replace('.', ' ').replace(',', ' ').split()
                    words.extend([w for w in raw if len(w) > 4 and w not in stop_words])
                most_common = [w[0] for w in Counter(words).most_common(5)]
                top_words = []
                for w in most_common:
                    if w not in top_words:
                        top_words.append(w)
                    if len(top_words) >= 2:
                        break
                cluster_themes[cluster_id] = " & ".join(top_words).title() if top_words else "Pesquisa Interdisciplinar"

            node_communities = {}
            for cluster_id, community in enumerate(communities):
                for uid in community:
                    node_communities[uid] = {"id": cluster_id, "theme": cluster_themes[cluster_id]}

            # 4. Centrality
            pagerank = nx.pagerank(G)
            degree_cent = nx.degree_centrality(G)

            # 5. Build adjacency map for connections panel
            adjacency = defaultdict(list)
            for edge in edges_data:
                src, tgt, lbl = edge.get('source'), edge.get('target'), edge.get('label', '')
                if src and tgt:
                    src_info = nodes_map.get(src, {})
                    tgt_info = nodes_map.get(tgt, {})
                    adjacency[src].append({
                        "uid": tgt,
                        "label": tgt_info.get('name') or tgt_info.get('title') or tgt,
                        "type": str(tgt_info.get('type', '')).lower(),
                        "edge_type": lbl,
                    })
                    adjacency[tgt].append({
                        "uid": src,
                        "label": src_info.get('name') or src_info.get('title') or src,
                        "type": str(src_info.get('type', '')).lower(),
                        "edge_type": lbl,
                    })

            # 6. Build result
            enriched_nodes = []
            for uid in list(G.nodes()):
                info = nodes_map.get(uid, {})
                comm = node_communities.get(uid, {"id": 0, "theme": "Pesquisa Geral"})

                bio_raw = info.get('bio') or info.get('description') or ''
                metadata = {
                    "institution": info.get('institution') or info.get('instituicao'),
                    "maturidade": info.get('maturidade'),
                    "o_que_busco": (info.get('o_que_busco') or info.get('goals') or '')[:150] or None,
                    "bio": bio_raw[:150] or None,
                    "funding": info.get('funding'),
                    "deadline": info.get('deadline'),
                    "edital_type": info.get('edital_type'),
                    "instituicao": info.get('instituicao'),
                    "category": info.get('category'),
                    "parent_area": info.get('parent_area'),
                    "course": info.get('course'),
                    "semester": info.get('semester'),
                }
                # Remove None values
                metadata = {k: v for k, v in metadata.items() if v is not None}

                enriched_nodes.append({
                    "id": uid,
                    "label": info.get('name') or info.get('title') or f"Nó {uid}",
                    "type": str(info.get('type', 'unknown')).lower(),
                    "cluster_id": comm["id"],
                    "cluster_theme": comm["theme"],
                    "influence": round(pagerank.get(uid, 0) * 1000, 2),
                    "connectivity": round(degree_cent.get(uid, 0), 2),
                    "connections": adjacency.get(uid, []),
                    "metadata": metadata,
                })

            return {
                "nodes": enriched_nodes,
                "edges": edges_data,
                "summary": {
                    "total_communities": len(communities),
                    "clusters": [{"id": k, "theme": v} for k, v in cluster_themes.items()],
                },
            }
        except Exception as e:
            logger.error(f"❌ Error in get_enriched_graph: {str(e)}", exc_info=True)
            return {"nodes": [], "edges": [], "error": str(e)}

    @staticmethod
    async def get_networkx_drawing():
        return {"image": None, "error": "Use get_enriched_graph para visualização interativa"}

    @staticmethod
    async def get_user_insight(user_uid: str):
        graph = await GraphAnalysisService.get_enriched_graph()
        if "error" in graph:
            return "Processando..."
        user_node = next((n for n in graph["nodes"] if n["id"] == user_uid), None)
        if not user_node:
            return "Perfil em indexação."
        return f"Você está no cluster '{user_node.get('cluster_theme', 'Geral')}', com influência de {user_node['influence']}."
