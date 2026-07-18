import { useState, useEffect } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { files, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { FolderOpen, Upload, Download, FileText, Image, Film, Music, Archive, Search, Grid, List, Eye } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };

const FILE_ICONS = {
  pdf: <FileText size={18} style={{ color: 'var(--danger)' }} />,
  doc: <FileText size={18} style={{ color: 'var(--brand)' }} />,
  docx: <FileText size={18} style={{ color: 'var(--brand)' }} />,
  xls: <FileText size={18} style={{ color: 'var(--success)' }} />,
  xlsx: <FileText size={18} style={{ color: 'var(--success)' }} />,
  ppt: <FileText size={18} style={{ color: 'var(--warning)' }} />,
  pptx: <FileText size={18} style={{ color: 'var(--warning)' }} />,
  png: <Image size={18} style={{ color: 'var(--accent)' }} />,
  jpg: <Image size={18} style={{ color: 'var(--accent)' }} />,
  jpeg: <Image size={18} style={{ color: 'var(--accent)' }} />,
  gif: <Image size={18} style={{ color: 'var(--accent)' }} />,
  mp4: <Film size={18} style={{ color: 'var(--info)' }} />,
  mp3: <Music size={18} style={{ color: 'var(--accent)' }} />,
  zip: <Archive size={18} style={{ color: 'var(--text3)' }} />,
};

function getFileIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || <FileText size={18} style={{ color: 'var(--text3)' }} />;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function Files() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await files.list({ workspace: activeWorkspace.id });
      setFilesList(unwrapData(res));
    } catch (e) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filesList.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('files.title', 'Files')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{filesList.length} files</p>
        </div>
        <Button variant="primary" leftIcon={<Upload size={14} />}>Upload File</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg3)', borderRadius: 8, padding: 3 }}>
          {[{ v: 'list', i: <List size={13} /> }, { v: 'grid', i: <Grid size={13} /> }].map(v => (
            <button key={v.v} onClick={() => setView(v.v)}
              style={{ background: view === v.v ? 'var(--bg2)' : 'transparent', border: view === v.v ? '1px solid var(--border)' : '1px solid transparent', borderRadius: 6, padding: '5px 7px', color: view === v.v ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {v.i}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderOpen size={24} />} title="No files yet" description="Upload files to share with your team." />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((f, i) => (
            <div key={f.id || i} style={{ ...cardBase, padding: 12, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="flex justify-center mb-2">{getFileIcon(f.name)}</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</p>
              <p style={{ fontSize: 10, color: 'var(--text3)', margin: '3px 0 0' }}>{formatSize(f.size)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((f, i) => (
            <div key={f.id || i} style={{ ...cardBase, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {getFileIcon(f.name)}
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.name}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatSize(f.size)}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{f.uploaded_by?.first_name || 'Unknown'}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{f.created_at ? format(new Date(f.created_at), 'MMM d, yyyy') : '—'}</span>
              <div className="flex gap-1">
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><Download size={13} /></button>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><Eye size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
