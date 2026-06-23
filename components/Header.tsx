export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <a href="#" className="logo">
          <div className="logo-icon">🌊</div>
          Mekong Pathfinder
          <div className="logo-pulse" />
        </a>
        <nav>
          <a href="#">Trang chủ</a>
          <a href="#solution">Thành tựu</a>
          <a href="#team">Đội ngũ</a>
          <a className="btn-nav" href="#download">Tải ứng dụng</a>
        </nav>
      </div>
    </header>
  )
}