'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError('Email atau password salah!');
      setPassword('');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="login-page">
      <div className="hero-bg-logo-single">
        <Image src="/logo.png" alt="" width={400} height={400} draggable={false} />
      </div>
      <div className="login-container">
        <div className="login-left">
          <div className="brand-section">
            <div className="logo">
              <Image src="/logo.png" alt="TmDash Logo" width={80} height={80} style={{ borderRadius: '50%' }} />
            </div>
            <h1>TmDash</h1>
            <h2>Nail & Beauty Studio</h2>
            <p>Sistem Kasir & Manajemen Studio</p>
          </div>
          <div className="decorative-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-container">
            <h3>Selamat Datang</h3>
            <p className="login-subtitle">Silakan masuk ke akun admin Anda</p>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fas fa-lock"></i> Password
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-login" disabled={loading}>
                <i className="fas fa-sign-in-alt"></i>{' '}
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
            <div className="login-footer">
              <p>TmDash Nail &amp; Beauty Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
