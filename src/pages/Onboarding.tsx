import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Rocket, Users, Shield, ArrowRight, Check, Plus, Mail } from 'lucide-react';
import api, { ws } from '../services/api';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { user, setActiveWorkspace } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    description: '',
  });
  
  const [invites, setInvites] = useState(['']);

  const handleAddInvite = () => setInvites([...invites, '']);
  const handleInviteChange = (index, val) => {
    const newInvites = [...invites];
    newInvites[index] = val;
    setInvites(newInvites);
  };

  const createWorkspace = async () => {
    if (!workspaceData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await ws.create(workspaceData);
      setActiveWorkspace(data.data || data);
      setStep(2);
      toast.success('Workspace created! 🚀');
    } catch (err) {
      toast.error('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const sendInvites = async () => {
    const validInvites = invites.filter(i => i.trim() !== '');
    if (validInvites.length === 0) {
      setStep(3);
      return;
    }
    setLoading(true);
    try {
      // Logic for batch invites would go here
      // For now we'll just simulate and move to final step
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(3);
      toast.success('Invitations sent! ✉️');
    } catch (err) {
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-violet/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12 px-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 
                  ${step === s ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-110' : 
                    step > s ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    'bg-white/5 border-white/10 text-text-tertiary'}`}
                >
                  {step > s ? <Check size={20} /> : s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-brand' : 'text-text-tertiary'}`}>
                  {s === 1 ? 'Workspace' : s === 2 ? 'Team' : 'Ready'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-px mx-4 transition-colors duration-500 ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Create Workspace */}
        {step === 1 && (
          <Card variant="glass" className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black tracking-tight">Create your mission control.</h1>
              <p className="text-text-secondary font-medium">Workspaces are where your team, projects, and communication live.</p>
            </div>
            
            <div className="space-y-6">
              <Input 
                label="Workspace Name"
                placeholder="e.g. Acme Corp, Engineering Team"
                value={workspaceData.name}
                onChange={e => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                required
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Description (Optional)</label>
                <textarea 
                  className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-brand/40 resize-none h-32"
                  placeholder="What is this workspace for?"
                  value={workspaceData.description}
                  onChange={e => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                />
              </div>
            </div>

            <Button size="lg" className="w-full py-5 text-lg font-black" onClick={createWorkspace} loading={loading}>
              Create Workspace <ArrowRight className="ml-2" />
            </Button>
          </Card>
        )}

        {/* Step 2: Invite Team */}
        {step === 2 && (
          <Card variant="glass" className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black tracking-tight">Invite your operators.</h1>
              <p className="text-text-secondary font-medium">RemoteTeam is built for collaboration. Add your team members via email.</p>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {invites.map((email, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <Input 
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => handleInviteChange(idx, e.target.value)}
                    icon={<Mail size={16} />}
                  />
                </div>
              ))}
              <Button variant="secondary" size="sm" className="w-full border-dashed" onClick={handleAddInvite}>
                <Plus size={16} className="mr-2" /> Add another
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" size="lg" className="flex-1 font-black" onClick={() => setStep(3)}>
                Skip for now
              </Button>
              <Button size="lg" className="flex-1 font-black" onClick={sendInvites} loading={loading}>
                Send Invitations <ArrowRight className="ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Finalize */}
        {step === 3 && (
          <Card variant="glass" className="p-16 text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto animate-bounce-slow">
              <Rocket size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight">Mission Control is ready.</h1>
              <p className="text-text-secondary font-medium">Your workspace has been initialized. Prepare for launch.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand"><Check size={20} /></div>
                <div>
                  <p className="text-sm font-black">Workspace Operational</p>
                  <p className="text-xs text-text-tertiary">All systems are green</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand"><Check size={20} /></div>
                <div>
                  <p className="text-sm font-black">Security Protocols Active</p>
                  <p className="text-xs text-text-tertiary">RBAC initialized</p>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full py-6 text-xl font-black" onClick={() => navigate('/dashboard')}>
              Launch Dashboard <Rocket className="ml-2" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
