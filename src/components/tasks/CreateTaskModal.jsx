import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useStore } from '../../store';
import { task } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace } = useStore();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await task.create(activeWorkspace.id, undefined, form);
      toast.success('Task created!');
      setForm({ title: '', description: '', priority: 'medium', deadline: '' });
      onClose();
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Task</Button>
        </div>
      }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} style={inputStyle} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
