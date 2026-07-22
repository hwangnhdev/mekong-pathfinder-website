'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lock } from 'lucide-react';

import post01 from '@/assets/images/archivement/731163862_1012850201126800_5294882283063890765_n(1).jpg';
import post02 from '@/assets/images/archivement/743811438_122137043955032137_6758588861132280663_n.jpg';
import post03 from '@/assets/images/archivement/710755064_1411913460972199_4669303431134683917_n.jpg';
import post04 from '@/assets/images/archivement/735476198_122120831732776852_7305649178693458863_n.jpg';
import post05 from '@/assets/images/archivement/Fpt-1.jpeg';
import post06 from '@/assets/images/archivement/597791670_122165768480761169_2079736875180653798_n.jpg';

const TABS = ['Thành tựu', 'Báo chí', 'Blog'];

const PRESS_DATA = [
  {
    source: 'VTV9',
    title: 'Mekong Pathfinder - Nền tảng số dẫn đường và cảnh báo ngập lụt đô thị hàng đầu tại Cần Thơ.',
    date: '12/10/2025',
    desc: 'Đài Truyền hình Việt Nam đưa tin về tính thực tiễn cao của ứng dụng bản đồ cộng đồng trong việc hỗ trợ người dân di chuyển mùa triều cường.',
    url: '#'
  },
  {
    source: 'Báo Tuổi Trẻ',
    title: 'Giải pháp công nghệ thích ứng triều cường hiệu quả của đội ngũ kỹ sư trẻ Cần Thơ.',
    date: '05/09/2025',
    desc: 'Báo Tuổi Trẻ đánh giá cao khả năng tích hợp trí tuệ nhân tạo (AI) giúp phân tích và tối ưu hóa tuyến đường tránh các điểm ngập cục bộ.',
    url: '#'
  },
  {
    source: 'Báo Thanh Niên',
    title: 'Người dân miền Tây chung tay cập nhật bản đồ ngập lụt qua Mekong Pathfinder.',
    date: '28/08/2025',
    desc: 'Hành trình xây dựng mạng lưới bản đồ số cộng đồng lớn nhất khu vực ĐBSCL, nơi mỗi người dân là một cảm biến giao thông.',
    url: '#'
  },
  {
    source: 'VTV Cần Thơ',
    title: 'Công nghệ đồng hành cùng đô thị sông nước thích ứng với nước biển dâng.',
    date: '15/08/2025',
    desc: 'Báo cáo phóng sự đặc biệt về các thiết bị cảm biến triều cường kết nối trực tiếp với ứng dụng Mekong Pathfinder.',
    url: '#'
  }
];

interface MDXArticle {
  slug: string;
  metadata: {
    title: string;
    date: string;
    category: string;
    desc: string;
    cover: string;
  };
  content: string;
}

