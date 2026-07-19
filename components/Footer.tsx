import Link from 'next/link';
import Image from 'next/image';

import logo04 from '../assets/images/logo_header/logo-04.png';

// Inline SVG Icon components
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
      <polygon points="10 15 15 12 10 9" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <Image
              src={logo04}
              alt="Mekong Pathfinder Logo"
              height={36}
              className="logo-full-img"
              style={{ width: 'auto', display: 'block' }}
            />
          </div>
          <div className="footer-tagline">
            Giải pháp đô thị bền vững — giúp người dân Cần Thơ và toàn vùng Mekong di
            chuyển an toàn trong mùa mưa lũ bằng công nghệ AI.
          </div>
          <div className="social-links">
            <a className="social-btn" href="https://www.facebook.com/mekongpathfinder/" aria-label="Facebook"><FacebookIcon /></a>
            <a className="social-btn" href="https://www.youtube.com/@MekongPathfinder" aria-label="YouTube"><YoutubeIcon /></a>
            <a className="social-btn" href="https://github.com/mekongpathfinders" aria-label="GitHub"><GithubIcon /></a>
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
        <span>Được xây dựng cho <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Cần Thơ</span> · Powered by AI</span>
      </div>
    </footer>
  );
}