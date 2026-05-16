import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { auth } from '../services/api'
import toast from 'react-hot-toast'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Card } from '../components/common/Card'
import { ShieldPlus, ArrowRight, Upload, User, UserPlus } from 'lucide-react'

const ROLES = [
  { value: 'viewer', label: 'Viewer', desc: 'Read-only node access', color: 'bg-blue-500' },
  { value: 'developer', label: 'Developer', desc: 'Build & Deploy nodes', color: 'bg-purple-500' },
  { value: 'manager', label: 'Manager', desc: 'Team synchronization', color: 'bg-emerald-500' },
  { value: 'designer', label: 'Designer', desc: 'Interface engineering', color: 'bg-rose-500' },
]

export default function Register() {
  const { theme } = useStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', password: '', password2: '', role: 'viewer'
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.first_name) e.first_name = 'Required'
    if (!form.last_name) e.last_name = 'Required'
    if (!form.email) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Required'
    else if (form.password.length < 8) e.password = 'Min 8 chars'
    if (form.password !== form.password2) e.password2 = 'No match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async ev => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)

    const formData = new FormData()
    Object.keys(form).forEach(k => formData.append(k, form[k]))
    if (avatar) formData.append('avatar', avatar)

    try {
      await auth.register(formData)
      toast.success('Account created. Please log in.')
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      let msg = 'Unable to register'
      if (data) {
        if (data.message) msg = data.message
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
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Card variant="glass" className="w-full max-w-[640px] p-8 md:p-12 relative z-10 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20 active:scale-95 transition-transform">
              <ShieldPlus size={32} strokeWidth={2.5} />
          </Link>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Initialize Node</h2>
          <p className="text-gray-400 font-medium">Join the decentralized workspace intelligence network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all overflow-hidden"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-500 group-hover:text-blue-500 transition-colors">
                  <Upload size={24} className="mx-auto mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase transition-opacity">Change</div>
            </div>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" placeholder="John" value={form.first_name} onChange={v => set('first_name', v)} error={errors.first_name} />
            <Input label="Last Name" placeholder="Doe" value={form.last_name} onChange={v => set('last_name', v)} error={errors.last_name} />
          </div>

          <Input label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={v => set('email', v)} error={errors.email} />

          {/* Role Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assigned Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map(r => (
                <div 
                  key={r.value} 
                  onClick={() => set('role', r.value)} 
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${form.role === r.value ? 'bg-blue-600/10 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-white/2 border-white/5 hover:border-white/10'}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center text-white font-black shadow-lg`}>
                    {r.label.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-black transition-colors ${form.role === r.value ? 'text-blue-500' : 'text-white'}`}>{r.label}</p>
                    <p className="text-[10px] text-gray-500 font-bold truncate">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={v => set('password', v)} error={errors.password} />
            <Input label="Confirm" type="password" placeholder="••••••••" value={form.password2} onChange={v => set('password2', v)} error={errors.password2} />
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            fullWidth 
            className="py-4 text-lg font-black"
            rightIcon={<ArrowRight size={20} />}
          >
            {loading ? 'Processing...' : 'Complete Initialization'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already have a node? <Link to="/login" className="text-blue-500 font-black hover:text-blue-400 ml-1 underline-offset-4 hover:underline">Log In</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
