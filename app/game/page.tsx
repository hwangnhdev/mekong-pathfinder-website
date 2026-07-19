'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Trophy, QrCode, Users, Play, ArrowRight, RefreshCw, 
  User, Smartphone, Monitor, AlertTriangle, CheckCircle2, 
  Clock, ArrowLeft, Award, Sparkles, Navigation, ShieldAlert,
  Sun, Moon
} from 'lucide-react';

import logo04 from '../../assets/images/logo_header/logo-04.png';

/* ── GAME DATA CONFIG ── */
const ROUNDS_DATA: Record<number, any> = {
  1: {
    round: 1,
    startingPoint: 'Đại học Cần Thơ (Khu II)',
    destination: 'Bến Ninh Kiều',
    duration: 45,
    routes: [
      { letter: 'A', name: 'Đường Mậu Thân', risk: 'high', traffic: 'heavy', time: '22 phút', desc: 'Tuyến ngắn nhất nhưng ngập nặng (0.8m - 1.2m), xe máy chết máy hàng loạt.', aiRecommended: false },
      { letter: 'B', name: 'Đường 30 Tháng 4', risk: 'none', traffic: 'moderate', time: '11 phút', desc: 'Tuyến đường nâng cấp cao ráo, hoàn toàn khô ráo và an toàn.', aiRecommended: true },
      { letter: 'C', name: 'Đường Trần Hưng Đạo', risk: 'medium', traffic: 'heavy', time: '16 phút', desc: 'Kẹt xe kéo dài do các phương tiện dồn toa tránh ngập.', aiRecommended: false },
      { letter: 'D', name: 'Đại lộ Hòa Bình', risk: 'none', traffic: 'heavy', time: '19 phút', desc: 'Đường không ngập nhưng kẹt cứng ngắt tại vòng xoay.', aiRecommended: false }
    ],
    aiExplanation: 'Đường 30 Tháng 4 là tuyến duy nhất được nâng cao cốt nền giao thông, giúp bạn di chuyển an toàn, khô ráo và tiết kiệm thời gian nhất.'
  },
  2: {
    round: 2,
    startingPoint: 'Chợ Cái Răng',
    destination: 'Sân bay Cần Thơ',
    duration: 45,
    routes: [
      { letter: 'A', name: 'Đường Nguyễn Văn Cừ', risk: 'high', traffic: 'heavy', time: '35 phút', desc: 'Ngập sâu (0.6m - 0.9m) tại đoạn trũng gần hồ Bún Xáng, giao thông tê liệt.', aiRecommended: false },
      { letter: 'B', name: 'Tuyến tránh Quốc lộ 91B', risk: 'none', traffic: 'light', time: '16 phút', desc: 'Tuyến đi vòng nhưng cao ráo, thông thoáng, tối ưu nhất.', aiRecommended: true },
      { letter: 'C', name: 'Đường Cách Mạng Tháng 8', risk: 'medium', traffic: 'moderate', time: '26 phút', desc: 'Ngập cục bộ (0.4m - 0.6m) gây hư hại động cơ xe máy.', aiRecommended: false },
      { letter: 'D', name: 'Đường Lê Hồng Phong', risk: 'medium', traffic: 'heavy', time: '29 phút', desc: 'Ngập nhẹ, nhiều xe tải lớn di chuyển tạo sóng nước nguy hiểm.', aiRecommended: false }
    ],
    aiExplanation: 'Tuyến tránh QL 91B tuy có quãng đường dài hơn nhưng cốt đường cao và lưu lượng xe thông thoáng, giúp tránh hoàn toàn vùng rập lụt nguy hiểm.'
  }
};

const BOT_NAMES = ['AI_Thanh', 'AI_Tuan', 'AI_Mai', 'Minh_CanTho', 'Vy_NinhKieu', 'Binh_CaiRang', 'Huu_PhongDien', 'Lan_BinhThuy', 'Nam_OMon'];

