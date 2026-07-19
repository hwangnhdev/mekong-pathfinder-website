'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Trophy, Users, CheckCircle2, AlertTriangle,
  Clock, Award
} from 'lucide-react';
import logo04 from '../../../assets/images/logo_header/logo-04.png';
import logo15 from '../../../assets/images/logo_header/logo-14.png';
import { ROUND_1_GRAPH } from '../gameData';

const HostMap = dynamic(() => import('./HostMap'), { ssr: false });

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
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
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Đã xảy ra lỗi giao diện trang Host:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '11px', color: '#7f1d1d' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HostProjectorPage() {
  return (
    <ErrorBoundary>
      <HostProjectorPageInner />
    </ErrorBoundary>
  );
}

function HostProjectorPageInner() {
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [joinLink, setJoinLink] = useState('');
  const [countdown, setCountdown] = useState(8);
  const [mounted, setMounted] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room');
      const pUrl = params.get('publicUrl');
      if (code) {
        setRoomCode(code.toUpperCase());
        const base = pUrl ? pUrl.trim().replace(/\/$/, '') : window.location.origin;
        setJoinLink(`${base}/game/join?room=${code.toUpperCase()}`);
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!roomCode) return;
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
          setRoomData(room);
          setFetchError('');
          
          if (room.status === 'in_progress' && room.stepStartedAt) {
            startTimerFromServer(room.stepStartedAt);
          }
        } else {
          setFetchError(data.error || 'Không tìm thấy phòng hoặc lỗi server.');
        }
      } catch {
        setFetchError('Lỗi kết nối tới máy chủ.');
      }
    };
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomCode]);

  const startTimerFromServer = (stepStartedAt?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = stepStartedAt ? Math.floor((Date.now() - stepStartedAt) / 1000) : 0;
    const remaining = Math.max(8 - elapsed, 0);
    setCountdown(remaining);

    if (remaining <= 0) return;

    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  if (!mounted) return null;

  if (!roomCode) {
    return (
      <div className="host-error-screen">
        <AlertTriangle size={48} />
        <h2>Không tìm thấy mã phòng</h2>
        <p>Vui lòng mở trang này từ Admin Dashboard với tham số <code>?room=CODE</code>.</p>
        <a href="/admin" className="admin-btn primary">Đi tới Admin</a>
      </div>
    );
  }

  if (fetchError && !roomData) {
    return (
      <div className="host-error-screen" style={{ color: '#ef4444' }}>
        <AlertTriangle size={48} />
        <h2>{fetchError}</h2>
        <p>Phòng {roomCode} không tồn tại hoặc server vừa khởi động lại.</p>
        <a href="/admin" className="admin-btn primary">Quay lại Admin để tạo phòng mới</a>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="host-error-screen">
        <h2 style={{ animation: 'pulse 1.5s infinite' }}>Đang tải dữ liệu phòng {roomCode}...</h2>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinLink)}`;
  const sortedPlayers = roomData ? [...roomData.players].sort((a: any, b: any) => b.score - a.score) : [];

  return (
    <div className="host-projector-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '1200px',
        height: '1200px',
        opacity: 0.06,
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)'
      }}>
        <Image src={logo15} alt="Watermark TL" fill sizes="360px" style={{ objectFit: 'contain' }} priority />
      </div>

      <div className="host-projector-inner" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {roomData && roomData.status !== 'waiting' && (
          <header className="host-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Image src={logo04} alt="Mekong Pathfinder" height={28} style={{ width: 'auto' }} priority />
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Bước {roomData.currentStep} / {ROUND_1_GRAPH.totalSteps}</span>
              <span className="host-room-badge" style={{ margin: 0 }}>Phòng: {roomCode}</span>
            </div>
          </header>
        )}

        {/* ── WAITING LOBBY ── */}
        {roomData?.status === 'waiting' && (
          <div className="admin-game-panel" style={{ width: '100%', maxWidth: '1000px', margin: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Image src={logo04} alt="Mekong Pathfinder Logo" height={56} style={{ width: 'auto', margin: '0 auto' }} priority />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: '32px',
              alignItems: 'center',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div>
                <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '4px' }}>
                  Mekong Pathfinder
                </span>
                <h1 style={{ fontSize: '38px', fontWeight: '950', color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  Flood Escape Race
                </h1>
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                  Di chuyển từng bước để tránh ngập lụt.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow)',
                lineHeight: '1.5',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  Luật chơi:
                </span>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  • <strong>Cách chơi:</strong> Trò chơi có {ROUND_1_GRAPH.totalSteps} bước ngã rẽ. Ở mỗi ngã rẽ, bạn có 8 giây để chọn đường đi.<br />
                  • <strong>Tham gia:</strong> Quét mã QR để vào phòng.<br />
                  • <strong>Ghi điểm:</strong> Chọn đường ít ngập sẽ được cộng điểm, kẹt xe hoặc ngập sâu sẽ bị trừ điểm! Nhanh tay sẽ có thêm điểm tốc độ.
                </p>
              </div>
            </div>

            <div className="admin-room-bar">
              <div className="admin-room-code">
                <span className="label">Mã phòng</span>
                <span className="code">{roomCode}</span>
              </div>
              <div className="admin-room-status">
                <span className="status-badge waiting">⏳ Đang chờ người chơi...</span>
                <span className="player-count"><Users size={14} /> {roomData?.players.length || 0} người chơi</span>
              </div>
            </div>

            <div className="admin-dashboard-two-col">
              <div className="admin-col-left">
                <div className="admin-players-section" style={{ minHeight: '340px' }}>
                  <h3><Trophy size={18} /> Danh sách ({roomData?.players.length || 0})</h3>
                  {roomData?.players && roomData.players.length > 0 ? (
                    <div className="admin-players-grid">
                      {roomData.players.map((p: any, i: number) => (
                        <div key={p.id} className="admin-player-row">
                          <span className="rank">{i + 1}</span>
                          <span className="name">{p.name}</span>
                          <span className="score">Sẵn sàng</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-players-empty-msg" style={{ padding: '60px 20px' }}>
                      Chưa có người chơi nào. Quét mã QR để vào phòng!
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-col-right">
                <div className="admin-qr-section" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>Quét mã để tham gia</h3>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <img src={qrUrl} alt="QR Code" width={240} height={240} style={{ display: 'block' }} />
                  </div>
                  <div style={{ marginTop: '20px', fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)' }}>
                    {joinLink}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GAMEPLAY MAP ── */}
        {roomData?.status === 'in_progress' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, position: 'relative' }}>
               <HostMap players={roomData.players} />
               
               {/* Overlay Timer */}
               <div style={{
                 position: 'absolute',
                 top: '20px',
                 left: '50%',
                 transform: 'translateX(-50%)',
                 background: 'rgba(15, 23, 42, 0.9)',
                 padding: '15px 30px',
                 borderRadius: '30px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '15px',
                 zIndex: 10,
                 boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
                 <Clock size={24} color={countdown <= 3 ? '#ef4444' : '#10b981'} />
                 <span style={{ fontSize: '32px', fontWeight: '900', color: countdown <= 3 ? '#ef4444' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                   {countdown}s
                 </span>
                 <span style={{ color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   {countdown > 0 ? 'Thời gian chọn ngã rẽ' : 'Chờ Host Next Step...'}
                 </span>
               </div>
            </div>
            
            {/* Sidebar Leaderboard */}
            <div style={{ width: '350px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                 <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18}/> Bảng Xếp Hạng</h3>
               </div>
               <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                 {sortedPlayers.map((p: any, i: number) => {
                   const node = ROUND_1_GRAPH.nodes[p.currentNodeId];
                   return (
                     <div key={p.id} style={{
                       display: 'flex',
                       alignItems: 'center',
                       padding: '12px',
                       background: 'var(--bg-layer-1)',
                       borderRadius: '8px',
                       marginBottom: '8px',
                       border: p.currentChoice ? '1px solid var(--primary)' : '1px solid transparent'
                     }}>
                       <div style={{ width: '30px', fontWeight: 'bold', color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>#{i+1}</div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {node?.name}</div>
                       </div>
                       <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>{p.score}</div>
                       {p.currentChoice && <CheckCircle2 size={16} color="var(--primary)" style={{marginLeft: '10px'}}/>}
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {/* ── FINISHED ── */}
        {roomData?.status === 'finished' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Award size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', marginBottom: '40px' }}>KẾT QUẢ CHUNG CUỘC</h1>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
               {/* Podium */}
               {sortedPlayers[1] && (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{sortedPlayers[1].name}</div>
                    <div style={{ background: '#c0c0c0', width: '120px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#000', borderRadius: '12px 12px 0 0' }}>2</div>
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{sortedPlayers[1].score} điểm</div>
                 </div>
               )}
               {sortedPlayers[0] && (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#fbbf24' }}>{sortedPlayers[0].name}</div>
                    <div style={{ background: '#fbbf24', width: '140px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '900', color: '#000', borderRadius: '12px 12px 0 0' }}>1</div>
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{sortedPlayers[0].score} điểm</div>
                 </div>
               )}
               {sortedPlayers[2] && (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{sortedPlayers[2].name}</div>
                    <div style={{ background: '#cd7f32', width: '120px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#000', borderRadius: '12px 12px 0 0' }}>3</div>
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{sortedPlayers[2].score} điểm</div>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
