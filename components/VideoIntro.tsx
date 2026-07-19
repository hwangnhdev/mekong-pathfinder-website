'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function VideoIntro() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClose = () => {
    if (fade) return;

    // Freeze the video immediately at the current frame
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setFade(true);
    setTimeout(() => {
      setShow(false);
    }, 1800); // 1.8s slow fadeout
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setMuted(nextMuted);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Stop the video and start the slow fade-out 1.2 seconds before the file ends.
    // This bypasses the black frames at the end of the mp4 file, freezing on a clear content frame!
    if (video.duration && video.currentTime >= video.duration - 1.2) {
      handleClose();
    }
  };

  // Prevent scroll when intro is showing
  useEffect(() => {
    if (show && !fade) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show, fade]);

  if (!show) return null;

  return (
    <div className={`video-intro-overlay ${fade ? 'fade-out' : ''}`}>
      <video
        ref={videoRef}
        src="/mk_intro.mp4"
        autoPlay
        muted={muted}
        playsInline
        onEnded={handleClose}
        onTimeUpdate={handleTimeUpdate}
        className="video-intro-player"
      />

      <div className="video-intro-controls">
        <button className="intro-btn mute-btn" onClick={toggleMute} aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}>
          {muted ? '🔇 Bật âm' : '🔊 Tắt âm'}
        </button>
        <button className="intro-btn skip-btn" onClick={handleClose}>
          Bỏ qua giới thiệu ➔
        </button>
      </div>
    </div>
  );
}
