import { useStore } from '../store'
import { useT } from '../i18n'
export default function Support() {
  const { theme, lang } = useStore()
  const t = useT(lang)
  return <div className={theme} style={{ padding: '2rem', background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}><div className="container"><h1>{t.supportCenter}</h1><p>Help articles, FAQ, and contact support.</p></div></div>
}
