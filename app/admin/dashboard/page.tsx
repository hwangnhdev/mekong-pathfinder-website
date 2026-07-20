'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Gamepad2, BarChart3, FileText, MessageSquare, Settings,
  Play, ArrowRight, RefreshCw, Users, Trophy, Monitor,
  LogOut, Plus, Sparkles, CheckCircle2, AlertTriangle,
  Clock, Award, Navigation
} from 'lucide-react';
import logo04 from '../../../assets/images/logo_header/logo-04.png';
import { ROUND_1_GRAPH } from '../../game/gameData';
import RouteJsonViewerTab from '../../../components/json/RouteJsonViewerTab';

const SIDEBAR_ITEMS = [
  { key: 'game', label: 'Game Center', icon: Gamepad2 },
  { key: 'viewer', label: 'Route Viewer', icon: Navigation },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'blog', label: 'Blog Manager', icon: FileText },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
  { key: 'system', label: 'System Logs', icon: Settings },
];

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('game');
  const [adminToken, setAdminToken] = useState('');

  // Game state
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [joinLink, setJoinLink] = useState('');
  const [hostLink, setHostLink] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [showResults, setShowResults] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [gameHistory, setGameHistory] = useState<Record<string, Record<string, number[]>>>({});

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_history' }),
      });
      const data = await res.json();
      if (data.success) {
        setGameHistory(data.history || {});
      }
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử điểm số tích lũy? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_history' }),
      });
      const data = await res.json();
      if (data.success) {
        setGameHistory({});
        if (roomData) {
          setRoomData({ ...roomData, overallScores: {} });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setPublicUrl(localStorage.getItem('mp-public-url') || '');
    }
    const token = localStorage.getItem('mp-admin-token');
    if (!token) {
      window.location.href = '/admin';
      return;
    }
    // Verify token
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) {
          localStorage.removeItem('mp-admin-token');
          window.location.href = '/admin';
        } else {
          setAdminToken(token);
        }
      })
      .catch(() => {
        window.location.href = '/admin';
      });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Poll room status
  useEffect(() => {
    if (!roomCode) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', roomCode }),
        });
        const data = await res.json();
        if (data.success) setRoomData(data.room);
      } catch { }
    };
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomCode]);

  useEffect(() => {
    if (activeTab === 'game') {
      fetchHistory();
    }
  }, [activeTab, roomData?.status]);

  const updateLinks = (code: string, currentPublicUrl: string) => {
    if (!code) return;
    let base = '';
    if (currentPublicUrl.trim()) {
      base = currentPublicUrl.trim().replace(/\/$/, '');
    } else {
      const origin = window.location.origin;
      base = origin;
    }
    setJoinLink(`${base}/game/join?room=${code}`);
    setHostLink(`${base}/game/host?room=${code}`);
  };

  const handlePublicUrlChange = (val: string) => {
    setPublicUrl(val);
    localStorage.setItem('mp-public-url', val);
    if (roomCode) {
      updateLinks(roomCode, val);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', adminToken }),
      });
      const data = await res.json();
      if (data.success) {
        setRoomCode(data.roomCode);
        updateLinks(data.roomCode, publicUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const gameAction = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, roomCode, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        if (action === 'start' || action === 'next_step') {
          startRoundTimer(data.room.isDevMode);
        }
        if (action === 'reset') {
          setShowResults(false);
          setCountdown(8);
        }
      }
    } catch { }
  };

  const startRoundTimer = (isDevMode: boolean = false) => {
    setShowResults(false);
    if (isDevMode) {
      setCountdown(9999);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setCountdown(8);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setShowResults(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('mp-admin-token');
    window.location.href = '/admin';
  };

  if (!mounted || !adminToken) return null;

  const sortedPlayers = roomData ? [...roomData.players].sort((a: any, b: any) => b.score - a.score) : [];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Image src={logo04} alt="Logo" height={28} style={{ width: 'auto' }} priority />
        </div>

        <nav className="admin-sidebar-nav">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* ── GAME CENTER TAB ── */}
        {activeTab === 'game' && (
          <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="admin-content-header">
              <div>
                <h1>Game Center</h1>
                <p>Tạo và quản lý phòng chơi trắc nghiệm tránh ngập lụt.</p>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {!roomCode ? (
                /* No active room — show create button */
                <div className="admin-empty-state">
                  <Gamepad2 size={56} strokeWidth={1.2} />
                  <h3>Chưa có phòng chơi nào</h3>
                  <p>Tạo một phòng mới để bắt đầu trận đấu trắc nghiệm tránh ngập cho khách tham quan.</p>
                  <button className="admin-btn primary" onClick={handleCreateRoom}>
                    <Plus size={16} /> Tạo Phòng chơi mới
                  </button>
                </div>
              ) : (
              /* Active room — show controls */
              <div className="admin-game-panel">
                {/* Room Info Bar */}
                <div className="admin-room-bar">
                  <div className="admin-room-code">
                    <span className="label">Mã phòng</span>
                    <span className="code">{roomCode}</span>
                  </div>
                  <div className="admin-room-status">
                    <span className={`status-badge ${roomData?.status || 'waiting'}`}>
                      {roomData?.status === 'waiting' && '⏳ Đang chờ'}
                      {roomData?.status === 'intro' && '🎬 Giới thiệu'}
                      {roomData?.status === 'in_progress' && '🟢 Đang chơi'}
                      {roomData?.status === 'loading' && '⚙️ Phân tích'}
                      {roomData?.status === 'finished' && '🏁 Kết thúc'}
                    </span>
                    <span className="player-count">
                      <Users size={14} /> {roomData?.players.length || 0} người chơi
                    </span>
                  </div>
                </div>

                {/* Two-column dashboard grid */}
                <div className="admin-dashboard-two-col">
                  {/* Left Column (Main/Middle): Standings & Realtime Player list */}
                  <div className="admin-col-left">
                    <div className="admin-players-section">
                      <h3><Trophy size={18} /> Danh sách người chơi ({roomData?.players.length || 0})</h3>
                      {sortedPlayers.length > 0 ? (
                        <div className="admin-players-grid">
                          {sortedPlayers.map((p: any, i: number) => (
                            <div key={p.id} className="admin-player-row">
                              <span className="rank">{i + 1}</span>
                              <span className="name">{p.name}</span>
                              <span className="choice">{p.currentChoice ? 'Đã chọn' : '—'}</span>
                              <span className="score">{p.score} đ</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="admin-players-empty-msg">
                          Chưa có người chơi nào gia nhập. Hãy quét mã QR bên cạnh để vào phòng!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Controls & QR Info */}
                  <div className="admin-col-right">
                    {/* Game Controls */}
                    <div className="admin-controls-section">
                      <h3><Gamepad2 size={18} /> Điều khiển trận đấu</h3>

                      <div className="admin-controls-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', marginBottom: '16px', display: 'flex' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Cấu hình Ngrok / Public URL (nếu có)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: https://xxxx.ngrok-free.app"
                          value={publicUrl}
                          onChange={(e) => handlePublicUrlChange(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            background: 'var(--bg-layer-1)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            // color: '#fff',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      {roomData?.status === 'waiting' && (
                        <div className="admin-controls-row" style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="admin-btn primary large"
                            onClick={() => gameAction('start')}
                            disabled={!roomData?.players.length}
                            style={{ flex: 1 }}
                          >
                            <Play size={18} /> Bắt đầu Trận đấu
                          </button>
                          <button
                            className="admin-btn secondary large"
                            onClick={() => gameAction('start', { isDevMode: true })}
                            disabled={!roomData?.players.length}
                            style={{ flex: 1, background: '#f59e0b', color: '#fff', border: 'none' }}
                          >
                            <Play size={18} /> Vào trận (Dev Mode)
                          </button>
                        </div>
                      )}

                      {roomData?.status === 'intro' && (
                        <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontWeight: 'bold' }}>🎬 Đang chiếu giới thiệu bối cảnh</h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Người chơi đang theo dõi bối cảnh và hướng dẫn trên màn hình chiếu.</p>
                          <button
                            className="admin-btn primary large"
                            onClick={() => gameAction('start_gameplay')}
                            style={{ width: '100%' }}
                          >
                            Bắt đầu chơi ngay ➔
                          </button>
                        </div>
                      )}

                      {roomData?.status === 'loading' && (
                        <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#34d399', fontWeight: 'bold' }}>⚙️ Đang phân tích kết quả bằng AI</h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Màn hình đang hiển thị fake loading phân tích kết quả.</p>
                          <button
                            className="admin-btn success large"
                            onClick={() => gameAction('end')}
                            style={{ width: '100%' }}
                          >
                            Xem kết quả ngay 🏁
                          </button>
                        </div>
                      )}

                      {roomData?.status === 'in_progress' && (
                        <>
                          <div className="admin-round-info">
                            <div className="admin-round-label">
                              <span>Bước {roomData.currentStep} / {ROUND_1_GRAPH.totalSteps}</span>
                            </div>
                            {roomData.isDevMode ? (
                              <div className="admin-timer" style={{ background: '#f59e0b', color: '#fff', borderColor: '#f59e0b' }}>
                                <Sparkles size={14} />
                                <span>Dev Mode</span>
                              </div>
                            ) : (
                              <div className="admin-timer">
                                <Clock size={16} />
                                <span className={countdown <= 3 ? 'danger' : ''}>{countdown}s</span>
                              </div>
                            )}
                            <div className="admin-answers-count">
                              <CheckCircle2 size={14} />
                              {roomData.players.filter((p: any) => p.currentChoice !== null).length} / {roomData.players.length} đã trả lời
                            </div>
                          </div>

                          {(roomData.isDevMode || showResults) && (
                            <div className="admin-controls-row" style={{ display: 'flex', gap: '10px' }}>
                              {roomData.isDevMode && roomData.currentStep > 1 && (
                                <button 
                                  className="admin-btn secondary large" 
                                  onClick={() => gameAction('prev_step')}
                                  style={{ flex: 1, background: '#475569', color: '#fff', border: 'none' }}
                                >
                                  Quay lại (Bước {roomData.currentStep - 1})
                                </button>
                              )}
                              {roomData.currentStep < ROUND_1_GRAPH.totalSteps ? (
                                <button className="admin-btn primary large" onClick={() => gameAction('next_step')} style={{ flex: 1 }}>
                                  <ArrowRight size={18} /> Đi tiếp (Bước {roomData.currentStep + 1})
                                </button>
                              ) : (
                                <button className="admin-btn success large" onClick={() => gameAction('next_step')} style={{ flex: 1 }}>
                                  <Award size={18} /> Xem Kết quả
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {roomData?.status === 'finished' && (
                        <div className="admin-finished-panel">
                          <Award size={40} />
                          <h4>Trận đấu đã kết thúc!</h4>
                          {sortedPlayers.length > 0 && (
                            <div className="admin-podium">
                              {sortedPlayers.slice(0, 3).map((p: any, i: number) => (
                                <div key={p.id} className="admin-podium-item">
                                  <span className="medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                  <strong>{p.name}</strong>
                                  <span className="score">{p.score} đ</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {roomData.isDevMode && (
                            <button 
                              className="admin-btn secondary large" 
                              onClick={() => gameAction('prev_step')}
                              style={{ width: '100%', marginTop: '15px', background: '#475569', color: '#fff', border: 'none' }}
                            >
                              Quay lại (Bước {roomData.currentStep})
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reset button always available */}
                      <div className="admin-controls-row" style={{ marginTop: '16px' }}>
                        <a
                          href={`${hostLink}${publicUrl ? `&publicUrl=${encodeURIComponent(publicUrl)}` : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn secondary"
                        >
                          <Monitor size={16} /> Mở Projector
                        </a>
                        <button className="admin-btn ghost" onClick={() => {
                          if (confirm('Đặt lại phòng chơi? Tất cả dữ liệu trận đấu sẽ bị xóa.')) {
                            gameAction('reset');
                          }
                        }}>
                          <RefreshCw size={14} /> Đặt lại
                        </button>
                        <button className="admin-btn ghost" onClick={() => {
                          if (confirm('Xóa phòng hiện tại và tạo phòng mới?')) {
                            setRoomCode('');
                            setRoomData(null);
                            setShowResults(false);
                          }
                        }}>
                          <Plus size={14} /> Phòng mới
                        </button>
                      </div>
                    </div>

                    {/* Player QR Card */}
                    <div className="admin-qr-card" style={{ marginTop: '16px' }}>
                      <h4>QR Người chơi quét tham gia</h4>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinLink)}`}
                        alt="Player QR"
                        className="admin-qr-img"
                        style={{ margin: '12px auto', display: 'block' }}
                      />
                      <code className="admin-link-code">{joinLink}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* 📜 HISTORICAL LEADERBOARD SECTION */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '24px',
              boxShadow: 'var(--shadow)',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                  📜 Lịch sử điểm số tích lũy các phòng chơi
                </h3>
                {Object.keys(gameHistory).length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Xóa tất cả lịch sử
                  </button>
                )}
              </div>

              {Object.keys(gameHistory).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '30px 10px' }}>
                  Chưa có lịch sử chơi game nào được ghi nhận.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {Object.entries(gameHistory).map(([code, scores]) => {
                    const sortedScores = Object.entries(scores).map(([name, scArray]) => {
                      const arr = Array.isArray(scArray) ? scArray : [scArray];
                      const total = arr.reduce((acc, val) => acc + (Number(val) || 0), 0);
                      return { name, total, history: arr };
                    }).sort((a, b) => b.total - a.total);

                    return (
                      <div key={code} style={{
                        background: 'var(--bg-layer-1)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>Phòng: {code}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            {sortedScores.length} người chơi
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                          {sortedScores.map((p, idx) => (
                            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '600', color: idx < 3 ? 'var(--primary)' : 'var(--text)' }}>#{idx + 1} {p.name}</span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                  {p.history.map((h, i) => `L${i + 1}: ${h}đ`).join(', ')}
                                </span>
                              </div>
                              <span style={{ fontWeight: 'bold' }}>{p.total} đ</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ROUTE JSON VIEWER TAB ── */}
        {activeTab === 'viewer' && (
          <RouteJsonViewerTab />
        )}

        {/* ── ANALYTICS PLACEHOLDER ── */}
        {activeTab === 'analytics' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <div>
                <h1>Analytics</h1>
                <p>Thống kê lượt truy cập và sử dụng ứng dụng.</p>
              </div>
            </div>
            <div className="admin-placeholder-panel">
              <BarChart3 size={56} strokeWidth={1.2} />
              <h3>Đang phát triển</h3>
              <p>Tính năng phân tích và theo dõi lượt truy cập sẽ sớm được triển khai trong các phiên bản tới.</p>
            </div>
          </div>
        )}

        {/* ── BLOG MANAGER PLACEHOLDER ── */}
        {activeTab === 'blog' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <div>
                <h1>Blog Manager</h1>
                <p>Quản lý và đăng bài viết cho trang landing page.</p>
              </div>
            </div>
            <div className="admin-placeholder-panel">
              <FileText size={56} strokeWidth={1.2} />
              <h3>Đang phát triển</h3>
              <p>Giao diện quản trị bài viết (CRUD) sẽ được phát triển trong các phiên bản tới.</p>
            </div>
          </div>
        )}

        {/* ── FEEDBACK PLACEHOLDER ── */}
        {activeTab === 'feedback' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <div>
                <h1>Feedback</h1>
                <p>Xem phản hồi từ người dùng và cộng đồng.</p>
              </div>
            </div>
            <div className="admin-placeholder-panel">
              <MessageSquare size={56} strokeWidth={1.2} />
              <h3>Đang phát triển</h3>
              <p>Hệ thống thu thập và hiển thị feedback sẽ được triển khai trong các phiên bản tới.</p>
            </div>
          </div>
        )}

        {/* ── SYSTEM LOGS PLACEHOLDER ── */}
        {activeTab === 'system' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <div>
                <h1>System Logs</h1>
                <p>Theo dõi nhật ký hệ thống và sức khỏe server.</p>
              </div>
            </div>
            <div className="admin-placeholder-panel">
              <Settings size={56} strokeWidth={1.2} />
              <h3>Đang phát triển</h3>
              <p>Giao diện theo dõi log server sẽ được triển khai trong các phiên bản tới.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
