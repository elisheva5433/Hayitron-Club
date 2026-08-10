import { useMemo, useState } from 'react';
import { BENEFITS_BUSINESSES } from '../data/benefitsData.js';

function sanitizeText(value) {
  const text = String(value || '');
  // Hide known mojibake artifacts from mixed encodings.
  if (/׳|Ã|â|×/.test(text)) {
    return 'פרטי ההטבה לפי המועדון';
  }
  return text;
}

function getLogoFallbackLabel(name) {
  const text = String(name || '').trim();
  if (!text) return 'לוגו';

  const words = text.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join('');
  return initials || text.slice(0, 2);
}

function BizCard({ biz }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const fallbackLabel = getLogoFallbackLabel(biz.name);

  return (
    <div className="tile" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', height: '80px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--paper-dim)', borderRadius: '0.5rem', padding: '0.5rem' }}>
        {biz.logo && !logoFailed ? (
          <img
            src={biz.logo}
            alt={biz.name}
            loading="lazy"
            onError={() => setLogoFailed(true)}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: biz.rotate ? `rotate(${biz.rotate}deg)` : undefined }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(47,111,98,0.14), rgba(221,180,64,0.18))',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              color: 'var(--ink)',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textAlign: 'center',
              padding: '0.5rem',
              lineHeight: 1.2,
            }}
          >
            <span>{fallbackLabel}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{biz.name}</h3>
        <span className="tag">{biz.cat}</span>
      </div>
      <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: 'var(--teal)', fontSize: '0.95rem' }}>{sanitizeText(biz.perk)}</p>
      <p style={{ margin: '0 0 0.4rem', fontSize: '0.83rem', color: 'var(--ink-soft)' }}>{sanitizeText(biz.benefitText)}</p>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>📍 {biz.addr}</p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>🕐 {biz.hours}</p>
    </div>
  );
}

function BenefitsPage() {
  const [businesses] = useState(BENEFITS_BUSINESSES);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('הכל');
  const [region, setRegion] = useState('כל הארץ');

  const categories = useMemo(() => {
    const dynamicCategories = [...new Set(businesses.map((b) => b.cat).filter(Boolean))];
    return ['הכל', ...dynamicCategories];
  }, [businesses]);

  const regions = useMemo(() => {
    const dynamicRegions = [...new Set(businesses.map((b) => b.region).filter((value) => value && value !== 'כל הארץ'))];
    return ['כל הארץ', ...dynamicRegions];
  }, [businesses]);

  const filtered = businesses.filter((b) => {
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
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">אזור</label>
              <select className="field" value={region} onChange={(e) => setRegion(e.target.value)}>
                {regions.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{filtered.length} בתי עסק נמצאו</p>

          {filtered.length > 0 ? (
            <div className="grid-3">
              {filtered.map((b) => <BizCard key={b.id} biz={b} />)}
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

