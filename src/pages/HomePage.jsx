const STATS = [
  { value: '850+', label: 'בתי עסק שותפים' },
  { value: '12,000+', label: 'חברי מועדון' },
  { value: '₪2.4M', label: 'נחסכו לחברים' },
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
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>מועדון היתרון</p>
            <h1 className="font-display">מחברים בין חברים, עסקים וקהילה</h1>
            <p>הטבות, כרטיסי חבר, קבוצות רכישה וחוויית שימוש אחת — כל זה במקום אחד.</p>
            <div className="hero-actions">
              <a className="btn-primary" href="/cards">לגלות את הכרטיסים</a>
              <a className="btn-ghost" href="/benefits" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.25)' }}>אינדקס הטבות</a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STATS.map((s) => (
              <div key={s.label} className="card card-body" style={{ textAlign: 'center' }}>
                <div className="font-num" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)' }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{s.label}</div>
              </div>
            ))}
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

