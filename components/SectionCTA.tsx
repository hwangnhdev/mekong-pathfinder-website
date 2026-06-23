import Link from 'next/link';

export default function SectionCTA() {
  return (
    <div className="section-cta" id="download">
      <div className="cta-aura cta-aura-1" />
      <div className="cta-aura cta-aura-2" />
      <div className="cta-inner">
        <div className="cta-tag">Tải ngay · Miễn phí hoàn toàn</div>
        <h2 className="cta-title">Sẵn sàng đi<br />an toàn hơn?</h2>
        <p className="cta-desc">
          Tải Mekong Pathfinder ngay hôm nay — bảo vệ bản thân, gia đình và chia sẻ thông tin
          ngập cho cộng đồng. Miễn phí, hoạt động offline và không cần đăng ký.
        </p>
        <div className="cta-actions">
          <Link href="#" className="btn-white">🍎 Tải trên App Store</Link>
          <Link href="#" className="btn-outline-white">🤖 Tải trên Google Play</Link>
        </div>
      </div>
    </div>
  );
}