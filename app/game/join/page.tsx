'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Play, Users, CheckCircle2, AlertTriangle, Clock, Award, MapPin
} from 'lucide-react';
import logo04 from '../../../assets/images/logo_header/logo-04.png';
import { ROUND_1_GRAPH } from '../gameData';

// Dynamically load the Leaflet map without SSR
const MobileMap = dynamic(() => import('./MobileMap'), { ssr: false, loading: () => <div style={{ height: 300, background: '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải bản đồ...</div> });

// A simple Error Boundary to display errors on mobile screens instead of a blank page
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', margin: '20px', fontSize: '13px', overflow: 'auto', border: '1px solid #fca5a5' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Đã xảy ra lỗi giao diện:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '11px', color: '#7f1d1d' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PlayerJoinPage() {
  return (
    <ErrorBoundary>
      <PlayerJoinPageInner />
    </ErrorBoundary>
  );
}

function PlayerJoinPageInner() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(8); // 8 seconds per step
  const [errorMsg, setErrorMsg] = useState('');
  const [joined, setJoined] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStepRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    setPlayerId('player_' + Math.random().toString(36).substring(2, 9));

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room');
      if (code) {
        setRoomCode(code.toUpperCase());
      }
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Poll room status after joining
  useEffect(() => {
    if (!joined || !roomCode) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ action: 'status', roomCode }),
        });
        const data = await res.json();
        if (data.success) {
          const room = data.room;
          // Reset choice when step advances
          if (room.currentStep !== prevStepRef.current) {
            setPlayerChoice(null);
          }
          prevStepRef.current = room.currentStep;
          setRoomData(room);
        }
      } catch { }
    };
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [joined, roomCode]);

  // Sync timer from server stepStartedAt
  useEffect(() => {
    if (roomData?.status === 'in_progress' && roomData.stepStartedAt) {
      const elapsed = Math.floor((Date.now() - roomData.stepStartedAt) / 1000);
      const remaining = Math.max(8 - elapsed, 0);
      setTimeRemaining(remaining);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining(r => {
          if (r <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [roomData?.currentStep, roomData?.status]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !playerName.trim()) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action: 'join', roomCode, playerName, playerId }),
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        setJoined(true);
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra.');
      }
    } catch {
      setErrorMsg('Lỗi mạng, vui lòng thử lại.');
    }
  };

  const handleSelectEdge = async (edgeId: string) => {
    if (!roomData?.stepStartedAt) return;
    const elapsed = Math.floor((Date.now() - roomData.stepStartedAt) / 1000);
    if (elapsed > 8 || playerChoice !== null) return;

    setPlayerChoice(edgeId);
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          action: 'select',
          roomCode,
          playerId,
          edgeId,
          timeTaken: Math.min(elapsed, 8),
        }),
      });
    } catch { }
  };

  if (!mounted) return null;

  const me = roomData?.players?.find((p: any) => p.id === playerId);
  const elapsedSeconds = roomData?.stepStartedAt
    ? Math.floor((Date.now() - roomData.stepStartedAt) / 1000)
    : 0;
  const isSelectionActive = elapsedSeconds <= 8 && playerChoice === null;

  let currentNode = null;
  let availableEdges: any[] = [];
  if (me && roomData?.status === 'in_progress') {
    currentNode = ROUND_1_GRAPH.nodes[me.currentNodeId];
    availableEdges = ROUND_1_GRAPH.edges.filter(e => e.from === me.currentNodeId);
  }

  return (
    <div className="join-page">
      <header className="join-header">
        <Image src={logo04} alt="Mekong Pathfinder" height={24} style={{ width: 'auto' }} priority />
      </header>

      <div className="join-container">
        {!joined && (
          <div className="join-card">
            <Users size={40} />
            <h2>Tham gia phòng đua</h2>
            <p>Nhập tên hiển thị để gia nhập cuộc đua tránh ngập lụt.</p>

            <form onSubmit={handleJoinRoom} className="join-form">
              <div className="join-room-display">
                Phòng: <strong>{roomCode || '—'}</strong>
              </div>
              <input
                type="text"
                placeholder="Nhập tên của bạn..."
                required
                maxLength={12}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="join-input"
              />
              {errorMsg && (
                <div className="join-error"><AlertTriangle size={14} /> {errorMsg}</div>
              )}
              <button type="submit" className="join-btn">
                Vào phòng <Play size={14} />
              </button>
            </form>
          </div>
        )}

        {joined && roomData?.status === 'waiting' && (
          <div className="join-card waiting">
            <CheckCircle2 size={40} />
            <h2>Đã tham gia!</h2>
            <p>Chào <strong>{playerName}</strong>, bạn đang trong phòng <strong>{roomCode}</strong>.</p>
            <div className="join-pulse-text">Đang chờ Host bắt đầu...</div>
          </div>
        )}

        {joined && roomData?.status === 'in_progress' && currentNode && (
          <div className="join-gameplay" style={{ padding: '0 10px' }}>
            <div className="join-round-bar" style={{ marginBottom: 15 }}>
              <div>
                <span className="join-round-label">Bước {roomData.currentStep}/{ROUND_1_GRAPH.totalSteps}</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> {currentNode.name}
                </strong>
              </div>
              <div className="join-timer">
                <Clock size={14} />
                <span className={timeRemaining <= 3 ? 'danger' : ''}>{timeRemaining}s</span>
              </div>
            </div>

            <MobileMap currentNode={currentNode} availableEdges={availableEdges} />

            <div style={{ marginTop: 15 }}>
              {playerChoice !== null && (
                <div className="join-locked" style={{ marginBottom: 15 }}>
                  <CheckCircle2 size={16} /> Đã chọn, chờ người khác...
                </div>
              )}
              {elapsedSeconds > 8 && playerChoice === null && (
                <div className="join-expired" style={{ marginBottom: 15 }}>
                  <AlertTriangle size={16} /> Hết thời gian!
                </div>
              )}

              <div className="join-routes">
                {availableEdges.map(edge => {
                  const isSelected = playerChoice === edge.id;
                  return (
                    <button
                      key={edge.id}
                      disabled={!isSelectionActive}
                      onClick={() => handleSelectEdge(edge.id)}
                      className={`join-route-btn ${isSelected ? 'selected' : ''} ${!isSelectionActive && !isSelected ? 'disabled' : ''}`}
                      style={{ borderLeft: `6px solid ${edge.color}` }}
                    >
                      <div className="join-route-top">
                        <span className={`join-route-letter ${isSelected ? 'active' : ''}`} style={{ backgroundColor: isSelected ? edge.color : 'rgba(255,255,255,0.1)' }}>{edge.letter}</span>
                        <strong>{edge.name}</strong>
                      </div>
                      <div className="join-route-tags">
                        <span className={`risk-tag ${edge.risk}`}>
                          {edge.risk === 'high' ? 'Ngập sâu' : edge.risk === 'medium' ? 'Ngập vừa' : 'An toàn'}
                        </span>
                        <span className="time-tag">⏱️ {edge.time}s</span>
                      </div>
                      <p className="join-route-desc">{edge.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {joined && roomData?.status === 'finished' && (
          <div className="join-card finished">
            <Award size={48} />
            <h2>Về đích!</h2>
            {me && (
              <div className="join-final-score">
                Tổng điểm: <strong>{me.score}</strong>
              </div>
            )}
            <p>Hãy xem bảng xếp hạng trên màn hình Host!</p>
          </div>
        )}
      </div>
    </div>
  );
}
