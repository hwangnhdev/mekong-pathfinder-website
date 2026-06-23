import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <div className="footer-logo-icon">🌊</div>
            Mekong Pathfinder
          </div>
          <div className="footer-tagline">
            Giải pháp đô thị bền vững — giúp người dân Cần Thơ và toàn vùng Mekong di
            chuyển an toàn trong mùa mưa lũ bằng công nghệ AI.
          </div>
          <div className="social-links">
            <a className="social-btn" href="#">𝑓</a>
            <a className="social-btn" href="#">▶</a>
            <a className="social-btn" href="#">⌥</a>
            <a className="social-btn" href="#">Z</a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="#">Bản đồ ngập</a></li>
            <li><a href="#">Dẫn đường AI</a></li>
            <li><a href="#">Cảnh báo sớm</a></li>
            <li><a href="#">Báo cáo cộng đồng</a></li>
            <li><a href="#">Dashboard đô thị</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Thông tin</h4>
          <ul>
            <li><a href="#">Thành tựu</a></li>
            <li><a href="#">Đội ngũ</a></li>
            <li><a href="#">Câu chuyện</a></li>
            <li><a href="#">Báo chí</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Tải ứng dụng</a></li>
            <li><a href="#">Hướng dẫn sử dụng</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Mekong Pathfinder. Bảo lưu mọi quyền.</span>
        <span>Được xây dựng cho <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Cần Thơ</span> · Powered by AI 🤖</span>
      </div>
    </footer>
  );
}