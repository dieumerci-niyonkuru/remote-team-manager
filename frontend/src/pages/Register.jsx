import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { useStore } from '../store'; import { useT } from '../i18n'; import { auth } from '../services/api'; import toast from 'react-hot-toast'

const checkStrength = (pass) => {
  let score = 0;
  if (!pass) return { score:0, text:'', color:'' };
  if (pass.length >= 8) score++;
  if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) score++;
  if (pass.match(/\d/)) score++;
  if (pass.match(/[^a-zA-Z0-9]/)) score++;
  if (score === 1) return { score:1, text:'Weak', color:'#ef4444', class:'weak' };
  if (score === 2) return { score:2, text:'Medium', color:'#f59e0b', class:'medium' };
  if (score >= 3) return { score:3, text:'Strong', color:'#22c55e', class:'strong' };
  return { score:0, text:'Very weak', color:'#ef4444', class:'weak' };
}

export default function Register() {
  const { setUser, theme, lang } = useStore(); const t = useT(lang); const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', password2: '' });
  const [errors, setErrors] = useState({}); const [loading, setLoading] = useState(false);
  const strength = checkStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.first_name) e.first_name = t.required;
    if (!form.last_name) e.last_name = t.required;
    if (!form.email) e.email = t.required;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.invalidEmail;
    if (!form.password) e.password = t.required;
    else if (form.password.length < 8) e.password = t.passMin;
    if (form.password !== form.password2) e.password2 = t.passMismatch;
    if (strength.score < 2) e.password = 'Password is too weak. Use 8+ chars, mixed case, numbers, symbols.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await auth.register(form);
      localStorage.setItem('rtm_access', res.data.data.access);
      localStorage.setItem('rtm_refresh', res.data.data.refresh);
      setUser(res.data.data.user);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'object' ? Object.values(msg).flat()[0] : msg || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className={theme} style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#3366ff,#6699ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>R</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Create your account</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Start collaborating with your team today</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">{t.firstName}</label><input className={`input ${errors.first_name?'error':''}`} placeholder="John" value={form.first_name} onChange={e => setForm({...form, first_name:e.target.value})} /></div>
            <div><label className="label">{t.lastName}</label><input className={`input ${errors.last_name?'error':''}`} placeholder="Doe" value={form.last_name} onChange={e => setForm({...form, last_name:e.target.value})} /></div>
          </div>
          <div><label className="label">{t.email}</label><input className={`input ${errors.email?'error':''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
          <div>
            <label className="label">{t.password}</label>
            <input className={`input ${errors.password?'error':''}`} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
            {form.password && (
              <>
                <div className="password-strength" style={{ width: `${strength.score * 33}%`, background: strength.color }} />
                <div className={`password-strength-text ${strength.class}`}>
                  <span>🔒</span> {strength.text}
                  {strength.score < 2 && <span style={{ fontSize: 10 }}> – Use uppercase, number, symbol</span>}
                </div>
              </>
            )}
          </div>
          <div><label className="label">{t.confirmPass}</label><input className={`input ${errors.password2?'error':''}`} type="password" placeholder="Repeat password" value={form.password2} onChange={e => setForm({...form, password2:e.target.value})} /></div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 13, fontSize: 15, borderRadius: 10, marginTop: 6 }}>{loading ? <div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff' }} /> : 'Create Account →'}</button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 20 }}>{t.hasAccount} <Link to="/login" style={{ color: '#3366ff', fontWeight: 700, textDecoration: 'none' }}>{t.login}</Link></p>
      </div>
    </div>
  )
}
