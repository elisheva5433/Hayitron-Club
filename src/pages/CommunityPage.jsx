import { useState, useEffect } from 'react';
import { createCommunityPost, getCommunityPosts, getVotes, castVote as submitVote } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VOTE_OPTIONS = [
  { id: 'stroller', name: 'עגלת תינוקות פרימיום', emoji: '🛒', price: '₪890 (מחיר רגיל ₪1,450)' },
  { id: 'freezer', name: 'מקפיא 5 מגירות', emoji: '🧊', price: '₪1,290 (מחיר רגיל ₪1,890)' },
  { id: 'oven', name: 'תנור אפייה משולב', emoji: '🔥', price: '₪2,190 (מחיר רגיל ₪2,990)' },
];

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      const diff = endOfMonth - now;
      if (diff <= 0) { setTimeLeft('ההצבעה נסגרה'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${days} ימים, ${hours} שעות, ${mins} דקות`);
    }
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, []);

  return timeLeft;
}

function CommunityPage() {
  const { member, isAuthenticated } = useAuth();
  const [votes, setVotes] = useState({});
  const [votedId, setVotedId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const countdown = useCountdown();

  useEffect(() => {
    getVotes(member?.email)
      .then(data => {
        const map = {};
        (data.votes || []).forEach(v => { map[v.optionId] = v.count; });
        setVotes(map);
        setVotedId(data.selectedOptionId || null);
      })
      .catch(() => {});
  }, [member?.email]);

  useEffect(() => {
    getCommunityPosts()
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  }, []);

  const totalVotes = VOTE_OPTIONS.reduce((s, v) => s + (votes[v.id] || 0), 0);

  async function castVote(id) {
    if (!isAuthenticated) return;
    try {
      const data = await submitVote({ optionId: id, userEmail: member.email });
      const map = {};
      (data.votes || []).forEach(v => { map[v.optionId] = v.count; });
      setVotes(map);
      setVotedId(data.selectedOptionId);
    } catch {}
  }

  async function addPost(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const data = await createCommunityPost({ author: 'אתם', text: newPost.trim() });
      setPosts((current) => [data.post, ...current]);
      setNewPost('');
    } catch {}
  }

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>קהילה</p>
          <h2 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>קבוצות רכישה ופורום</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>הצביעו על המוצר הבא, ושתפו גם אתם.</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.5rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: '1.25rem' }}>הצבעה — מוצר חודש אוגוסט</h3>
              {countdown && (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--coral)', background: 'rgba(193,72,61,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                  ⏱ נסגר בעוד {countdown}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {VOTE_OPTIONS.map((v) => {
                const count = votes[v.id] || 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isVoted = votedId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => castVote(v.id)}
                    disabled={!isAuthenticated}
                    style={{
                      textAlign: 'right', background: 'white', border: `1.5px solid ${isVoted ? 'var(--teal)' : 'var(--line)'}`,
                      borderRadius: '14px', padding: '1rem', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, right: 0, left: `${100 - pct}%`, background: 'rgba(47,111,98,0.07)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '1.4rem', marginLeft: '0.5rem' }}>{v.emoji}</span>
                        <strong>{v.name}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600 }}>{v.price}</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '50px' }}>
                        <div className="font-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: isVoted ? 'var(--teal)' : 'var(--ink)' }}>{pct}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{count} קולות</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!isAuthenticated && <p style={{ marginTop: '0.75rem', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>יש להתחבר לאזור האישי כדי להצביע.</p>}
            {votedId && <p style={{ marginTop: '0.75rem', color: 'var(--teal)', fontWeight: 600, fontSize: '0.9rem' }}>✓ הבחירה נשמרה. אפשר לבחור מוצר אחר כדי לשנות את ההצבעה.</p>}
          </div>

          <div>
            <h3 className="font-display" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>פורום הקהילה</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '1rem', lineHeight: 1.6 }}>
              רוצים לשתף המלצה, שאלה או עדכון? כתבו כאן והקהילה תקרא.
              אנא שמרו על שיח מכבד, ללא פרסומת או תכנים.
            </p>
            <form onSubmit={addPost} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
              <input
                className="field" placeholder="כתבו משהו לקהילה..."
                value={newPost} onChange={(e) => setNewPost(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn-teal" type="submit" style={{ padding: '0.7rem 1.2rem', whiteSpace: 'nowrap' }}>פרסום</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts.map((p, i) => (
                <div key={p.id || i} className="tile" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{p.author}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{p.createdAt || p.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55 }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default CommunityPage;

