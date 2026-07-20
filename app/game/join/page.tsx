'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Play, Users, CheckCircle2, AlertTriangle, Clock, Award, MapPin, Sparkles, Loader2
} from 'lucide-react';
import logo04 from '../../../assets/images/logo_header/logo-04.png';
import { ROUND_1_GRAPH } from '../gameData';

// Dynamically load the Leaflet map without SSR
const MobileMap = dynamic(() => import('./MobileMap'), { ssr: false, loading: () => <div style={{ height: 180, background: '#1e293b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải bản đồ...</div> });

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
  const [timeRemaining, setTimeRemaining] = useState(15); // 15 seconds per step
  const [errorMsg, setErrorMsg] = useState('');
  const [joined, setJoined] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStepRef = useRef<number>(0);
  const serverTimeOffsetRef = useRef<number>(0);

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

  const failureCountRef = useRef(0);

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
          failureCountRef.current = 0;
          const room = data.room;
          if (data.serverTime) {
            serverTimeOffsetRef.current = data.serverTime - Date.now();
          }
          // Reset choice when step advances
          if (room.currentStep !== prevStepRef.current) {
            setPlayerChoice(null);
          }
          prevStepRef.current = room.currentStep;
          setRoomData(room);
        } else {
          // Check if the error is specifically that the room does not exist
          if (data.error === 'Không tìm thấy phòng!') {
            failureCountRef.current += 1;
            if (failureCountRef.current >= 5) { // Allow up to 5 consecutive failures (~7.5 seconds)
              setJoined(false);
              setRoomData(null);
              setErrorMsg('Phòng chơi không tồn tại hoặc đã bị đặt lại.');
            }
          }
        }
      } catch (err) {
        // Network timeout / transient issues: increment count but do not disconnect immediately
        failureCountRef.current += 1;
        if (failureCountRef.current >= 15) { // Allow up to 15 network errors (~22.5 seconds)
          setJoined(false);
          setRoomData(null);
          setErrorMsg('Mất kết nối với máy chủ quá lâu.');
        }
      }
    };
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [joined, roomCode]);

  // Sync timer from server stepStartedAt
  useEffect(() => {
    if (roomData?.status === 'in_progress' && roomData.stepStartedAt) {
      if (roomData.isDevMode) {
        setTimeRemaining(9999);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const serverNow = Date.now() + serverTimeOffsetRef.current;
      const elapsed = Math.floor((serverNow - roomData.stepStartedAt) / 1000);
      const remaining = Math.max(15 - elapsed, 0);
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
  }, [roomData?.currentStep, roomData?.stepStartedAt, roomData?.status]);

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
        if (data.serverTime) {
          serverTimeOffsetRef.current = data.serverTime - Date.now();
        }
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
    const serverNow = Date.now() + serverTimeOffsetRef.current;
    const elapsed = Math.floor((serverNow - roomData.stepStartedAt) / 1000);
    
    const isDevMode = !!roomData.isDevMode;
    if (!isDevMode) {
      if (elapsed > 15 || playerChoice !== null) return;
    }

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
          timeTaken: Math.min(elapsed, 15),
        }),
      });
    } catch { }
  };

  if (!mounted) return null;

  const me = roomData?.players?.find((p: any) => p.id === playerId);
  const serverNow = Date.now() + serverTimeOffsetRef.current;
  const elapsedSeconds = roomData?.stepStartedAt
    ? Math.floor((serverNow - roomData.stepStartedAt) / 1000)
    : 0;
  
  const isSelectionActive = roomData?.isDevMode
    ? roomData.status === 'in_progress'
    : (elapsedSeconds <= 15 && playerChoice === null);

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

        {/* Case 2: Joined and Kicked out (host reset) -> Thank You Screen */}
        {joined && roomData && !me && (
          <div className="join-card finished" style={{ textAlign: 'center' }}>
            <Award size={48} style={{ color: 'var(--primary)', margin: '0 auto 15px', display: 'block' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '10px' }}>Cảm ơn bạn đã tham gia!</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Trận đấu đã kết thúc và phòng chơi đã được Host đặt lại. Cảm ơn bạn đã đồng hành cùng Mekong Pathfinder trong hành trình giảm thiểu rủi ro ngập lụt!
            </p>
            <button 
              onClick={() => {
                setJoined(false);
                setRoomData(null);
                setPlayerChoice(null);
              }} 
              className="join-btn" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              Tham gia phòng mới
            </button>
            <button 
              onClick={() => {
                window.location.href = 'https://mekongpathfinder.vn/';
              }} 
              className="join-btn" 
              style={{ width: '100%', marginTop: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              Qua xem Website
            </button>
          </div>
        )}

        {/* Case 3: Joined and Room is in waiting status (waiting for host to start) -> Waiting with Rules */}
        {joined && roomData?.status === 'waiting' && me && (
          <div className="join-card waiting" style={{ maxWidth: '440px', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)', margin: '0 auto 10px', display: 'block' }} />
              <h2 style={{ margin: '0 0 5px', textAlign: 'center' }}>Đã tham gia!</h2>
              <p style={{ margin: 0, textAlign: 'center' }}>Chào <strong>{playerName}</strong>, bạn đang trong phòng <strong>{roomCode}</strong>.</p>
              <div className="join-pulse-text" style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center' }}>Đang chờ Host bắt đầu...</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Hướng dẫn & Luật chơi</h4>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
                <li>🏁 <strong>Nhiệm vụ:</strong> Di chuyển từ Đại học Cần Thơ về đích an toàn, tránh các tuyến đường ngập lụt.</li>
                <li>⏱️ <strong>Thời gian:</strong> Tại mỗi giao lộ, bạn chỉ có <strong>8 giây</strong> để chọn ngã rẽ. Nếu hết giờ, bạn sẽ bị phạt kẹt xe!</li>
                <li>⚠️ <strong>Rủi ro ngập:</strong> Các tuyến đường có 3 mức độ: <em>An toàn, Ngập vừa</em> và <em>Ngập sâu</em>. Đi vào vùng ngập sâu sẽ bị trừ nhiều điểm.</li>
                <li>🧠 <strong>AI Trợ lý:</strong> Hãy tham khảo ý kiến phân tích của AI Mekong Pathfinder trên màn hình chính để đưa ra lựa chọn sáng suốt.</li>
                <li>🏆 <strong>Điểm số:</strong> Về đích an toàn với thời gian nhanh nhất để đạt thứ hạng cao nhất trên Bảng xếp hạng.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Case 4: Intro phase (waiting for player to look at projector) */}
        {joined && roomData?.status === 'intro' && me && (
          <div className="join-card intro" style={{ maxWidth: '440px', textAlign: 'center', padding: '30px 20px' }}>
            <Award size={48} style={{ color: 'var(--primary)', margin: '0 auto 15px', display: 'block', animation: 'bounce 2s infinite' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '10px' }}>Theo dõi Bối cảnh Trận đấu</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Bối cảnh câu chuyện, luật chơi, gợi ý từ AI trợ lý và bản đồ đang được chiếu trên màn hình projector lớn. Hãy nhìn lên để chuẩn bị cho cuộc đua nhé!
            </p>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <div className="join-pulse-text" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Trận đấu sắp bắt đầu...</div>
            </div>
          </div>
        )}

        {/* Case 5: Loading / Result analysis phase */}
        {joined && roomData?.status === 'loading' && me && (
          <div className="join-card loading" style={{ maxWidth: '440px', textAlign: 'center', padding: '30px 20px' }}>
            <Loader2 className="animate-spin text-primary" size={48} style={{ color: 'var(--primary)', margin: '0 auto 15px', display: 'block' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '10px' }}>AI Đang Phân Tích Kết Quả</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Đang mô phỏng lộ trình di chuyển tránh ngập lụt của bạn và các người chơi khác. Kết quả sắp được hiển thị!
            </p>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--primary)', borderRadius: '2px', animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        )}

        {/* Case 6: In progress gameplay */}
        {joined && roomData?.status === 'in_progress' && currentNode && (
          <div className="join-gameplay" style={{ padding: '0 4px' }}>
            <div className="join-round-bar" style={{ marginBottom: 10 }}>
              <div>
                <span className="join-round-label">Bước {roomData.currentStep}/{ROUND_1_GRAPH.totalSteps}</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> {currentNode.name}
                </strong>
              </div>
              {roomData.isDevMode ? (
                <div className="join-timer" style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }}>
                  <Sparkles size={12} />
                  <span>Dev Mode</span>
                </div>
              ) : (
                <div className="join-timer">
                  <Clock size={14} />
                  <span className={timeRemaining <= 3 ? 'danger' : ''}>{timeRemaining}s</span>
                </div>
              )}
            </div>

            <MobileMap currentNode={currentNode} availableEdges={availableEdges} pathHistory={me.pathHistory || []} playerChoice={playerChoice} />

            <div style={{ marginTop: 10 }}>
              {playerChoice !== null && (
                roomData.isDevMode ? (
                  <div className="join-locked" style={{ marginBottom: 10, background: '#fef3c7', borderColor: '#f59e0b', color: '#b45309' }}>
                    <Sparkles size={16} /> Chế độ Dev: Bạn có thể thay đổi hướng đi
                  </div>
                ) : (
                  <div className="join-locked" style={{ marginBottom: 10 }}>
                    <CheckCircle2 size={16} /> Đã chọn, chờ người khác...
                  </div>
                )
              )}
              {elapsedSeconds > 15 && playerChoice === null && (
                <div className="join-expired" style={{ marginBottom: 10 }}>
                  <AlertTriangle size={16} /> Hết thời gian!
                </div>
              )}

              <div className="join-routes">
                {availableEdges.map(edge => {
                  const isSelected = playerChoice === edge.id;
                  return (
                    <div
                      key={edge.id}
                      onClick={() => isSelectionActive && handleSelectEdge(edge.id)}
                      className={`join-route-btn ${isSelected ? 'selected' : ''} ${!isSelectionActive && !isSelected ? 'disabled' : ''}`}
                      style={{ 
                        borderLeft: `6px solid ${edge.color}`,
                        cursor: isSelectionActive ? 'pointer' : 'default'
                      }}
                      role="button"
                      tabIndex={0}
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
                    </div>
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
            <button 
              onClick={() => {
                setJoined(false);
                setRoomData(null);
                setPlayerChoice(null);
              }} 
              className="join-btn" 
              style={{ width: '100%', marginTop: '20px' }}
            >
              Tham gia phòng mới
            </button>
            <button 
              onClick={() => {
                window.location.href = 'https://mekongpathfinder.vn/';
              }} 
              className="join-btn" 
              style={{ width: '100%', marginTop: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              Qua xem Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
