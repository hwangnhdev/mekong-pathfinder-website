export default function SectionTeam() {
  const members = [
    {
      name: 'Nguyễn Văn An',
      role: 'Trưởng nhóm dự án',
      avatar: 'NA',
      color: '#0369a1',
      bio: 'Kỹ sư phần mềm, 8 năm kinh nghiệm trong lĩnh vực IoT và hệ thống cảnh báo sớm.',
    },
    {
      name: 'Trần Thị Bình',
      role: 'Chuyên gia dữ liệu',
      avatar: 'TB',
      color: '#0d9488',
      bio: 'Chuyên gia phân tích dữ liệu địa không gian, từng làm việc tại các tổ chức quốc tế về biến đổi khí hậu.',
    },
    {
      name: 'Lê Hoàng Cường',
      role: 'Kỹ sư AI/ML',
      avatar: 'LC',
      color: '#16a34a',
      bio: 'Nghiên cứu sinh AI, tập trung vào mô hình dự báo ngập và tối ưu lộ trình.',
    },
    {
      name: 'Phạm Thị Dung',
      role: 'UX/UI Designer',
      avatar: 'PD',
      color: '#d97706',
      bio: 'Thiết kế trải nghiệm người dùng cho ứng dụng di động và dashboard vận hành.',
    },
    {
      name: 'Võ Minh Đức',
      role: 'Backend Engineer',
      avatar: 'VD',
      color: '#7c3aed',
      bio: 'Xây dựng hệ thống real-time, API và tích hợp cảm biến IoT.',
    },
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
          <div className="section-desc" style={{ maxWidth: 520, margin: '14px auto 0' }}>
            Đội ngũ đa ngành — từ kỹ thuật, dữ liệu đến thiết kế — cùng chung tay giải
            quyết vấn đề ngập đô thị tại vùng Mekong.
          </div>
        </div>

        <div className="team-grid">
          {members.map((m) => (
            <div key={m.name} className="team-card">
              <div
                className="team-avatar"
                style={{ background: m.color }}
              >
                {m.avatar}
              </div>
              <div className="team-name">{m.name}</div>
              <div className="team-role" style={{ color: m.color }}>{m.role}</div>
              <p className="team-bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}