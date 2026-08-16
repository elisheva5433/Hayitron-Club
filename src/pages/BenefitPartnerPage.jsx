import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BENEFITS_BUSINESSES } from '../data/benefitsData.js';

function sanitizeText(value) {
  const text = String(value || '');
  if (/׳|Ã|â|×/.test(text)) {
    return 'פרטי ההטבה לפי המועדון';
  }
  return text;
}

function normalizePartnerKey(name) {
  const text = String(name || '').trim();
  if (!text) return '';
  const parts = text.split(' - ').map((part) => part.trim()).filter(Boolean);
  return parts[0] || text;
}

function toDistinctBranches(branches) {
  const seen = new Set();
  const result = [];

  for (const branch of branches) {
    const city = sanitizeText(branch.city || branch.region || '');
    const address = sanitizeText(branch.address || branch.addr || city || '');
    const key = `${city}::${address}`;

    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      id: branch.id || `${city}-${address}`,
      city: city || 'לא זמין',
      address: address || 'לא זמין',
      phone: branch.phone || '',
    });
  }

  return result;
}

function getReliablePromoText(partnerName, category, perk) {
  const safeName = sanitizeText(partnerName || 'בית העסק');
  const safeCategory = sanitizeText(category || 'מגוון מוצרים');
  const safePerk = sanitizeText(perk || 'הטבת מועדון');

  return `${safeName} הוא עסק שותף במועדון בתחום ${safeCategory}. ההטבה הרשמית במאגר היא: ${safePerk}. מומלץ לבדוק מול הסניף את פרטי המלאי והתנאים לפני הרכישה.`;
}

function getBenefitActionText(benefitText, perk) {
  const safeBenefitText = sanitizeText(benefitText || '');
  const safePerk = sanitizeText(perk || 'הטבת מועדון');

  if (/טעון|טעינה|כרטיס/i.test(safeBenefitText)) {
    return 'בתשלום באמצעות הכסף הטעון בכרטיס';
  }

  if (/קופה|קופ/i.test(safeBenefitText)) {
    return 'יש לעדכן בקופה לפי תנאי העסק';
  }

  return `מימוש בהתאם לתנאי העסק לצד ${safePerk}`;
}

