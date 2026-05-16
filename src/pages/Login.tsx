import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

interface LoginResponse {
  data: {
    access: string;
    refresh: string;
    user: any;
  };
  message?: string;
  detail?: string;
}

export default function Login() {
  const { setUser, theme } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const response = await auth.login(form);
      const data: LoginResponse = response.data;
      localStorage.setItem('rtm_access', data.data.access);
      localStorage.setItem('rtm_refresh', data.data.refresh);
      setUser(data.data.user);
      toast.success(data.message || 'Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Unable to log in. Please check your email and password.';
      if (data) {
        if (data.message) msg = data.message;
        else if (data.detail) msg = 'Incorrect email or password.';
        else if (typeof data === 'object') {
          const errors = Object.values(data).flat();
          if (errors.length > 0) msg = String(errors[0]);
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg)', 
      padding: '20px', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <div className="moving-code-bg" />
      
      <div className="card glass-premium fade-in" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        padding: 'clamp(24px, 5vw, 56px)', 
        borderRadius: '32px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ 
            display: 'inline-flex', 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--brand), #8b5cf6)', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            margin: '0 auto 24px', 
            boxShadow: '0 10px 20px rgba(51,102,255,0.3)',
            overflow: 'hidden',
            padding: '12px'
          }}>
             <img src="/logo.png" alt="RemoteTeam" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Link>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '15px', fontWeight: 500 }}>
            Enter your email and password to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label" style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Email Address
            </label>
            <input 
              className="input" 
              type="email" 
              placeholder="name@company.com" 
              required 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              style={{ padding: '16px 20px', fontSize: '15px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="label" style={{ marginBottom: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <input 
              className="input" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              style={{ padding: '16px 20px', fontSize: '15px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', fontWeight: 700, marginTop: '12px', transition: '0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text2)', marginTop: '32px', fontWeight: 500 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>

      <style>{`
        .glass-premium { 
          background: rgba(var(--bg-card-rgb, 255, 255, 255), 0.9); 
          backdrop-filter: blur(20px); 
          border: 1px solid rgba(150,150,150,0.1); 
        }
        @media (prefers-color-scheme: dark) {
          .glass-premium { background: rgba(var(--bg-card-rgb, 20, 20, 25), 0.8); }
        }
      `}</style>
    </div>
  );
}
