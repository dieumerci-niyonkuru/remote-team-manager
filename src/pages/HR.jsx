import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { hr, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { Users, Briefcase, Clock, TrendingUp, Award, UserCheck, Building2, Plus } from 'lucide-react';
import { Modal } from '../components/common/Modal';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', job_title: '', department: '' });
  const [addLoading, setAddLoading] = useState(false);

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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!addForm.first_name.trim() || !addForm.email.trim()) return;
    setAddLoading(true);
    try {
      await hr.createEmployee({ user: { first_name: addForm.first_name, last_name: addForm.last_name, email: addForm.email }, job_title: addForm.job_title, department: addForm.department });
      toast.success('Employee added!');
      setAddForm({ first_name: '', last_name: '', email: '', job_title: '', department: '' });
      setShowAddModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add employee');
    } finally {
      setAddLoading(false);
    }
  };

  const addInputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const addLabelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };

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
        <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowAddModal(true)}>Add Employee</Button>
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

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddEmployee} loading={addLoading}>Add Employee</Button>
          </div>
        }>
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label style={addLabelStyle}>First Name *</label>
            <input value={addForm.first_name} onChange={e => setAddForm({...addForm, first_name: e.target.value})} placeholder="First name" required style={addInputStyle} />
          </div>
          <div>
            <label style={addLabelStyle}>Last Name</label>
            <input value={addForm.last_name} onChange={e => setAddForm({...addForm, last_name: e.target.value})} placeholder="Last name" style={addInputStyle} />
          </div>
          <div>
            <label style={addLabelStyle}>Email *</label>
            <input type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="employee@example.com" required style={addInputStyle} />
          </div>
          <div>
            <label style={addLabelStyle}>Job Title</label>
            <input value={addForm.job_title} onChange={e => setAddForm({...addForm, job_title: e.target.value})} placeholder="e.g. Software Engineer" style={addInputStyle} />
          </div>
          <div>
            <label style={addLabelStyle}>Department</label>
            <input value={addForm.department} onChange={e => setAddForm({...addForm, department: e.target.value})} placeholder="e.g. Engineering" style={addInputStyle} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
