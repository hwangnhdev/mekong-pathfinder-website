'use client';

import React, { useState } from 'react';

export default function SectionProductDemo() {
  const [play, setPlay] = useState(false);

  return (
    <section className="section-video-demo" id="product-demo">
      <div className="section-inner">
        <div className="section-header" style={{ textAlign: 'center', margin: '0 auto 32px', maxWidth: '850px' }}>
          <span className="eyebrow">Demo sản phẩm</span>
          <h2 className="section-title">Video giới thiệu <span>Mekong Pathfinder</span></h2>
          <p className="section-desc" style={{ margin: '14px auto 0' }}>
            Theo dõi thước phim thực tế mô tả đầy đủ các tính năng dẫn đường thông minh, cảnh báo ngập lụt và sức mạnh phối hợp cộng đồng của giải pháp.
          </p>
        </div>

        <div className="video-player-container">
          <div className="video-player-glow" />
          <div className="video-player-shell">
            {!play ? (
              <div className="video-placeholder" onClick={() => setPlay(true)}>
                <div className="video-overlay-tint" />

                {/* Background image mockup using YouTube high-res thumbnail */}
                <div className="video-preview-bg" />

                <div className="play-button-outer">
                  <div className="play-button-pulsing" />
                  <button className="play-button" aria-label="Phát video">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                </div>

                <div className="video-hint-text">Bấm để xem thước phim giới thiệu</div>
              </div>
            ) : (
              <iframe
                src="https://www.youtube.com/embed/XxICY48htJM?autoplay=1&rel=0"
                title="Mekong Pathfinder Video Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="video-iframe"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
