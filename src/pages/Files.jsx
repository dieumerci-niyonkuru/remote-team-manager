import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { files as filesApi } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Upload, Download, Trash2, Eye, Search, Grid, List,
  File, FileImage, FileText, FileVideo, FileAudio,
  X, Plus, RefreshCw, Filter, FolderOpen,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';

/* ── design tokens ─────────────────────────────────────────── */
const C = {
  brand:   '#3366ff',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#ef4444',
  cyan:    '#06b6d4',
};

/* ── file type helpers ─────────────────────────────────────── */
const FILE_TYPES = {
  image:    { exts: ['jpg','jpeg','png','gif','webp','svg','avif','bmp'], icon: <FileImage size={20} />, color: C.violet,  label: 'Image'    },
  video:    { exts: ['mp4','mov','avi','mkv','webm'],                    icon: <FileVideo size={20} />, color: C.rose,    label: 'Video'    },
  audio:    { exts: ['mp3','wav','ogg','flac','aac'],                    icon: <FileAudio size={20} />, color: C.emerald, label: 'Audio'    },
  document: { exts: ['pdf','doc','docx','xls','xlsx','ppt','pptx'],     icon: <FileText  size={20} />, color: C.brand,   label: 'Document' },
  text:     { exts: ['txt','md','csv','json','yaml','xml','html','css','js','ts'], icon: <FileText size={20} />, color: C.amber, label: 'Text' },
};

function getFileType(name = '') {
  const ext = (name.split('.').pop() || '').toLowerCase();
  for (const [key, t] of Object.entries(FILE_TYPES)) {
    if (t.exts.includes(ext)) return { key, ...t };
  }
  return { key: 'other', icon: <File size={20} />, color: '#64748b', label: 'File' };
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function relativeTime(isoStr) {
  if (!isoStr) return '';
  const d = (Date.now() - new Date(isoStr)) / 1000;
  if (d < 60)    return 'just now';
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(isoStr).toLocaleDateString();
}

/* ── sub-components ────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 8 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.06)', animation: 'skelPulse 1.5s ease-in-out infinite' }} />
  );
}

/* Upload progress bar */
function ProgressBar({ pct, color = C.brand }) {
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)`, borderRadius: 99, transition: 'width 0.15s ease' }} />
    </div>
  );
}

/* File grid card */
function FileCard({ file, onPreview, onDelete }) {
  const name = file.file_name || file.file?.split('/').pop() || 'Untitled';
  const type = getFileType(name);
  const [hov, setHov] = useState(false);
  const isImage = type.key === 'image';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#0d1425', border: `1px solid ${hov ? type.color + '40' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, overflow: 'hidden',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 14px 36px -8px ${type.color}20` : '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.25s',
      }}
    >
      {/* Thumbnail / preview area */}
      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${type.color}0a`, borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        {isImage && file.file ? (
          <img src={file.file} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ color: type.color, opacity: 0.7 }}>
            {React.cloneElement(type.icon, { size: 48 })}
          </div>
        )}
        {/* Hover overlay */}
        {hov && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <button onClick={() => onPreview(file)} style={{ ...iconBtn(C.brand), backdropFilter: 'blur(4px)' }} title="Preview">
              <Eye size={14} />
            </button>
            <a href={file.file} download={name} style={{ ...iconBtn(C.emerald), backdropFilter: 'blur(4px)', textDecoration: 'none' }} title="Download">
              <Download size={14} />
            </a>
            <button onClick={() => onDelete(file.id)} style={{ ...iconBtn(C.rose), backdropFilter: 'blur(4px)' }} title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: '0 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>
          {name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: type.color, background: `${type.color}15`, padding: '2px 7px', borderRadius: 5 }}>
            {type.label}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            {formatSize(file.file_size)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* File list row */
function FileRow({ file, onPreview, onDelete }) {
  const name = file.file_name || file.file?.split('/').pop() || 'Untitled';
  const type = getFileType(name);
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: hov ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${type.color}14`, border: `1px solid ${type.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, flexShrink: 0 }}>
        {type.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          {formatSize(file.file_size)} · {relativeTime(file.uploaded_at || file.created_at)}
          {file.uploaded_by_name && ` · ${file.uploaded_by_name}`}
        </p>
      </div>

      <span style={{ fontSize: 10, fontWeight: 700, color: type.color, background: `${type.color}15`, padding: '3px 9px', borderRadius: 6, flexShrink: 0 }}>
        {type.label}
      </span>

      {hov && (
        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
          <button onClick={() => onPreview(file)} style={iconBtn(C.brand)} title="Preview"><Eye size={13} /></button>
          <a href={file.file} download={name} style={{ ...iconBtn(C.emerald), textDecoration: 'none' }} title="Download"><Download size={13} /></a>
          <button onClick={() => onDelete(file.id)} style={iconBtn(C.rose)} title="Delete"><Trash2 size={13} /></button>
        </div>
      )}
    </div>
  );
}

