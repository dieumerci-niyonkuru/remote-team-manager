import { useState, useCallback } from 'react';

import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ws as workspaces, invites, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, PartyPopper, X as XIcon, Mail } from 'lucide-react';
import { Button } from '../components/common/Button';
import Modal from '../components/common/Modal';

const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, display: 'block' };

interface InviteResult {
  email: string;
  success: boolean;
  message: string;
}

export default function Onboarding() {
  const { user, setActiveWorkspace } = useStore();
  const navigate = useNavigate();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [wsForm, setWsForm] = useState({ name: '', description: '' });
  const [teamEmails, setTeamEmails] = useState('');
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const resetWizard = useCallback(() => {
    setWizardStep(0);
    setWsForm({ name: '', description: '' });
    setTeamEmails('');
    setInviteResults([]);
    setLoading(false);
    setInviteLoading(false);
  }, []);

  const openWizard = useCallback(() => {
    resetWizard();
    setWizardOpen(true);
  }, [resetWizard]);

  const closeWizard = useCallback(() => {
    setWizardOpen(false);
    resetWizard();
  }, [resetWizard]);

  const handleCreateWorkspace = async () => {
    if (!wsForm.name.trim()) { toast.error('Workspace name is required'); return; }
    setLoading(true);
    try {
      const r = await workspaces.create({ name: wsForm.name.trim(), description: wsForm.description.trim() });
      setActiveWorkspace(unwrapData(r));
      toast.success('Workspace created!');
      setWizardStep(1);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeam = async () => {
    const emails = teamEmails
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e.includes('@') && e.includes('.'));

    if (!emails.length) {
      toast.error('Enter at least one valid email address');
      return;
    }

    setInviteLoading(true);
    const results: InviteResult[] = [];

    for (const email of emails) {
      try {
        const wid = useStore.getState().activeWorkspace?.id;
        if (wid) {
          await invites.generateLink({ workspace: wid, email, role: 'member' });
        }
        results.push({ email, success: true, message: 'Invite sent' });
      } catch (e: any) {
        results.push({ email, success: false, message: e.response?.data?.detail || 'Failed to send invite' });
      }
    }

    setInviteResults(results);
    setInviteLoading(false);

    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    if (successes > 0) toast.success(`Invited ${successes} member${successes > 1 ? 's' : ''}`);
    if (failures > 0) toast.error(`${failures} invite${failures > 1 ? 's' : ''} failed`);

    setWizardStep(2);
  };

  const stepLabels = ['Workspace', 'Invite', 'Done'];

  const wizardFooter = wizardStep < 2 ? (
    <div className="flex gap-2 w-full">
      {wizardStep > 0 && (
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => setWizardStep(wizardStep - 1)}
          fullWidth
        >
          Back
        </Button>
      )}
      {wizardStep === 0 && (
        <Button
          variant="primary"
          rightIcon={<ArrowRight size={14} />}
          onClick={handleCreateWorkspace}
          loading={loading}
          fullWidth
        >
          Next
        </Button>
      )}
      {wizardStep === 1 && (
        <Button
          variant="primary"
          rightIcon={<ArrowRight size={14} />}
          onClick={handleInviteTeam}
          loading={inviteLoading}
          fullWidth
        >
          Next
        </Button>
      )}
    </div>
  ) : (
    <Button
      variant="primary"
      rightIcon={<ArrowRight size={14} />}
      onClick={() => { closeWizard(); navigate('/dashboard'); }}
      fullWidth
    >
      Go to Dashboard
    </Button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--brand-bg, rgba(99,102,241,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Sparkles size={32} style={{ color: 'var(--brand)' }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 32, lineHeight: 1.6 }}>
          Set up your workspace, invite your team, and start collaborating in minutes.
        </p>
        <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />} onClick={openWizard}>
          Get Started
        </Button>
      </div>

      <Modal isOpen={wizardOpen} onClose={closeWizard} title="Setup Wizard" size="md" footer={wizardFooter}>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: i <= wizardStep ? 'var(--brand)' : 'var(--bg3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: i <= wizardStep ? '#fff' : 'var(--text3)',
                    fontSize: 12,
                    fontWeight: 800,
                    transition: '0.2s',
                    flexShrink: 0,
                  }}
                >
                  {i < wizardStep ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: i <= wizardStep ? 'var(--text)' : 'var(--text3)', transition: '0.2s' }}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ width: 48, height: 2, background: i < wizardStep ? 'var(--brand)' : 'var(--bg3)', borderRadius: 1, transition: '0.2s', marginBottom: 16 }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Create Workspace */}
        {wizardStep === 0 && (
          <div>
            <div className="text-center mb-6">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--brand-bg, rgba(99,102,241,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Briefcase size={22} style={{ color: 'var(--brand)' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Create your workspace</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>This is where your team will collaborate</p>
            </div>
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Workspace Name *</label>
                <input
                  value={wsForm.name}
                  onChange={e => setWsForm({ ...wsForm, name: e.target.value })}
                  placeholder="e.g., Engineering Team"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={wsForm.description}
                  onChange={e => setWsForm({ ...wsForm, description: e.target.value })}
                  rows={2}
                  placeholder="What's this workspace for?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Invite Team Members */}
        {wizardStep === 1 && (
          <div>
            <div className="text-center mb-6">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-subtle, rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Mail size={22} style={{ color: 'var(--accent, #8b5cf6)' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Invite your team</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Add team members by email (comma-separated)</p>
            </div>
            <div>
              <label style={labelStyle}>Email Addresses *</label>
              <textarea
                value={teamEmails}
                onChange={e => setTeamEmails(e.target.value)}
                rows={4}
                placeholder="alice@company.com, bob@company.com"
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                autoFocus
              />
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                {(() => {
                  const count = teamEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e.includes('@') && e.includes('.')).length;
                  return count > 0 ? `${count} valid email${count > 1 ? 's' : ''} detected` : 'Enter at least one valid email';
                })()}
              </p>
            </div>

            {inviteResults.length > 0 && (
              <div className="space-y-2 mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>Invite Results</p>
                {inviteResults.map(r => (
                  <div
                    key={r.email}
                    className="flex items-center gap-2"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: r.success ? 'var(--success-subtle, rgba(16,185,129,0.08))' : 'var(--error-subtle, rgba(239,68,68,0.08))',
                      fontSize: 12,
                    }}
                  >
                    {r.success ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--success, #10b981)', flexShrink: 0 }} />
                    ) : (
                      <XIcon size={14} style={{ color: 'var(--error, #ef4444)', flexShrink: 0 }} />
                    )}
                    <span style={{ color: 'var(--text)', fontWeight: 600, wordBreak: 'break-all' }}>{r.email}</span>
                    <span style={{ color: 'var(--text3)', marginLeft: 'auto', flexShrink: 0 }}>{r.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Complete */}
        {wizardStep === 2 && (
          <div className="text-center">
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--success-subtle, rgba(16,185,129,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 2s ease-in-out infinite' }}>
              <PartyPopper size={32} style={{ color: 'var(--success, #10b981)' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px' }}>You're all set!</h2>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.6 }}>
              Your workspace is ready. Start collaborating with your team.
            </p>
            {inviteResults.length > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
                <strong>{inviteResults.filter(r => r.success).length}</strong> team member{inviteResults.filter(r => r.success).length !== 1 ? 's' : ''} invited
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
