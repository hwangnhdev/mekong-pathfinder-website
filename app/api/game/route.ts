import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { ROUND_1_GRAPH } from '../../game/gameData';

interface Player {
  id: string;
  name: string;
  score: number;
  currentNodeId: string; // Tracks where they are in the graph
  pathHistory: string[]; // List of edge IDs they have traversed
  currentChoice: string | null; // The edge ID they selected for the current step
  timeTaken: number;
}

interface Room {
  code: string;
  status: 'waiting' | 'intro' | 'in_progress' | 'loading' | 'finished';
  currentRound: 1 | 2;
  currentStep: number; // 1, 2, 3...
  stepStartedAt?: number;
  players: Player[];
  overallScores?: Record<string, number[]>;
}

const ROOMS_FILE = path.join(process.cwd(), 'rooms_persist.json');

function loadRoomsFile(): Map<string, Room> {
  const map = new Map<string, Room>();
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf-8');
      const obj = JSON.parse(data);
      Object.entries(obj).forEach(([code, room]) => {
        map.set(code, room as Room);
      });
    }
  } catch (e) {
    console.error("Error reading rooms file:", e);
  }
  return map;
}

function saveRoomsFile(roomsMap: Map<string, Room>) {
  try {
    const obj = Object.fromEntries(roomsMap.entries());
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing rooms file:", e);
  }
}

// In-memory rooms cache with file restore
const rooms: Map<string, Room> = (global as any).gameRooms || loadRoomsFile();
(global as any).gameRooms = rooms;

const HISTORY_FILE = path.join(process.cwd(), 'game_history.json');

function loadHistoryFile(): Record<string, Record<string, number[]>> {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading history file:", e);
  }
  return {};
}

function saveHistoryFile(history: Record<string, Record<string, number[]>>) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing history file:", e);
  }
}

