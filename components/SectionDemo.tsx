'use client'

import { useState, useEffect, useRef } from 'react'

const TABS = [
  'Bản đồ ngập',
  'AI lộ trình',
  'Cảnh báo',
  'Cộng đồng',
  'Dashboard',
  'Mekong network',
]

export default function SectionDemo() {
  const [activeTab, setActiveTab] = useState(0)
  const mapRef = useRef<any>(null)
  const mapInitRef = useRef(false)

  // Init Leaflet map when tab 0 is active
  useEffect(() => {
    if (activeTab !== 0 || mapInitRef.current) return

    const initMap = () => {
      const L = (window as any).L
      if (!L || !document.getElementById('demoRealMap')) return
      mapInitRef.current = true
      const map = L.map('demoRealMap', { zoomControl: true }).setView([10.045, 105.747], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)
      const floodPts = [[10.038, 105.740], [10.052, 105.755], [10.041, 105.760], [10.060, 105.745], [10.033, 105.752]]
      const warnPts  = [[10.047, 105.735], [10.055, 105.762], [10.065, 105.750]]
      const safePts  = [[10.045, 105.748], [10.050, 105.738]]
      const mkIcon = (cls: string) => L.divIcon({ className: '', html: `<div class="demo-marker ${cls}"></div>`, iconSize: [18,18] })
      floodPts.forEach(p => L.marker(p, { icon: mkIcon('flood') }).addTo(map))
      warnPts.forEach(p  => L.marker(p, { icon: mkIcon('warn')  }).addTo(map))
      safePts.forEach(p  => L.marker(p, { icon: mkIcon('safe')  }).addTo(map))
      mapRef.current = map
    }

    if ((window as any).L) { initMap(); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = initMap
    document.head.appendChild(script)
  }, [activeTab])

  return (
    <div className="section-demo" id="demo">
      <div className="section-inner">
        <div className="section-header">
          <div className="eyebrow">Demo sản phẩm</div>
          <div className="section-title">Xem Mekong Pathfinder<br /><span>hoạt động trên dữ liệu thật</span></div>
          <div className="section-desc">
            Các màn hình dưới đây mô phỏng luồng sử dụng chính. Riêng bản đồ dùng OpenStreetMap để hiển thị nền bản đồ thật tại Cần Thơ.
          </div>
        </div>

        <div className="demo-shell">
          <div className="demo-tabs" role="tablist">
            {TABS.map((t, i) => (
              <button
                key={i}
                className={`demo-tab${activeTab === i ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveTab(i)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="demo-body">
            {/* Panel 0 — Bản đồ ngập */}
            <div className={`demo-panel${activeTab === 0 ? ' active' : ''}`}>
              <div className="dp-layout">
                <div className="dp-info">
                  <div className="dp-tag">Tính năng 01</div>
                  <h3 className="dp-title">Bản đồ ngập<br />thời gian thực</h3>
                  <p className="dp-desc">Hiển thị các điểm ngập trên bản đồ thật của Cần Thơ, cập nhật từ cảm biến IoT, dự báo triều và báo cáo cộng đồng.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
                      5 điểm đang ngập
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} />
                      3 khu vực cảnh báo
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                      Tuyến an toàn đang mở
                    </div>
                  </div>
                  <div className="dp-update">Cập nhật: vừa xong</div>
                </div>
                <div className="dp-screen">
                  <div className="dp-screen-bar">
                    <div className="dp-screen-dots"><span /><span /><span /></div>
                    <span className="dp-screen-title">Bản đồ ngập - Cần Thơ</span>
                    <span className="dp-live-badge">LIVE</span>
                  </div>
                  <div className="real-map" id="demoRealMap" />
                </div>
              </div>
            </div>

            {/* Panel 1 — AI lộ trình */}
            <div className={`demo-panel${activeTab === 1 ? ' active' : ''}`}>
              <div className="dp-layout">
                <div className="dp-info">
                  <div className="dp-tag">Tính năng 02</div>
                  <h3 className="dp-title">AI tối ưu<br />lộ trình tránh ngập</h3>
                  <p className="dp-desc">AI phân tích điểm ngập, mực nước và mật độ giao thông để đề xuất tuyến an toàn hơn.</p>
                  <div className="dp-input-label">Từ</div>
                  <select className="dp-select"><option>Bến Ninh Kiều</option><option>Chợ Cái Răng</option><option>ĐH Cần Thơ</option></select>
                  <div className="dp-input-label">Đến</div>
                  <select className="dp-select"><option>BV Đa Khoa Cần Thơ</option><option>Sân bay Cần Thơ</option><option>Khu CN Trà Nóc</option></select>
                  <div className="dp-controls">
                    <button className="dp-btn primary" type="button">Tìm đường an toàn</button>
                  </div>
                  <div className="route-stats">
                    <div className="rs-item"><div className="rs-val green">4.2 km</div><div className="rs-label">Khoảng cách</div></div>
                    <div className="rs-item"><div className="rs-val">11 phút</div><div className="rs-label">Thời gian</div></div>
                    <div className="rs-item"><div className="rs-val red">2 điểm</div><div className="rs-label">Ngập tránh</div></div>
                  </div>
                </div>
                <div className="dp-screen">
                  <div className="dp-screen-bar">
                    <div className="dp-screen-dots"><span /><span /><span /></div>
                    <span className="dp-screen-title">AI Route Engine</span>
                    <span className="dp-live-badge" style={{ background: 'rgba(45,198,83,0.12)', color: '#1a7a3c' }}>94%</span>
                  </div>
                  <div className="route-demo">
                    <svg width="100%" height="100%" viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="routeGrid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0L0 0 0 32" fill="none" stroke="rgba(67,97,238,0.10)" strokeWidth="0.8"/></pattern>
                        <path id="safeRoute" d="M24,280 Q70,230 116,205 Q170,174 220,120 Q275,64 430,52"/>
                        <path id="blockedRoute" d="M24,280 Q80,240 118,222 Q174,196 226,218 Q270,238 286,176"/>
                      </defs>
                      <rect width="480" height="320" fill="url(#routeGrid)"/>
                      <rect x="190" y="0" width="58" height="320" fill="#4361ee" opacity="0.08"/>
                      <line x1="0" y1="110" x2="480" y2="110" stroke="rgba(67,97,238,0.22)" strokeWidth="2"/>
                      <line x1="0" y1="220" x2="480" y2="220" stroke="rgba(67,97,238,0.22)" strokeWidth="2"/>
                      <ellipse cx="105" cy="220" rx="34" ry="22" fill="#ef233c" opacity="0.14"/>
                      <ellipse cx="260" cy="118" rx="38" ry="20" fill="#ef233c" opacity="0.14"/>
                      <use href="#blockedRoute" fill="none" stroke="#ef233c" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.5"/>
                      <use href="#safeRoute" fill="none" stroke="#2dc653" strokeWidth="12" opacity="0.12"/>
                      <use href="#safeRoute" fill="none" stroke="#2dc653" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 7">
                        <animate attributeName="stroke-dashoffset" from="0" to="-150" dur="2.4s" repeatCount="indefinite"/>
                      </use>
                      <circle cx="24" cy="280" r="10" fill="#4361ee"/>
                      <circle cx="430" cy="52" r="10" fill="#ef233c"/>
                      <circle r="8" fill="white" stroke="#2dc653" strokeWidth="3">
                        <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#safeRoute"/></animateMotion>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2 — Cảnh báo */}
            <div className={`demo-panel${activeTab === 2 ? ' active' : ''}`}>
              <div className="dp-layout">
                <div className="dp-info">
                  <div className="dp-tag">Tính năng 03</div>
                  <h3 className="dp-title">Cảnh báo sớm<br />và push notification</h3>
                  <p className="dp-desc">Nhận thông báo trước 30-60 phút khi khu vực có nguy cơ ngập.</p>
                  <div className="dp-input-label">Lọc theo mức độ</div>
                  <select className="dp-select">
                    <option value="all">Tất cả cảnh báo</option>
                    <option value="high">Mức cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                  <div className="alert-mini-list" style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                    <div className="aml-item"><div className="aml-sev high"/><div><div className="aml-title">Đ. Mậu Thân - 1.2m</div><div className="aml-sub">5 phút trước</div></div></div>
                    <div className="aml-item"><div className="aml-sev high"/><div><div className="aml-title">Nguyễn Văn Cừ - 0.8m</div><div className="aml-sub">12 phút trước</div></div></div>
                    <div className="aml-item"><div className="aml-sev medium"/><div><div className="aml-title">Trần Văn Hoài - dự báo 45 phút</div><div className="aml-sub">18 phút trước</div></div></div>
                    <div className="aml-item"><div className="aml-sev low"/><div><div className="aml-title">Lý Tự Trọng - nguy cơ thấp</div><div className="aml-sub">1 giờ trước</div></div></div>
                  </div>
                </div>
                <div className="dp-screen">
                  <div className="dp-screen-bar">
                    <div className="dp-screen-dots"><span /><span /><span /></div>
                    <span className="dp-screen-title">Dự báo lượng mưa 6h</span>
                  </div>
                  <div className="forecast-wrap">
                    <div className="forecast-bars">
                      {[
                        { h: '85%', bg: '#ef233c', lbl: 'Now\n87mm' },
                        { h: '70%', bg: '', lbl: '+1h\n62mm', op: 0.55 },
                        { h: '55%', bg: '', lbl: '+2h\n48mm', op: 0.45 },
                        { h: '38%', bg: '', lbl: '+3h\n34mm', op: 0.35 },
                        { h: '23%', bg: '', lbl: '+4h\n21mm', op: 0.25 },
                        { h: '13%', bg: '', lbl: '+5h\n12mm', op: 0.2 },
                        { h: '7%', bg: '#2dc653', lbl: '+6h\n6mm' },
                      ].map((b, i) => (
                        <div key={i} className="fcast-col">
                          <div className="fcast-bar" style={{ height: b.h, background: b.bg || undefined, opacity: b.op }} />
                          <div className="fcast-lbl">{b.lbl.split('\n').map((l, j) => <span key={j} style={{ display: 'block' }}>{l}</span>)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="notif-list">
                      <div className="notif-card high"><strong>Khẩn cấp</strong> - Đ. Mậu Thân ngập 1.2m, không nên qua lại.</div>
                      <div className="notif-card medium"><strong>Cảnh báo</strong> - Trần Văn Hoài dự báo ngập trong 45 phút.</div>
                      <div className="notif-card low"><strong>Lưu ý</strong> - Triều đang rút, cải thiện sau khoảng 1 giờ.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 3 — Cộng đồng */}
            <div className={`demo-panel${activeTab === 3 ? ' active' : ''}`}>
              <div className="dp-layout">
                <div className="dp-info">
                  <div className="dp-tag">Tính năng 04</div>
                  <h3 className="dp-title">Báo cáo<br />cộng đồng</h3>
                  <p className="dp-desc">Người dân gửi mô tả, mức nước và vị trí. AI kiểm tra ngữ cảnh trước khi đưa báo cáo lên bản đồ vận hành.</p>
                  <div className="dp-compose">
                    <textarea placeholder="Bạn thấy ngập ở đâu? Mô tả ngắn..." rows={4} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                      <select className="dp-select" style={{ flex: 1 }}>
                        <option>Mực nước dưới 30cm</option>
                        <option>Mực nước 30-60cm</option>
                        <option>Mực nước 60cm-1m</option>
                        <option>Mực nước trên 1m</option>
                      </select>
                      <button className="dp-btn primary" type="button">Gửi</button>
                    </div>
                  </div>
                  <div className="dp-update">AI xác thực báo cáo trong khoảng 2 giây trước khi hiển thị.</div>
                </div>
                <div className="dp-screen">
                  <div className="dp-screen-bar">
                    <div className="dp-screen-dots"><span /><span /><span /></div>
                    <span className="dp-screen-title">Feed cộng đồng</span>
                  </div>
                  <div className="community-feed">
                    <div className="cf-item">
                      <div className="cf-avatar" style={{ background: '#e8f0fe', color: '#185FA5' }}>NV</div>
                      <div><div className="cf-header"><span className="cf-name">Nguyễn Văn An</span><span className="cf-loc">Đ. Mậu Thân</span></div><div className="cf-text">Ngập sâu khoảng 1.2m, xe máy không qua được. Cống tắc.</div><span className="cf-badge">AI xác thực - 1.2m</span></div>
                    </div>
                    <div className="cf-item">
                      <div className="cf-avatar" style={{ background: '#e1f5ee', color: '#0F6E56' }}>TL</div>
                      <div><div className="cf-header"><span className="cf-name">Trần Thị Lan</span><span className="cf-loc">Cái Răng</span></div><div className="cf-text">Đường qua lại bình thường, nước rút rồi.</div><span className="cf-badge">AI xác thực - an toàn</span></div>
                    </div>
                    <div className="cf-item">
                      <div className="cf-avatar" style={{ background: '#faeeda', color: '#854F0B' }}>PH</div>
                      <div><div className="cf-header"><span className="cf-name">Phạm Hoàng</span><span className="cf-loc">Đ. 3/2</span></div><div className="cf-text">Nước mới bắt đầu dâng, khoảng 30cm nhưng đang tăng nhanh.</div><span className="cf-badge checking">AI đang xác thực...</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 4 — Dashboard */}
            <div className={`demo-panel${activeTab === 4 ? ' active' : ''}`}>
              <div className="dp-screen" style={{ minHeight: 0 }}>
                <div className="dp-screen-bar">
                  <div className="dp-screen-dots"><span /><span /><span /></div>
                  <span className="dp-screen-title">Dashboard quản lý đô thị - Cần Thơ</span>
                  <span className="dp-live-badge">LIVE</span>
                </div>
                <div className="dashboard-wrap">
                  <div className="dash-kpi-grid">
                    <div className="kpi-card red"><div className="kpi-num">5</div><div className="kpi-label">Điểm đang ngập</div><div className="kpi-sub">+2 so với 1h trước</div></div>
                    <div className="kpi-card amber"><div className="kpi-num">8</div><div className="kpi-label">Cảnh báo hoạt động</div><div className="kpi-sub">3 mức cao</div></div>
                    <div className="kpi-card blue"><div className="kpi-num">47</div><div className="kpi-label">Báo cáo cộng đồng</div><div className="kpi-sub">hôm nay</div></div>
                    <div className="kpi-card green"><div className="kpi-num">3/5</div><div className="kpi-label">Đội ứng phó</div><div className="kpi-sub">đang triển khai</div></div>
                  </div>
                  <div className="dash-bottom-grid">
                    <div className="dash-mini-panel">
                      <div className="dmp-title">Điểm ngập theo mức độ</div>
                      <div className="dmp-row"><span>Đ. Mậu Thân</span><span className="dmp-val red">1.2m tăng</span></div>
                      <div className="dmp-row"><span>Nguyễn Văn Cừ</span><span className="dmp-val red">0.8m tăng</span></div>
                      <div className="dmp-row"><span>Đ. 30/4</span><span className="dmp-val">0.5m ổn định</span></div>
                      <div className="dmp-row"><span>Lý Tự Trọng</span><span className="dmp-val green">0.2m giảm</span></div>
                    </div>
                    <div className="dash-mini-panel">
                      <div className="dmp-title">Đội ứng phó</div>
                      <div className="crew-row"><div className="crew-av" style={{ background: '#e1f5ee', color: '#0F6E56' }}>P3</div><div style={{ flex: 1 }}><div className="crew-nm">Đội phường 3</div><div className="crew-tk">Đ. Mậu Thân</div></div><span className="crew-st active">Đang làm</span></div>
                      <div className="crew-row"><div className="crew-av" style={{ background: '#e1f5ee', color: '#0F6E56' }}>BT</div><div style={{ flex: 1 }}><div className="crew-nm">Đội Bình Thủy</div><div className="crew-tk">Nguyễn Văn Cừ</div></div><span className="crew-st active">Đang làm</span></div>
                      <div className="crew-row"><div className="crew-av" style={{ background: '#faeeda', color: '#854F0B' }}>CR</div><div style={{ flex: 1 }}><div className="crew-nm">Đội Cái Răng</div><div className="crew-tk">Đang di chuyển</div></div><span className="crew-st enroute">Trên đường</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 5 — Mekong network */}
            <div className={`demo-panel${activeTab === 5 ? ' active' : ''}`}>
              <div className="dp-layout">
                <div className="dp-info">
                  <div className="dp-tag">Tính năng 06</div>
                  <h3 className="dp-title">Mạng lưới<br />Mekong 13 tỉnh</h3>
                  <p className="dp-desc">Chia sẻ dữ liệu ngập liên tỉnh, phủ toàn Đồng bằng sông Cửu Long bằng cảm biến, báo cáo cộng đồng và đồng bộ định kỳ.</p>
                  <div className="net-kpi-list">
                    <div className="nkpi"><div className="nkpi-val">13/13</div><div className="nkpi-label">Tỉnh kết nối</div></div>
                    <div className="nkpi"><div className="nkpi-val">247</div><div className="nkpi-label">Cảm biến IoT</div></div>
                    <div className="nkpi"><div className="nkpi-val">99.2%</div><div className="nkpi-label">Uptime</div></div>
                    <div className="nkpi"><div className="nkpi-val">5 phút</div><div className="nkpi-label">Tần suất sync</div></div>
                  </div>
                </div>
                <div className="dp-screen">
                  <div className="dp-screen-bar">
                    <div className="dp-screen-dots"><span /><span /><span /></div>
                    <span className="dp-screen-title">Mạng lưới Mekong</span>
                  </div>
                  <div className="network-wrap">
                    <svg className="network-map" width="100%" viewBox="0 0 440 330" xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id="netGrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0L0 0 0 28" fill="none" stroke="rgba(67,97,238,0.08)" strokeWidth="0.7"/></pattern></defs>
                      <rect width="440" height="330" fill="url(#netGrid)"/>
                      <g stroke="#4361ee" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.34">
                        <line x1="220" y1="155" x2="110" y2="65"/><line x1="220" y1="155" x2="330" y2="55"/>
                        <line x1="220" y1="155" x2="130" y2="240"/><line x1="220" y1="155" x2="320" y2="248"/>
                        <line x1="220" y1="155" x2="55" y2="148"/><line x1="220" y1="155" x2="392" y2="148"/>
                        <line x1="220" y1="155" x2="260" y2="295"/><line x1="220" y1="155" x2="195" y2="42"/>
                      </g>
                      <circle cx="220" cy="155" r="22" fill="#4361ee"/>
                      <text x="220" y="159" textAnchor="middle" fill="white" fontSize="9" fontFamily="Be Vietnam Pro,sans-serif" fontWeight="700">Cần Thơ</text>
                      <circle cx="220" cy="155" r="22" fill="none" stroke="#4361ee" strokeWidth="2" opacity="0.45">
                        <animate attributeName="r" values="22;38;22" dur="2.2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.45;0;0.45" dur="2.2s" repeatCount="indefinite"/>
                      </circle>
                      <g fill="#2dc653" opacity=".9">
                        <circle cx="110" cy="65" r="9"/><circle cx="330" cy="55" r="9"/>
                        <circle cx="130" cy="240" r="9"/><circle cx="320" cy="248" r="9"/>
                        <circle cx="195" cy="42" r="8"/><circle cx="260" cy="295" r="8"/>
                      </g>
                      <g fill="#f4a261" opacity=".9"><circle cx="55" cy="148" r="8"/><circle cx="392" cy="148" r="8"/></g>
                      <g fill="#ef233c" opacity=".82"><circle cx="122" cy="40" r="8"/><circle cx="350" cy="196" r="8"/></g>
                      <g fill="#4a5568" fontSize="8" fontFamily="Be Vietnam Pro,sans-serif" textAnchor="middle">
                        <text x="110" y="52">An Giang</text><text x="330" y="42">Đồng Tháp</text>
                        <text x="130" y="260">Kiên Giang</text><text x="320" y="268">Vĩnh Long</text>
                        <text x="55" y="135">Hà Tiên</text><text x="392" y="135">Bến Tre</text>
                        <text x="122" y="27">Tiền Giang</text><text x="350" y="214">Bạc Liêu</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}