import { useStore } from '../store'
import { useT } from '../i18n'
export default function Analytics() {
  const { theme, lang } = useStore()
  const t = useT(lang)
  return <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}><div className="container"><h1>{t.analyticsDashboard}</h1><p>Team productivity charts and insights.</p></div></div>
}
