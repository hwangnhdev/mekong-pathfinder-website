'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Trophy, Users, CheckCircle2, AlertTriangle,
  Clock, Award, Sparkles, Loader2
} from 'lucide-react';
import logo04 from '../../../assets/images/logo_header/logo-04.png';
import logo15 from '../../../assets/images/logo_header/logo-14.png';
import { ROUND_1_GRAPH } from '../gameData';

const HostMap = dynamic(() => import('./HostMap'), { ssr: false });

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
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionCountdown, setTransitionCountdown] = useState(5);
  const isTransitioningRef = useRef(false);
  const serverTimeOffsetRef = useRef<number>(0);

  const [introCountdown, setIntroCountdown] = useState(15);
  const [loadingCountdown, setLoadingCountdown] = useState(5);
  const [leaderboardTab, setLeaderboardTab] = useState<'round' | 'overall'>('round');

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
          if (data.serverTime) {
            serverTimeOffsetRef.current = data.serverTime - Date.now();
          }
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

  useEffect(() => {
    if (!roomData) return;

    if (roomData.status === 'intro' && roomData.stepStartedAt) {
      const serverNow = Date.now() + serverTimeOffsetRef.current;
      const elapsed = Math.floor((serverNow - roomData.stepStartedAt) / 1000);
      const remaining = Math.max(15 - elapsed, 0);
      setIntroCountdown(remaining);

      const interval = setInterval(() => {
        const now = Date.now() + serverTimeOffsetRef.current;
        const el = Math.floor((now - roomData.stepStartedAt!) / 1000);
        const rem = Math.max(15 - el, 0);
        setIntroCountdown(rem);
        if (rem <= 0) {
          clearInterval(interval);
          controlGame('start_gameplay');
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    if (roomData.status === 'loading' && roomData.stepStartedAt) {
      const serverNow = Date.now() + serverTimeOffsetRef.current;
      const elapsed = Math.floor((serverNow - roomData.stepStartedAt) / 1000);
      const remaining = Math.max(5 - elapsed, 0);
      setLoadingCountdown(remaining);

      const interval = setInterval(() => {
        const now = Date.now() + serverTimeOffsetRef.current;
        const el = Math.floor((now - roomData.stepStartedAt!) / 1000);
        const rem = Math.max(5 - el, 0);
        setLoadingCountdown(rem);
        if (rem <= 0) {
          clearInterval(interval);
          controlGame('end');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData?.status, roomData?.stepStartedAt]);

  const controlGame = async (action: string) => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action, roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        if (action === 'next_step' || action === 'prev_step') {
          isTransitioningRef.current = false;
          setIsTransitioning(false);
        }
      }
    } catch (err) {
      console.error("Error controlling game:", err);
    }
  };

  const advanceToNextStep = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ action: 'next_step', roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }
    } catch (err) {
      console.error("Error advancing step:", err);
      isTransitioningRef.current = false;
      setIsTransitioning(false);
    }
  };

  const triggerTransitionPhase = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTransitionCountdown(5);

    let currentTransition = 5;
    const tInterval = setInterval(() => {
      currentTransition -= 1;
      setTransitionCountdown(currentTransition);
      if (currentTransition <= 0) {
        clearInterval(tInterval);
        advanceToNextStep();
      }
    }, 1000);
  };

  const startTimerFromServer = (stepStartedAt?: number) => {
    if (isTransitioningRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (roomData?.isDevMode) {
      setCountdown(9999);
      return;
    }

    const serverNow = Date.now() + serverTimeOffsetRef.current;
    const elapsed = stepStartedAt ? Math.floor((serverNow - stepStartedAt) / 1000) : 0;
    const remaining = Math.max(15 - elapsed, 0);
    setCountdown(remaining);

    if (remaining <= 0) {
      triggerTransitionPhase();
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          triggerTransitionPhase();
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
        width: '120%',
        height: '120%',
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
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {roomData.status === 'intro' && '🎬 Giới thiệu'}
                {roomData.status === 'loading' && '⚙️ Phân tích kết quả'}
                {roomData.status === 'finished' && '🏆 Kết quả'}
                {roomData.status === 'in_progress' && `Bước ${roomData.currentStep} / ${ROUND_1_GRAPH.totalSteps}`}
              </span>
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
              gridTemplateColumns: '1fr 1.9fr',
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
                  Flood<br /> Escape Race
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
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text)', fontWeight: 'bold' }}>Quét mã để tham gia</h3>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)' }}>
                      {joinLink}
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <img src={qrUrl} alt="QR Code" width={240} height={240} style={{ display: 'block' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INTRO / STORY SCENE ── */}
        {roomData?.status === 'intro' && (
          <div className="admin-game-panel" style={{ width: '100%', maxWidth: '1000px', margin: 'auto', textAlign: 'left', padding: '30px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.25em', display: 'block', marginBottom: '8px' }}>
                Mekong Pathfinder
              </span>
              <h1 style={{ fontSize: '34px', fontWeight: '950', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                BỐI CẢNH CUỘC ĐUA TRÁNH NGẬP LỤT
              </h1>
              <div style={{ height: '4px', width: '80px', background: 'var(--primary)', margin: '15px auto', borderRadius: '2px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '20px', lineHeight: '1.6' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    🌊 Tình huống khẩn cấp
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', margin: 0 }}>
                    Cần Thơ đang hứng chịu đợt triều cường kết hợp mưa lớn cực đoan. Nước dâng nhanh gây ngập lụt cục bộ trên diện rộng, đe dọa các tuyến đường di chuyển từ <strong>Đại học FPT Cần Thơ</strong> về <strong>Bến Ninh Kiều</strong>.
                  </p>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '20px', lineHeight: '1.6' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    💡 Gợi ý di chuyển từ AI trợ lý
                  </h3>
                  <ul style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Ưu tiên tuyến đường cao ráo:</strong> Xem kỹ rủi ro (An toàn, Ngập vừa, Ngập sâu) trước khi đưa ra quyết định.</li>
                    <li><strong>Điểm phạt ngập lụt:</strong> Chọn nhầm đường ngập nặng sẽ bị trừ điểm rất lớn (-30đ) và làm chậm thời gian di chuyển.</li>
                    <li><strong>Tốc độ là chìa khóa:</strong> Lựa chọn nhanh trong 2 giây đầu sẽ nhận thêm điểm thưởng tốc độ rất lớn!</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--text)', fontSize: '16px', fontWeight: 'bold' }}>
                    🎮 Hướng dẫn điều khiển
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.5', margin: 0 }}>
                    Tại mỗi giao lộ, bạn chỉ có <strong>15 giây</strong> để chọn ngã rẽ A, B hoặc C trên màn hình điện thoại của mình. Hãy chú ý lắng nghe và nhìn lên màn hình chiếu này để xem các tuyến đường xung quanh!
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Trận đấu sẽ bắt đầu sau
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--primary)', animation: 'pulse 1s infinite', fontFamily: 'monospace' }}>
                    {introCountdown}s
                  </div>
                  <button
                    onClick={() => controlGame('start_gameplay')}
                    style={{
                      marginTop: '15px',
                      padding: '10px 24px',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s'
                    }}
                  >
                    Bắt đầu chơi ngay ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FAKE LOADING SCENE ── */}
        {roomData?.status === 'loading' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px' }}>
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px'
            }}>
              <Loader2 className="animate-spin text-primary" size={50} style={{ color: 'var(--primary)' }} />
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '10px' }}>
              ĐANG PHÂN TÍCH KẾT QUẢ BẰNG AI
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '500px', textAlign: 'center', lineHeight: '1.6', marginBottom: '30px' }}>
              Trình phân tích Mekong Pathfinder AI đang mô phỏng đường đi, tính toán chỉ số phơi nhiễm ngập lụt và tổng hợp bảng xếp hạng chung cuộc...
            </p>

            <div style={{ width: '300px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '15px' }}>
              <div style={{
                height: '100%',
                width: `${((5 - loadingCountdown) / 5) * 100}%`,
                background: 'var(--primary)',
                transition: 'width 1s linear'
              }} />
            </div>

            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Xem kết quả sau {loadingCountdown} giây...
            </span>

            <button
              onClick={() => controlGame('end')}
              style={{
                marginTop: '25px',
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600'
              }}
            >
              Bỏ qua & Xem kết quả ➔
            </button>
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
                background: roomData.isDevMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                padding: roomData.isDevMode ? '8px 16px' : '15px 30px',
                borderRadius: roomData.isDevMode ? '20px' : '30px',
                display: 'flex',
                alignItems: 'center',
                gap: roomData.isDevMode ? '8px' : '15px',
                zIndex: 10,
                boxShadow: roomData.isDevMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
                border: roomData.isDevMode ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: roomData.isDevMode ? 'blur(8px)' : 'none'
              }}>
                {roomData.isDevMode ? (
                  <>
                    <Sparkles size={14} color="#f59e0b" style={{ animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Dev Mode
                    </span>
                    <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ color: '#e2e8f0', fontSize: '11.5px', fontWeight: '500' }}>
                      Không giới hạn thời gian chọn đường
                    </span>
                  </>
                ) : (
                  <>
                    <Clock size={24} color={isTransitioning ? '#3b82f6' : (countdown <= 3 ? '#ef4444' : '#10b981')} />
                    <span style={{ fontSize: '32px', fontWeight: '900', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                      {isTransitioning ? `${transitionCountdown}s` : `${countdown}s`}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {isTransitioning ? 'Đang tổng hợp & xe đang di chuyển...' : 'Thời gian chọn ngã rẽ'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Leaderboard */}
            <div style={{ width: '350px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} /> Bảng Xếp Hạng</h3>
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
                      <div style={{ width: '30px', fontWeight: 'bold', color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>#{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {node?.name}</div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>{p.score}</div>
                      {p.currentChoice && <CheckCircle2 size={16} color="var(--primary)" style={{ marginLeft: '10px' }} />}
                    </div>
                  );
                })}
              </div>
              
              {/* Host Controls on Projector (For dev / manual override) */}
              <div style={{ padding: '15px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--bg-layer-1)' }}>
                {roomData.currentStep > 1 && (
                  <button
                    onClick={() => controlGame('prev_step')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#475569',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    Quay lại
                  </button>
                )}
                <button
                  onClick={() => controlGame('next_step')}
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: roomData.currentStep < ROUND_1_GRAPH.totalSteps ? '#3b82f6' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  {roomData.currentStep < ROUND_1_GRAPH.totalSteps ? 'Đi tiếp ➔' : 'Xem kết quả 🏁'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FINISHED ── */}
        {roomData?.status === 'finished' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 40px', overflowY: 'auto', width: '100%' }}>
            <Award size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
            <h1 style={{ fontSize: '38px', fontWeight: '950', marginBottom: '25px', textTransform: 'uppercase' }}>
              BẢNG XẾP HẠNG CUỘC ĐUA
            </h1>

            {/* TAB SELECTOR */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '30px',
              width: '100%',
              maxWidth: '500px'
            }}>
              <button
                onClick={() => setLeaderboardTab('round')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: leaderboardTab === 'round' ? 'var(--primary)' : 'transparent',
                  color: leaderboardTab === 'round' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14.5px',
                  transition: 'all 0.2s'
                }}
              >
                Vòng Đấu Này
              </button>
              <button
                onClick={() => setLeaderboardTab('overall')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: leaderboardTab === 'overall' ? 'var(--primary)' : 'transparent',
                  color: leaderboardTab === 'overall' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '14.5px',
                  transition: 'all 0.2s'
                }}
              >
                Chung Cuộc (Tích Lũy)
              </button>
            </div>

            {/* LEADERBOARD DATA RENDERING */}
            {(() => {
              const activeList = leaderboardTab === 'round' 
                ? sortedPlayers.map(p => ({ name: p.name, score: p.score, historyText: '' }))
                : Object.entries(roomData.overallScores || {}).map(([name, scores]) => {
                    const scoresArray = Array.isArray(scores) ? scores : [scores];
                    const sum = scoresArray.reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
                    return {
                      name,
                      score: sum,
                      historyText: scoresArray.map((s, idx) => `Lượt ${idx + 1}: ${s}đ`).join(', ')
                    };
                  }).sort((a, b) => b.score - a.score);

              return (
                <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* Podium */}
                  {activeList.length > 0 && (
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end', justifyContent: 'center', padding: '20px 0' }}>
                      {/* 2nd Place */}
                      {activeList[1] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{activeList[1].name}</div>
                          <div style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', width: '110px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#fff', borderRadius: '12px 12px 0 0', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>2</div>
                          <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '14.5px', color: '#cbd5e1' }}>{activeList[1].score} điểm</div>
                          {activeList[1].historyText && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activeList[1].historyText}>{activeList[1].historyText}</div>
                          )}
                        </div>
                      )}
                      {/* 1st Place */}
                      {activeList[0] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '22px', fontWeight: '900', marginBottom: '8px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👑 {activeList[0].name}
                          </div>
                          <div style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', width: '130px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '900', color: '#000', borderRadius: '12px 12px 0 0', boxShadow: '0 10px 32px rgba(251,191,36,0.3)' }}>1</div>
                          <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '16.5px', color: '#fbbf24' }}>{activeList[0].score} điểm</div>
                          {activeList[0].historyText && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activeList[0].historyText}>{activeList[0].historyText}</div>
                          )}
                        </div>
                      )}
                      {/* 3rd Place */}
                      {activeList[2] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{activeList[2].name}</div>
                          <div style={{ background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)', width: '110px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#fff', borderRadius: '12px 12px 0 0', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>3</div>
                          <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '14.5px', color: '#a16207' }}>{activeList[2].score} điểm</div>
                          {activeList[2].historyText && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activeList[2].historyText}>{activeList[2].historyText}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rest of the list */}
                  {activeList.length > 3 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeList.slice(3).map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.03)'
                        }}>
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '24px' }}>#{idx + 4}</span>
                            <div>
                              <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                              {item.historyText && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {item.historyText}
                                </div>
                              )}
                            </div>
                          </div>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.score} đ</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => controlGame('prev_step')}
              style={{
                marginTop: '40px',
                padding: '12px 24px',
                background: '#475569',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              ⬅ Quay lại bước 3
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