function BenefitPartnerPage() {
  const { businessId } = useParams();
  const [logoFailed, setLogoFailed] = useState(false);

  const businesses = BENEFITS_BUSINESSES;
  const selected = businesses.find((biz) => biz.id === businessId);

  const partnerKey = normalizePartnerKey(selected?.name);
  const relatedBranches = useMemo(() => {
    if (!partnerKey) return [];
    return businesses.filter((biz) => normalizePartnerKey(biz.name) === partnerKey);
  }, [businesses, partnerKey]);

  const website = String(selected.website || '').trim();
  const phones = Array.isArray(selected.phones) ? selected.phones.filter(Boolean) : [];
  const officialBranches = Array.isArray(selected.branches) ? selected.branches : [];
  const branchSource = officialBranches.length > 0 ? officialBranches : relatedBranches;
  const branches = useMemo(() => toDistinctBranches(branchSource), [branchSource]);

  const verifiedNote = selected.infoVerifiedFrom === 'kehilotcard-public-api'
    ? 'נתוני העסק והסניפים אומתו מול מאגר ציבורי רשמי של קהילות.'
    : 'חלק מהנתונים מבוססים על מאגר מקומי היסטורי, ללא מקור ציבורי מאמת לכל השדות.';

  const branchPhonesText = branches.some((branch) => branch.phone)
    ? branches.map((branch) => `${branch.city}: ${branch.phone || 'לא זמין'}`).join(' | ')
    : phones.length > 0
      ? phones.join(' | ')
      : 'לא זמין במאגר הנתונים הנוכחי';

  if (!selected) {
    return (
      <section className="section-pad">
        <div className="container">
          <div className="card card-body" style={{ textAlign: 'center' }}>
            <h2 className="font-display" style={{ marginTop: 0 }}>העסק לא נמצא</h2>
            <p style={{ color: 'var(--ink-soft)' }}>ייתכן שהקישור ישן או שהעסק הוסר מהמאגר.</p>
            <Link className="btn-primary" to="/benefits">חזרה למועדון העסקים השותפים</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="partners-hero">
        <div className="container">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>עמוד עסק</p>
          <h1 className="font-display" style={{ margin: '0.25rem 0 0.6rem', color: 'white', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)' }}>{sanitizeText(selected.name)}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{verifiedNote}</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.2rem' }}>
        <div className="container">
          <div className="partner-detail-grid">
            <article className="card partner-detail-main">
              <div className="partner-detail-logo-stage">
                {selected.logo && !logoFailed ? (
                  <img
                    src={selected.logo}
                    alt={selected.name}
                    onError={() => setLogoFailed(true)}
                    className="partner-detail-logo"
                    loading="lazy"
                  />
                ) : (
                  <div className="partner-logo-fallback">{sanitizeText(selected.name).slice(0, 2)}</div>
                )}
              </div>

              <div className="card-body">
                <h2 className="font-display" style={{ marginTop: 0, marginBottom: '0.7rem' }}>על החנות והמוצרים</h2>
                <p style={{ marginTop: 0, color: 'var(--ink-soft)' }}>
                  העסק פועל בתחום {sanitizeText(selected.cat || 'לא זמין')}. פירוט רשמי מהמאגר: {sanitizeText(selected.benefitText || 'לא זמין')}
                </p>

                <div className="partner-benefit-hero">
                  <div className="partner-benefit-hero-copy">
                    <div className="partner-benefit-hero-value">{sanitizeText(selected.perk || 'לא זמין')}</div>
                    <div className="partner-benefit-hero-note">{getBenefitActionText(selected.benefitText, selected.perk)}</div>
                  </div>
                  <div className="partner-benefit-hero-meta">
                    <span className="partner-benefit-hero-label">גובה ההטבה</span>
                    <span className="partner-benefit-hero-subtitle">המידע החשוב ביותר במבט אחד</span>
                  </div>
                </div>

                <h3 className="font-display" style={{ marginBottom: '0.6rem' }}>פרטי יצירת קשר ואתר</h3>
                <ul className="partner-info-list">
                  <li>
                    <strong>טלפון:</strong>{' '}
                    {branchPhonesText}
                  </li>
                  <li>
                    <strong>אתר:</strong>{' '}
                    {website ? (
                      <a href={website} target="_blank" rel="noreferrer" className="partner-website-link" aria-label={`מעבר לאתר של ${selected.name}`}>
                        🖐 מעבר לאתר הרשמי
                      </a>
                    ) : 'לא קיים קישור אתר מאומת במאגר'}
                  </li>
                </ul>

                <div className="partner-promo-box">
                  <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>למה כדאי לבדוק את העסק</h4>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{getReliablePromoText(selected.name, selected.cat, selected.perk)}</p>
                </div>
              </div>
            </article>

            <aside className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0 }}>סניפים לפי המאגר</h3>
              <p style={{ marginTop: 0, color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                הרשימה מבוססת על רשומות קיימות באינדקס. אם חסר סניף, המשמעות היא שאין עליו נתון מאומת במאגר.
              </p>
              <div className="partner-branches-list">
                {branches.length > 0 ? branches.map((branch) => (
                  <div key={branch.id} className="partner-branch-item">
                    <div style={{ fontWeight: 700 }}>{branch.city}</div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>{branch.address}</div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
                      טלפון: {branch.phone || 'לא זמין'}
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">לא נמצאו נתוני סניפים לעסק זה במאגר הנוכחי.</div>
                )}
              </div>

              <Link to="/benefits" className="btn-ghost" style={{ marginTop: '1rem', width: '100%' }}>
                חזרה למועדון העסקים השותפים
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export default BenefitPartnerPage;