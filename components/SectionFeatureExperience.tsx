'use client'

import { useState, useEffect, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapPin, Navigation, Search, Wrench, Camera, Users, ShieldAlert, Droplet, AlertTriangle, Video } from 'lucide-react'

const TABS = [
  { label: 'Bản đồ thời gian thực', icon: MapPin, isComingSoon: false },
  { label: 'AI Nhận diện ngập', icon: Camera, isComingSoon: true },
  { label: 'Cộng đồng', icon: Users, isComingSoon: true },
]

// Real coordinates in Can Tho to make the map look extremely authentic
const FLOOD_POINTS: [number, number][] = [
  [10.0385, 105.7795], // Mau Than ngập sâu
  [10.0441, 105.7712], // Nguyen Van Cu ngập nhẹ
  [10.0315, 105.7688], // Tran Hung Dao
  [10.0520, 105.7820], // Cach Mang Thang Tam
  [10.0260, 105.7550], // Chợ Cái Răng
]

const WARN_POINTS: [number, number][] = [
  [10.0410, 105.7850], // Ho Xuan Huong
  [10.0505, 105.7620], // Tran Van Hoai nguy cơ cao
  [10.0610, 105.7580], // Nguyen Van Linh
]

const CAM_POINTS: [number, number][] = [
  [10.0350, 105.7800], // Cam Ngã tư Mậu Thân
  [10.0450, 105.7700], // Cam Nguyễn Văn Cừ
  [10.0550, 105.7650], // Cam CMT8
]

const REPAIR_POINTS: [number, number][] = [
  [10.0360, 105.7820], // Tiệm sửa xe Ninh Kiều
  [10.0430, 105.7730], // Sửa xe Lưu Hữu Phước
]

const ROUTE_DATA: Record<string, {
  safe: [number, number][]
  blocked: [number, number][]
  distance: string
  time: string
  avoided: string
}> = {
  'Bến Ninh Kiều-BV Đa Khoa Cần Thơ': {
    safe: [
      [10.0345, 105.7875], // Ninh Kieu
      [10.0360, 105.7850],
      [10.0400, 105.7810],
      [10.0440, 105.7780],
      [10.0455, 105.7755], // BV Da Khoa
    ],
    blocked: [
      [10.0345, 105.7875],
      [10.0385, 105.7795], // Mau Than (ngập)
      [10.0455, 105.7755],
    ],
    distance: '2.8 km',
    time: '8 phút',
    avoided: '1 điểm ngập sâu (Mậu Thân)',
  },
  'Chợ Cái Răng-Sân bay Cần Thơ': {
    safe: [
      [10.0260, 105.7550], // Chợ Cái Răng
      [10.0310, 105.7480],
      [10.0410, 105.7350],
      [10.0520, 105.7220],
      [10.0650, 105.7180], // Airport
    ],
    blocked: [
      [10.0260, 105.7550],
      [10.0441, 105.7712], // Nguyen Van Cu (ngập)
      [10.0650, 105.7180],
    ],
    distance: '10.2 km',
    time: '22 phút',
    avoided: '2 điểm ngập lớn',
  },
}

