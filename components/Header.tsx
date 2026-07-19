'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import logo04 from '../assets/images/logo_header/logo-04.png';
import logo from '../assets/images/logo_header/logo_icon.png';

// Inline SVG Icon components
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export default function Header() {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('mp-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('mp-theme', next ? 'dark' : 'light');
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="header-inner">
        <a href="#" className="logo">
          <Image
            src={logo04}
            alt="Mekong Pathfinder Logo"
            height={36}
            className="logo-horizontal"
            style={{ width: 'auto', display: 'block' }}
            priority
          />
          <Image
            src={logo}
            alt="Mekong Pathfinder Icon Logo"
            height={40}
            className="logo-vertical"
            style={{ width: 'auto', display: 'block' }}
            priority
          />
        </a>

        <nav>
          <a href="#intro">Giới thiệu</a>
          <a href="#product-demo">Demo</a>
          <a href="#experience">Trải nghiệm</a>
          <a href="#info">Thành tựu</a>
          <a href="#team">Đội ngũ</a>
          <a href="#contact">Liên hệ</a>
        </nav>

        <div className="header-actions">
          {/* <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            title={dark ? 'Sáng' : 'Tối'}
            >
            {dark ? <SunIcon /> : <MoonIcon />}
            </button> */}
          <a className="btn-nav" href="#download">Tải ứng dụng</a>
        </div>
      </div>
    </header>
  );
}