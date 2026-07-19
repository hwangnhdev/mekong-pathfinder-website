/* ── GAME GRAPH DATA CONFIG ── */
/* Defines the multi-turn node graph for the Flood Escape Race game */

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
  from: string; // source node ID
  to: string; // destination node ID
  letter: string; // A, B, C for UI buttons
  name: string; // Display name
  color: string; // Hex color for drawing and button (e.g. '#3b82f6')
  risk: 'none' | 'medium' | 'high';
  time: number; // in seconds
  desc: string;
  geometry: Waypoint[];
}

export interface RoundGraph {
  round: number;
  startingNodeId: string;
  destinationNodeId: string;
  totalSteps: number;
  nodes: Record<string, GameNode>;
  edges: GameEdge[];
}

// ── ROUND 1 GRAPH (3 Steps: Start -> Mid1 -> Mid2 -> End) ──
export const ROUND_1_GRAPH: RoundGraph = {
  round: 1,
  startingNodeId: 'start',
  destinationNodeId: 'end',
  totalSteps: 3,
  nodes: {
    'start': { id: 'start', name: 'Đại học Cần Thơ', lat: 10.0298, lng: 105.7706 },
    'm1_n': { id: 'm1_n', name: 'Ngã tư Mậu Thân', lat: 10.0350, lng: 105.7760 },
    'm1_c': { id: 'm1_c', name: 'Đường 30/4', lat: 10.0300, lng: 105.7765 },
    'm1_s': { id: 'm1_s', name: 'Trần Hưng Đạo', lat: 10.0250, lng: 105.7750 },
    'm2_n': { id: 'm2_n', name: 'Vòng xoay Hùng Vương', lat: 10.0360, lng: 105.7810 },
    'm2_c': { id: 'm2_c', name: 'Đại lộ Hòa Bình', lat: 10.0310, lng: 105.7820 },
    'm2_s': { id: 'm2_s', name: 'Công viên Lưu Hữu Phước', lat: 10.0260, lng: 105.7800 },
    'end': { id: 'end', name: 'Bến Ninh Kiều', lat: 10.0335, lng: 105.7865 },
  },
  edges: [
    // STEP 1 (Start -> Mid1)
    {
      id: 'e_s_n', from: 'start', to: 'm1_n', letter: 'A', name: 'Đường Mậu Thân', color: '#ef4444', risk: 'high', time: 15, desc: 'Tuyến ngắn nhưng ngập rất sâu (0.8m).',
      geometry: [{ lat: 10.0298, lng: 105.7706 }, { lat: 10.0324, lng: 105.7733 }, { lat: 10.0350, lng: 105.7760 }]
    },
    {
      id: 'e_s_c', from: 'start', to: 'm1_c', letter: 'B', name: 'Đường 30 Tháng 4', color: '#10b981', risk: 'none', time: 10, desc: 'Cao ráo, thông thoáng.',
      geometry: [{ lat: 10.0298, lng: 105.7706 }, { lat: 10.0299, lng: 105.7735 }, { lat: 10.0300, lng: 105.7765 }]
    },
    {
      id: 'e_s_s', from: 'start', to: 'm1_s', letter: 'C', name: 'Trần Hưng Đạo', color: '#f59e0b', risk: 'medium', time: 12, desc: 'Kẹt xe nhẹ do mưa.',
      geometry: [{ lat: 10.0298, lng: 105.7706 }, { lat: 10.0274, lng: 105.7728 }, { lat: 10.0250, lng: 105.7750 }]
    },

    // STEP 2 (Mid1 -> Mid2)
    {
      id: 'e_m1n_m2n', from: 'm1_n', to: 'm2_n', letter: 'A', name: 'Hùng Vương (Bắc)', color: '#3b82f6', risk: 'none', time: 9, desc: 'Đường 1 chiều, vắng xe.',
      geometry: [{ lat: 10.0350, lng: 105.7760 }, { lat: 10.0355, lng: 105.7785 }, { lat: 10.0360, lng: 105.7810 }]
    },
    {
      id: 'e_m1n_m2c', from: 'm1_n', to: 'm2_c', letter: 'B', name: 'Trần Văn Khéo', color: '#f59e0b', risk: 'medium', time: 14, desc: 'Có lô cốt công trình.',
      geometry: [{ lat: 10.0350, lng: 105.7760 }, { lat: 10.0330, lng: 105.7790 }, { lat: 10.0310, lng: 105.7820 }]
    },
    {
      id: 'e_m1c_m2n', from: 'm1_c', to: 'm2_n', letter: 'A', name: 'Lý Tự Trọng', color: '#ef4444', risk: 'high', time: 18, desc: 'Ngập nặng khu vực hồ Xáng Thổi.',
      geometry: [{ lat: 10.0300, lng: 105.7765 }, { lat: 10.0330, lng: 105.7785 }, { lat: 10.0360, lng: 105.7810 }]
    },
    {
      id: 'e_m1c_m2c', from: 'm1_c', to: 'm2_c', letter: 'B', name: 'Đại lộ Hòa Bình', color: '#10b981', risk: 'none', time: 8, desc: 'Lộ trình AI khuyên dùng, rất đẹp.',
      geometry: [{ lat: 10.0300, lng: 105.7765 }, { lat: 10.0305, lng: 105.7790 }, { lat: 10.0310, lng: 105.7820 }]
    },
    {
      id: 'e_m1c_m2s', from: 'm1_c', to: 'm2_s', letter: 'C', name: 'Ngô Quyền', color: '#3b82f6', risk: 'none', time: 11, desc: 'Đi vòng nhưng đường tốt.',
      geometry: [{ lat: 10.0300, lng: 105.7765 }, { lat: 10.0280, lng: 105.7780 }, { lat: 10.0260, lng: 105.7800 }]
    },
    {
      id: 'e_m1s_m2c', from: 'm1_s', to: 'm2_c', letter: 'A', name: 'Phan Đình Phùng', color: '#f59e0b', risk: 'medium', time: 13, desc: 'Ùn ứ tại ngã ba.',
      geometry: [{ lat: 10.0250, lng: 105.7750 }, { lat: 10.0280, lng: 105.7785 }, { lat: 10.0310, lng: 105.7820 }]
    },
    {
      id: 'e_m1s_m2s', from: 'm1_s', to: 'm2_s', letter: 'B', name: 'Hai Bà Trưng', color: '#10b981', risk: 'none', time: 9, desc: 'Đường dọc bờ sông, mát mẻ.',
      geometry: [{ lat: 10.0250, lng: 105.7750 }, { lat: 10.0255, lng: 105.7775 }, { lat: 10.0260, lng: 105.7800 }]
    },

    // STEP 3 (Mid2 -> End)
    {
      id: 'e_m2n_e', from: 'm2_n', to: 'end', letter: 'A', name: 'Nguyễn Thái Học', color: '#3b82f6', risk: 'none', time: 7, desc: 'Khá gần và an toàn.',
      geometry: [{ lat: 10.0360, lng: 105.7810 }, { lat: 10.0347, lng: 105.7837 }, { lat: 10.0335, lng: 105.7865 }]
    },
    {
      id: 'e_m2c_e', from: 'm2_c', to: 'end', letter: 'B', name: 'Đường Hai Bà Trưng (Tiếp)', color: '#10b981', risk: 'none', time: 5, desc: 'Lộ trình tối ưu nhất.',
      geometry: [{ lat: 10.0310, lng: 105.7820 }, { lat: 10.0322, lng: 105.7842 }, { lat: 10.0335, lng: 105.7865 }]
    },
    {
      id: 'e_m2s_e', from: 'm2_s', to: 'end', letter: 'C', name: 'Nguyễn Trãi', color: '#ef4444', risk: 'high', time: 16, desc: 'Đường ven chợ kẹt cứng, triều cường dâng.',
      geometry: [{ lat: 10.0260, lng: 105.7800 }, { lat: 10.0297, lng: 105.7832 }, { lat: 10.0335, lng: 105.7865 }]
    }
  ]
};

export const BOT_NAMES = ['AI_Thanh', 'AI_Tuan', 'AI_Mai', 'Minh_CanTho', 'Vy_NinhKieu', 'Binh_CaiRang', 'Huu_PhongDien', 'Lan_BinhThuy', 'Nam_OMon'];