export default function SectionFeatureExperience() {
  const [activeTab, setActiveTab] = useState(0)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routeLinesRef = useRef<any[]>([])
  const mapInitRef = useRef(false)

  // Floating Bar States
  const [searchQuery, setSearchQuery] = useState('')
  const [isRoutingMode, setIsRoutingMode] = useState(false)
  const [fromLoc, setFromLoc] = useState('Bến Ninh Kiều')
  const [toLoc, setToLoc] = useState('BV Đa Khoa Cần Thơ')
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [activeFilters, setActiveFilters] = useState({
    flood: true,
    warn: true,
    cam: true,
    repair: true,
  })

  // Init Leaflet map
  useEffect(() => {
    if (activeTab !== 0 || mapInitRef.current) return

    const initMap = () => {
      const L = (window as any).L
      if (!L || !document.getElementById('demoRealMap')) return
      mapInitRef.current = true

      // Focus map on Ninh Kieu, Can Tho
      const map = L.map('demoRealMap', { zoomControl: false }).setView([10.038, 105.778], 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      // Add zoom control at the bottom right instead of default top left to avoid clashing with the search card
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapRef.current = map
      renderMarkers()
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

  // Re-render markers whenever filters change
  useEffect(() => {
    if (mapRef.current) {
      renderMarkers()
    }
  }, [activeFilters])

  const renderMarkers = () => {
    const L = (window as any).L
    if (!L || !mapRef.current) return

    // Clear previous markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const ICON_FLOOD = renderToStaticMarkup(<Droplet size={14} strokeWidth={2.5} color="white" />)
    const ICON_WARN = renderToStaticMarkup(<AlertTriangle size={14} strokeWidth={2.5} color="white" />)
    const ICON_CAM = renderToStaticMarkup(<Video size={14} strokeWidth={2.5} color="white" />)
    const ICON_REPAIR = renderToStaticMarkup(<Wrench size={14} strokeWidth={2.5} color="white" />)

    const mkIcon = (cls: string, iconHtml: string) => L.divIcon({
      className: '',
      html: `<div class="demo-marker ${cls}">${iconHtml}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })

    // Add Flood points
    if (activeFilters.flood) {
      FLOOD_POINTS.forEach(p => {
        const m = L.marker(p, { icon: mkIcon('flood', ICON_FLOOD) }).addTo(mapRef.current)
          .bindPopup('<b>Điểm ngập sâu</b><br>Mực nước: 0.6 – 1.2m<br>Phương tiện hạn chế di chuyển')
        markersRef.current.push(m)
      })
    }

    // Add Warning points
    if (activeFilters.warn) {
      WARN_POINTS.forEach(p => {
        const m = L.marker(p, { icon: mkIcon('warn', ICON_WARN) }).addTo(mapRef.current)
          .bindPopup('<b>Khu vực cảnh báo</b><br>Nguy cơ ngập do triều cường dâng cao')
        markersRef.current.push(m)
      })
    }

    // Add Camera points
    if (activeFilters.cam) {
      CAM_POINTS.forEach(p => {
        const m = L.marker(p, { icon: mkIcon('cam', ICON_CAM) }).addTo(mapRef.current)
          .bindPopup('<b>Camera giao thông</b><br>Xem hình ảnh ngập thời gian thực')
        markersRef.current.push(m)
      })
    }

    // Add Repair shop points
    if (activeFilters.repair) {
      REPAIR_POINTS.forEach(p => {
        const m = L.marker(p, { icon: mkIcon('repair', ICON_REPAIR) }).addTo(mapRef.current)
          .bindPopup('<b>Tiệm sửa xe</b><br>Hỗ trợ cứu hộ ngập nước khẩn cấp')
        markersRef.current.push(m)
      })
    }
  }

  // Toggle Filters
  const toggleFilter = (type: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Calculate Safe Route (Avoiding Flooded Points)
  const calculateRoute = () => {
    const L = (window as any).L
    if (!L || !mapRef.current) return

    // Clear previous polylines
    routeLinesRef.current.forEach(l => l.remove())
    routeLinesRef.current = []

    const key = `${fromLoc}-${toLoc}`
    const data = ROUTE_DATA[key]

    if (data) {
      // Draw Blocked/Danger Route (Red Dashed Line)
      const blockedLine = L.polyline(data.blocked, {
        color: '#ef233c',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.75
      }).addTo(mapRef.current).bindPopup('Tuyến đường thông thường (Bị ngập lụt)')

      // Draw Safe Route (Green Solid Line)
      const safeLine = L.polyline(data.safe, {
        color: '#16a34a',
        weight: 6,
        opacity: 0.85
      }).addTo(mapRef.current).bindPopup('Tuyến đường an toàn do AI đề xuất')

      routeLinesRef.current.push(blockedLine, safeLine)

      // Fit map view to path bounds
      const group = L.featureGroup([blockedLine, safeLine])
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] })

      setRouteInfo({
        time: data.time,
        distance: data.distance,
        avoided: data.avoided
      })
    }
  }

  return (
    <div className="section-demo" id="experience">
      <div className="section-inner">
        <div className="section-header">
          <div className="eyebrow">Trải nghiệm tính năng</div>
          <div className="section-title">Xem Mekong Pathfinder<br /><span>hoạt động trên dữ liệu thật</span></div>
          <div className="section-desc">
            Các màn hình dưới đây mô phỏng luồng sử dụng chính. Riêng bản đồ dùng OpenStreetMap để hiển thị nền bản đồ thật tại Cần Thơ.
          </div>
        </div>

        <div className="demo-shell">
          <div className="demo-tabs" role="tablist">
            {TABS.map((t, i) => {
              const Icon = t.icon
              return (
                <button
                  key={i}
                  className={`demo-tab${activeTab === i ? ' active' : ''}${t.isComingSoon ? ' coming-soon' : ''}`}
                  type="button"
                  onClick={() => {
                    if (!t.isComingSoon) {
                      setActiveTab(i)
                    }
                  }}
                  style={t.isComingSoon ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
                >
                  <Icon size={15} strokeWidth={2.2} />
                  <span>{t.label}</span>
                  {t.isComingSoon && <span className="coming-soon-badge">Sắp có</span>}
                </button>
              )
            })}
          </div>

          <div className="demo-body">
            {/* ══════ Tab 0: Bản đồ thời gian thực ══════ */}
            <div className={`demo-panel${activeTab === 0 ? ' active' : ''}`}>
              <div className="dp-layout full-map">
                <div className="dp-screen" style={{ position: 'relative', width: '100%' }}>

                  {/* Floating Google Maps Style Card */}
                  <div className="gmaps-float-card">
                    {!isRoutingMode ? (
                      /* Search Mode */
                      <div className="gmaps-search-box">
                        <div className="gmaps-input-wrapper">
                          <Search className="gmaps-search-icon" size={18} />
                          <input
                            type="text"
                            placeholder="Tìm địa điểm, tiệm sửa xe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            className="gmaps-route-toggle-btn"
                            title="Chỉ đường tránh ngập"
                            onClick={() => setIsRoutingMode(true)}
                          >
                            <Navigation size={18} />
                          </button>
                        </div>

                        {/* Search Suggestions or Quick Filters */}
                        <div className="gmaps-quick-suggestions">
                          <span className="suggestion-title">Gợi ý địa điểm:</span>
                          <div className="suggestion-tags">
                            <span onClick={() => setSearchQuery('Bến Ninh Kiều')}>Bến Ninh Kiều</span>
                            <span onClick={() => setSearchQuery('Chợ Cái Răng')}>Chợ Cái Răng</span>
                            <span onClick={() => setSearchQuery('BV Đa Khoa Cần Thơ')}>BV Đa Khoa</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Routing Mode */
                      <div className="gmaps-route-box">
                        <div className="gmaps-route-header">
                          <button className="gmaps-back-btn" onClick={() => {
                            setIsRoutingMode(false);
                            setRouteInfo(null);
                            // Clear route polylines
                            routeLinesRef.current.forEach(l => l.remove());
                            routeLinesRef.current = [];
                            if (mapRef.current) {
                              mapRef.current.setView([10.038, 105.778], 14);
                            }
                          }}>
                            ← Quay lại
                          </button>
                          <span className="gmaps-route-title">Chỉ đường tránh ngập</span>
                        </div>

                        <div className="gmaps-route-inputs">
                          <div className="route-input-row">
                            <span className="route-dot green" />
                            <select value={fromLoc} onChange={(e) => setFromLoc(e.target.value)}>
                              <option value="Bến Ninh Kiều">Từ: Bến Ninh Kiều</option>
                              <option value="Chợ Cái Răng">Từ: Chợ Cái Răng</option>
                            </select>
                          </div>
                          <div className="route-input-row">
                            <span className="route-dot red" />
                            <select value={toLoc} onChange={(e) => setToLoc(e.target.value)}>
                              <option value="BV Đa Khoa Cần Thơ">Đến: BV Đa Khoa Cần Thơ</option>
                              <option value="Sân bay Cần Thơ">Đến: Sân bay Cần Thơ</option>
                            </select>
                          </div>
                        </div>

                        <button className="dp-btn primary gmaps-route-submit" onClick={calculateRoute}>
                          Tìm đường an toàn (AI)
                        </button>

                        {/* Route calculation output */}
                        {routeInfo && (
                          <div className="gmaps-route-result animate-fade-in">
                            <div className="grr-main">
                              <span className="grr-time">{routeInfo.time}</span>
                              <span className="grr-distance">({routeInfo.distance})</span>
                            </div>
                            <div className="grr-detail">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--green)' }}>
                                <ShieldAlert size={14} /> Tránh thành công:
                              </span>
                              <div style={{ paddingLeft: '18px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                {routeInfo.avoided}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Integrated Map Legend & Filters */}
                    <div className="gmaps-filters-section">
                      <div className="gmaps-filter-title">Hiển thị trên bản đồ:</div>
                      <div className="gmaps-filter-buttons">
                        <button
                          className={`filter-pill ${activeFilters.flood ? 'active red' : ''}`}
                          onClick={() => toggleFilter('flood')}
                        >
                          <span className="dot red" /> Điểm ngập
                        </button>
                        <button
                          className={`filter-pill ${activeFilters.warn ? 'active yellow' : ''}`}
                          onClick={() => toggleFilter('warn')}
                        >
                          <span className="dot yellow" /> Cảnh báo
                        </button>
                        <button
                          className={`filter-pill ${activeFilters.cam ? 'active blue' : ''}`}
                          onClick={() => toggleFilter('cam')}
                        >
                          <span className="dot blue" /> Camera
                        </button>
                        <button
                          className={`filter-pill ${activeFilters.repair ? 'active orange' : ''}`}
                          onClick={() => toggleFilter('repair')}
                        >
                          <span className="dot orange" /> Cứu hộ / Sửa xe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Leaflet Map */}
                  <div className="real-map" id="demoRealMap" style={{ height: '580px', width: '100%', zIndex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
