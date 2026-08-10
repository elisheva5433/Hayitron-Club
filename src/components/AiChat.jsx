import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LOCAL_RESPONSES = {
  יתרה: () => 'ניתן לבדוק את היתרה הזמינה בכרטיס באזור האישי שלך.',
  הפעל: () => 'כדי להפעיל כרטיס חדש, היכנסי לאזור האישי והזיני את מספר הכרטיס ותעודת הזהות.',
  'קבוצת רכישה': () => 'ניתן להצביע על מוצר החודש ולהירשם לקבוצת הרכישה בעמוד "קהילה".',
  הטב: () => 'ניתן לחפש הטבות לפי קטגוריה ואזור בעמוד "הטבות".',
  חסום: () => 'אם הכרטיס חסום, פנה/י למוקד השירות דרך דף יצירת הקשר לאימות זהות ושחרור הכרטיס.',
};

function fallbackResponse(question) {
  for (const [key, fn] of Object.entries(LOCAL_RESPONSES)) {
    if (question.includes(key)) return fn();
  }
  return 'אני יכול לעזור בנושאי הטבות, קבוצות רכישה, הפעלת כרטיס ובדיקת יתרה. אפשר לנסח את השאלה קצת אחרת?';
}

export default function AiChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: 'שלום! אני העוזר האישי של מועדון היתרון. אפשר לשאול אותי על הטבות, קבוצת הרכישה, סטטוס כרטיס ויתרה. איך אפשר לעזור?' }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const systemPrompt = `את/ה העוזר האישי הדיגיטלי של 'מועדון היתרון' - מועדון הטבות קהילתי בישראל עם כרטיסי חברות, אינדקס הטבות בבתי עסק, קבוצות רכישה חודשיות ופורום קהילתי. ענה/י תמיד בעברית, בקצרה (2-3 משפטים), בטון ידידותי ומקצועי.${user ? ` המשתמש הנוכחי: ${user.name}, יתרה: ₪${user.balance || 0}.` : ''}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history, system: systemPrompt }),
      });

      const data = await res.json();
      const answer = data.answer || fallbackResponse(q.toLowerCase());
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
      setHistory(prev => [...prev, { role: 'user', content: q }, { role: 'assistant', content: answer }]);
    } catch {
      const answer = fallbackResponse(q.toLowerCase());
      setMessages(prev => [...prev, { role: 'bot', text: answer }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="פתח את העוזר האישי"
        style={{
          position: 'fixed', bottom: '22px', left: '22px', zIndex: 60,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--gold-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
          transition: 'transform .2s ease', border: 'none', cursor: 'pointer',
          transform: open ? 'scale(1.06)' : 'scale(1)',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 3C7 3 3 6.6 3 11c0 2.4 1.2 4.6 3.1 6.1-.1 1-.5 2.3-1.3 3.4 1.6-.2 3-.8 4.1-1.5.7.2 1.4.3 2.1.3 5 0 9-3.6 9-8 0-4.4-4-8-9-8Z" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="8.5" cy="11" r="1" fill="currentColor"/>
          <circle cx="12" cy="11" r="1" fill="currentColor"/>
          <circle cx="15.5" cy="11" r="1" fill="currentColor"/>
        </svg>
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '92px', left: '22px', zIndex: 60,
          width: 'min(360px, 88vw)', maxHeight: '70vh',
          background: '#fff', borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)',
          border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--ink)', color: '#fff' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>העוזר האישי של היתרון</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>זמין 24/7 · מבוסס בינה מלאכותית</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                background: m.role === 'bot' ? 'var(--paper-dim)' : 'var(--ink)',
                color: m.role === 'bot' ? 'var(--ink)' : '#fff',
                borderRadius: m.role === 'bot' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                padding: '0.6rem 0.85rem', fontSize: '0.88rem',
                alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ background: 'var(--paper-dim)', borderRadius: '14px 14px 14px 4px', padding: '0.6rem 0.85rem', fontSize: '0.88rem', alignSelf: 'flex-start', color: 'var(--ink-soft)' }}>
                ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: '0.75rem', borderTop: '1px solid var(--line)', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="field"
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              placeholder="שאל/י על יתרה, הטבות, קבוצות רכישה..."
              disabled={loading}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.9rem' }} disabled={loading}>
              שלח
            </button>
          </form>
        </div>
      )}
    </>
  );
}
