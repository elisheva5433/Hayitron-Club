import { Link } from 'react-router-dom';

const STATS = [
  { value: '141+', label: 'עסקים שותפים' },
  { value: '3,800+', label: 'חברי מועדון' },
  { value: '₪480K', label: 'נחסך ללקוחות בשנה האחרונה' },
];

const HIGHLIGHTS = [
  { icon: '🏷️', title: 'הנחות ישירות', desc: 'הנחות קבועות במאות בתי עסק — מסעדות, אופנה, בריאות ועוד.' },
  { icon: '💳', title: 'כרטיס חבר חכם', desc: 'כרטיס דיגיטלי עם ניהול יתרה, פעולות ואזור אישי.' },
  { icon: '🛒', title: 'קבוצות רכישה', desc: 'הצטרפו לקנייה קבוצתית חודשית ורכשו במחירי סיטונאי.' },
  { icon: '👥', title: 'קהילה פעילה', desc: 'פורום חברים, המלצות ושיתוף חוויות.' },
];

function HomePage() {
  return (
    <>
      <section className="hero-v2">
        <div className="container hero-v2-grid">
          {/* Text */}
          <div style={{ color: 'white' }}>
            <p className="eyebrow" style={{ marginBottom: '1rem', color: 'var(--gold-soft)' }}>מועדון קהילתי להטבות אמיתיות</p>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.25rem', color: 'white' }}>
              כרטיס אחד.<br />קהילה שלמה של לב יהודי.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '480px' }}>
              הטבות בבתי עסק נבחרים, קבוצות רכישה חודשיות במחירי רצפה, וזירת קהילה שבה אתם קובעים מה קורה בחודש הבא.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a className="btn-primary" href="/cards">הכרטיסים שלנו →</a>
              <a className="btn-ghost" href="/benefits" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}>עולם ההטבות</a>
            </div>
            <div className="hero-v2-stats">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="hero-v2-stat-value">{s.value}</div>
                  <div className="hero-v2-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card with entrance animation + stage rings — clickable */}
          <div className="card-stage" style={{ display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line */}
            <div className="hero-stage-wrap">
              {/* platform rings — animate in then fade out */}
              <div className="hero-stage-ring hero-stage-ring-3" />
              <div className="hero-stage-ring hero-stage-ring-2" />
              <div className="hero-stage-ring hero-stage-ring-1" />
              <div className="hero-stage-glow" />

              <Link to="/beit-naaman" className="hero-card-animated" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="hero-card" style={{ cursor: 'pointer' }}>
                  <div className="splash-card-shine" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div className="chip" />
                    <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.04em' }}>הלב היהודי</span>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.02em', marginBottom: '0.15rem' }}>בית נאמן</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.65, letterSpacing: '0.03em', marginBottom: '0.55rem' }}>כל ההטבות בבית אחד.</div>
                    <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '1.1rem', letterSpacing: '0.14em', opacity: 0.9, marginBottom: '0.6rem' }}>4291 8830 1122 4457</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.15rem' }}>בעל/ת הכרטיס</div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>ישראל ישראלי</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>08/29</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>למה להצטרף?</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', margin: '0 0 2.5rem' }}>הכל במקום אחד</h2>
          <div className="grid-2">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="tile" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{h.icon}</span>
                <div>
                  <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem' }}>{h.title}</h3>
                  <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '0.95rem' }}>{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--paper-dim)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>מוכנים להצטרף?</p>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', margin: '0 0 1rem' }}>בחרו כרטיס והתחילו עכשיו</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>מסלולים החל מ-₪19 בחודש, ניתן לביטול בכל עת.</p>
          <a className="btn-primary" href="/cards">לבחירת כרטיס</a>
        </div>
      </section>
    </>
  );
}

export default HomePage;

