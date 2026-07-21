import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { ws, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { Activity as ActIcon, Clock, FileText, MessageSquare, CheckSquare, Users, GitBranch, Upload } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const ACT_ICONS = {
  task_created: <CheckSquare size={14} style={{ color: 'var(--brand)' }} />,
  task_completed: <CheckSquare size={14} style={{ color: 'var(--success)' }} />,
  comment_added: <MessageSquare size={14} style={{ color: 'var(--accent)' }} />,
  file_uploaded: <Upload size={14} style={{ color: 'var(--warning)' }} />,
  member_joined: <Users size={14} style={{ color: 'var(--success)' }} />,
  project_updated: <GitBranch size={14} style={{ color: 'var(--info)' }} />,
};

export default function Activity() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try { const r = await ws.activity(activeWorkspace.id); setActivities(unwrapData(r)); }
    catch (e) { toast.error('Failed to load activity'); } finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('activity.title', 'Activity')}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : activities.length === 0 ? (
        <EmptyState icon={<ActIcon size={24} />} title="No activity yet" description="Activity will appear here as your team works." />
      ) : (
        <div style={cardBase}>
          <div className="space-y-0">
            {activities.map((a, i) => (
              <div key={a.id || i} className="flex gap-3" style={{ padding: '12px 0', borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {ACT_ICONS[a.type] || <Clock size={14} style={{ color: 'var(--text3)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700 }}>{a.user?.first_name || a.actor?.first_name || 'Someone'}</span>
                    {' '}<span style={{ color: 'var(--text3)' }}>{a.description || a.action || a.message || 'performed an action'}</span>
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', margin: '3px 0 0' }}>
                    {a.created_at ? format(new Date(a.created_at), 'MMM d, h:mm a') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
