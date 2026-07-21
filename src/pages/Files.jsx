import { useState, useEffect, useRef } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { files, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { format } from 'date-fns';
import { FolderOpen, Upload, Download, FileText, Image, Film, Music, Archive, Search, Grid, List, Eye, X, Trash2, CloudUpload } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

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

function getFileUrl(f) {
  if (f.file_url) return f.file_url;
  const path = f.file || f.url;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || '';
  return base + path;
}

function getFileName(f) {
  return f.filename || f.name || 'Untitled';
}

function isPreviewable(name) {
  const ext = name?.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'pdf', 'txt', 'md'].includes(ext);
}

export default function Files() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { if (activeWorkspace) load(); }, [activeWorkspace]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await files.list({ workspace: activeWorkspace.id });
      setFilesList(unwrapData(res));
    } catch { toast.error('Failed to load files'); } finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !activeWorkspace) return;
    setUploading(true);
    setUploadProgress(0);
    let successCount = 0;
    const total = selectedFiles.length;

    for (let i = 0; i < total; i++) {
      const file = selectedFiles[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('content_type', 'workspace');
        formData.append('object_id', activeWorkspace.id);
        formData.append('filename', file.name);
        await files.upload(formData);
        successCount++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
      setUploadProgress(Math.round(((i + 1) / total) * 100));
    }

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded`);
      setShowUpload(false);
      setSelectedFiles([]);
      load();
    }
    setUploading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await files.delete(id);
      toast.success('File deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) setSelectedFiles(prev => [...prev, ...dropped]);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) setSelectedFiles(prev => [...prev, ...selected]);
  };

  const removeSelected = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openPreview = (f) => {
    const url = getFileUrl(f);
    if (url) setPreviewFile({ ...f, url, display_name: getFileName(f) });
  };

  const filtered = filesList.filter(f => getFileName(f).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-5" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('files.title', 'Files')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>{filesList.length} files</p>
        </div>
        <Button variant="primary" leftIcon={<Upload size={14} />} onClick={() => setShowUpload(true)}>Upload File</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(51,102,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px 8px 30px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }} />
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
            <div key={f.id || i} style={{ ...cardBase, padding: 12, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, getFileName(f)); }}
                style={{ position: 'absolute', top: 6, right: 6, background: 'var(--bg3)', border: 'none', borderRadius: 4, padding: 3, cursor: 'pointer', color: 'var(--text3)', display: 'flex', opacity: 0.7 }}>
                <Trash2 size={11} />
              </button>
              <div className="flex justify-center mb-2">{getFileIcon(getFileName(f))}</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getFileName(f)}</p>
              <p style={{ fontSize: 10, color: 'var(--text3)', margin: '3px 0 0' }}>{formatSize(f.file_size)}</p>
              <div className="flex gap-1 justify-center mt-2">
                {isPreviewable(getFileName(f)) && <button onClick={(e) => { e.stopPropagation(); openPreview(f); }}
                  style={{ background: 'var(--bg3)', border: 'none', borderRadius: 4, padding: 3, cursor: 'pointer', color: 'var(--brand)', display: 'flex' }}><Eye size={12} /></button>}
                <a href={getFileUrl(f)} download={getFileName(f)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  style={{ background: 'var(--bg3)', border: 'none', borderRadius: 4, padding: 3, cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><Download size={12} /></a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((f, i) => (
            <div key={f.id || i} style={{ ...cardBase, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {getFileIcon(getFileName(f))}
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{getFileName(f)}</span>
              </div>
              <span className="hidden sm:inline" style={{ fontSize: 11, color: 'var(--text3)' }}>{formatSize(f.file_size)}</span>
              <span className="hidden md:inline" style={{ fontSize: 11, color: 'var(--text3)' }}>{f.uploaded_by?.first_name || 'Unknown'}</span>
              <span className="hidden lg:inline" style={{ fontSize: 11, color: 'var(--text3)' }}>{f.uploaded_at || f.created_at ? format(new Date(f.uploaded_at || f.created_at), 'MMM d, yyyy') : '—'}</span>
              <div className="flex gap-1">
                {isPreviewable(getFileName(f)) && <button onClick={() => openPreview(f)} style={{ background: 'transparent', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 4, display: 'flex' }}><Eye size={13} /></button>}
                <a href={getFileUrl(f)} download={getFileName(f)} target="_blank" rel="noreferrer" style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex', textDecoration: 'none' }}><Download size={13} /></a>
                <button onClick={() => handleDelete(f.id, getFileName(f))} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div onClick={() => { setShowUpload(false); setSelectedFiles([]); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: 440, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Upload Files</h3>
              <button onClick={() => { setShowUpload(false); setSelectedFiles([]); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>

            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 10, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', transition: '0.2s', background: dragOver ? 'var(--brand-bg)' : 'var(--bg3)', marginBottom: 16 }}>
              <CloudUpload size={32} style={{ color: dragOver ? 'var(--brand)' : 'var(--text3)', marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Click or drag files here</p>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0' }}>Any file type accepted</p>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 16 }}>
                {selectedFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, marginBottom: 4, background: 'var(--bg3)' }}>
                    {getFileIcon(f.name)}
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{formatSize(f.size)}</span>
                    <button onClick={() => removeSelected(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Uploading...</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--brand)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setShowUpload(false); setSelectedFiles([]); }}>Cancel</Button>
              <Button variant="primary" leftIcon={<Upload size={14} />} onClick={handleUpload} loading={uploading} disabled={!selectedFiles.length || uploading}>
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div onClick={() => setPreviewFile(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{previewFile.display_name || getFileName(previewFile)}</span>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              {previewFile.url?.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) ? (
                <img src={previewFile.url} alt={previewFile.display_name || getFileName(previewFile)} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
              ) : previewFile.url?.includes('.pdf') ? (
                <iframe src={previewFile.url} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }} title={previewFile.display_name || getFileName(previewFile)} />
              ) : (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  {getFileIcon(previewFile.display_name || getFileName(previewFile))}
                  <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 8 }}>{previewFile.display_name || getFileName(previewFile)}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Preview not available for this file type</p>
                  <a href={previewFile.url} download={previewFile.display_name || getFileName(previewFile)} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12 }}>
                    <Button variant="primary" size="sm" leftIcon={<Download size={12} />}>Download</Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
