import { useEffect, useRef, useState } from 'react';
import { getCardBenefits } from '../services/api.js';

const cardTypes = [
  {
    id: 'basic', title: 'כרטיס בסיסי', cardName: 'ברכת הבית', tone: 'basic', price: '₪19', period: 'לחודש',
    benefitCardId: 'basic',
    perks: ['הטבות בסיסיות במאות עסקים', 'אינדקס הטבות מלא', 'אזור אישי דיגיטלי', 'גישה לפורום הקהילה'],
  },
  {
    id: 'vip', title: 'כרטיס פרימיום', cardName: 'בית נאמן', tone: 'vip', price: '₪49', period: 'לחודש',
    benefitCardId: 'beit-naaman-men',
    perks: ['כל הטבות הכרטיס הבסיסי', 'הנחות עומק בשותפים מובילים', 'הגרלות ואירועי VIP', 'עדיפות בקבוצות רכישה'],
  },
  {
    id: 'family', title: 'כרטיס תושבי חו"ל', cardName: 'בן בית', tone: 'benbait', price: '₪89', period: 'לחודש',
    benefitCardId: 'ben-bait',
    tagline: 'בישראל אתה בן בית - לתושבי חו"ל מגיע יותר.',
    description: 'כרטיס בן בית מעניק לתושבי חוץ הנחות ייחודיות במאות עסקים ברחבי הארץ - כי כשאתה מגיע הביתה, מגיע לך לקבל יותר.',
    perks: ['הטבות ייחודיות לתושבי חו"ל', 'דיסקונטים במאות עסקים', 'תמיכה עדיפה'],
  },
];

