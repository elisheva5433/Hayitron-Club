import { useState, useEffect } from 'react';

const cardTypes = [
  {
    id: 'basic', title: 'כרטיס בסיסי', cardName: 'ברכת הבית', tone: 'basic', price: '₪19', period: 'לחודש',
    perks: ['הטבות בסיסיות במאות עסקים', 'אינדקס הטבות מלא', 'אזור אישי דיגיטלי', 'גישה לפורום הקהילה'],
  },
  {
    id: 'vip', title: 'כרטיס פרימיום', cardName: 'בית נאמן', tone: 'vip', price: '₪49', period: 'לחודש',
    perks: ['כל הטבות הכרטיס הבסיסי', 'הנחות עומק בשותפים מובילים', 'הגרלות ואירועי VIP', 'עדיפות בקבוצות רכישה'],
  },
  {
    id: 'family', title: 'כרטיס עסקי / משפחתי', cardName: 'בית חלומותי', tone: 'family', price: '₪89', period: 'לחודש',
    perks: ['עד 5 מוטבים תחת חשבון אחד', 'דוח שימוש חודשי', 'ניהול הרשאות', 'תמיכה עדיפה'],
  },
];

function CardVisual({ tone, cardName }) {
  const lastDigits = { basic: '7790', vip: '4457', family: '2201' }[tone];
  return (
    <div style={{ perspective: '1200px', marginBottom: '1.5rem' }}>
      <div
        className={`membership-card ${tone}`}
        style={{
          minHeight: '200px', position: 'relative', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '1.3rem',
          transform: 'rotateY(-10deg) rotateX(5deg)',
          transition: 'transform .25s ease',
          boxShadow: '0 20px 50px -15px rgba(0,0,0,0.45)',
          borderRadius: '18px',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'rotateY(-3deg) rotateX(2deg) scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(5deg)'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.04em' }}>
            <img src="/לוגו הלב היהודי-02.png" alt="הלב היהודי" style={{ height: '28px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(2)' }} />
          </span>
          <div className="chip" />
        </div>
        <div>
          {cardName && (
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.02em', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
              {cardName}
            </div>
          )}
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '1rem', letterSpacing: '0.12em', opacity: 0.9 }}>
            {lastDigits} ···· ···· ····
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsPage() {
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', idNumber: '', address: '', email: '', phone: '', cardName: '' });

  useEffect(() => {
    if (chosen && !submitted) {
      document.getElementById('purchase-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [chosen]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, cardNumber: form.cardNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה בהרשמה');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>הצטרפות</p>
          <h2 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>הכרטיסים שלנו</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>בחרו את המסלול שמתאים לכם — ניתן לשדרג בכל עת.</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="grid-3">
            {cardTypes.map((card) => (
              <div key={card.id} className="tile" style={{ padding: '1.5rem', cursor: 'pointer', outline: chosen === card.id ? '2px solid var(--teal)' : 'none' }} onClick={() => setChosen(card.id)}>
                <CardVisual tone={card.tone} cardName={card.cardName} />
                <h3 style={{ margin: '0 0 0.25rem', fontFamily: "'Frank Ruhl Libre', serif" }}>{card.title}</h3>
                <p style={{ margin: '0 0 1rem', fontFamily: "'Rubik', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--gold)' }}>
                  {card.price} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--ink-soft)' }}>{card.period}</span>
                </p>
                <ul style={{ paddingRight: '1rem', margin: 0 }}>
                  {card.perks.map((p) => <li key={p} style={{ marginBottom: '0.3rem', fontSize: '0.92rem' }}>{p}</li>)}
                </ul>
                <button
                  className={chosen === card.id ? 'btn-primary' : 'btn-ghost'}
                  style={{ marginTop: '1.2rem', width: '100%' }}
                  onClick={() => setChosen(card.id)}
                  type="button"
                >
                  {chosen === card.id ? '✓ נבחר' : 'בחירה'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {chosen && !submitted && (
        <section id="purchase-flow" style={{ background: 'var(--paper-dim)', padding: '3.5rem 0' }}>
          <div className="container" style={{ maxWidth: '520px' }}>
            <h3 className="font-display" style={{ marginBottom: '1.2rem' }}>
              הצטרפות — {cardTypes.find((c) => c.id === chosen)?.title}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="label">שם מלא</label><input className="field" name="name" required placeholder="ישראל ישראלי" value={form.name} onChange={handleChange} /></div>
              <div><label className="label">תעודת זהות</label><input className="field" name="idNumber" required placeholder="000000000" value={form.idNumber} onChange={handleChange} /></div>
              <div><label className="label">כתובת מגורים</label><input className="field" name="address" required placeholder="רחוב, מספר, עיר" value={form.address} onChange={handleChange} /></div>
              <div><label className="label">אימייל</label><input className="field" name="email" type="email" required placeholder="mail@example.com" value={form.email} onChange={handleChange} /></div>
              <div><label className="label">טלפון נייד</label><input className="field" name="phone" type="tel" required placeholder="050-0000000" value={form.phone} onChange={handleChange} /></div>
              <div><label className="label">השם שיונפק על הכרטיס</label><input className="field" name="cardName" required placeholder="כפי שיופיע על הכרטיס הפיזי" value={form.cardName} onChange={handleChange} /></div>
              {error && <p style={{ color: 'var(--coral)', margin: 0 }}>{error}</p>}
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'שולח...' : 'אישור והצטרפות'}</button>
            </form>
          </div>
        </section>
      )}

      {submitted && (
        <section style={{ background: 'var(--paper-dim)', padding: '3.5rem 0' }}>
          <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <h3 className="font-display">ברוכים הבאים למועדון!</h3>
            <p style={{ color: 'var(--ink-soft)' }}>פרטי ההצטרפות נשלחו לאימייל שלכם.</p>
          </div>
        </section>
      )}
    </>
  );
}

export default CardsPage;

