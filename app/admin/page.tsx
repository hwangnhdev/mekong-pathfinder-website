'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LogIn, ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import logo04 from '../../assets/images/logo_header/logo-04.png';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const token = localStorage.getItem('mp-admin-token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/admin/dashboard';
      }
    } catch {
      // Token invalid, stay on login
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mp-admin-token', data.token);
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.error || 'Đăng nhập thất bại.');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="admin-login-page">
      {/* Background animated gradient */}
      <div className="admin-login-bg" />

      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Logo */}
          <div className="admin-login-logo">
            <Image
              src={logo04}
              alt="Mekong Pathfinder"
              height={36}
              style={{ width: 'auto' }}
              priority
            />
          </div>

          {/* Header */}
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <ShieldCheck size={28} />
            </div>
            <h1>Bảng điều khiển quản trị</h1>
            <p>Vui lòng đăng nhập để quản lý trò chơi, nội dung và hệ thống Mekong Pathfinder.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="admin-username">Tên đăng nhập</label>
              <input
                id="admin-username"
                type="text"
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Mật khẩu</label>
              <div className="admin-pw-wrapper">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-login-error">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="admin-spinner" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/">← Trở về Trang chủ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