function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    for (const net of interfaces) {
      const familyV4 = typeof (net as any).family === 'string' 
        ? (net as any).family === 'IPv4' 
        : (net as any).family === 4;
      if (familyV4 && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const TOKEN_SECRET = 'mp-admin-token-2026';

function isValidAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    if (!decoded.startsWith(TOKEN_SECRET + ':')) return false;
    const timestamp = parseInt(decoded.split(':')[1], 10);
    return Date.now() - timestamp < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'getInfo') {
      return NextResponse.json({ success: true, localIp: getLocalIpAddress() });
    }

    if (action === 'create') {
      const { adminToken } = body;
      if (!adminToken || !isValidAdminToken(adminToken)) {
        return NextResponse.json({ success: false, error: 'Bạn cần đăng nhập Admin để tạo phòng.' }, { status: 401 });
      }

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newRoom: Room = {
        code,
        status: 'waiting',
        currentRound: 1,
        currentStep: 1,
        players: [],
      };
      rooms.set(code, newRoom);
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, roomCode: code, localIp: getLocalIpAddress() });
    }

    if (action === 'join') {
      const { roomCode, playerName, playerId } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });
      if (room.status !== 'waiting') return NextResponse.json({ success: false, error: 'Phòng đã bắt đầu hoặc đã kết thúc!' });

      const existingPlayer = room.players.find(p => p.id === playerId);
      if (!existingPlayer) {
        room.players.push({
          id: playerId,
          name: playerName.substring(0, 12),
          score: 0,
          currentNodeId: 'start',
          pathHistory: [],
          currentChoice: null,
          timeTaken: 0,
        });
      }
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'status') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'start') {
      const { roomCode, isDevMode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });

      room.status = 'intro';
      room.currentRound = 1;
      room.currentStep = 1;
      room.stepStartedAt = Date.now();
      (room as any).isDevMode = !!isDevMode;
      
      // Initialize overall scores map if not exists
      if (!room.overallScores) {
        const history = loadHistoryFile();
        room.overallScores = history[room.code] || {};
      }

      const startNode = ROUND_1_GRAPH.startingNodeId;
      room.players.forEach(p => {
        p.score = 0;
        p.currentNodeId = startNode;
        p.pathHistory = [];
        p.currentChoice = null;
        p.timeTaken = 0;
      });
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'start_gameplay') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });

      room.status = 'in_progress';
      room.currentStep = 1;
      room.stepStartedAt = Date.now();
      
      // Reset active gameplay status for players just in case
      const startNode = ROUND_1_GRAPH.startingNodeId;
      room.players.forEach(p => {
        p.score = 0;
        p.currentNodeId = startNode;
        p.pathHistory = [];
        p.currentChoice = null;
        p.timeTaken = 0;
      });

      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'select') {
      const { roomCode, playerId, edgeId, timeTaken } = body; // edgeId is the choice
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) return NextResponse.json({ success: false, error: 'Người chơi không có trong phòng!' });
      
      // If isDevMode is active, allow changing selection by bypassing the "already selected" check!
      if (!(room as any).isDevMode && player.currentChoice !== null) {
        return NextResponse.json({ success: false, error: 'Bạn đã chọn rồi!' });
      }

      player.currentChoice = edgeId;
      player.timeTaken = timeTaken;

      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'next_step') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });

      const maxSteps = ROUND_1_GRAPH.totalSteps; // typically 3

      // Process all choices for the current step
      room.players.forEach(p => {
        if (p.currentChoice) {
          const chosenEdge = ROUND_1_GRAPH.edges.find(e => e.id === p.currentChoice);
          if (chosenEdge) {
            p.pathHistory.push(chosenEdge.id);
            p.currentNodeId = chosenEdge.to; // Move player to new node

            // Calculate score for this step
            let points = 50; // base score for making a move
            if (chosenEdge.risk === 'none') points += 50;
            if (chosenEdge.risk === 'medium') points += 20;
            if (chosenEdge.risk === 'high') points -= 30; // penalty

            // Speed bonus
            if (p.timeTaken <= 2) points += 20;
            else if (p.timeTaken <= 5) points += 10;

            p.score += points;
          }
        }
        
        // Reset choice for the next turn
        p.currentChoice = null;
        p.timeTaken = 0;
      });

      if (room.currentStep >= maxSteps) {
        // Accumulate overall scores as array of numbers
        if (!room.overallScores) {
          room.overallScores = {};
        }
        room.players.forEach(p => {
          if (!room.overallScores![p.name]) {
            room.overallScores![p.name] = [];
          }
          room.overallScores![p.name].push(p.score);
        });

        // Save to file
        const history = loadHistoryFile();
        history[room.code] = room.overallScores;
        saveHistoryFile(history);

        room.status = 'loading';
        room.stepStartedAt = Date.now();
      } else {
        room.currentStep += 1;
        room.stepStartedAt = Date.now();
      }

      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room });
    }

    if (action === 'prev_step') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });

      if (room.currentStep > 1) {
        room.currentStep -= 1;
        room.stepStartedAt = Date.now();
        room.status = 'in_progress';

        room.players.forEach(p => {
          if (p.pathHistory.length > 0) {
            const lastEdgeId = p.pathHistory.pop();
            const lastEdge = ROUND_1_GRAPH.edges.find(e => e.id === lastEdgeId);
            if (lastEdge) {
              p.currentNodeId = lastEdge.from;
              let points = 50;
              if (lastEdge.risk === 'none') points += 50;
              if (lastEdge.risk === 'medium') points += 20;
              if (lastEdge.risk === 'high') points -= 30;
              p.score = Math.max(0, p.score - points);
            }
          }
          p.currentChoice = null;
          p.timeTaken = 0;
        });
      }
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room, serverTime: Date.now() });
    }

    if (action === 'end') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });
      room.status = 'finished';
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room });
    }

    if (action === 'reset') {
      const { roomCode } = body;
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return NextResponse.json({ success: false, error: 'Không tìm thấy phòng!' });
      room.status = 'waiting';
      room.currentRound = 1;
      room.currentStep = 1;
      room.players = [];
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, room });
    }

    if (action === 'get_history') {
      const history = loadHistoryFile();
      return NextResponse.json({ success: true, history });
    }

    if (action === 'clear_history') {
      saveHistoryFile({});
      rooms.forEach(r => {
        r.overallScores = {};
      });
      saveRoomsFile(rooms);
      return NextResponse.json({ success: true, history: {} });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
