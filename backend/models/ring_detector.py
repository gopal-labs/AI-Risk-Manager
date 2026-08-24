"""
ring_detector.py — F6 Collusion / Ring Fraud Detection
======================================================
Graph-based entity network analysis using NetworkX.

Entity Nodes:
  - merchant
  - user
  - device
  - ip
  - bank_account (or vpa)
  - phone

Edges:
  - Created whenever entities share identifiers or participate in the same transaction.

Public API:
-----------
  RingDetector.add_transaction(tx_data)
  RingDetector.build_graph(transactions)
  RingDetector.detect_rings() -> list[dict]
  RingDetector.get_entity_subgraph(entity_id) -> dict
  RingDetector.get_ring_risk_boost(tx_data) -> tuple[float, list[dict]]
"""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any, Optional

import networkx as nx

logger = logging.getLogger(__name__)


class RingDetector:
    def __init__(self, min_cluster_size: int = 3, min_shared_identifiers: int = 2) -> None:
        self.min_cluster_size = min_cluster_size
        self.min_shared_identifiers = min_shared_identifiers
        self.graph = nx.Graph()
        self._tx_cache: dict[str, dict] = {}
        self._clusters_cache: list[dict] = []
        self._entity_to_cluster: dict[str, str] = {}

    def clear(self) -> None:
        self.graph.clear()
        self._tx_cache.clear()
        self._clusters_cache.clear()
        self._entity_to_cluster.clear()

    def add_transaction(self, tx: dict) -> None:
        """Add transaction and entity edges to graph."""
        tx_id = tx.get("tx_id", "")
        if not tx_id:
            return

        self._tx_cache[tx_id] = tx
        merchant_id = tx.get("merchant_id", "")
        user_id = tx.get("user_id") or f"U-{tx_id}"
        device_id = tx.get("device_id", "")
        ip = tx.get("ip", "")
        vpa = tx.get("vpa", "")
        tx_risk = float(tx.get("composite_score", 50))

        # Add transaction node
        self.graph.add_node(
            tx_id,
            node_type="tx",
            label=f"₹{int(tx.get('amount', 0)):,}",
            risk=tx_risk,
            amount=tx.get("amount", 0),
        )

        # Entity nodes to connect
        entities = []
        if merchant_id:
            entities.append((merchant_id, "merchant", tx.get("merchant_name", merchant_id)[:18]))
        if user_id:
            entities.append((user_id, "user", user_id))
        if device_id and device_id != "DEV-000":
            entities.append((device_id, "device", device_id))
        if ip and ip not in ("0.0.0.0", ""):
            entities.append((f"ip-{ip}", "ip", ip))
        if vpa:
            entities.append((f"vpa-{vpa}", "vpa", vpa[:20]))

        for ent_id, ent_type, label in entities:
            if not self.graph.has_node(ent_id):
                self.graph.add_node(ent_id, node_type=ent_type, label=label, risk=tx_risk)
            else:
                # Update node risk to max seen
                self.graph.nodes[ent_id]["risk"] = max(
                    self.graph.nodes[ent_id].get("risk", 0), tx_risk
                )

            # Edge between transaction and entity
            self.graph.add_edge(tx_id, ent_id, edge_type=ent_type)

        # Connect shared identifiers directly (e.g. shared device between users or VPAs)
        ent_ids = [e[0] for e in entities]
        for i in range(len(ent_ids)):
            for j in range(i + 1, len(ent_ids)):
                e1, e2 = ent_ids[i], ent_ids[j]
                if not self.graph.has_edge(e1, e2):
                    self.graph.add_edge(e1, e2, edge_type="shared_identifier")

    def build_graph(self, transactions: list[dict]) -> None:
        """Rebuild graph from transaction list."""
        self.clear()
        for tx in transactions:
            self.add_transaction(tx)
        self.detect_rings()

    def detect_rings(self) -> list[dict]:
        """
        Analyze connected components in the entity graph to identify suspicious clusters.
        """
        clusters = []
        cluster_idx = 1
        self._entity_to_cluster.clear()

        # Find connected components with networkx
        components = list(nx.connected_components(self.graph))
        for comp in components:
            if len(comp) < self.min_cluster_size:
                continue

            subgraph = self.graph.subgraph(comp)

            # Separate node types
            tx_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "tx"]
            merchant_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "merchant"]
            device_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "device"]
            ip_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "ip"]
            vpa_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "vpa"]
            user_nodes = [n for n in comp if self.graph.nodes[n].get("node_type") == "user"]

            # Calculate shared identifier count
            shared_identifiers = []
            if len(device_nodes) > 0:
                shared_identifiers.extend([self.graph.nodes[d].get("label", d) for d in device_nodes])
            if len(ip_nodes) > 0:
                shared_identifiers.extend([self.graph.nodes[i].get("label", i) for i in ip_nodes])
            if len(vpa_nodes) > 0:
                shared_identifiers.extend([self.graph.nodes[v].get("label", v) for v in vpa_nodes])

            # Cluster risk score formula based on high-risk tx ratio, shared identifiers, and multi-merchant overlap
            node_risks = [self.graph.nodes[n].get("risk", 50) for n in comp]
            avg_risk = sum(node_risks) / len(node_risks) if node_risks else 50
            high_risk_cnt = sum(1 for r in node_risks if r >= 70)

            # Cluster score calculation (0–100)
            cluster_score = min(
                98.0,
                avg_risk * 0.4
                + (high_risk_cnt / len(comp)) * 30
                + min(len(shared_identifiers) * 10, 25)
                + (15 if len(merchant_nodes) > 1 else 0)
            )
            cluster_score = round(cluster_score, 1)

            # Mark suspicious if score >= 65 or multiple shared devices/IPs
            is_suspicious = cluster_score >= 65.0 or (len(device_nodes) + len(ip_nodes) >= 2 and len(tx_nodes) >= 2)
            if not is_suspicious:
                continue

            cluster_id = f"RING-{cluster_idx:03d}"
            cluster_idx += 1

            evidence = []
            if len(device_nodes) > 0:
                evidence.append(f"Shared device(s) ({', '.join([self.graph.nodes[d].get('label', d) for d in device_nodes[:2]])}) across multiple transactions")
            if len(ip_nodes) > 0:
                evidence.append(f"Shared IP address(es) ({', '.join([self.graph.nodes[i].get('label', i) for i in ip_nodes[:2]])})")
            if len(merchant_nodes) > 1:
                evidence.append(f"Cross-merchant collusion involving {len(merchant_nodes)} merchants")
            if len(vpa_nodes) > 0:
                evidence.append(f"Shared VPA endpoints ({len(vpa_nodes)} active)")

            members = []
            for n in comp:
                self._entity_to_cluster[n] = cluster_id
                members.append({
                    "id": n,
                    "type": self.graph.nodes[n].get("node_type", "entity"),
                    "label": self.graph.nodes[n].get("label", n),
                    "risk": self.graph.nodes[n].get("risk", 50),
                })

            clusters.append({
                "cluster_id": cluster_id,
                "risk_score": cluster_score,
                "members": members,
                "shared_identifiers": shared_identifiers,
                "transaction_count": len(tx_nodes),
                "merchant_count": len(merchant_nodes),
                "entity_count": len(comp),
                "evidence": evidence,
            })

        clusters.sort(key=lambda x: x["risk_score"], reverse=True)
        self._clusters_cache = clusters
        return clusters

    def get_ring_risk_boost(self, tx: dict) -> tuple[float, list[dict]]:
        """
        Check if transaction belongs to or shares nodes with a suspicious cluster.
        Returns: (boost_score, evidence_reasons)
        """
        device_id = tx.get("device_id", "")
        ip = f"ip-{tx.get('ip', '')}"
        vpa = f"vpa-{tx.get('vpa', '')}"
        user_id = tx.get("user_id", "")

        matched_clusters = set()
        for ent in (device_id, ip, vpa, user_id):
            if ent and ent in self._entity_to_cluster:
                matched_clusters.add(self._entity_to_cluster[ent])

        if not matched_clusters:
            return 0.0, []

        reasons = []
        max_boost = 0.0
        for cid in matched_clusters:
            c = next((item for item in self._clusters_cache if item["cluster_id"] == cid), None)
            if c:
                boost = min(30.0, c["risk_score"] * 0.28)
                if boost > max_boost:
                    max_boost = boost
                reasons.append({
                    "label": f"Suspicious fraud ring ({c['cluster_id']})",
                    "weight": int(boost),
                })

        return max_boost, reasons

    def get_entity_subgraph(self, entity_id: str, depth: int = 2) -> dict:
        """Return ego graph around an entity up to depth."""
        if not self.graph.has_node(entity_id):
            return {"nodes": [], "edges": [], "found": False}

        ego = nx.ego_graph(self.graph, entity_id, radius=depth)
        nodes = [
            {
                "id": n,
                "label": ego.nodes[n].get("label", n),
                "type": ego.nodes[n].get("node_type", "entity"),
                "risk": ego.nodes[n].get("risk", 50),
            }
            for n in ego.nodes
        ]
        edges = [
            {
                "source": u,
                "target": v,
                "label": ego.edges[u, v].get("edge_type", "link"),
            }
            for u, v in ego.edges
        ]
        return {"nodes": nodes, "edges": edges, "found": True}


# Singleton accessor
_DETECTOR_SINGLETON: Optional[RingDetector] = None

def get_ring_detector() -> RingDetector:
    global _DETECTOR_SINGLETON
    if _DETECTOR_SINGLETON is None:
        _DETECTOR_SINGLETON = RingDetector()
    return _DETECTOR_SINGLETON
