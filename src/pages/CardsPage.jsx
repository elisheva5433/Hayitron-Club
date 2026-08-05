import { useState } from 'react';

const cardTypes = [
  {
    id: 'basic', title: 'כרטיס בסיסי', tone: 'basic', price: '₪19', period: 'לחודש',
    perks: ['הטבות בסיסיות במאות עסקים', 'אינדקס הטבות מלא', 'אזור אישי דיגיטלי', 'גישה לפורום הקהילה'],
  },
  {
    id: 'vip', title: 'כרטיס פרימיום', tone: 'vip', price: '₪49', period: 'לחודש',
    perks: ['כל הטבות הכרטיס הבסיסי', 'הנחות עומק בשותפים מובילים', 'הגרלות ואירועי VIP', 'עדיפות בקבוצות רכישה'],
  },
  {
    id: 'family', title: 'כרטיס עסקי / משפחתי', tone: 'family', price: '₪89', period: 'לחודש',
    perks: ['עד 5 מוטבים תחת חשבון אחד', 'דוח שימוש חודשי', 'ניהול הרשאות', 'תמיכה עדיפה'],
  },
];

function CardVisual({ tone }) {
  const lastDigits = { basic: '7790', vip: '4457', family: '2201' }[tone];
  return (
    <div className={`membership-card ${tone}`} style={{ minHeight: '180px', marginBottom: '1.2rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.04em' }}>היתרון</span>
        <div className="chip" />
      </div>
      <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '1rem', letterSpacing: '0.12em', opacity: 0.9 }}>
        {lastDigits} ···· ···· ····
      </div>
    </div>
  );
}

function CardsPage() {
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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
                <CardVisual tone={card.tone} />
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
              <div><label className="label">שם מלא</label><input className="field" required placeholder="ישראל ישראלי" /></div>
              <div><label className="label">אימייל</label><input className="field" type="email" required placeholder="mail@example.com" /></div>
              <div><label className="label">מספר כרטיס אשראי</label><input className="field" placeholder="0000 0000 0000 0000" /></div>
              <button className="btn-primary" type="submit">אישור והצטרפות</button>
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

