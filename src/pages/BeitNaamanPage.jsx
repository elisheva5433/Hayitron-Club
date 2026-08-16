import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BENEFITS_BUSINESSES } from '../data/benefitsData.js';

const MEN_CATS   = new Set(['ביגוד גברים','ביגוד חסידי','כובעים','רכב','ארבעת המינים','תשמישי קדושה','ספרים','ביטוחים','סלולר','אלקטרוניקה ותאורה','חשמל']);
const WOMEN_CATS = new Set(['ביגוד נשים','תכשיטים ושעונים','בשמים','אופנה','ריהוט ומזרונים']);
// categories that appear on both cards
const SHARED_CATS = new Set(['כללי','מזון','אוכל ומסעדנות','אופטיקה','נעליים','בגדי ילדים','פנאי ותיירות','כלי כתיבה וצעצועים','אחר','מצעים וכלי בית']);

const menBenefits   = BENEFITS_BUSINESSES.filter(b => MEN_CATS.has(b.cat) || SHARED_CATS.has(b.cat));
const womenBenefits = BENEFITS_BUSINESSES.filter(b => WOMEN_CATS.has(b.cat) || SHARED_CATS.has(b.cat));

function CardVisual({ variant }) {
  const isSilver = variant === 'men';
  return (
    <div
      style={{
        width: '100%', maxWidth: '320px', aspectRatio: '1.586',
        borderRadius: '18px',
        background: isSilver
          ? 'linear-gradient(135deg, #1e1e2e 0%, #5a5a7a 48%, #2a2a3e 100%)'
          : 'linear-gradient(135deg, #3a2608 0%, #c9a050 52%, #7c5520 100%)',
        padding: '1.2rem 1.3rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: 'white', position: 'relative', overflow: 'hidden',
        boxShadow: isSilver
          ? '0 24px 50px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)'
          : '0 24px 50px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        transition: 'transform .25s ease, box-shadow .25s ease',
      }}
    >
      {/* card shine */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.14), transparent 45%), repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)',
        mixBlendMode: 'overlay',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <img src="/לוגו הלב היהודי-02.png" alt="" style={{ height: '20px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(2.5)' }} />
        <div style={{
          width: 38, height: 28, borderRadius: 5,
          background: isSilver
            ? 'linear-gradient(135deg, #9090b0, #d0d0e8, #7070a0)'
            : 'linear-gradient(135deg, #f4e2b0, #c9a050, #8a6a2a)',
        }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>בית נאמן</div>
        <div style={{ fontSize: '0.68rem', opacity: 0.6, letterSpacing: '0.04em', marginBottom: '0.45rem' }}>כל ההטבות בבית אחד.</div>
        <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '0.88rem', letterSpacing: '0.14em', opacity: 0.85, marginBottom: '0.45rem' }}>
          {isSilver ? '•••• •••• •••• 7391' : '•••• •••• •••• 4820'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.58rem', opacity: 0.5, marginBottom: '0.08rem' }}>סוג</div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', opacity: 0.9, letterSpacing: '0.04em' }}>
              {isSilver ? 'כסף · גברים' : 'זהב · נשים'}
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', opacity: 0.5 }}>08/29</div>
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ biz }) {
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <Link to={`/benefits/${biz.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-soft)' }}>
        {biz.logo && !logoFailed
          ? <img src={biz.logo} alt="" onError={() => setLogoFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (biz.name || '').slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{biz.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>{biz.perk}</div>
      </div>
      <span className="tag" style={{ flexShrink: 0, fontSize: '0.72rem' }}>{biz.cat}</span>
    </Link>
  );
}

export default function BeitNaamanPage() {
  const [active, setActive] = useState('men'); // 'men' | 'women'

  const benefits = active === 'men' ? menBenefits : womenBenefits;

  return (
    <>
      <section style={{ background: 'var(--ink)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem' }}>כרטיס המועדון</p>
          <h1 className="font-display" style={{ color: 'white', margin: '0 0 0.5rem', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>בית נאמן</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>כל ההטבות בבית אחד · בחרו את הכרטיס שלכם</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          {/* Two cards selector */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'men',   label: 'גברים', count: menBenefits.length },
              { key: 'women', label: 'נשים',  count: womenBenefits.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                  outline: 'none',
                }}
              >
                <div style={{
                  borderRadius: 22,
                  padding: 4,
                  border: active === key
                    ? `3px solid ${key === 'men' ? '#8a8aaa' : 'var(--gold)'}`
                    : '3px solid transparent',
                  transition: 'border-color .2s',
                  transform: active === key ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform .2s, border-color .2s',
                }}>
                  <CardVisual variant={key} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.1rem' }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{count} הטבות</div>
                </div>
              </button>
            ))}
          </div>

          {/* Benefits list */}
          <div className="card card-body" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <h2 className="font-display" style={{ margin: 0, fontSize: '1.15rem' }}>
                הטבות כרטיס {active === 'men' ? 'גברים' : 'נשים'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{benefits.length} עסקים</span>
            </div>
            <div>
              {benefits.map(biz => <BenefitRow key={biz.id} biz={biz} />)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/benefits" className="btn-ghost">לכל עולם ההטבות</Link>
          </div>
        </div>
      </section>
    </>
  );
}