export default function SectionInfo() {
  const [activeTab, setActiveTab] = useState(1);
  const [achievements, setAchievements] = useState<MDXArticle[]>([]);
  const [blogs, setBlogs] = useState<MDXArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<MDXArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.achievements) setAchievements(data.achievements);
        if (data.blog) setBlogs(data.blog);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching content:', err);
        setLoading(false);
      });
  }, []);

  const renderMarkdown = (md: string) => {
    return md.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="md-h1">{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="md-h2">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="md-h3">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith('- ')) {
        return <li key={idx} className="md-li">{trimmed.slice(2)}</li>;
      }
      if (trimmed === '') return <br key={idx} />;
      return <p key={idx} className="md-p">{line}</p>;
    });
  };

  return (
    <section className="section-info" id="info">
      <div className="section-inner">
        <div className="section-header" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: '800px' }}>
          <span className="eyebrow">Thành tựu</span>
          <h2 className="section-title">Thành tựu & <span>Truyền thông</span></h2>
          <p className="section-desc" style={{ margin: '14px auto 0' }}>
            Cập nhật những cột mốc nổi bật, bài viết chuyên sâu và tin tức báo chí mới nhất của Mekong Pathfinder.
          </p>
        </div>

        {/* Info Tabs */}
        <div className="info-tabs-wrapper">
          <div className="info-tabs" role="tablist">
            {/* Tab 0: Thành tựu (Khóa) */}
            <button
              disabled
              className="info-tab locked-tab"
              type="button"
              role="tab"
              title="Tính năng đang phát triển"
              style={{ cursor: 'not-allowed', opacity: 0.5, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Lock size={14} />
              Thành tựu
            </button>

            {/* Tab 1: Báo chí (Hoạt động) */}
            <button
              className={`info-tab ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
              type="button"
              role="tab"
              aria-selected={activeTab === 1}
            >
              Báo chí
            </button>

            {/* Tab 2: Blog (Khóa) */}
            <button
              disabled
              className="info-tab locked-tab"
              type="button"
              role="tab"
              title="Tính năng đang phát triển"
              style={{ cursor: 'not-allowed', opacity: 0.5, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Lock size={14} />
              Blog
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="info-panels-container">

          {/* PANEL 0: Thành tựu (Story & Stats & MDX Cards) */}
          <div className={`info-panel ${activeTab === 0 ? 'active' : ''}`} role="tabpanel">
            {loading ? (
              <div className="content-loader">Đang tải bài viết...</div>
            ) : (
              <>
                <div className="press-scroll-container">
                  {achievements.map((item, idx) => (
                    <div key={idx} className="press-card-wrapper">
                      <div className="info-grid-card clickable-card" style={{ height: '100%' }} onClick={() => setSelectedArticle(item)}>
                        <div className="card-top">
                          <span className="press-source">{item.metadata.category}</span>
                          <span className="card-date">{item.metadata.date}</span>
                        </div>
                        <h3 className="card-heading">{item.metadata.title}</h3>
                        <p className="card-paragraph">{item.metadata.desc}</p>
                        <div className="card-link-action">Xem chi tiết bài viết ➔</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="scroll-hint-text">➔ Vuốt ngang để xem thêm thành tựu</div>
              </>
            )}
          </div>

          {/* PANEL 1: Báo chí (Grid layout matching test.html) */}
          <div className={`info-panel ${activeTab === 1 ? 'active' : ''}`} role="tabpanel">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {/* Featured Card 1 (Large) */}
              <article className="relative md:col-span-4 lg:col-span-4 min-h-[340px] md:aspect-[16/9] rounded-[28px] overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://www.facebook.com/share/p/18EM8omtyM/" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Hoạt động nổi bật của Mekong Pathfinder"></a>
                <Image alt="Hoạt động nổi bật" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post01} priority />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-50% to-transparent flex flex-col justify-end p-6 md:p-10 z-10 pointer-events-none">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">GIẢI THƯỞNG</span>
                    <span className="text-slate-300 text-xs font-medium">2026-06-25</span>
                  </div>
                  <h3 className="text-white text-xl md:text-3xl font-extrabold mb-2.5 leading-tight group-hover:text-blue-300 transition-colors line-clamp-2 drop-shadow-md">Mekong Pathfinder giành Giải Nhất & Pitching Xuất sắc nhất DECIC 2026</h3>
                  <p className="text-slate-200 text-sm md:text-base max-w-2xl hidden md:block line-clamp-2 leading-relaxed drop-shadow">Giải Nhất Digital Era Creative Innovation Competition 2026 và Giải Pitching xuất sắc nhất. Dự án đã xuất sắc vượt qua hàng trăm đội thi trên toàn quốc.</p>
                </div>
              </article>

              {/* Small Card 1 */}
              <article className="relative md:col-span-2 lg:col-span-2 min-h-[280px] aspect-[4/5] md:aspect-auto rounded-[28px] overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://www.viettelsoftware.com/viettel-software-dong-hanh-cung-digital-era-creative-innovation-competition-2026.html" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Viettel Software đồng hành"></a>
                <Image alt="Sự kiện cộng đồng" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post02} />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-55% to-transparent flex flex-col justify-end p-5 md:p-6 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">ĐỒNG HÀNH</span>
                    <span className="text-slate-300 text-xs font-medium">2026-06-25</span>
                  </div>
                  <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors drop-shadow-md">Viettel Software đồng hành cùng Digital Era Creative Innovation Competition 2026</h3>
                </div>
              </article>

              {/* Small Card 2 */}
              <article className="relative md:col-span-2 lg:col-span-2 min-h-[280px] aspect-[4/5] md:aspect-auto rounded-[28px] overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://startupwheel.vn/vi/top-100-startup-wheel-2026/" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Startup Wheel 2026"></a>
                <Image alt="Đối tác" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post03} />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-55% to-transparent flex flex-col justify-end p-5 md:p-6 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">KHỞI NGHIỆP</span>
                    <span className="text-slate-300 text-xs font-medium">2026-06-01</span>
                  </div>
                  <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors drop-shadow-md">Mekong Pathfinder lọt Top 100 Startup Wheel 2026</h3>
                </div>
              </article>

              {/* Featured Card 2 (Medium/Wide) */}
              <article className="relative md:col-span-4 lg:col-span-4 min-h-[300px] aspect-[2/1] rounded-[28px] overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://www.facebook.com/share/p/1CGEG8BXKk/" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Mekong Pathfinder"></a>
                <Image alt="Dự án số hóa" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post04} />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-50% to-transparent flex flex-col justify-end p-6 md:p-8 z-10 pointer-events-none">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">LAN TỎA DỰ ÁN</span>
                    <span className="text-slate-300 text-xs font-medium">2026-06-27</span>
                  </div>
                  <h3 className="text-white text-lg md:text-2xl font-bold mb-1.5 leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 drop-shadow-md">Mekong Pathfinder - Bản đồ sống chống ngập cho Đồng bằng sông Cửu Long</h3>
                  <p className="text-slate-200 text-xs md:text-sm line-clamp-2 max-w-xl leading-relaxed drop-shadow">Ứng dụng AI + dữ liệu cộng đồng giúp người dân Cần Thơ và ĐBSCL di chuyển an toàn hơn trong mùa ngập.</p>
                </div>
              </article>

              {/* Small Card 3 */}
              <article className="relative md:col-span-3 lg:col-span-3 min-h-[260px] aspect-[16/9] rounded-[28px] overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://laodong.vn/giao-duc/ung-dung-ai-sinh-vien-can-tho-tim-loi-giai-cho-do-thi-ngap-nuoc-1704149.ldo" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Ứng dụng AI chống ngập"></a>
                <Image alt="Kiến thức" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post05} />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-55% to-transparent flex flex-col justify-end p-5 md:p-6 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">BÁO LAO ĐỘNG  </span>
                    <span className="text-slate-300 text-xs font-medium">2026-04</span>
                  </div>
                  <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors drop-shadow-md">Sinh viên Cần Thơ dùng AI giải bài toán ngập nước đô thị</h3>
                </div>
              </article>

              {/* Small Card 4 */}
              <article className="relative md:col-span-3 lg:col-span-3 min-h-[260px] aspect-[16/9] rounded-[28px] overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200/20 dark:border-slate-800">
                <a href="https://daihoc.fpt.edu.vn/tin-tuc/khi-sinh-vien-khong-chi-hoc-cong-nghe-ma-con-giai-bai-toan-cua-do-thi-mien-tay/" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Mekong Pathfinder FPT Cần Thơ"></a>
                <Image alt="Tổng kết" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={post06} />
                <div style={{ padding: "18px" }} className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 via-55% to-transparent flex flex-col justify-end p-5 md:p-6 z-10 pointer-events-none">
                  <span className="bg-primary text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">HÀNH TRÌNH</span>
                  <span className="text-slate-300 text-xs font-medium">2026-04-03</span>
                  <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors drop-shadow-md">Khi sinh viên FPT Cần Thơ không chỉ học công nghệ mà còn giải bài toán thực tế của miền Tây</h3>
                </div>
              </article>
            </div>

            {/* Footer Indicator */}
            {/* <div className="mt-8 flex justify-center">
              <a
                href="https://facebook.com/mekongpathfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3 rounded-full border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 group"
              >
                Xem thêm bài viết
                <span className="text-[18px] group-hover:translate-y-1 transition-transform">↓</span>
              </a>
            </div> */}
          </div>

          {/* PANEL 2: Blog (MDX Cards) */}
          <div className={`info-panel ${activeTab === 2 ? 'active' : ''}`} role="tabpanel">
            {loading ? (
              <div className="content-loader">Đang tải bài viết...</div>
            ) : (
              <div className="info-cards-grid-layout">
                {blogs.map((item, idx) => (
                  <div key={idx} className="info-grid-card clickable-card" onClick={() => setSelectedArticle(item)}>
                    <div className="card-top">
                      <span className="blog-category">{item.metadata.category}</span>
                      <span className="card-date">{item.metadata.date}</span>
                    </div>
                    <h3 className="card-heading">{item.metadata.title}</h3>
                    <p className="card-paragraph">{item.metadata.desc}</p>
                    <div className="card-link-action">Đọc bài viết ➔</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div className="article-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="article-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedArticle(null)} aria-label="Đóng">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="modal-article-header">
              <span className="press-source" style={{ textTransform: 'uppercase' }}>{selectedArticle.metadata.category}</span>
              <span className="card-date">{selectedArticle.metadata.date}</span>
            </div>
            <div className="modal-article-body">
              {renderMarkdown(selectedArticle.content)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
