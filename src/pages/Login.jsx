import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import { useT } from '../i18n'
import toast from 'react-hot-toast'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Card } from '../components/common/Card'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function Login() {
  const { setUser, theme, lang } = useStore()
  const t = useT(lang)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async ev => {
    ev.preventDefault()
    setLoading(true)
    try {
      const { data } = await auth.login(form)
      localStorage.setItem('rtm_access', data.data.access)
      localStorage.setItem('rtm_refresh', data.data.refresh)
      setUser(data.data.user)
      toast.success(t.welcomeBack || 'Secure Connection Established')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      let msg = t.enterCreds || 'Unauthorized: Check Credentials'
      if (data) {
        if (data.message) msg = data.message
        else if (data.detail) msg = data.detail
        else if (typeof data === 'object') {
          const errors = Object.values(data).flat()
          if (errors.length > 0) msg = errors[0]
        }
      }
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className={`min-h-screen bg-[#060b18] flex items-center justify-center p-6 relative overflow-hidden ${theme}`}>
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Card variant="glass" className="w-full max-w-[480px] p-8 md:p-12 relative z-10 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20 active:scale-95 transition-transform">
              <ShieldCheck size={32} strokeWidth={2.5} />
          </Link>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{t.welcomeBack}</h2>
          <p className="text-gray-400 font-medium">{t.enterCreds}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label={t.neuralId || "Email Address"}
            type="email" 
            placeholder="name@company.com" 
            required 
            value={form.email} 
            onChange={e => setForm({...form, email:e.target.value})} 
          />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.accessKey || "Password"}</label>
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                {t.recoverKey || "Forgot?"}
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={form.password} 
              onChange={e => setForm({...form, password:e.target.value})} 
            />
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            fullWidth 
            className="py-4 text-lg font-black"
            rightIcon={<ArrowRight size={20} />}
          >
            {t.establishConn || "Establish Connection"}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500 font-medium">
            {t.newToWs || "New to RemoteTeam?"} <Link to="/register" className="text-blue-500 font-black hover:text-blue-400 ml-1 underline-offset-4 hover:underline">{t.joinMission || "Join Mission"}</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
