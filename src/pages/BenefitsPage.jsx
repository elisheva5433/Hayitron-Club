import { useState } from 'react';

const CATEGORIES = ['הכל', 'מסעדנות', 'אופנה', 'בריאות ורפואה', 'פנאי ותיירות', 'בית וגינה', 'חינוך'];
const REGIONS = ['כל הארץ', 'גוש דן', 'ירושלים והסביבה', 'חיפה והצפון', 'באר שבע והדרום', 'השרון'];

const BUSINESSES = [
  { name: 'מסעדת הבית של אמא', cat: 'מסעדנות', region: 'גוש דן', perk: '15% הנחה על כל התפריט', hours: '12:00–23:00', addr: 'רוטשילד 45, תל אביב', logo: '/logos/dekcif.svg' },
  { name: 'קליניקת שיניים לבן', cat: 'בריאות ורפואה', region: 'השרון', perk: '20% הנחה על טיפולים אסתטיים', hours: '09:00–18:00', addr: 'סוקולוב 12, הרצליה', logo: '/logos/ninja.svg' },
  { name: 'סטודיו פילאטיס תנועה', cat: 'פנאי ותיירות', region: 'ירושלים והסביבה', perk: 'מנוי חודשי במחיר -30%', hours: '07:00–21:00', addr: 'עמק רפאים 8, ירושלים', logo: '/logos/magic-kass.svg' },
  { name: 'בוטיק אורבן קלוז', cat: 'אופנה', region: 'חיפה והצפון', perk: '2 ב-1 על כל הפריטים', hours: '10:00–20:00', addr: 'הרצל 33, חיפה', logo: '/logos/crazy-cats.svg' },
  { name: 'משתלת הגינה הירוקה', cat: 'בית וגינה', region: 'השרון', perk: '10% הנחה + משלוח חינם', hours: '08:00–17:00', addr: 'ויצמן 5, רעננה', logo: '/logos/hapark.svg' },
  { name: 'חדר בריחה מיינדגיים', cat: 'פנאי ותיירות', region: 'גוש דן', perk: '20% הנחה לקבוצות', hours: '10:00–00:00', addr: 'אחד העם 22, תל אביב', logo: '/logos/rentour.svg' },
  { name: 'מרכז חוגי מדע לילדים', cat: 'חינוך', region: 'באר שבע והדרום', perk: 'חודש ראשון חינם', hours: '15:00–19:00', addr: 'רגר 10, באר שבע', logo: '/logos/golkapa.svg' },
  { name: 'מספרת סטייל היתרון', cat: 'אופנה', region: 'ירושלים והסביבה', perk: '25% הנחה על צביעה', hours: '09:00–19:00', addr: 'יפו 90, ירושלים', logo: '/logos/horse-trip.svg' },
  { name: 'מרפאת עיניים ראייה טובה', cat: 'בריאות ורפואה', region: 'גוש דן', perk: 'בדיקת ראייה חינם + 15% על משקפיים', hours: '08:30–17:30', addr: 'אבן גבירול 60, תל אביב', logo: '/logos/paintball.svg' },
];

function BizCard({ biz }) {
  return (
    <div className="tile" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', height: '80px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--paper-dim)', borderRadius: '0.5rem', padding: '0.5rem' }}>
        <img src={biz.logo} alt={biz.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{biz.name}</h3>
        <span className="tag">{biz.cat}</span>
      </div>
      <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: 'var(--teal)', fontSize: '0.95rem' }}>{biz.perk}</p>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>📍 {biz.addr}</p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>🕐 {biz.hours}</p>
    </div>
  );
}

function BenefitsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('הכל');
  const [region, setRegion] = useState('כל הארץ');

  const filtered = BUSINESSES.filter((b) => {
    const matchSearch = b.name.includes(search) || b.perk.includes(search) || b.addr.includes(search);
    const matchCat = cat === 'הכל' || b.cat === cat;
    const matchRegion = region === 'כל הארץ' || b.region === region;
    return matchSearch && matchCat && matchRegion;
  });

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>שותפים</p>
          <h2 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>אינדקס ההטבות</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>כל ההטבות שלנו, מסועפות לפי קטגוריה ואזור.</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div>
              <label className="label">חיפוש</label>
              <input className="field" placeholder="שם עסק, הטבה או כתובת..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="label">קטגוריה</label>
              <select className="field" value={cat} onChange={(e) => setCat(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">אזור</label>
              <select className="field" value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{filtered.length} בתי עסק נמצאו</p>

          {filtered.length > 0 ? (
            <div className="grid-3">
              {filtered.map((b) => <BizCard key={b.name} biz={b} />)}
            </div>
          ) : (
            <div className="empty-state">לא נמצאו תוצאות לחיפוש הזה.</div>
          )}
        </div>
      </section>
    </>
  );
}

export default BenefitsPage;

