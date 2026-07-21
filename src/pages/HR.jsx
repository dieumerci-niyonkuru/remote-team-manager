import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { hr, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { Users, Briefcase, Clock, TrendingUp, Award, UserCheck, Building2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

export default function HR() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await hr.employees();
      setEmployees(unwrapData(res));
    } catch (e) {
      toast.error('Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const onlineCount = employees.filter(e => e.is_online).length;
  const deptCount = new Set(employees.map(e => e.department).filter(Boolean)).size;
  const stats = [
    { label: 'Total Employees', value: employees.length, icon: <Users size={16} />, color: 'var(--brand)' },
    { label: 'Online Now', value: onlineCount, icon: <UserCheck size={16} />, color: 'var(--success)' },
    { label: 'Departments', value: deptCount || '—', icon: <Building2 size={16} />, color: 'var(--accent)' },
    { label: 'Avg Tenure', value: employees.length ? Math.round(employees.reduce((a, e) => a + (e.tenure_months || 0), 0) / employees.length) + 'mo' : '—', icon: <TrendingUp size={16} />, color: 'var(--warning)' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('hr.title', 'Human Resources')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{employees.length} employees</p>
        </div>
        <Button variant="primary" leftIcon={<Users size={14} />}>Add Employee</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} style={{ ...cardBase, transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={cardBase}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>Employees</h3>
            {employees.length === 0 ? (
              <EmptyState icon={<Users size={24} />} title="No employees" description="Add your first employee to get started." />
            ) : (
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Employee', 'Role', 'Department', 'Status', 'Joined'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => {
                      const u = emp.user || {};
                      const name = u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username || emp.name || '—';
                      return (
                        <tr key={emp.id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div className="flex items-center gap-3">
                              <Avatar user={u} size={28} />
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{name}</p>
                                <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{u.email || emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}><Badge variant="secondary">{emp.job_title || emp.role || '—'}</Badge></td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text3)' }}>{emp.department || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div className="flex items-center gap-1">
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: emp.is_online ? 'var(--success)' : 'var(--text3)' }} />
                              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{emp.is_online ? 'Online' : 'Offline'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text3)' }}>{emp.joined_at ? format(new Date(emp.joined_at), 'MMM d, yyyy') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
