import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BENEFITS_BUSINESSES } from '../data/benefitsData.js';
import { sanitizeText, normalizePartnerKey, normalizeSearchValue, matchesBusinessName } from '../utils/benefitsCatalog.js';

function getLogoFallbackLabel(name) {
  const text = String(name || '').trim();
  if (!text) return 'לוגו';

  const words = text.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join('');
  return initials || text.slice(0, 2);
}

function BizCard({ biz, filterQuery }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const fallbackLabel = getLogoFallbackLabel(biz.name);

  return (
    <Link to={`/benefits/${biz.id}${filterQuery}`} className="partner-card" aria-label={`מעבר לעסק ${biz.name}`}>
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

      <div className="partner-card-body" style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <span className="tag">{sanitizeText(biz.cat)}</span>
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

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const cat = searchParams.get('cat') || 'הכל';
  const region = searchParams.get('region') || 'כל הארץ';

  const updateFilter = (key, value, defaultValue) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === defaultValue) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const categories = useMemo(() => {
    const dynamicCategories = [...new Set(businesses.map((b) => b.cat).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, 'he', { sensitivity: 'base' }));
    return ['הכל', ...dynamicCategories];
  }, [businesses]);

  const regions = useMemo(() => {
    const dynamicRegions = [...new Set(
      businesses.flatMap((biz) => [
        biz.region,
        ...(Array.isArray(biz.branches) ? biz.branches.map((branch) => branch?.city) : []),
      ]).filter((value) => value && value !== 'כל הארץ')
    )].sort((first, second) => first.localeCompare(second, 'he', { sensitivity: 'base' }));
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
              <input className="field benefits-filter-control" placeholder="שם עסק" value={search} onChange={(e) => updateFilter('search', e.target.value, '')} />
            </div>
            <div className="benefits-filter-field">
              <label className="label">קטגוריה</label>
              <select className="field benefits-filter-control" value={cat} onChange={(e) => updateFilter('cat', e.target.value, 'הכל')}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="benefits-filter-field">
              <label className="label">אזור</label>
              <select className="field benefits-filter-control" value={region} onChange={(e) => updateFilter('region', e.target.value, 'כל הארץ')}>
                {regions.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{filtered.length} עסקים שותפים נמצאו</p>

          {filtered.length > 0 ? (
            <div className="grid-3">
              {filtered.map((b) => <BizCard key={b.id} biz={b} filterQuery={searchParams.toString() ? `?${searchParams.toString()}` : ''} />)}
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
};

export default BenefitsPage;

