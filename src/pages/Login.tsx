import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { auth } from '../services/api';
import { getT } from '../i18n';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export default function Login() {
  const { setUser, lang = 'en' } = useStore();
  const t = getT(lang);
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const response = await auth.login({ username: form.email, password: form.password });
      const result = response.data;
      localStorage.setItem('rtm_access', result.access);
      localStorage.setItem('rtm_refresh', result.refresh);
      setUser(result.user);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Invalid email or password.';
      if (data?.message) msg = data.message;
      else if (data?.detail) msg = data.detail;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Zap size={16} />, text: 'Real-time collaboration' },
    { icon: <Shield size={16} />, text: 'Bank-grade security' },
    { icon: <Globe size={16} />, text: 'Works in 3 languages' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg)',
      fontFamily: 'var(--font-body)', overflow: 'hidden', position: 'relative'
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', background: 'linear-gradient(135deg, #0a1628 0%, #111e3b 50%, #0d1829 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden'
      }} className="login-left-panel">
        {/* Animated background orbs */}
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, background:'radial-gradient(circle, rgba(51,102,255,0.15) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', animation:'float 8s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:300, height:300, background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', animation:'float 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none', marginBottom:64 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg, var(--brand), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 12px 30px rgba(51,102,255,0.35)', padding:10 }}>
              <img src="/logo.png" alt="RT" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            </div>
            <span style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-0.03em' }}>
              Remote<span style={{ color:'var(--brand)' }}>Team</span>
            </span>
          </Link>

          <h2 style={{ fontSize:'clamp(32px,3vw,48px)', fontWeight:900, color:'#fff', lineHeight:1.15, letterSpacing:'-0.03em', marginBottom:20 }}>
            Your team's<br />command center.
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:48, maxWidth:380 }}>
            Everything your distributed team needs — projects, chat, analytics, and AI — unified in one intelligent workspace.
          </p>

          {features.map((f, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'rgba(51,102,255,0.15)', border:'1px solid rgba(51,102,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--brand)', flexShrink:0 }}>
                {f.icon}
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{f.text}</span>
            </div>
          ))}

          <div style={{ marginTop:64, padding:'24px', borderRadius:20, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize:15, fontStyle:'italic', color:'rgba(255,255,255,0.6)', marginBottom:12, lineHeight:1.6 }}>
              "We ship 40% faster since moving to RemoteTeam. It's the first tool our engineers actually love."
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3366ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:900 }}>S</div>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:'#fff', margin:0 }}>Sarah Jenkins</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0 }}>VP Engineering, Acme Corp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', minHeight:'100vh', overflowY:'auto' }}>
        {/* Mobile logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:40 }} className="login-mobile-logo">
          <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', padding:8 }}>
            <img src="/logo.png" alt="RT" style={{ width:'100%', objectFit:'contain' }} />
          </div>
          <span style={{ fontSize:20, fontWeight:900, color:'var(--text)', letterSpacing:'-0.02em' }}>Remote<span style={{ color:'var(--brand)' }}>Team</span></span>
        </Link>

        <div style={{ width:'100%', maxWidth:460 }}>
          <div style={{ marginBottom:36, textAlign:'center' }}>
            <h1 style={{ fontSize:'clamp(26px,4vw,34px)', fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em', margin:'0 0 8px' }}>
              Welcome back
            </h1>
            <p style={{ color:'var(--text3)', fontSize:15, margin:0 }}>Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                Email Address
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="name@company.com"
                style={{
                  width:'100%', padding:'14px 18px', borderRadius:12, fontSize:15,
                  background:'var(--bg3)', border:`2px solid ${focused==='email' ? 'var(--brand)' : 'var(--border)'}`,
                  color:'var(--text)', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
                  fontFamily:'var(--font-body)'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:12, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize:13, color:'var(--brand)', textDecoration:'none', fontWeight:600 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="••••••••••"
                  style={{
                    width:'100%', padding:'14px 50px 14px 18px', borderRadius:12, fontSize:15,
                    background:'var(--bg3)', border:`2px solid ${focused==='password' ? 'var(--brand)' : 'var(--border)'}`,
                    color:'var(--text)', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
                    fontFamily:'var(--font-body)'
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:4, display:'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width:'100%', padding:'15px', borderRadius:12, fontSize:15, fontWeight:800,
                background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--brand), #6b46c1)',
                color: loading ? 'var(--text3)' : '#fff', border:'none', cursor: loading ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4,
                boxShadow: loading ? 'none' : '0 8px 24px rgba(51,102,255,0.35)',
                transition:'all 0.2s', transform: loading ? 'none' : 'translateY(0)',
                fontFamily:'var(--font-body)'
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:'2px solid var(--text3)', borderTop:'2px solid transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--text3)', marginTop:28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--brand)', fontWeight:800, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
