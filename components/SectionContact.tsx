'use client';

import React, { useState } from 'react';

const FAQ_DATA = [
  {
    question: 'Mekong Pathfinder có hoạt động khi không có Internet (offline) không?',
    answer: 'Có. Ứng dụng hỗ trợ lưu trữ cục bộ (cache) dữ liệu bản đồ nền Cần Thơ và lộ trình gần nhất. Bạn vẫn có thể định vị cơ bản và xem lại các cảnh báo ngập lụt đã được tải trước đó ngay cả khi kết nối mạng yếu hoặc mất mạng đột ngột.'
  },
  {
    question: 'Dữ liệu cảnh báo điểm ngập thời gian thực được thu thập từ đâu?',
    answer: 'Dữ liệu được cập nhật liên tục từ mạng lưới cảm biến đo mực nước tự động tại các cống triều cường Cần Thơ, kết hợp với dữ liệu dự báo triều trạm khí tượng thủy văn, và báo cáo hiện trường thực tế từ cộng đồng đã qua bộ lọc xác minh tự động của AI.'
  },
  {
    question: 'Tôi có thể đóng góp báo cáo ngập úng hoặc kẹt xe bằng cách nào?',
    answer: 'Ngay trên bản đồ ứng dụng, bạn bấm nút "Báo cáo", chọn mức nước ước tính (Dưới 30cm, 30-60cm, Trên 60cm) và chụp ảnh/nhập mô tả nhanh. AI của hệ thống sẽ đối chiếu dữ liệu hình ảnh và duyệt hiển thị lên bản đồ chung sau 2 giây.'
  },
  {
    question: 'Dự án Mekong Pathfinder có thu phí hay quảng cáo không?',
    answer: 'Hoàn toàn không. Mekong Pathfinder là một giải pháp công nghệ phi lợi nhuận hướng tới cộng đồng. Ứng dụng được cung cấp miễn phí 100%, không chứa quảng cáo nhằm đảm bảo trải nghiệm cứu hộ giao thông thông suốt và an toàn nhất cho người dân.'
  }
];

export default function SectionContact() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Contact Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setFormStatus('error');
      return;
    }

    setFormStatus('loading');
    // Simulate API request
    setTimeout(() => {
      setFormStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  return (
    <section className="section-contact" id="contact">
      <div className="section-inner">
        <div className="section-header" style={{ textAlign: 'center', margin: '0 auto 52px', maxWidth: '720px' }}>
          <span className="eyebrow">Liên hệ</span>
          <h2 className="section-title">Kết nối với <span>Mekong Pathfinder</span></h2>
          <p className="section-desc" style={{ margin: '14px auto 0' }}>
            Bạn có câu hỏi, góp ý hay muốn hợp tác phát triển dự án? Hãy gửi lời nhắn cho chúng tôi hoặc tham khảo các giải đáp nhanh bên dưới.
          </p>
        </div>

        <div className="contact-layout-grid">
          {/* Left Column: FAQ (Các câu hỏi thường gặp) */}
          <div className="contact-faq-wrapper">
            <h3 className="contact-sub-title">Câu hỏi thường gặp (FAQ)</h3>
            <div className="faq-accordion-list">
              {FAQ_DATA.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button 
                      className="faq-question-btn" 
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      type="button"
                    >
                      <span>{faq.question}</span>
                      <span className="faq-icon-arrow">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                    <div className="faq-answer-container">
                      <div className="faq-answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact & Feedback Form */}
          <div className="contact-form-wrapper">
            <div className="contact-card-shell">
              <h3 className="contact-sub-title">Gửi phản hồi & Liên hệ</h3>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="contact-name">Họ và tên</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formStatus === 'error') setFormStatus('idle');
                    }}
                    placeholder="Nguyễn Văn A" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formStatus === 'error') setFormStatus('idle');
                    }}
                    placeholder="an.nguyen@example.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Lời nhắn / Phản hồi (Feedback)</label>
                  <textarea 
                    id="contact-message" 
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (formStatus === 'error') setFormStatus('idle');
                    }}
                    placeholder="Nhập nội dung góp ý hoặc thông tin liên hệ của bạn tại đây..." 
                    required 
                  />
                </div>

                {formStatus === 'error' && (
                  <div className="form-alert error">
                    Vui lòng điền đầy đủ tất cả các trường thông tin!
                  </div>
                )}

                {formStatus === 'success' && (
                  <div className="form-alert success">
                    🎉 Gửi thông tin thành công! Cảm ơn phản hồi quý báu của bạn.
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className={`btn-submit ${formStatus === 'loading' ? 'loading' : ''}`}
                    disabled={formStatus === 'loading'}
                  >
                    {formStatus === 'loading' ? (
                      <span className="btn-loading-spinner"></span>
                    ) : (
                      <>
                        Gửi liên hệ
                        <span className="arrow-icon">➔</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
