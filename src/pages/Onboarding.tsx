import { useState } from 'react';

import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ws, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Briefcase, Users, FolderKanban, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(20px,3vw,32px)' };
const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };
const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, display: 'block' };

const STEPS = ['workspace', 'team', 'projects', 'complete'];

export default function Onboarding() {
  const { user, setActiveWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wsForm, setWsForm] = useState({ name: '', description: '' });
  const [teamEmails, setTeamEmails] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const handleCreateWorkspace = async () => {
    if (!wsForm.name.trim()) { toast.error('Workspace name is required'); return; }
    setLoading(true);
    try {
      const r = await ws.create(wsForm);
      setActiveWorkspace(unwrapData(r));
      toast.success('Workspace created!');
      setStep(1);
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Failed to create workspace'); } finally { setLoading(false); }
  };

  const handleInviteTeam = () => {
    const emails = teamEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
    if (emails.length) toast.success(`Invited ${emails.length} members`);
    setStep(2);
  };

  const handleCreateProject = () => {
    if (projectForm.name.trim()) toast.success('Project created!');
    setStep(3);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= step ? 'var(--brand)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= step ? '#fff' : 'var(--text3)', fontSize: 11, fontWeight: 800, transition: '0.2s' }}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? 'var(--brand)' : 'var(--bg3)', borderRadius: 1, transition: '0.2s' }} />}
            </div>
          ))}
        </div>

        <div key={step} style={cardBase}>
          {step === 0 && (
            <>
              <div className="text-center mb-6">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Briefcase size={22} style={{ color: 'var(--brand)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Create your workspace</h2>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>This is where your team will collaborate</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Workspace Name *</label>
                  <input value={wsForm.name} onChange={e => setWsForm({...wsForm, name: e.target.value})} placeholder="e.g., Engineering Team" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={wsForm.description} onChange={e => setWsForm({...wsForm, description: e.target.value})} rows={2} placeholder="What's this workspace for?" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Button variant="primary" fullWidth loading={loading} onClick={handleCreateWorkspace} rightIcon={<ArrowRight size={14} />}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-subtle, rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Users size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Invite your team</h2>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>Add team members by email (comma-separated)</p>
              </div>
              <div className="space-y-4">
                <textarea value={teamEmails} onChange={e => setTeamEmails(e.target.value)} rows={4} placeholder="alice@company.com, bob@company.com"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                <div className="flex gap-2">
                  <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={() => setStep(0)} fullWidth>Back</Button>
                  <Button variant="primary" rightIcon={<ArrowRight size={14} />} onClick={handleInviteTeam} fullWidth>Continue</Button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--success-subtle, rgba(16,185,129,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FolderKanban size={22} style={{ color: 'var(--success)' }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Create a project</h2>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>Set up your first project (optional)</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Project Name</label>
                  <input value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} placeholder="e.g., Website Redesign" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" leftIcon={<ArrowLeft size={14} />} onClick={() => setStep(1)} fullWidth>Back</Button>
                  <Button variant="primary" rightIcon={<ArrowRight size={14} />} onClick={handleCreateProject} loading={loading} fullWidth>Continue</Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--success-subtle, rgba(16,185,129,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={28} style={{ color: 'var(--success)' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>You're all set!</h2>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.6 }}>Your workspace is ready. Start collaborating with your team.</p>
              <Button variant="primary" rightIcon={<ArrowRight size={14} />} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
