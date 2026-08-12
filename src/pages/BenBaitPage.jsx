import { Link } from 'react-router-dom';

function CardVisual() {
  return (
    <div style={{ perspective: '1200px', marginBottom: '1.5rem' }}>
      <div
        style={{
          minHeight: '200px', position: 'relative', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '1.3rem',
          background: 'linear-gradient(135deg, #0a1628 0%, #1e4080 52%, #0d2a55 100%)',
          borderRadius: '18px', color: 'white',
          transform: 'rotateY(-10deg) rotateX(5deg)',
          transition: 'transform .25s ease',
          boxShadow: '0 20px 50px -15px rgba(0,0,0,0.55)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'rotateY(-3deg) rotateX(2deg) scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(5deg)'}
      >
        {/* card texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '18px', pointerEvents: 'none',
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 55%), repeating-linear-gradient(115deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)',
          mixBlendMode: 'overlay',
        }} />
        {/* Star of David subtle watermark */}
        <div style={{
          position: 'absolute', bottom: '1rem', left: '1rem', opacity: 0.08,
          fontSize: '4rem', lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>✡</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <img src="/לוגו הלב היהודי-02.png" alt="" style={{ height: '28px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(2.5)' }} />
          <div style={{
            width: 36, height: 28, borderRadius: 5,
            background: 'linear-gradient(135deg, #c8d8f0, #e8f0ff, #a0b8d8)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.15rem', letterSpacing: '0.02em' }}>
            בן בית
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.65, letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
            כל ההטבות בבית אחד.
          </div>
          <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '1rem', letterSpacing: '0.14em', opacity: 0.85 }}>
            •••• •••• •••• 3614
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BenBaitPage() {
  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e4080 60%, #0d2a55 100%)', padding: '4rem 0 3rem', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '0.5rem' }}>כרטיס תושבי חו"ל</p>
          <h1 className="font-display" style={{ margin: '0 0 1rem', fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.15, color: 'white' }}>
            לתושבי חו"ל מגיע יותר.<br />
            <span style={{ color: 'var(--gold-soft)' }}>בישראל אתה בן בית.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', margin: '0 0 2rem', lineHeight: 1.7 }}>
            כרטיס בן בית מעניק לתושבי חוץ הנחות ייחודיות במאות עסקים ברחבי הארץ — כי כשאתה מגיע הביתה, מגיע לך לקבל יותר.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardVisual />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="card card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏠</div>
            <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1.4rem' }}>ההטבות בדרך</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '0 0 1.5rem', lineHeight: 1.7 }}>
              אנחנו בעיצומו של רכישת שותפויות עסקיות ייחודיות לכרטיס בן בית.
              <br />בקרוב תוכלו ליהנות מהטבות מותאמות לתושבי חוץ.
            </p>
            <Link to="/cards" className="btn-ghost">חזרה לכל הכרטיסים</Link>
          </div>
        </div>
      </section>
    </>
  );
}
