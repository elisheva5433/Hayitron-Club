import { useState } from 'react';

const INITIAL_VOTES = [
  { id: 'stroller', name: 'עגלת תינוקות פרימיום', emoji: '🛒', price: '₪890 (מחיר רגיל ₪1,450)', votes: 142 },
  { id: 'freezer', name: 'מקפיא 5 מגירות', emoji: '🧊', price: '₪1,290 (מחיר רגיל ₪1,890)', votes: 97 },
  { id: 'oven', name: 'תנור אפייה משולב', emoji: '🔥', price: '₪2,190 (מחיר רגיל ₪2,990)', votes: 118 },
];

const INITIAL_POSTS = [
  { author: 'מיכל א.', time: 'לפני שעתיים', text: 'מישהו יכול להמליץ על מוצר לחודש הבא? הייתי שמחה לראות מכונת כביסה בקבוצת הרכישה הבאה.' },
  { author: 'אורי ב.', time: 'אתמול', text: 'קניתי את המקרר מקבוצת הרכישה הקודמת — שירות מעולה וההנחה הייתה משמעותית. ממליץ בחום!' },
  { author: 'דנה כ.', time: 'לפני יומיים', text: 'האם אפשר להוסיף למועדון גם בתי עסק לטיפוח חיות מחמד? יש לי כמה המלצות טובות באזור השרון.' },
];

function CommunityPage() {
  const [votes, setVotes] = useState(INITIAL_VOTES);
  const [votedId, setVotedId] = useState(null);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');

  const totalVotes = votes.reduce((s, v) => s + v.votes, 0);

  function castVote(id) {
    if (votedId === id) return;
    setVotes((prev) => prev.map((v) => v.id === id ? { ...v, votes: v.votes + 1 } : (votedId === v.id ? { ...v, votes: v.votes - 1 } : v)));
    setVotedId(id);
  }

  function addPost(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosts([{ author: 'אתם', time: 'עכשיו', text: newPost.trim() }, ...posts]);
    setNewPost('');
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
            <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>הצבעה — מוצר חודש אוגוסט</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {votes.map((v) => {
                const pct = Math.round((v.votes / totalVotes) * 100);
                const isVoted = votedId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => castVote(v.id)}
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{v.votes} קולות</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {votedId && <p style={{ marginTop: '0.75rem', color: 'var(--teal)', fontWeight: 600, fontSize: '0.9rem' }}>✓ הצבעתם נרשמה!</p>}
          </div>

          <div>
            <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>פורום הקהילה</h3>
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
                <div key={i} className="tile" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{p.author}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{p.time}</span>
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

