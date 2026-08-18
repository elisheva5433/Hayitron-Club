import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BENEFITS_BUSINESSES } from '../data/benefitsData.js';
import { sanitizeText, normalizePartnerKey, normalizeSearchValue, matchesBusinessName, getBranchSummary } from '../utils/benefitsCatalog.js';

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
  const branchSummary = getBranchSummary(biz);

  return (
    <Link to={`/benefits/${biz.id}`} className="partner-card" aria-label={`מעבר לעסק ${biz.name}`}>
      <div className="partner-card-logo-shell">
        {biz.logo && !logoFailed ? (
          <img
            src={biz.logo}
            alt={biz.name}
            loading="lazy"
            onError={() => setLogoFailed(true)}
            className="partner-card-logo"
            style={{ transform: biz.rotate ? `rotate(${biz.rotate}deg)` : undefined }}
          />
        ) : (
          <div className="partner-card-fallback">
            <span>{fallbackLabel}</span>
          </div>
        )}
      </div>

      <div className="partner-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.6rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.02rem' }}>{sanitizeText(biz.name)}</h3>
          <span className="tag">{sanitizeText(biz.cat)}</span>
        </div>
        <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: 'var(--teal)', fontSize: '0.95rem' }}>{sanitizeText(biz.perk)}</p>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink-soft)' }}>📍 {branchSummary || sanitizeText(biz.addr)}</p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>לצפייה בפרטי העסק המלאים</p>
      </div>
    </Link>
  );
}

function BenefitsPage() {
  const businesses = useMemo(() => {
    const deduped = new Map();

    for (const biz of BENEFITS_BUSINESSES) {
      const key = normalizePartnerKey(biz.name);
      const existing = deduped.get(key);

      if (!existing) {
        deduped.set(key, { ...biz, branches: Array.isArray(biz.branches) ? [...biz.branches] : [] });
        continue;
      }

      const nextBranches = [...(existing.branches || []), ...(Array.isArray(biz.branches) ? biz.branches : [])];
      deduped.set(key, {
        ...existing,
        ...biz,
        branches: nextBranches,
        addr: existing.addr || biz.addr || '',
      });
    }

    return Array.from(deduped.values());
  }, []);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('הכל');
  const [region, setRegion] = useState('כל הארץ');

  const categories = useMemo(() => {
    const dynamicCategories = [...new Set(businesses.map((b) => b.cat).filter(Boolean))];
    return ['הכל', ...dynamicCategories];
  }, [businesses]);

  const regions = useMemo(() => {
    const dynamicRegions = [...new Set(
      businesses.flatMap((biz) => [
        biz.region,
        ...(Array.isArray(biz.branches) ? biz.branches.map((branch) => branch?.city) : []),
      ]).filter((value) => value && value !== 'כל הארץ')
    )];
    return ['כל הארץ', ...dynamicRegions];
  }, [businesses]);

  const normalizedSearch = normalizeSearchValue(search);

  const filtered = businesses.filter((b) => {
    const matchSearch = !normalizedSearch || matchesBusinessName(b.name, normalizedSearch);
    const matchCat = cat === 'הכל' || b.cat === cat;
    const branchCities = Array.isArray(b.branches) ? b.branches.map((branch) => branch?.city) : [];
    const matchRegion = region === 'כל הארץ' || b.region === region || branchCities.includes(region);
    return matchSearch && matchCat && matchRegion;
  });

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>שותפים</p>
          <h2 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>מועדון העסקים השותפים</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>קטלוג העסקים וההטבות הרשמיות.</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="benefits-filters">
            <div className="benefits-filter-search">
              <label className="label">חיפוש</label>
              <input className="field benefits-filter-control" placeholder="שם עסק" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="benefits-filter-field">
              <label className="label">קטגוריה</label>
              <select className="field benefits-filter-control" value={cat} onChange={(e) => setCat(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="benefits-filter-field">
              <label className="label">אזור</label>
              <select className="field benefits-filter-control" value={region} onChange={(e) => setRegion(e.target.value)}>
                {regions.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{filtered.length} עסקים שותפים נמצאו</p>

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

export {
  sanitizeText,
  normalizePartnerKey,
  normalizeSearchValue,
  matchesBusinessName,
  getBranchSummary,
};

export default BenefitsPage;

