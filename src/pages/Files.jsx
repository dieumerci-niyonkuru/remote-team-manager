import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { files } from '../services/api'
import toast from 'react-hot-toast'

export default function Files() {
  const { theme } = useStore()
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  const [preview, setPreview] = useState(null)

  const loadFiles = async () => {
    try {
      const res = await files.list()
      setFileList(res.data)
    } catch {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
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
      toast.success('File uploaded successfully!')
    } catch {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      e.target.value = '' // reset input
    }
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
      <div className="overlay" style={{ zIndex: 1000 }} onClick={() => setPreview(null)}>
        <div className="card scale-in" style={{ width: '90%', maxWidth: 1000, height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text)' }}>Preview: {preview.file?.split('/').pop()}</h3>
            <button className="btn-icon" onClick={() => setPreview(null)}>✕</button>
          </div>
          <div style={{ flex: 1, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {isImage ? (
              <img src={preview.file} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : isPDF ? (
              <iframe src={preview.file} title="PDF Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 16 }}>Preview not available for this file type.</div>
                <a href={preview.file} className="btn btn-primary" style={{ marginTop: 16 }} target="_blank" rel="noreferrer">Download to View</a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={theme} style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)', padding: '32px 24px' }}>
      <PreviewModal />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--text)' }}>
              Resources & Files
            </h1>
            <p style={{ color: 'var(--text2)', marginTop: 4 }}>Manage all your workspace attachments and file versions securely.</p>
          </div>
          <div>
            <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleUpload} />
            <label htmlFor="fileUpload" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {uploading ? 'Uploading...' : '☁️ Upload File'}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        ) : (
          <div className="card" style={{ padding: 24 }}>
            {fileList.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text2)' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>No files uploaded yet.</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Upload resources to share with your team.</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text2)', fontSize: 13, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Version</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Size</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Uploaded</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fileList.map((f, i) => {
                    const fileName = f.file?.split('/').pop() || 'Unknown File'
                    return (
                      <tr key={f.id || i} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                        <td style={{ padding: '16px', fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            📄
                          </div>
                          {fileName}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text2)' }}>v{f.version || 1}</td>
                        <td style={{ padding: '16px', color: 'var(--text2)' }}>{formatSize(f.file_size || 102400)}</td>
                        <td style={{ padding: '16px', color: 'var(--text3)', fontSize: 13 }}>{new Date(f.uploaded_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setPreview(f)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Preview</button>
                          <a href={f.file} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Download</a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