/* Preview modal */
function PreviewModal({ file, onClose }) {
  if (!file) return null;
  const name = file.file_name || file.file?.split('/').pop() || '';
  const type = getFileType(name);
  const isImage = type.key === 'image';
  const isPDF   = name.toLowerCase().endsWith('.pdf');
  const isVideo = type.key === 'video';
  const isAudio = type.key === 'audio';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 1000, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ color: type.color }}>{type.icon}</div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          <a href={file.file} download={name} style={{ ...iconBtn(C.emerald), textDecoration: 'none' }} title="Download"><Download size={15} /></a>
          <button onClick={onClose} style={iconBtn(C.rose)}><X size={15} /></button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08101f', minHeight: 300 }}>
          {isImage && <img src={file.file} alt={name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />}
          {isPDF  && <iframe src={file.file} title={name} style={{ width: '100%', height: '75vh', border: 'none' }} />}
          {isVideo && <video src={file.file} controls style={{ maxWidth: '100%', maxHeight: '75vh' }} />}
          {isAudio && <audio src={file.file} controls style={{ margin: '40px auto' }} />}
          {!isImage && !isPDF && !isVideo && !isAudio && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: type.color, marginBottom: 20 }}>{React.cloneElement(type.icon, { size: 64 })}</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>No preview available</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>Download the file to view it.</p>
              <a href={file.file} download={name} style={{ ...primaryBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Download size={14} /> Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: '9px 18px', borderRadius: 10,
  background: `linear-gradient(90deg,${C.brand},${C.violet})`,
  color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
};

function iconBtn(color) {
  return {
    width: 30, height: 30, borderRadius: 8,
    background: `${color}15`, border: `1px solid ${color}30`,
    color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.15s',
    flexShrink: 0,
  };
}

/* ── Upload queue item ─────────────────────────────────────── */
function UploadItem({ name, pct, done, error }) {
  const type = getFileType(name);
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: type.color, flexShrink: 0 }}>{type.icon}</div>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: done ? C.emerald : error ? C.rose : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
          {done ? '✓' : error ? '✕' : `${pct}%`}
        </span>
      </div>
      {!done && !error && <ProgressBar pct={pct} color={type.color} />}
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────── */
export default function Files() {
  const { activeWorkspace } = useStore();
  const [fileList,  setFileList ] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [queue,     setQueue    ] = useState([]); // { name, pct, done, error }
  const [preview,   setPreview  ] = useState(null);
  const [viewMode,  setViewMode ] = useState('grid'); // 'grid' | 'list'
  const [search,    setSearch   ] = useState('');
  const [typeFilter,setTypeFilter] = useState('all');
  const [dragging,  setDragging ] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef      = useRef(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await filesApi.list({});
      const data = res.data;
      setFileList(Array.isArray(data) ? data : data?.results || data?.data || []);
    } catch { toast.error('Failed to load files'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  /* Drag-and-drop handlers */
  const onDragOver  = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = e => { if (!dropRef.current?.contains(e.relatedTarget)) setDragging(false); };
  const onDrop      = e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); };

  const uploadFiles = async (rawFiles) => {
    const arr = Array.from(rawFiles);
    if (!arr.length) return;

    const newItems = arr.map(f => ({ name: f.name, pct: 0, done: false, error: false }));
    setQueue(prev => [...prev, ...newItems]);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const qIdx = queue.length + i; // rough index — use name as key

      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_name', file.name);
      formData.append('file_size', file.size);
      formData.append('content_type', 'workspace');
      formData.append('object_id', activeWorkspace?.id || 1);

      try {
        // Simulate progress using XMLHttpRequest for real progress events
        const uploadedFile = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${import.meta.env.PROD ? 'https://remote-team-manager-production.up.railway.app/api' : '/api'}/file-attachments/`);
          const token = localStorage.getItem('rtm_access');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setQueue(prev => prev.map(q => q.name === file.name && !q.done ? { ...q, pct } : q));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data.data || data);
              } catch { reject(new Error('Parse error')); }
            } else {
              reject(new Error(xhr.statusText));
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(formData);
        });

        setQueue(prev => prev.map(q => q.name === file.name ? { ...q, pct: 100, done: true } : q));
        setFileList(prev => [uploadedFile, ...prev]);
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        setQueue(prev => prev.map(q => q.name === file.name ? { ...q, error: true } : q));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Clear done/error items from queue after 3 sec
    setTimeout(() => {
      setQueue(prev => prev.filter(q => !q.done && !q.error));
    }, 3000);
  };

  const handleFileInput = (e) => {
    uploadFiles(e.target.files);
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await filesApi.delete(id);
      setFileList(prev => prev.filter(f => f.id !== id));
      toast.success('File deleted');
    } catch { toast.error('Failed to delete file'); }
  };

  /* Filtering */
  const filtered = fileList.filter(f => {
    const name = (f.file_name || f.file?.split('/').pop() || '').toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all') {
      const t = getFileType(name);
      if (t.key !== typeFilter) return false;
    }
    return true;
  });

  /* ── Render ── */
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 'clamp(16px,2.5vw,28px) clamp(16px,3vw,32px)', background: 'var(--bg,#060b18)', maxWidth: 1440, margin: '0 auto' }}>

      <PreviewModal file={preview} onClose={() => setPreview(null)} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(51,102,255,0.1)', border: '1px solid rgba(51,102,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} color={C.brand} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 3px' }}>Files & Assets</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              {loading ? 'Loading…' : `${fileList.length} file${fileList.length !== 1 ? 's' : ''} · ${formatSize(fileList.reduce((s, f) => s + (f.file_size || 0), 0))} total`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadFiles} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <RefreshCw size={13} />
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileInput} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: `linear-gradient(90deg,${C.brand},${C.violet})`, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, boxShadow: '0 4px 14px rgba(51,102,255,0.3)' }}
          >
            <Upload size={14} /> Upload Files
          </button>
        </div>
      </div>

      {/* ── Upload queue ── */}
      {queue.length > 0 && (
        <div style={{ background: '#0d1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={14} color={C.brand} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Uploading {queue.filter(q => !q.done && !q.error).length} file(s)…</span>
          </div>
          {queue.map((q, i) => <UploadItem key={i} {...q} />)}
        </div>
      )}

      {/* ── Toolbar: search + filter + view ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files…"
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 11, boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff', fontSize: 13, outline: 'none' }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all" style={{ background: '#0d1425' }}>All types</option>
          {Object.entries(FILE_TYPES).map(([k, t]) => (
            <option key={k} value={k} style={{ background: '#0d1425' }}>{t.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 11 }}>
          {[{ mode: 'grid', icon: <Grid size={15} /> }, { mode: 'list', icon: <List size={15} /> }].map(({ mode, icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '6px 10px', borderRadius: 8,
              background: viewMode === mode ? '#0d1425' : 'transparent',
              border: viewMode === mode ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              color: viewMode === mode ? '#fff' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', display: 'flex', transition: 'all 0.15s',
            }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Drop zone ── */}
      <div
        ref={dropRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.brand : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 16, padding: '22px', textAlign: 'center', marginBottom: 20,
          background: dragging ? 'rgba(51,102,255,0.06)' : 'rgba(255,255,255,0.02)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <Upload size={22} color={dragging ? C.brand : 'rgba(255,255,255,0.2)'} style={{ margin: '0 auto 8px', display: 'block' }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: dragging ? C.brand : 'rgba(255,255,255,0.3)', margin: 0 }}>
          {dragging ? 'Drop to upload' : 'Drag & drop files here, or click to browse'}
        </p>
      </div>

      {/* ── File list / grid ── */}
      {loading ? (
        viewMode === 'grid'
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
              {[...Array(8)].map((_, i) => <Skel key={i} h={210} r={16} />)}
            </div>
          : <div style={{ background: '#0d1425', borderRadius: 16, overflow: 'hidden' }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                  <Skel w={38} h={38} r={10} />
                  <div style={{ flex: 1 }}><Skel h={12} w="50%" style={{ marginBottom: 6 }} /><Skel h={9} w="30%" /></div>
                </div>
              ))}
            </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0d1425', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <FolderOpen size={42} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 14px', display: 'block' }} />
          <p style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
            {search || typeFilter !== 'all' ? 'No files match your filter' : 'No files uploaded yet'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: '0 0 22px' }}>
            {search || typeFilter !== 'all' ? 'Try a different search or filter.' : 'Upload files to get started.'}
          </p>
          {!search && typeFilter === 'all' && (
            <button onClick={() => fileInputRef.current?.click()} style={{ ...primaryBtn, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Upload size={14} /> Upload First File
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
          {filtered.map(f => <FileCard key={f.id} file={f} onPreview={setPreview} onDelete={handleDelete} />)}
        </div>
      ) : (
        <div style={{ background: '#0d1425', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {filtered.map(f => <FileRow key={f.id} file={f} onPreview={setPreview} onDelete={handleDelete} />)}
        </div>
      )}

      <style>{`
        @keyframes skelPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
