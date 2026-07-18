import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useStore } from '../../store';
import { proj } from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const { activeWorkspace } = useStore();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await proj.create(activeWorkspace.id, form);
      toast.success('Project created!');
      setForm({ name: '', description: '' });
      onClose();
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Project</Button>
        </div>
      }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={labelStyle}>Project Name *</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </form>
    </Modal>
  );
}
