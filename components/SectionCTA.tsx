import Link from 'next/link';
import Image from 'next/image';

import iconGgplay from '../assets/images/logo_header/icon-ggplay.png';
import iconAppstore from '../assets/images/logo_header/icon-appstore.png';

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
          <Link href="https://apps.apple.com/vn/app/mekong-pathfinder/id6762562496?l=vi" className="cta-badge">
            <Image
              src={iconAppstore}
              alt="Download on the App Store"
              width={170}
              height={50}
              className="cta-badge-img"
              priority
            />
          </Link>
          <Link href="https://play.google.com/store/apps/details?id=com.fpt.mekongpathfinder&hl=en" className="cta-badge">
            <Image
              src={iconGgplay}
              alt="Get it on Google Play"
              width={170}
              height={50}
              className="cta-badge-img"
              priority
            />
          </Link>
        </div>
      </div>
    </div>
  );
}