function CardVisual({ tone, cardName }) {
  const lastDigits = { basic: '7790', vip: '4457', family: '2201', benbait: '3614' }[tone];
  return (
    <div style={{ perspective: '1200px', marginBottom: '1.5rem' }}>
      <div
        className={`membership-card ${tone === 'benbait' ? '' : tone}`}
        style={{
          minHeight: '200px', position: 'relative', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '1.3rem',
          ...(tone === 'benbait' ? { background: 'linear-gradient(135deg, #124d40 0%, #25755f 52%, #0d3028 100%)' } : {}),
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
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.02em', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                {cardName}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '0.03em', marginTop: '0.15rem' }}>כל ההטבות בבית אחד.</div>
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
  const [benefitsModal, setBenefitsModal] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [benefitsLoading, setBenefitsLoading] = useState(false);
  const [benefitsError, setBenefitsError] = useState('');
  const [vipAudience, setVipAudience] = useState('men');
  const [form, setForm] = useState({ name: '', idNumber: '', address: '', email: '', phone: '', cardName: '' });
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (chosen && !submitted) {
      document.getElementById('purchase-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => nameInputRef.current?.focus(), 450);
    }
  }, [chosen]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  const selectedCardTitle = chosen === 'vip-men'
    ? 'בית נאמן לגברים'
    : chosen === 'vip-women'
      ? 'בית נאמן לנשים'
      : cardTypes.find((card) => card.id === chosen)?.title;
  const selectedCardId = chosen === 'vip-men'
    ? 'beit-naaman-men'
    : chosen === 'vip-women'
      ? 'beit-naaman-women'
      : chosen === 'family'
        ? 'ben-bait'
        : chosen;

  const loadBenefits = async (card, cardId = card.benefitCardId) => {
    setBenefitsModal({ card, cardId });
    setBenefits([]);
    setBenefitsError('');
    setBenefitsLoading(true);
    try {
      const data = await getCardBenefits(cardId);
      setBenefits(data.benefits || []);
    } catch (requestError) {
      setBenefitsError(requestError.message);
    } finally {
      setBenefitsLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cardId: selectedCardId }),
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
          <div className="grid-3 membership-card-grid">
            {cardTypes.map((card) => {
              const isBeitNaaman = card.id === 'vip';
              return (
                <div key={card.id} className="tile membership-plan" style={{ padding: '1.5rem', outline: chosen?.startsWith(card.id) ? '2px solid var(--teal)' : 'none' }}>
                  <CardVisual tone={card.tone} cardName={card.cardName} />
                  <h3 style={{ margin: '0 0 0.25rem', fontFamily: "'Frank Ruhl Libre', serif" }}>{card.title}</h3>
                  <p style={{ margin: '0 0 1rem', fontFamily: "'Rubik', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {card.price} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--ink-soft)' }}>{card.period}</span>
                  </p>
                  {card.tagline ? <p className="card-tagline">{card.tagline}</p> : null}
                  {card.description ? <p className="card-description">{card.description}</p> : null}
                  <ul style={{ paddingRight: '1rem', margin: 0 }}>
                    {card.perks.map((perk) => <li key={perk} style={{ marginBottom: '0.3rem', fontSize: '0.92rem' }}>{perk}</li>)}
                  </ul>
                  <div className="card-actions">
                    <button className="btn-ghost" type="button" onClick={() => loadBenefits(card)}>צפייה בהטבות</button>
                    {isBeitNaaman ? (
                      <>
                        <div className="card-audience-picker" role="group" aria-label="בחירת מסלול בית נאמן">
                          <button className={vipAudience === 'men' ? 'active' : ''} type="button" onClick={() => setVipAudience('men')}>גברים</button>
                          <button className={vipAudience === 'women' ? 'active' : ''} type="button" onClick={() => setVipAudience('women')}>נשים</button>
                        </div>
                        <button className="btn-primary" type="button" onClick={() => setChosen(`vip-${vipAudience}`)}>הצטרפות לבית נאמן</button>
                      </>
                    ) : (
                      <button className="btn-primary" type="button" onClick={() => setChosen(card.id)}>הצטרפות לכרטיס</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="bulk-order-callout" aria-label="הזמנה מרוכזת לארגונים ומוסדות">
            <div>
              <p className="eyebrow">הזמנה מרוכזת</p>
              <h3 className="font-display">ארגונים ומוסדות</h3>
              <p>להזמנה מרוכזת של כרטיסי מועדון, נשמח לעמוד לרשותכם.</p>
            </div>
            <div className="bulk-order-actions">
              <a href="mailto:halev@gmail.com">halev@gmail.com</a>
              <a href="https://wa.me/972555555555" target="_blank" rel="noreferrer">WhatsApp: 055-555-5555</a>
            </div>
          </aside>
        </div>
      </section>

      {chosen && !submitted && (
        <section id="purchase-flow" style={{ background: 'var(--paper-dim)', padding: '3.5rem 0' }}>
          <div className="container" style={{ maxWidth: '520px' }}>
            <h3 className="font-display" style={{ marginBottom: '1.2rem' }}>
              הצטרפות — {selectedCardTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="label">שם מלא</label><input ref={nameInputRef} className="field" name="name" required placeholder="ישראל ישראלי" value={form.name} onChange={handleChange} /></div>
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
            <p style={{ color: 'var(--ink-soft)' }}>פרטי ההצטרפות נשמרו בהצלחה.</p>
          </div>
        </section>
      )}

      {benefitsModal ? (
        <div className="card-benefits-modal-backdrop" role="presentation" onMouseDown={() => setBenefitsModal(null)}>
          <section className="card-benefits-modal" role="dialog" aria-modal="true" aria-labelledby="card-benefits-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="card-benefits-modal-header">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>הטבות הכרטיס</p>
                <h2 id="card-benefits-title" className="font-display" style={{ margin: '0.2rem 0 0' }}>{benefitsModal.card.cardName}</h2>
              </div>
              <button className="modal-close" type="button" onClick={() => setBenefitsModal(null)} aria-label="סגירת חלון ההטבות">×</button>
            </div>
            {benefitsModal.card.id === 'vip' ? (
              <div className="card-benefits-audience">
                <button className={benefitsModal.cardId === 'beit-naaman-men' ? 'active' : ''} type="button" onClick={() => loadBenefits(benefitsModal.card, 'beit-naaman-men')}>גברים</button>
                <button className={benefitsModal.cardId === 'beit-naaman-women' ? 'active' : ''} type="button" onClick={() => loadBenefits(benefitsModal.card, 'beit-naaman-women')}>נשים</button>
              </div>
            ) : null}
            {benefitsLoading ? <p>טוענים הטבות...</p> : null}
            {benefitsError ? <p style={{ color: 'var(--coral)' }}>{benefitsError}</p> : null}
            {!benefitsLoading && !benefitsError ? (
              <div className="card-benefits-list">
                {benefits.map((benefit) => <div key={benefit.id}><strong>{benefit.name}</strong><span>{benefit.perk || benefit.benefitText}</span></div>)}
                {benefits.length === 0 ? <p>הטבות למסלול זה יפורסמו בקרוב.</p> : null}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

export default CardsPage;

