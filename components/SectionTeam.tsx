export default function SectionTeam() {
  const members = [
    {
      name: 'Nguyễn Văn An',
      role: 'Trưởng nhóm dự án',
      avatar: 'NA',
      color: '#4361ee',
      bio: 'Kỹ sư phần mềm, 8 năm kinh nghiệm trong lĩnh vực IoT và hệ thống cảnh báo sớm.',
    },
    {
      name: 'Trần Thị Bình',
      role: 'Chuyên gia dữ liệu',
      avatar: 'TB',
      color: '#00b4d8',
      bio: 'Chuyên gia phân tích dữ liệu địa không gian, từng làm việc tại các tổ chức quốc tế về biến đổi khí hậu.',
    },
    {
      name: 'Lê Hoàng Cường',
      role: 'Kỹ sư AI/ML',
      avatar: 'LC',
      color: '#2dc653',
      bio: 'Nghiên cứu sinh AI, tập trung vào mô hình dự báo ngập và tối ưu lộ trình.',
    },
    {
      name: 'Phạm Thị Dung',
      role: 'UX/UI Designer',
      avatar: 'PD',
      color: '#f4a261',
      bio: 'Thiết kế trải nghiệm người dùng cho ứng dụng di động và dashboard vận hành.',
    },
    {
      name: 'Võ Minh Đức',
      role: 'Backend Engineer',
      avatar: 'VD',
      color: '#e040fb',
      bio: 'Xây dựng hệ thống real-time, API và tích hợp cảm biến IoT.',
    },
  ];

  return (
    <div className="section-team" id="team" style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #ffffff 0%, #f7faff 48%, #ffffff 100%)' }}>
      <div className="section-inner" style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="eyebrow" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '16px' }}>Đội ngũ</div>
          <div className="section-title" style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--text)' }}>Những người xây dựng<br /><span style={{ color: 'var(--primary)' }}>Mekong Pathfinder</span></div>
          <div className="section-desc" style={{ fontSize: '17px', color: 'var(--text-muted)', marginTop: '16px', maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>Đội ngũ đa ngành — từ kỹ thuật, dữ liệu đến thiết kế — cùng chung tay giải quyết vấn đề ngập đô thị.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '20px' }}>
          {members.map((m) => (
            <div key={m.name} style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '16px', border: '1px solid rgba(67,97,238,0.12)', background: 'var(--bg-card)', boxShadow: '0 8px 30px rgba(31,45,89,0.05)', transition: 'transform 0.25s, box-shadow 0.25s' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, margin: '0 auto 16px', boxShadow: `0 4px 16px ${m.color}44` }}>
                {m.avatar}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{m.name}</h4>
              <div style={{ fontSize: '12px', fontWeight: 600, color: m.color, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.role}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}