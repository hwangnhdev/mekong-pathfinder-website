/* ── GAME GRAPH DATA CONFIG ── */
/* All segments, nodes and geometry sourced STRICTLY from data/data.json */
/* NO mock or fabricated geometry — every edge maps 1:1 to a data.json segment */

import solutionData from '../../data/solution.json';
import floodData from '../../data/flood.json';
import dataScenario from '../../data/data.json';

export interface Waypoint {
  lat: number;
  lng: number;
}

export interface GameNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface GameEdge {
  id: string;
  from: string;
  to: string;
  letter: string;
  name: string;
  color: string;
  risk: 'none' | 'medium' | 'high';
  time: number;        // duration in seconds
  distance: number;    // distance in meters
  desc: string;
  geometry: Waypoint[];
  isSolutionPath?: boolean;
}

export interface RoundGraph {
  round: number;
  startingNodeId: string;
  destinationNodeId: string;
  totalSteps: number;
  nodes: Record<string, GameNode>;
  edges: GameEdge[];
}

export const SOLUTION_DATA = solutionData;
export const FLOOD_DATA = floodData;
export const DATA_SCENARIO = dataScenario;

// ── Solution path: the optimal AI route (S1→S2→S3→S4→S5→S6) ──
const SOLUTION_SEGMENT_IDS = new Set(['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);

// ── Display metadata per segment ──
const SEGMENT_META: Record<string, { risk: 'none' | 'medium' | 'high'; desc: string }> = {
  S1:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Đường Nguyễn Văn Cừ nối dài, mặt đường khô ráo.' },
  S2:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Đường Nguyễn Văn Cừ nối dài, hạ tầng cao ráo.' },
  S3:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Đường Nguyễn Văn Cừ nối dài đến Ngã tư NVC – NVL.' },
  S4:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Đi thẳng qua đường Mậu Thân đến Cầu Rạch Ngỗng.' },
  S5:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Qua Huỳnh Thúc Kháng – Hoàng Văn Thụ đến Cầu Ba Khía.' },
  S6:  { risk: 'none',   desc: 'Tuyến chuẩn AI: Qua Xô Viết Nghệ Tĩnh ra Bến Ninh Kiều.' },
  S7:  { risk: 'medium', desc: 'Đường 3/2 từ Vòng Xuyến 30/4 đến Ngã tư Mậu Thân – 3/2.' },
  S8:  { risk: 'medium', desc: 'Đường 30/4 từ Ngã tư Mậu Thân ra Bến Ninh Kiều.' },
  S9:  { risk: 'medium', desc: 'Đường 30/4 từ Vòng Xuyến 30/4 ra thẳng Bến Ninh Kiều.' },
  S10: { risk: 'medium', desc: 'Đi vòng qua Nguyễn Văn Linh – Đường 3/2 đến Cầu Ba Khía, né Mậu Thân.' },
  S11: { risk: 'high',   desc: 'Đường Mậu Thân, khu vực ngập sâu do triều cường dâng.' },
  S12: { risk: 'medium', desc: 'Đường Hoàng Quốc Việt.' },
  S13: { risk: 'medium', desc: 'Đường Nguyễn Văn Trường.' },
};

const RISK_COLORS: Record<string, string> = {
  none:   '#3b82f6', // Uniform blue for all choices to hide hints
  medium: '#3b82f6',
  high:   '#3b82f6',
};

// ── Build the complete game graph from data.json ──
function buildRoundGraph(): RoundGraph {
  // 1. Nodes
  const nodes: Record<string, GameNode> = {};
  dataScenario.nodes.forEach((n: any) => {
    nodes[n.id] = { id: n.id, name: n.name, lat: n.lat, lng: n.lng };
  });

  // 2. Group segments by source node for letter assignment
  const edgesByFrom: Record<string, any[]> = {};
  dataScenario.segments.forEach((seg: any) => {
    if (!edgesByFrom[seg.from]) edgesByFrom[seg.from] = [];
    edgesByFrom[seg.from].push(seg);
  });

  // 3. Build edges — solution-path edges always get letter 'A'
  const edges: GameEdge[] = [];
  const LETTERS = ['A', 'B', 'C', 'D'];

  Object.values(edgesByFrom).forEach((segs) => {
    // Sort: solution path first, then by segment ID
    segs.sort((a: any, b: any) => {
      const aS = SOLUTION_SEGMENT_IDS.has(a.id) ? 0 : 1;
      const bS = SOLUTION_SEGMENT_IDS.has(b.id) ? 0 : 1;
      if (aS !== bS) return aS - bS;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    segs.forEach((seg: any, idx: number) => {
      const meta = SEGMENT_META[seg.id] || { risk: 'medium' as const, desc: seg.name };
      edges.push({
        id: seg.id,
        from: seg.from,
        to: seg.to,
        letter: LETTERS[idx] || String.fromCharCode(65 + idx),
        name: seg.name,
        color: RISK_COLORS[meta.risk] || '#3b82f6',
        risk: meta.risk,
        time: Math.round((seg.duration || 60000) / 1000),
        distance: Math.round(seg.distance || 0),
        desc: meta.desc,
        geometry: seg.geometry as Waypoint[],
        isSolutionPath: SOLUTION_SEGMENT_IDS.has(seg.id),
      });
    });
  });

  return {
    round: 1,
    startingNodeId: dataScenario.start_node,
    destinationNodeId: dataScenario.end_node,
    totalSteps: 6,   // max possible (A→B→C→D→E→F→G)
    nodes,
    edges,
  };
}

export const ROUND_1_GRAPH: RoundGraph = buildRoundGraph();

// Helper to extract exact segment geometry from data.json
export const getSegmentGeom = (segmentId: string): Waypoint[] => {
  const seg = dataScenario.segments.find((s: any) => s.id === segmentId);
  return seg ? seg.geometry : [];
};

export const BOT_NAMES = [
  'AI_Thanh', 'AI_Tuan', 'AI_Mai',
  'Minh_CanTho', 'Vy_NinhKieu', 'Binh_CaiRang',
  'Huu_PhongDien', 'Lan_BinhThuy', 'Nam_OMon',
];

// ── SOLUTION EVALUATION HELPER ──
export function evaluatePlayerRoute(pathHistory: string[]) {
  let totalDistance = 0;
  let totalTime = 0;
  let floodPenalties = 0;
  let score = 100;

  pathHistory.forEach(edgeId => {
    const edge = ROUND_1_GRAPH.edges.find(e => e.id === edgeId);
    if (!edge) return;

    totalDistance += edge.distance || 0;
    totalTime += edge.time || 0;

    if (edge.risk === 'high') {
      floodPenalties += 2;
      score -= 20; // Heavy penalty for deep flood
    } else if (edge.risk === 'medium') {
      floodPenalties += 1;
      score -= 10; // Medium penalty for light flood
    }
    
    // Minor penalty for non-optimal/detour paths (if it's not the solution path)
    if (!edge.isSolutionPath) {
      score -= 5;
    }
  });

  return {
    totalDistance,
    totalTime,
    floodPenalties,
    score: Math.max(0, Math.min(100, Math.round(score)))
  };
}
