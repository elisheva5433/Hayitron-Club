import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCardBenefits } from '../services/api.js';

export default function CardBenefitsPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCardBenefits(cardId)
      .then((data) => {
        if (!active) return;
        setCard(data.card);
        setBenefits(data.benefits || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => { active = false; };
  }, [cardId]);

  if (error) {
    return (
      <section className="section-pad">
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="empty-state">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>הטבות הכרטיס</p>
          <h1 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>
            {card?.title || 'טוענים הטבות...'}
          </h1>
          {card?.description ? <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>{card.description}</p> : null}
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {card ? <p style={{ margin: '0 0 1rem', color: 'var(--ink-soft)' }}>{benefits.length} הטבות זמינות במסלול זה</p> : null}
          <div className="grid-3">
            {benefits.map((benefit) => (
              <Link key={benefit.id} to={`/benefits/${benefit.id}`} className="partner-card" aria-label={`מעבר לעסק ${benefit.name}`}>
                <div className="partner-card-logo-shell">
                  {benefit.logo ? <img src={benefit.logo} alt={benefit.name} className="partner-card-logo" /> : <div className="partner-card-fallback">{benefit.name.slice(0, 2)}</div>}
                </div>
                <div className="partner-card-body">
                  <strong>{benefit.name}</strong>
                  <div style={{ color: 'var(--teal)', fontWeight: 700, marginTop: '0.25rem' }}>{benefit.perk || benefit.benefitText}</div>
                </div>
              </Link>
            ))}
          </div>
          {card && benefits.length === 0 ? <div className="empty-state">הטבות למסלול זה יפורסמו בקרוב.</div> : null}
          <Link to="/cards" className="btn-ghost">חזרה לכל הכרטיסים</Link>
        </div>
      </section>
    </>
  );
}