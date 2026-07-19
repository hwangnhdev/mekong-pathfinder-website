'use client';

import React from 'react';
import Image from 'next/image';
import aiSolution from '../assets/images/application/ai-solution.png';

export default function SectionAISolution() {
  return (
    <section className="section-ai-solution" id="ai-solution">
      <div className="section-inner">
        {/* Header left-aligned above the grid */}
        <div className="section-header" style={{ marginBottom: '48px', maxWidth: '800px' }}>
          <span className="eyebrow">Cơ chế hoạt động</span>
          <h2 className="section-title">Hệ thống AI <span>thích ứng thông minh</span></h2>
          <p className="section-desc" style={{ marginTop: '14px' }}>
            Mekong Pathfinder vận hành như một thực thể sống kỹ thuật số, liên tục tiếp nhận dữ liệu thực tế và phân tích để đưa ra những chỉ dẫn giao thông an toàn nhất cho người dân Cần Thơ.
          </p>
        </div>

        <div className="ai-solution-grid">
          {/* Left Column: AI Solution Image Diagram */}
          <div className="ai-solution-image-container">
            <div className="ai-solution-glow" />
            <div className="ai-solution-card-shell">
              <div className="mockup-header">
                <div className="mockup-dots"><span /><span /><span /></div>
                <span className="mockup-title">AI Engine Architecture</span>
              </div>
              <div className="mockup-image-wrap">
                <Image
                  src={aiSolution}
                  alt="Mekong Pathfinder AI Solution Mechanism Diagram"
                  className="ai-solution-img"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column: Steps */}
          <div className="ai-solution-content">
            <div className="mechanism-steps">
              <div className="m-step">
                <div className="m-step-number">01</div>
                <div className="m-step-body">
                  <h3>Thu thập dữ liệu đa nguồn</h3>
                  <p>Hệ thống tự động đồng bộ lượng mưa thời gian thực, số liệu triều cường từ trạm đo khí tượng thủy văn và trạng thái dòng chảy từ 247 cảm biến IoT.</p>
                </div>
              </div>

              <div className="m-step">
                <div className="m-step-number">02</div>
                <div className="m-step-body">
                  <h3>Xác thực hình ảnh bằng AI</h3>
                  <p>Mô hình Computer Vision tự động phân tích hình ảnh ngập do cộng đồng gửi lên để xác minh độ sâu, trạng thái vật cản và loại bỏ các tin báo lỗi sau 2 giây.</p>
                </div>
              </div>

              <div className="m-step">
                <div className="m-step-number">03</div>
                <div className="m-step-body">
                  <h3>Tối ưu hóa lộ trình tránh ngập</h3>
                  <p>Thuật toán tìm đường AI tự động gán hệ số cản trở cực cao cho các tuyến ngập sâu, tính toán lại hành trình an toàn nhất để đề xuất tức thời cho người dùng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
