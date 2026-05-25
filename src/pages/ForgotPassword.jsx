import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', { email });
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send reset email.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-body)', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text3)',
          textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 32
        }}>
          <ArrowLeft size={15} /> Back to login
        </Link>

        {sent ? (
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20,
            padding: '48px 32px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={30} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>
              Check your inbox
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              If an account with <strong style={{ color: 'var(--text)' }}>{email}</strong> exists,
              we've sent a password reset link.
            </p>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--brand), #7c3aed)',
              color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 14
            }}>
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: 'var(--brand)'
              }}>
                <Mail size={24} />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Reset password
              </h1>
              <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>
                Enter your email and we'll send a reset link
              </p>
            </div>

            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8
                  }}>
                    Email address
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 14,
                      background: 'var(--bg3)', border: '2px solid var(--border)',
                      color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'var(--font-body)'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 800,
                  background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--brand), #7c3aed)',
                  color: loading ? 'var(--text3)' : '#fff', border: 'none',
                  cursor: loading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s'
                }}>
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : 'Send reset link'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
