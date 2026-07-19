'use client';

import React, { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState(0);
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
            {TABS.map((tab, idx) => (
              <button
                key={idx}
                className={`info-tab ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
                type="button"
                role="tab"
                aria-selected={activeTab === idx}
              >
                {tab}
              </button>
            ))}
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

          {/* PANEL 1: Báo chí (Horizontal scroll cards) */}
          <div className={`info-panel ${activeTab === 1 ? 'active' : ''}`} role="tabpanel">
            <div className="press-scroll-container">
              {PRESS_DATA.map((item, idx) => (
                <div key={idx} className="press-card-wrapper">
                  <a href={item.url} className="info-grid-card press-card" style={{ height: '100%' }}>
                    <div className="card-top">
                      <span className="press-source">{item.source}</span>
                      <span className="card-date">{item.date}</span>
                    </div>
                    <h3 className="card-heading">{item.title}</h3>
                    <p className="card-paragraph">{item.desc}</p>
                    <div className="card-link-action">Đọc bài viết gốc ➔</div>
                  </a>
                </div>
              ))}
            </div>
            <div className="scroll-hint-text">➔ Vuốt ngang để xem thêm bài viết báo chí</div>
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
