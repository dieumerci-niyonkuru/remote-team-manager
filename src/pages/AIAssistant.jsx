import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { ai as aiApi, proj, task, ws as wsApi } from '../services/api';
import { Sparkles, Send, RefreshCw, RotateCcw, Zap, Target, BarChart2, Users, CheckSquare } from 'lucide-react';

const C = { brand: '#3366ff', violet: '#8b5cf6', emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444' };

const QUICK_PROMPTS = [
  { icon: <Target size={14} />,    text: 'Break down this week\'s sprint into tasks', color: C.brand },
  { icon: <BarChart2 size={14} />, text: 'Analyze team productivity and bottlenecks', color: C.violet },
  { icon: <Users size={14} />,     text: 'Suggest workload distribution for the team', color: C.emerald },
  { icon: <CheckSquare size={14} />, text: 'List high-priority tasks due this week',   color: C.amber },
  { icon: <Zap size={14} />,       text: 'Generate a weekly summary for stakeholders', color: C.rose },
];

/* ── Format AI message (bold, bullets) ─────────────────────── */
function FormattedMessage({ content }) {
  const lines = content.split('\n');
  return (
    <div style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)' }}>
      {lines.map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: C.brand, flexShrink: 0, marginTop: 2 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[•\-] /, '')) }} />
            </div>
          );
        }
        if (/^\*\*(.+)\*\*/.test(line)) {
          return <p key={i} style={{ fontWeight: 800, color: '#fff', margin: '8px 0 4px' }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        }
        return line ? <p key={i} style={{ margin: '3px 0' }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} /> : <br key={i} />;
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:800">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12px">$1</code>');
}

/* ── Typing indicator ───────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.4)',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────── */
export default function AIAssistant() {
  const { user, activeWorkspace } = useStore();
  const name = user?.first_name || user?.username || 'there';

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hello ${name}! I'm your AI productivity co-pilot. 🧠\n\nI can help you:\n• **Break down tasks** from a high-level goal\n• **Analyze team velocity** and bottlenecks\n• **Generate summaries** for stakeholders\n• **Suggest workload distribution** across team members\n\nWhat would you like to explore today?`,
    }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.suggestTasks(msg);
      const data = res.data;
      let aiContent = '';

      if (data?.command_type === 'breakdown' && Array.isArray(data.tasks)) {
        aiContent = `Here's a task breakdown for your request:\n\n${
          data.tasks.map(t =>
            `• **${t.title}** [${(t.priority || 'medium').toUpperCase()}]\n  ${t.description || ''}`
          ).join('\n\n')
        }`;
      } else if (data?.tasks && Array.isArray(data.tasks)) {
        aiContent = data.tasks.map(t => `• **${t.title}** — ${t.description || ''}`).join('\n');
      } else if (data?.message) {
        aiContent = data.message;
      } else if (typeof data === 'string') {
        aiContent = data;
      } else {
        aiContent = "I've processed your request. Try asking me to break down a specific goal, analyze your team's workload, or generate a summary.";
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);
    } catch (err) {
      const msg = err.response?.status === 429
        ? "You've hit the rate limit. Please wait a moment before sending another request."
        : "I'm having trouble connecting to the AI core. Please try again in a moment.";
      setMessages(prev => [...prev, { role: 'ai', content: msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([{
      role: 'ai',
      content: `Chat cleared! How can I help you, ${name}?`,
    }]);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg,#060b18)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0a1020', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg,#3366ff,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(51,102,255,0.4)',
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              AI Productivity Co-pilot
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.emerald, boxShadow: `0 0 6px ${C.emerald}` }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                Online · {activeWorkspace?.name || 'No workspace selected'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <RotateCcw size={12} /> Clear Chat
        </button>
      </div>

      {/* ── Message list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12,
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '82%', animation: 'fadeInUp 0.25s ease',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg,#3366ff,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(51,102,255,0.35)', marginTop: 2,
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
            )}
            <div style={{
              padding: m.role === 'user' ? '12px 16px' : '14px 18px',
              borderRadius: 16,
              borderTopRightRadius: m.role === 'user' ? 4 : 16,
              borderTopLeftRadius: m.role === 'ai' ? 4 : 16,
              background: m.role === 'user'
                ? 'linear-gradient(135deg,#3366ff,#8b5cf6)'
                : 'rgba(255,255,255,0.06)',
              border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.09)' : 'none',
              maxWidth: '100%',
            }}>
              {m.role === 'user'
                ? <p style={{ fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{m.content}</p>
                : <FormattedMessage content={m.content} />
              }
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start', animation: 'fadeInUp 0.2s ease' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#3366ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, borderTopLeftRadius: 4 }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts ── */}
      <div style={{ padding: '0 20px 12px', flexShrink: 0, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q.text)} disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                padding: '7px 13px', borderRadius: 20, flexShrink: 0,
                background: `${q.color}10`, border: `1px solid ${q.color}25`,
                color: q.color, fontSize: 11, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'all 0.15s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = `${q.color}20`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${q.color}10`)}
            >
              {q.icon} {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding: '0 20px 20px', flexShrink: 0 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, padding: '12px 14px 12px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(51,102,255,0.5)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about tasks, velocity, workload, summaries…"
            disabled={loading}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14, fontWeight: 500,
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading ? `linear-gradient(135deg,${C.brand},${C.violet})` : 'rgba(255,255,255,0.07)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s', boxShadow: input.trim() && !loading ? '0 2px 8px rgba(51,102,255,0.4)' : 'none',
            }}
          >
            {loading
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <Send size={14} />
            }
          </button>
        </form>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8, fontWeight: 500 }}>
          AI suggestions are generated to assist planning. Always verify with your team.
        </p>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
          40% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
