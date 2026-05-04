import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { files } from '../services/api'
import toast from 'react-hot-toast'

export default function Files() {
  const { theme } = useStore()
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    loadFiles()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadFiles = async () => {
    try {
      const res = await files.list()
      setFileList(res.data)
    } catch { toast.error('Telemetry failed to sync') } finally { setLoading(false) }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('content_type', 'workspace')
    formData.append('object_id', 1) 
    setUploading(true)
    try {
      const res = await files.upload(formData)
      setFileList(prev => [res.data, ...prev])
      toast.success('Asset deployed! 🚀')
    } catch { toast.error('Link failure') } finally { setUploading(false); e.target.value = '' }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const PreviewModal = () => {
    if (!preview) return null
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(preview.file)
    const isPDF = /\.pdf$/i.test(preview.file)
    return (
      <div className="overlay" style={{ zIndex: 2000 }} onClick={() => setPreview(null)}>
        <div className="card glass" style={{ width: '95%', maxWidth: 1100, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800, color: 'var(--text)' }}>PREVIEW: {preview.file?.split('/').pop()}</h3>
            <button className="btn-icon" onClick={() => setPreview(null)}>✕</button>
          </div>
          <div style={{ flex: 1, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isImage ? ( <img src={preview.file} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> ) : 
             isPDF ? ( <iframe src={preview.file} style={{ width: '100%', height: '100%', border: 'none' }} /> ) : (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>📄</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>PREVIEW UNAVAILABLE</div>
                <a href={preview.file} className="btn btn-primary" style={{ marginTop: 24 }} target="_blank" rel="noreferrer">DOWNLOAD RESOURCE</a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: '100vh', padding: isMobile ? '40px 16px' : '80px 24px' }}>
      <PreviewModal />
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, flexWrap:'wrap', gap:24 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'var(--text)', letterSpacing:'-0.03em' }}>Resources & Assets</h1>
            <p style={{ color: 'var(--text2)', marginTop: 8, fontWeight:500 }}>Secure decentralized storage for your mission-critical files.</p>
          </div>
          <div>
            <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleUpload} />
            <label htmlFor="fileUpload" className="btn btn-primary" style={{ cursor: 'pointer', padding:'16px 32px', borderRadius:16, fontWeight:800 }}>
              {uploading ? 'Transmitting...' : '☁️ UPLOAD RESOURCE'}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="grid-responsive">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />)}
          </div>
        ) : fileList.length === 0 ? (
          <div className="card glass" style={{ padding: 80, textAlign: 'center' }}>
             <div style={{ fontSize: 64, marginBottom: 24 }}>📁</div>
             <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>No Assets Detected</div>
             <p style={{ color: 'var(--text3)', marginTop: 12 }}>Upload resources to initialize the workspace library.</p>
          </div>
        ) : isMobile ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
            {fileList.map((f, i) => (
              <div key={f.id || i} className="card glass" style={{ padding:24 }}>
                 <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'var(--brand-bg)', color:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📄</div>
                    <div style={{ overflow:'hidden' }}>
                       <div style={{ fontWeight:800, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.file?.split('/').pop()}</div>
                       <div style={{ fontSize:12, color:'var(--text3)', fontWeight:700 }}>{formatSize(f.file_size)} • v{f.version || 1}</div>
                    </div>
                 </div>
                 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <button onClick={() => setPreview(f)} className="btn btn-secondary" style={{ padding:12, fontSize:13 }}>Preview</button>
                    <a href={f.file} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding:12, fontSize:13, textAlign:'center', textDecoration:'none' }}>Download</a>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card glass" style={{ padding: 0, overflow:'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing:1.5 }}>
                  <th style={{ padding: '24px 32px', fontWeight: 900 }}>Resource Name</th>
                  <th style={{ padding: '24px 32px', fontWeight: 900 }}>Rev</th>
                  <th style={{ padding: '24px 32px', fontWeight: 900 }}>Capacity</th>
                  <th style={{ padding: '24px 32px', fontWeight: 900 }}>Timestamp</th>
                  <th style={{ padding: '24px 32px', fontWeight: 900, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fileList.map((f, i) => (
                  <tr key={f.id || i} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '24px 32px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap:16 }}>
                      <div style={{ width:40, height:40, borderRadius:12, background:'var(--brand-bg)', color:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📄</div>
                      {f.file?.split('/').pop()}
                    </td>
                    <td style={{ padding: '24px 32px', color: 'var(--text2)', fontWeight:600 }}>v{f.version || 1}</td>
                    <td style={{ padding: '24px 32px', color: 'var(--text2)', fontWeight:600 }}>{formatSize(f.file_size)}</td>
                    <td style={{ padding: '24px 32px', color: 'var(--text3)', fontSize: 13, fontWeight:700 }}>{new Date(f.uploaded_at).toLocaleDateString()}</td>
                    <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                        <button onClick={() => setPreview(f)} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>PREVIEW</button>
                        <a href={f.file} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 12, textDecoration:'none' }}>DOWNLOAD</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