export default function GamePage() {
  const [mode, setMode] = useState<'selection' | 'solo' | 'host' | 'player'>('selection');
  const [playerId, setPlayerId] = useState('');
  const [dark, setDark] = useState(false);

  // Read theme and generate player ID on client load
  useEffect(() => {
    setPlayerId('player_' + Math.random().toString(36).substring(2, 9));
    
    const saved = localStorage.getItem('mp-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Auto-detect room parameter to enter player controller mode directly
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) {
        setMode('player');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('mp-theme', next ? 'dark' : 'light');
  };

  return (
    <div className="game-page-container">
      
      {/* Fixed Header bar sync with landing page */}
      <header className="game-fixed-header">
        <div className="game-header-inner">
          <a href="/" className="logo">
            <Image
              src={logo04}
              alt="Mekong Pathfinder Logo"
              height={32}
              style={{ width: 'auto', display: 'block' }}
              priority
            />
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={dark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
              title={dark ? 'Sáng' : 'Tối'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {mode !== 'selection' && (
              <button 
                onClick={() => {
                  if (confirm('Bạn có muốn thoát và quay lại màn hình chọn chế độ?')) {
                    setMode('selection');
                  }
                }} 
                className="btn-nav"
                style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border-strong)' }}
              >
                <ArrowLeft size={13} style={{ marginRight: '4px', display: 'inline' }} /> Chọn chế độ
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* 1. SELECTION SCREEN */}
        {mode === 'selection' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trò chơi điều hướng ngập lụt</span>
            <h2 className="game-headline">
              Bạn có thể về đích trước <span>AI không?</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 16px', fontSize: '15px', lineHeight: '1.6' }}>
              Hãy chọn cho mình tuyến đường di chuyển tối ưu nhất thông qua các khu vực ngập úng thực tế của Cần Thơ để ghi điểm tối đa và vượt mặt đối thủ.
            </p>

            <div className="game-mode-grid">
              
              {/* Solo training mode card */}
              <div className="game-card">
                <div>
                  <div className="game-card-icon blue">
                    <User size={24} />
                  </div>
                  <h3>Chơi Đơn (Solo vs AI Bots)</h3>
                  <p>
                    Trải nghiệm trực tiếp ngay trên thiết bị này. Đua tài chọn đường tránh ngập lụt với 9 đối thủ máy (AI) thông minh trong 2 vòng.
                  </p>
                </div>
                <button onClick={() => setMode('solo')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Bắt đầu đua ngay <ArrowRight size={16} />
                </button>
              </div>

              {/* Host display card */}
              <div className="game-card">
                <div>
                  <div className="game-card-icon green">
                    <Monitor size={24} />
                  </div>
                  <h3>Màn hình chính (Projector View)</h3>
                  <p>
                    Dành cho màn hình trình chiếu lớn tại quầy triển lãm. Quản lý phòng đấu, đếm ngược thời gian và bảng xếp hạng người chơi quét mã QR.
                  </p>
                </div>
                <button onClick={() => setMode('host')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--green)' }}>
                  Mở Màn hình chính <ArrowRight size={16} />
                </button>
              </div>

              {/* Player controller card */}
              <div className="game-card">
                <div>
                  <div className="game-card-icon yellow">
                    <Smartphone size={24} />
                  </div>
                  <h3>Tay Cầm Điều Khiển (Mobile Client)</h3>
                  <p>
                    Sử dụng điện thoại di động quét mã QR hiển thị từ Màn hình chính để tham gia phòng đấu nhanh và trả lời câu hỏi tránh ngập.
                  </p>
                </div>
                <button onClick={() => setMode('player')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--yellow)' }}>
                  Tham gia Phòng chơi <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 2. SOLO MODE COMPONENT */}
        {mode === 'solo' && <SoloGameComponent />}

        {/* 3. HOST MULTIPLAYER MODE COMPONENT */}
        {mode === 'host' && <HostGameComponent />}

        {/* 4. PLAYER MULTIPLAYER MODE COMPONENT */}
        {mode === 'player' && <PlayerGameComponent playerId={playerId} />}

      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* 🎮 2.1 SOLO GAME MODE IMPLEMENTATION                     */
/* ──────────────────────────────────────────────────────── */
function SoloGameComponent() {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'playing' | 'revealing' | 'over'>('lobby');
  const [playerName, setPlayerName] = useState('');
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [timer, setTimer] = useState(45);
  const [selectionTime, setSelectionTime] = useState(8);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundStats, setRoundStats] = useState<Record<string, string | null>>({});
  const [timeSelected, setTimeSelected] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Leaderboard Scores
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    BOT_NAMES.forEach(bot => {
      initialScores[bot] = 0;
    });
    initialScores['Bạn'] = 0;
    setScores(initialScores);
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleRevealRound();
            return 0;
          }
          return t - 1;
        });

        setSelectionTime(st => {
          if (st <= 1) return 0;
          return st - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setGameState('playing');
    setTimer(45);
    setSelectionTime(8);
    setPlayerChoice(null);
  };

  const handleSelectRoute = (letter: string) => {
    if (selectionTime <= 0 || playerChoice !== null) return;
    setPlayerChoice(letter);
    setTimeSelected(8 - selectionTime);
  };

  const handleRevealRound = () => {
    setGameState('revealing');
    
    // Calculate bot scores for the round
    const newRoundStats: Record<string, string | null> = {};
    const updatedScores = { ...scores };

    // Player score
    if (playerChoice === 'B') {
      let speedBonus = 0;
      if (timeSelected <= 2) speedBonus = 30;
      else if (timeSelected <= 5) speedBonus = 20;
      else if (timeSelected <= 8) speedBonus = 10;
      updatedScores['Bạn'] += 100 + speedBonus;
      newRoundStats['Bạn'] = 'B';
    } else {
      newRoundStats['Bạn'] = playerChoice;
    }

    // Bot selections
    BOT_NAMES.forEach(bot => {
      const isAIBot = bot.startsWith('AI_');
      let botChoice = 'B';
      if (!isAIBot) {
        const options = ['A', 'B', 'C', 'D'];
        botChoice = options[Math.floor(Math.random() * options.length)];
      } else {
        botChoice = Math.random() < 0.9 ? 'B' : ['A', 'C', 'D'][Math.floor(Math.random() * 3)];
      }

      newRoundStats[bot] = botChoice;

      if (botChoice === 'B') {
        const simulatedTime = Math.floor(Math.random() * 8) + 1;
        let speedBonus = 0;
        if (simulatedTime <= 2) speedBonus = 30;
        else if (simulatedTime <= 5) speedBonus = 20;
        else if (simulatedTime <= 8) speedBonus = 10;
        updatedScores[bot] += 100 + speedBonus;
      }
    });

    setScores(updatedScores);
    setRoundStats(newRoundStats);
  };

  const handleNextRound = () => {
    if (currentRound === 1) {
      setCurrentRound(2);
      setGameState('playing');
      setTimer(45);
      setSelectionTime(8);
      setPlayerChoice(null);
      setTimeSelected(0);
    } else {
      setGameState('over');
    }
  };

  const handleResetSolo = () => {
    setCurrentRound(1);
    setGameState('lobby');
    setPlayerChoice(null);
    setTimer(45);
    setSelectionTime(8);
    const resetScores = { ...scores };
    Object.keys(resetScores).forEach(k => {
      resetScores[k] = 0;
    });
    setScores(resetScores);
  };

  const sortedLeaderboard = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const activeRoundData = ROUNDS_DATA[currentRound];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
      
      {/* 2.1.1 LOBBY SCREEN */}
      {gameState === 'lobby' && (
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
          <Trophy size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text)' }}>Tham gia đua Chơi Đơn</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>Nhập tên của bạn để bắt đầu cạnh tranh trực tiếp với các AI Bots tránh ngập.</p>
          
          <form onSubmit={handleStartGame}>
            <input 
              type="text" 
              placeholder="Tên người chơi của bạn..." 
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="game-input"
              style={{ marginBottom: '16px' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Đua với Bots <Play size={14} />
            </button>
          </form>
        </div>
      )}

      {/* 2.1.2 PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
          
          {/* Main game board */}
          <div>
            <div className="game-status-bar">
              <div>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>Vòng đua {currentRound}/2</span>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: '4px 0 0' }}>Từ: {activeRoundData.startingPoint} ➔ Đến: {activeRoundData.destination}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Thời gian còn lại</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: timer <= 10 ? 'var(--red)' : 'var(--text)' }}>{timer}s</span>
              </div>
            </div>

            {/* Selection instructions overlay */}
            <div style={{ marginBottom: '24px', background: selectionTime > 0 ? 'var(--primary-dim)' : 'var(--bg2)', border: `1px solid ${selectionTime > 0 ? 'var(--primary-glow)' : 'var(--border)'}`, padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={16} style={{ color: selectionTime > 0 ? 'var(--primary)' : 'var(--text-dim)' }} />
              <div style={{ fontSize: '13px', flex: 1 }}>
                {selectionTime > 0 ? (
                  <span>Bạn còn <strong>{selectionTime} giây</strong> để chọn lộ trình ghi điểm tốc độ!</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Cửa sổ lựa chọn đã đóng. Vui lòng chờ đếm ngược hoặc nhấn <strong>"Tua nhanh"</strong> để xem kết quả.</span>
                )}
              </div>
              {selectionTime === 0 && (
                <button 
                  onClick={handleRevealRound}
                  className="btn-nav"
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}
                >
                  Tua nhanh kết quả ➔
                </button>
              )}
            </div>

            {/* Routes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {activeRoundData.routes.map((route: any) => {
                const isSelected = playerChoice === route.letter;
                const isSelectionActive = selectionTime > 0 && playerChoice === null;
                
                let borderStyle = '1px solid var(--border)';
                let bgStyle = 'var(--bg)';
                if (isSelected) {
                  borderStyle = '2px solid var(--primary)';
                  bgStyle = 'var(--primary-dim)';
                }

                return (
                  <div 
                    key={route.letter}
                    onClick={() => isSelectionActive && handleSelectRoute(route.letter)}
                    style={{ 
                      background: bgStyle, 
                      border: borderStyle, 
                      borderRadius: '12px', 
                      padding: '16px', 
                      cursor: isSelectionActive ? 'pointer' : 'default',
                      opacity: !isSelectionActive && !isSelected ? 0.6 : 1,
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: isSelected ? 'var(--primary)' : 'var(--border-strong)', color: isSelected ? '#fff' : 'var(--text)', display: 'flex', alignItems: 'center', fontWeight: '800', fontSize: '14px', justifyContent: 'center' }}>
                          {route.letter}
                        </span>
                        <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{route.name}</strong>
                      </div>
                      
                      {/* Route tags */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: route.risk === 'high' ? 'rgba(239,35,60,0.1)' : route.risk === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: route.risk === 'high' ? 'var(--red)' : route.risk === 'medium' ? 'var(--yellow)' : 'var(--green)' }}>
                          Ngập: {route.risk === 'high' ? 'Cực sâu' : route.risk === 'medium' ? 'Vừa' : 'Không'}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg2)', color: 'var(--text-muted)' }}>
                          ⏱️ {route.time}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, paddingLeft: '38px' }}>
                      {route.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar: Live Bot Leaderboard */}
          <div className="game-leaderboard-card">
            <h4 style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={16} style={{ color: 'var(--yellow)' }} /> BẢNG XẾP HẠNG
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedLeaderboard.map(([name, score], i) => (
                <div key={name} className={`game-leaderboard-item${name === 'Bạn' ? ' active' : ''}`}>
                  <span style={{ color: name === 'Bạn' ? 'var(--text)' : 'var(--text-muted)' }}>
                    {i + 1}. <strong style={{ color: 'var(--text)' }}>{name === 'Bạn' ? `${playerName} (Bạn)` : name}</strong>
                  </span>
                  <span style={{ fontWeight: '700', color: name === 'Bạn' ? 'var(--primary)' : 'var(--text)' }}>{score} đ</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2.1.3 REVEALING / EXPLANATION SCREEN */}
      {gameState === 'revealing' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>Vòng {currentRound} - KẾT QUẢ</span>
            
            <div style={{ display: 'block', marginTop: '16px' }}>
              {playerChoice === 'B' ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px 24px', borderRadius: '100px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--green)' }} />
                  <span style={{ fontWeight: '800', color: 'var(--green)', fontSize: '16px' }}>ĐÚNG CHÍNH XÁC! Bạn chọn đúng Tuyến của AI</span>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.2)', padding: '12px 24px', borderRadius: '100px' }}>
                  <AlertTriangle size={20} style={{ color: 'var(--red)' }} />
                  <span style={{ fontWeight: '800', color: 'var(--red)', fontSize: '16px' }}>BỊ NGẬP LỤT! Bạn chọn sai lộ trình</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '32px' }}>
            
            {/* AI recommendation explain */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Navigation size={18} style={{ color: 'var(--primary)' }} /> AI Khuyên dùng: Tuyến B
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {activeRoundData.aiExplanation}
              </p>

              {/* Bot stats */}
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>Phân bổ lựa chọn:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['A', 'B', 'C', 'D'].map(letter => {
                  const matches = Object.values(roundStats).filter((c: any) => c === letter).length;
                  const total = Object.keys(roundStats).length;
                  const percent = Math.round((matches / total) * 100) || 0;
                  
                  return (
                    <div key={letter} style={{ fontSize: '12.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Lộ trình {letter} ({activeRoundData.routes.find((r: any) => r.letter === letter)?.name}):</span>
                        <strong style={{ color: letter === 'B' ? 'var(--green)' : 'var(--text)' }}>{percent}% ({matches} người chơi)</strong>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: letter === 'B' ? 'var(--green)' : 'var(--text-dim)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score updates */}
            <div className="game-leaderboard-card">
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>BẢNG ĐIỂM TỔNG HỢP</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sortedLeaderboard.slice(0, 5).map(([name, score], i) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: name === 'Bạn' ? 'var(--text)' : 'var(--text-muted)' }}>
                      {i + 1}. <strong>{name === 'Bạn' ? `${playerName} (Bạn)` : name}</strong>
                    </span>
                    <span style={{ fontWeight: '700', color: name === 'Bạn' ? 'var(--primary)' : 'var(--text)' }}>{score} đ</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <button onClick={handleNextRound} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
            {currentRound === 1 ? 'Tiếp tục Vòng 2 ➔' : 'Xem Kết quả Chung cuộc ➔'}
          </button>
        </div>
      )}

      {/* 2.1.4 GAME OVER SCREEN */}
      {gameState === 'over' && (
        <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
          <Award size={64} style={{ color: 'var(--yellow)', marginBottom: '20px' }} />
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Kết quả chung cuộc</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Bạn đã hoàn thành cuộc đua tránh ngập lụt đô thị.</p>

          {/* Podiums */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'left', marginBottom: '32px', boxShadow: 'var(--shadow)' }}>
            {sortedLeaderboard.slice(0, 3).map(([name, score], i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
              return (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{medal}</span>
                    <strong style={{ color: name === 'Bạn' ? 'var(--primary)' : 'var(--text)', fontSize: '16px' }}>
                      {name === 'Bạn' ? `${playerName} (Bạn)` : name}
                    </strong>
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--primary)' }}>{score} điểm</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleResetSolo} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              <RefreshCw size={14} /> Chơi lại
            </button>
            <button 
              onClick={() => {
                window.location.href = '/';
              }} 
              className="btn-primary" 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Trở về Trang chủ ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* 🖥️ 2.2 HOST MULTIPLAYER VIEW IMPLEMENTATION             */
/* ──────────────────────────────────────────────────────── */
function HostGameComponent() {
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [joinLink, setJoinLink] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [showResults, setShowResults] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const createRoom = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' })
        });
        const data = await res.json();
        if (data.success) {
          setRoomCode(data.roomCode);
          let link = `${window.location.origin}/game?room=${data.roomCode}`;
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (data.localIp && data.localIp !== 'localhost') {
              link = `${window.location.protocol}//${data.localIp}${window.location.port ? ':' + window.location.port : ''}/game?room=${data.roomCode}`;
            }
          }
          setJoinLink(link);
        }
      } catch (err) {
        console.error(err);
      }
    };
    createRoom();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!roomCode) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', roomCode })
        });
        const data = await res.json();
        if (data.success) {
          setRoomData(data.room);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    pollIntervalRef.current = setInterval(fetchStatus, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [roomCode]);

  const handleHostStart = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', roomCode })
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        startRoundTimer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRoundTimer = () => {
    setShowResults(false);
    setCountdown(45);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerIntervalRef.current!);
          setShowResults(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleHostNext = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next', roomCode })
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        startRoundTimer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHostEnd = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', roomCode })
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHostReset = async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', roomCode })
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        setShowResults(false);
        setCountdown(45);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!roomData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><RefreshCw className="animate-spin" /> Đang tạo phòng...</div>;
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinLink)}`;
  const sortedPlayers = [...roomData.players].sort((a, b) => b.score - a.score);
  const activeRoundData = ROUNDS_DATA[roomData.currentRound];

  return (
    <div style={{ minHeight: '60vh' }}>
      
      {/* 2.2.1 HOST LOBBY / WAITING FOR PLAYERS */}
      {roomData.status === 'waiting' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', padding: '20px' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Phòng chơi Triển lãm</span>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', margin: '8px 0 24px', letterSpacing: '-0.03em' }}>Đang chờ người tham gia...</h3>

            <div className="game-qr-section">
              <img src={qrImageUrl} alt="QR Code to Join" className="game-qr-code" style={{ width: '180px', height: '180px' }} />
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>Quét mã QR để gia nhập cuộc đua</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>Sử dụng camera điện thoại quét mã hoặc truy cập trực tiếp bằng đường dẫn:</p>
                <code style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', color: 'var(--primary)', fontSize: '12px', wordBreak: 'break-all' }}>{joinLink}</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>Mã phòng: <span style={{ color: 'var(--primary)', background: 'var(--primary-dim)', border: '1px solid var(--primary-glow)', padding: '6px 16px', borderRadius: '6px', fontSize: '20px' }}>{roomData.code}</span></div>
              <button 
                onClick={handleHostStart} 
                disabled={roomData.players.length === 0} 
                className="btn-primary" 
                style={{ opacity: roomData.players.length === 0 ? 0.5 : 1, cursor: roomData.players.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Bắt đầu Trận đấu <Play size={14} />
              </button>
            </div>
          </div>

          <div className="game-leaderboard-card">
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} /> NGƯỜI CHƠI ĐÃ JOIN ({roomData.players.length})
            </h4>
            
            {roomData.players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: '13.5px' }}>Đang chờ người quét QR...</div>
            ) : (
              <div className="game-bots-grid">
                {roomData.players.map((p: any) => (
                  <div key={p.id} className="game-bot-badge">
                    <span className="game-bot-dot" />
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2.2.2 HOST PLAYING / GAME SCREEN */}
      {roomData.status === 'in_progress' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px' }}>
            
            {/* Round info */}
            <div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow)' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Vòng thi đấu {roomData.currentRound}/2</span>
                <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text)', margin: '8px 0 16px' }}>Từ: {activeRoundData.startingPoint} ➔ Đến: {activeRoundData.destination}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Thời gian còn lại</span>
                    <div style={{ fontSize: '48px', fontWeight: '900', color: countdown <= 10 ? 'var(--red)' : 'var(--text)', lineHeight: 1 }}>
                      {countdown} <span style={{ fontSize: '20px' }}>giây</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lượt trả lời nhận được</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)' }}>
                      {roomData.players.filter((p: any) => p.choice !== null).length} / {roomData.players.length}
                    </div>
                  </div>
                </div>
              </div>

              {!showResults ? (
                /* Choices distribution in real-time */
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px' }}>Lộ trình được người chơi chọn nhiều nhất:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {['A', 'B', 'C', 'D'].map(letter => {
                      const matches = roomData.players.filter((p: any) => p.choice === letter).length;
                      const total = roomData.players.length || 1;
                      const percent = Math.round((matches / total) * 100);
                      const route = activeRoundData.routes.find((r: any) => r.letter === letter);

                      return (
                        <div key={letter} style={{ fontSize: '13.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span>Lộ trình {letter} ({route?.name})</span>
                            <strong>{percent}% ({matches} lượt)</strong>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* AI Reveal Result & Explanations */
                <div className="animate-scale-in" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Sparkles style={{ color: 'var(--green)' }} />
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>AI Khuyên Dùng: Lộ trình B ({activeRoundData.routes.find((r: any) => r.letter === 'B')?.name})</h4>
                  </div>
                  <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    {activeRoundData.aiExplanation}
                  </p>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    {roomData.currentRound === 1 ? (
                      <button onClick={handleHostNext} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        Sang Vòng 2 ➔
                      </button>
                    ) : (
                      <button onClick={handleHostEnd} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--yellow)' }}>
                        Kết thúc Trận đấu & Xem Podium ➔
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Leaderboard list */}
            <div className="game-leaderboard-card">
              <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: 'var(--yellow)' }} /> BẢNG XẾP HẠNG TRỰC TIẾP
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedPlayers.map((p: any, i: number) => {
                  const isAnswered = p.choice !== null;
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: isAnswered ? 'var(--bg2)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-dim)', width: '20px' }}>{i + 1}.</span>
                        <strong style={{ color: 'var(--text)' }}>{p.name}</strong>
                        {isAnswered && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>SUBMITTED</span>}
                      </div>
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>{p.score} đ</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2.2.3 HOST GAME OVER / PODIUM SCREEN */}
      {roomData.status === 'finished' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
          <Award size={72} style={{ color: 'var(--yellow)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', marginBottom: '8px' }}>Trận đấu Kết thúc!</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Vinh danh các nhà thông thái tránh ngập Cần Thơ.</p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'left', marginBottom: '36px', boxShadow: 'var(--shadow)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--text)' }}>BẢNG VÀNG CHIẾN THẮNG</h4>
            {sortedPlayers.slice(0, 5).map((p: any, i: number) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️';
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{medal}</span>
                    <strong style={{ color: 'var(--text)', fontSize: '16px' }}>{p.name}</strong>
                  </div>
                  <span style={{ fontWeight: '950', fontSize: '18px', color: 'var(--primary)' }}>{p.score} điểm</span>
                </div>
              );
            })}
          </div>

          <button onClick={handleHostReset} className="btn-primary" style={{ padding: '14px 28px', fontSize: '14px' }}>
            <RefreshCw size={14} /> Chơi Trận Mới
          </button>
        </div>
      )}

    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/* 📱 2.3 PLAYER MOBILE CONTROLLER IMPLEMENTATION           */
/* ──────────────────────────────────────────────────────── */
function PlayerGameComponent({ playerId }: { playerId: string }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [errorMsg, setErrorMsg] = useState('');
  const [joined, setJoined] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room');
      if (code) {
        setRoomCode(code.toUpperCase());
      }
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!joined || !roomCode) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', roomCode })
        });
        const data = await res.json();
        if (data.success) {
          setRoomData(data.room);
          
          const me = data.room.players.find((p: any) => p.id === playerId);
          if (me && me.choice === null) {
            setPlayerChoice(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    pollIntervalRef.current = setInterval(fetchStatus, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [joined, roomCode, playerId]);

  useEffect(() => {
    if (roomData?.status === 'in_progress') {
      const elapsed = Math.floor((Date.now() - (roomData.roundStartedAt || Date.now())) / 1000);
      const startTimer = Math.max(45 - elapsed, 0);
      setTimeRemaining(startTimer);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(r => {
          if (r <= 1) {
            clearInterval(timerIntervalRef.current!);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [roomData?.currentRound, roomData?.status]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !playerName.trim()) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomCode, playerName, playerId })
      });
      const data = await res.json();
      if (data.success) {
        setRoomData(data.room);
        setJoined(true);
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra khi tham gia phòng.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi mạng, vui lòng thử lại.');
    }
  };

  const handleSelectRoute = async (letter: string) => {
    const elapsed = Math.floor((Date.now() - (roomData.roundStartedAt || Date.now())) / 1000);
    const selectionWindowElapsed = Math.min(elapsed, 8);

    if (elapsed > 8 || playerChoice !== null) return;

    setPlayerChoice(letter);

    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'select', 
          roomCode, 
          playerId, 
          choice: letter, 
          timeTaken: selectionWindowElapsed 
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const me = roomData?.players.find((p: any) => p.id === playerId);
  const activeRoundData = roomData ? ROUNDS_DATA[roomData.currentRound] : null;
  const elapsedSeconds = roomData ? Math.floor((Date.now() - (roomData.roundStartedAt || Date.now())) / 1000) : 0;
  const isSelectionWindowActive = elapsedSeconds <= 8 && playerChoice === null;

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto' }}>
      
      {/* 2.3.1 JOIN FORM */}
      {!joined && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>Tham gia phòng đua</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>Nhập mã phòng và tên của bạn để tham gia vào bảng xếp hạng màn hình lớn.</p>

          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Mã phòng (Room Code)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: ABC123" 
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="game-input"
                style={{ fontWeight: '700', letterSpacing: '0.05em' }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Tên hiển thị (Tối đa 12 ký tự)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: HuyCầnThơ" 
                required
                maxLength={12}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="game-input"
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--red)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
              Vào phòng <Play size={14} />
            </button>
          </form>
        </div>
      )}

      {/* 2.3.2 WAITING SCREEN IN LOBBY */}
      {joined && roomData?.status === 'waiting' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <Users size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>Đã gia nhập thành công!</h4>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Chào <strong style={{ color: 'var(--text)' }}>{playerName}</strong>, bạn đang ở trong phòng <strong style={{ color: 'var(--primary)' }}>{roomData.code}</strong>.
          </div>
          
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '12.5px', animation: 'pulse-dot 1.5s infinite' }}>
            Đang chờ chủ phòng khởi động trận đấu...
          </div>
        </div>
      )}

      {/* 2.3.3 CONTROLLER GAMEPLAY SCREEN */}
      {joined && roomData?.status === 'in_progress' && activeRoundData && me && (
        <div>
          
          {/* Round brief */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow)' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>Vòng {roomData.currentRound}/2</span>
              <strong style={{ display: 'block', color: 'var(--text)', fontSize: '13px', marginTop: '2px' }}>Mục tiêu: {activeRoundData.destination}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Thời gian</span>
              <strong style={{ display: 'block', fontSize: '16px', color: timeRemaining <= 10 ? 'var(--red)' : 'var(--text)' }}>{timeRemaining}s</strong>
            </div>
          </div>

          {/* Locked status notification */}
          {playerChoice !== null && (
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} /> Đã khóa Lựa chọn: <strong>Lộ trình {playerChoice}</strong>
            </div>
          )}

          {/* Time expired notification */}
          {elapsedSeconds > 8 && playerChoice === null && (
            <div style={{ background: 'rgba(239,35,60,0.06)', border: '1px solid rgba(239,35,60,0.2)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={16} /> Đã hết thời gian lựa chọn!
            </div>
          )}

          {/* 4 buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeRoundData.routes.map((r: any) => {
              const isSelected = playerChoice === r.letter;
              const isActive = isSelectionWindowActive;

              let btnBorder = '1px solid var(--border)';
              let btnBg = 'var(--bg-card)';
              if (isSelected) {
                btnBorder = '2px solid var(--primary)';
                btnBg = 'var(--primary-dim)';
              }

              return (
                <button
                  key={r.letter}
                  disabled={!isActive}
                  onClick={() => handleSelectRoute(r.letter)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: btnBorder,
                    background: btnBg,
                    color: 'var(--text)',
                    textAlign: 'left',
                    cursor: isActive ? 'pointer' : 'default',
                    opacity: !isActive && !isSelected ? 0.5 : 1,
                    transition: 'all 0.2s',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--primary)' : 'var(--border-strong)',
                    color: isSelected ? '#fff' : 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '13px'
                  }}>
                    {r.letter}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{r.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.time} — Ngập: {r.risk === 'high' ? 'Cực sâu' : r.risk === 'medium' ? 'Vừa' : 'Không'}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Điểm tích lũy hiện tại của bạn: <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>{me.score} đ</strong>
          </div>

        </div>
      )}

      {/* 2.3.4 CONTROLLER FINAL RESULTS */}
      {joined && roomData?.status === 'finished' && me && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <Trophy size={48} style={{ color: 'var(--yellow)', marginBottom: '16px' }} />
          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)', marginBottom: '8px' }}>Trận đấu đã kết thúc!</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Bạn đã xuất sắc hoàn thành phần thi tại triển lãm.</p>

          <div style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-glow)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Điểm số của bạn</span>
            <strong style={{ fontSize: '32px', color: 'var(--text)', fontWeight: '900' }}>{me.score} đ</strong>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Vui lòng xem thứ hạng chung cuộc trên Màn hình lớn Projector.
          </div>
        </div>
      )}

    </div>
  );
}
