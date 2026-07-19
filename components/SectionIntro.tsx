'use client';

import React from 'react';
import Image from 'next/image';
import { Navigation, Map, Bell, Users, Brain, LifeBuoy } from 'lucide-react';
import threeSmartPhones from '../assets/images/logo_header/three-smart-phone.png';

export default function SectionIntro() {
  return (
    <section id="intro" className="section-intro">
      <div className="section-intro-container">
        {/* Left column: Content */}
        <div className="intro-content-wrapper">
          <span className="eyebrow">Giới thiệu dự án</span>
          <h2 className="section-title">Mekong Pathfinder</h2>

          <p className="intro-subtitle-highlight" style={{ fontSize: '17px', fontWeight: 600, color: 'var(--primary)', margin: '14px 0', lineHeight: 1.4 }}>
            Nền tảng bản đồ số và dẫn đường thích ứng thông minh tiên phong tại Cần Thơ.
          </p>

          <p className="section-desc" style={{ marginBottom: '28px' }}>
            Kết hợp trí tuệ nhân tạo (AI), dữ liệu camera thời gian thực và phản hồi từ hiện trường để giúp người dân phát hiện ngập lụt, nhận cảnh báo sớm và di chuyển theo lộ trình an toàn nhất trong mùa mưa bão.
          </p>

          {/* Core Features list */}
          <div className="intro-features-block">
            <h3>Các tính năng nổi bật</h3>
            <ul className="intro-features-list">
              <li>
                <span className="feature-check" style={{ color: 'var(--primary)', background: 'rgba(0, 86, 210, 0.12)' }}>
                  <Navigation size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Dẫn đường ưu tiên an toàn</strong>
                  AI đề xuất tuyến đường tránh ngập lụt thời gian thực.
                </div>
              </li>
              <li>
                <span className="feature-check" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
                  <Map size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Bản đồ ngập thời gian thực</strong>
                  Hiển thị trực quan mực nước từ cảm biến và camera.
                </div>
              </li>
              <li>
                <span className="feature-check" style={{ color: '#ef233c', background: 'rgba(239, 35, 60, 0.12)' }}>
                  <Bell size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Cảnh báo sớm</strong>
                  Thông báo tức thời nguy cơ ngập do triều cường, mưa lớn.
                </div>
              </li>
              <li>
                <span className="feature-check" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
                  <Users size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Báo cáo cộng đồng</strong>
                  Người dân chia sẻ và xác thực thông tin ngập tại hiện trường.
                </div>
              </li>
              <li>
                <span className="feature-check" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' }}>
                  <Brain size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Dự báo ngập bằng AI</strong>
                  Dự đoán xu hướng và độ sâu ngập lụt trong những giờ tới.
                </div>
              </li>
              <li>
                <span className="feature-check" style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)' }}>
                  <LifeBuoy size={14} strokeWidth={2.5} />
                </span>
                <div>
                  <strong>Hỗ trợ khẩn cấp</strong>
                  Tìm kiếm điểm sửa xe, cứu hộ và bãi đỗ an toàn gần nhất.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right column: Smartphone Image */}
        <div className="intro-image-wrapper">
          <div className="intro-image-glow" />
          <Image
            src={threeSmartPhones}
            alt="Mekong Pathfinder Smartphones"
            className="intro-phone-img"
            priority
          />
        </div>
      </div>
    </section>
  );
}
