import Image from 'next/image';
import img1 from '@/assets/images/members/Picsart_26-03-23_08-58-16-479.png';
import img2 from '@/assets/images/members/Picsart_26-03-23_09-00-44-512.png';
import img3 from '@/assets/images/members/Picsart_26-03-23_09-01-03-867.png';
import img4 from '@/assets/images/members/Picsart_26-03-23_09-01-22-698.png';
import img5 from '@/assets/images/members/Picsart_26-03-23_09-07-27-394.png';

export default function SectionTeam() {
  const members = [

    {
      name: 'Nguyễn Thị Thu Thảo',
      mainRole: 'Chief Communications Officer (CCO)',
      specRole: 'Digital Marketing & PR',
      image: img4,
      color: '#0369a1',
      bio: 'Xây dựng chiến lược truyền thông, Digital Marketing & quản lý cộng đồng. Quan hệ đối tác và quảng bá thương hiệu.',
    },
    {
      name: 'Huỳnh Nghiêm Tố Trân',
      mainRole: 'Chief Brand Officer (CBO)',
      specRole: 'UI/UX & Brand Design',
      image: img3,
      color: '#0d9488',
      bio: 'Thiết kế UI/UX và trải nghiệm người dùng. Xây dựng nhận diện thương hiệu, thiết kế hình ảnh và tài liệu truyền thông.',
    },
    {
      name: 'Huỳnh Ngọc Như Quỳnh',
      mainRole: 'CEO & Head of AI',
      specRole: 'AI & Flood Intelligence',
      image: img1,
      color: '#16a34a',
      bio: 'Định hướng chiến lược & phát triển sản phẩm. Nghiên cứu AI, Computer Vision & Flood Intelligence. Quản lý dự án và kết nối đối tác.',
    },
    {
      name: 'Tăng Thành Vui',
      mainRole: 'Chief Technology Officer (CTO)',
      specRole: 'Backend & Cloud Infrastructure',
      image: img5,
      color: '#d97706',
      bio: 'Thiết kế kiến trúc hệ thống, phát triển backend & cloud infrastructure. Đảm bảo hiệu năng và khả năng mở rộng của nền tảng.',
    },
    {
      name: 'Nguyễn Huy Hoàng',
      mainRole: 'Chief Financial Officer (CFO)',
      specRole: 'Product Owner & Software',
      image: img2,
      color: '#7c3aed',
      bio: 'Định hướng phát triển sản phẩm, phân tích thị trường và mô hình kinh doanh. Xây dựng roadmap sản phẩm, lập kế hoạch tài chính và hỗ trợ gọi vốn.',
    }
  ];

  return (
    <div className="section-team" id="team">
      <div className="section-inner">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="eyebrow">Đội ngũ</div>
          <div className="section-title">
            Những người xây dựng<br />
            <span>Mekong Pathfinder</span>
          </div>
          <div className="section-desc" style={{ maxWidth: 540, margin: '14px auto 0' }}>
            Đội ngũ sinh viên Đa ngành từ Trường Đại học FPT Cần Thơ — kết hợp đam mê công nghệ và tinh thần trách nhiệm với cộng đồng.
          </div>
        </div>

        <div className="team-grid">
          {members.map((m) => (
            <div key={m.name} className="team-card">
              <div
                className="team-avatar"
                style={{
                  width: 130,
                  height: 130,
                  background: 'transparent',
                  overflow: 'hidden',
                  position: 'relative',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                }}
              >
                <Image src={m.image} alt={m.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
              </div>
              <div className="team-name">{m.name}</div>

              {/* 2 Roles formatted on 2 distinct lines */}
              <div className="team-roles-block" style={{ minHeight: 46, display: 'flex', flexDirection: 'column', flexFlow: 'column nowrap', justifyContent: 'center', marginBottom: 10 }}>
                <div className="team-role" style={{ color: 'var(--primary)', margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {m.mainRole}
                </div>
                <div className="team-spec-role" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {m.specRole}
                </div>
              </div>

              <p className="team-bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}