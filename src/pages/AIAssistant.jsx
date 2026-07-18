import { useState, useEffect, useCallback } from 'react';
import * as tokens from '../styles/tokens';
import { useStore } from '../store';
import { ai, task, unwrapData } from '../services/api';
import toast from 'react-hot-toast';
import { getT } from '../i18n';
import { Sparkles, Send, Brain, BarChart2, PenTool, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const cardBase = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: tokens.radius.lg, padding: 'clamp(16px,2vw,20px)' };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 };
const statBox = { flex: '1 1 100px', textAlign: 'center', padding: '12px 8px', background: 'var(--bg3)', borderRadius: tokens.radius.md };
const statValue = { fontSize: 22, fontWeight: 800, color: 'var(--brand)' };
const statLabel = { fontSize: 11, color: 'var(--text3)', marginTop: 2 };

export default function AIAssistant() {
  const { activeWorkspace, lang = 'en' } = useStore();
  const t = getT(lang || 'en');

  const [prompt, setPrompt] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [suggestingLoading, setSuggestingLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [writeContent, setWriteContent] = useState('');
  const [writeResult, setWriteResult] = useState('');
  const [writeLoading, setWriteLoading] = useState(false);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await ai.insights();
      setInsights(unwrapData(res));
    } catch {
      toast.error('Failed to load insights');
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await ai.summary();
      setSummary(unwrapData(res));
    } catch {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
    loadSummary();
  }, [loadInsights, loadSummary]);

  const handleSuggest = async () => {
    if (!prompt.trim() || suggestingLoading) return;
    setSuggestingLoading(true);
    setSuggestedTasks([]);
    setAddedIds(new Set());
    try {
      const res = await ai.suggestTasks(prompt);
      const data = unwrapData(res);
      const tasks = data?.tasks || data?.suggestions || (Array.isArray(data) ? data : []);
      setSuggestedTasks(tasks.map((s, i) => ({ id: i, title: s.title || s.name || s.text || String(s), description: s.description || s.details || '' })));
    } catch {
      toast.error('Failed to get suggestions');
    } finally {
      setSuggestingLoading(false);
    }
  };

  const handleAddTask = async (suggestedTask) => {
    if (!activeWorkspace) return;
    try {
      await task.create(activeWorkspace.id, null, { title: suggestedTask.title, description: suggestedTask.description });
      setAddedIds(prev => new Set([...prev, suggestedTask.id]));
      toast.success('Task added');
    } catch {
      toast.error('Failed to add task');
    }
  };

  const handleWrite = async () => {
    if (!writeContent.trim() || writeLoading) return;
    setWriteLoading(true);
    setWriteResult('');
    try {
      const res = await ai.write({ content: writeContent, action: 'improve' });
      const data = unwrapData(res);
      setWriteResult(data?.result || data?.content || data?.text || (typeof data === 'string' ? data : ''));
    } catch {
      toast.error('Failed to improve writing');
    } finally {
      setWriteLoading(false);
    }
  };

  const completionRate = summary ? (summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0) : 0;

  return (
    <div className="p-4 md:p-6" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
        <span className="flex items-center gap-2"><Sparkles size={20} style={{ color: 'var(--brand)' }} /> {t('ai.title', 'AI Assistant')}</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

        <div style={{ ...cardBase, gridColumn: 'span 1 / -1' }}>
          <div style={sectionTitle}><Brain size={16} style={{ color: 'var(--brand)' }} /> AI Task Suggestions</div>
          <form onSubmit={e => { e.preventDefault(); handleSuggest(); }} className="flex gap-2" style={{ marginBottom: 12 }}>
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe what tasks you need..."
              style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              disabled={suggestingLoading}
            />
            <Button type="submit" variant="primary" size="md" leftIcon={<Send size={14} />} loading={suggestingLoading} disabled={!prompt.trim() || suggestingLoading}>
              Suggest
            </Button>
          </form>
          {suggestedTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestedTasks.map(st => (
                <div key={st.id} className="flex items-center gap-3" style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: tokens.radius.md, border: '1px solid var(--border)' }}>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{st.title}</div>
                    {st.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{st.description}</div>}
                  </div>
                  <Button
                    variant={addedIds.has(st.id) ? 'secondary' : 'primary'}
                    size="sm"
                    leftIcon={<Plus size={14} />}
                    disabled={addedIds.has(st.id)}
                    onClick={() => handleAddTask(st)}
                  >
                    {addedIds.has(st.id) ? 'Added' : 'Add'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={cardBase}>
          <div style={sectionTitle}><BarChart2 size={16} style={{ color: 'var(--brand)' }} /> {t('ai.insights', 'Workspace Insights')}</div>
          {insightsLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size={24} /></div>
          ) : insights ? (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>
                Productivity Score: <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: 18 }}>{insights.productivity_score ?? insights.productivity ?? '—'}</span>
              </div>
              <div className="flex gap-3" style={{ marginBottom: 12 }}>
                <div style={statBox}>
                  <div style={statValue}>{insights.task_count ?? insights.total_tasks ?? 0}</div>
                  <div style={statLabel}>Tasks</div>
                </div>
                <div style={statBox}>
                  <div style={statValue}>{insights.completed_count ?? insights.completed ?? 0}</div>
                  <div style={statLabel}>Completed</div>
                </div>
              </div>
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>Recommendations</div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{typeof rec === 'string' ? rec : rec.text || rec.message || JSON.stringify(rec)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No insights available</div>
          )}
        </div>

        <div style={cardBase}>
          <div style={sectionTitle}><BarChart2 size={16} style={{ color: 'var(--brand)' }} /> {t('ai.summary', 'Task Summary')}</div>
          {summaryLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner size={24} /></div>
          ) : summary ? (
            <div>
              <div className="flex gap-3" style={{ marginBottom: 12 }}>
                <div style={statBox}>
                  <div style={statValue}>{summary.total ?? 0}</div>
                  <div style={statLabel}>Total</div>
                </div>
                <div style={statBox}>
                  <div style={statValue}>{summary.done ?? 0}</div>
                  <div style={statLabel}>Done</div>
                </div>
                <div style={statBox}>
                  <div style={statValue}>{summary.in_progress ?? summary.inProgress ?? 0}</div>
                  <div style={statLabel}>In Progress</div>
                </div>
                <div style={statBox}>
                  <div style={statValue}>{summary.todo ?? 0}</div>
                  <div style={statLabel}>To Do</div>
                </div>
                <div style={{ ...statBox, background: 'rgba(239,68,68,0.1)' }}>
                  <div style={{ ...statValue, color: '#ef4444' }}>{summary.overdue ?? 0}</div>
                  <div style={statLabel}>Overdue</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Completion Rate: {completionRate}%</div>
              <div style={{ width: '100%', height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--brand)', borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>No summary available</div>
          )}
        </div>

        <div style={{ ...cardBase, gridColumn: 'span 1 / -1' }}>
          <div style={sectionTitle}><PenTool size={16} style={{ color: 'var(--brand)' }} /> {t('ai.writing', 'AI Writing Assistant')}</div>
          <textarea
            value={writeContent}
            onChange={e => setWriteContent(e.target.value)}
            placeholder="Paste or type content to improve..."
            rows={5}
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: 10 }}
            disabled={writeLoading}
          />
          <Button variant="primary" size="md" leftIcon={<Sparkles size={14} />} loading={writeLoading} disabled={!writeContent.trim() || writeLoading} onClick={handleWrite}>
            Improve Writing
          </Button>
          {writeResult && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--bg3)', borderRadius: tokens.radius.md, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>Improved Version</div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{writeResult}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
