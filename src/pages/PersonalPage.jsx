import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TRANSACTIONS = [
  { date: '22.07.2026', biz: 'מסעדת הבית של אמא', amount: '-₪186' },
  { date: '18.07.2026', biz: 'טעינת כרטיס', amount: '+₪300' },
  { date: '11.07.2026', biz: 'קליניקת שיניים לבן', amount: '-₪240' },
  { date: '02.07.2026', biz: 'בוטיק אורבן קלוז', amount: '-₪95' },
  { date: '28.06.2026', biz: 'טעינת כרטיס', amount: '+₪500' },
];

function PersonalPage() {
  const { member, isAuthenticated, statusMessage, setStatusMessage, login, register, topup, logout } = useAuth();
  const [formMode, setFormMode] = useState('login');
  const [amount, setAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    try {
      await login(form.email.value.trim(), form.password.value);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    try {
      await register({
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        cardNumber: form.cardNumber.value.trim(),
      });
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleTopup(e) {
    e.preventDefault();
    try {
      await topup(Number(amount || 0));
      setAmount('');
      setShowTopup(false);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>חשבון</p>
          <h2 className="font-display" style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'white' }}>האזור האישי</h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', margin: 0 }}>ניהול הכרטיס, היתרה והפעולות שלכם.</p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          {statusMessage ? (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(47,111,98,0.1)', color: 'var(--teal)', fontWeight: 600 }}>
              {statusMessage}
            </div>
          ) : null}

          {!isAuthenticated ? (
            <div className="grid-2">
              <div className="card card-body">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <button
                    className={formMode === 'login' ? 'btn-primary' : 'btn-ghost'}
                    style={{ flex: 1 }}
                    onClick={() => setFormMode('login')}
                    type="button"
                  >התחברות</button>
                  <button
                    className={formMode === 'register' ? 'btn-primary' : 'btn-ghost'}
                    style={{ flex: 1 }}
                    onClick={() => setFormMode('register')}
                    type="button"
                  >הרשמה</button>
                </div>

                {formMode === 'login' ? (
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div><label className="label">אימייל</label><input className="field" name="email" type="email" required /></div>
                    <div><label className="label">סיסמה</label><input className="field" name="password" type="password" required /></div>
                    <button className="btn-teal" type="submit">התחברות</button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div><label className="label">שם מלא</label><input className="field" name="name" required /></div>
                    <div><label className="label">אימייל</label><input className="field" name="email" type="email" required /></div>
                    <div><label className="label">סיסמה</label><input className="field" name="password" type="password" required /></div>
                    <div><label className="label">מספר כרטיס</label><input className="field" name="cardNumber" placeholder="0000 0000 0000 0000" /></div>
                    <button className="btn-primary" type="submit">הרשמה</button>
                  </form>
                )}
              </div>
              <div className="card card-body">
                <h3 className="font-display" style={{ marginTop: 0 }}>למה כדאי?</h3>
                <ul style={{ paddingRight: '1rem', lineHeight: 2 }}>
                  <li>ניהול כרטיסים ונקודות במקום אחד</li>
                  <li>הטבות מותאמות אישית</li>
                  <li>עדכונים על קבוצות רכישה</li>
                  <li>היסטוריית פעולות מלאה</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="personal-grid">
              <div>
                {/* card visual */}
                <div className="membership-card vip" style={{ marginBottom: '1.25rem', maxWidth: '380px', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.1rem' }}>היתרון</span>
                    <div className="chip" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Rubik', sans-serif", letterSpacing: '0.12em', fontSize: '0.95rem', opacity: 0.9, marginBottom: '0.4rem' }}>
                      {member?.cardNumber || '0000 0000 0000 0000'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', opacity: 0.75 }}>{member?.name}</span>
                      <span className="pill-active" style={{ fontSize: '0.78rem' }}>פעיל</span>
                    </div>
                  </div>
                </div>

                <div className="card card-body" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0 }}>יתרה</h4>
                    <span className="font-num" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)' }}>₪{member?.balance}</span>
                  </div>
                  {!showTopup ? (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowTopup(true)} type="button">טעינת כרטיס</button>
                  ) : (
                    <form onSubmit={handleTopup} style={{ display: 'flex', gap: '0.6rem' }}>
                      <input className="field" type="number" min="1" placeholder="סכום" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ flex: 1 }} />
                      <button className="btn-primary" type="submit">אישור</button>
                      <button className="btn-ghost" type="button" onClick={() => setShowTopup(false)}>ביטול</button>
                    </form>
                  )}
                </div>

                <button className="btn-ghost" style={{ width: '100%' }} onClick={logout} type="button">התנתקות</button>
              </div>

              <div>
                <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>פעולות אחרונות</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {TRANSACTIONS.map((t, i) => (
                    <div key={i} className="tile" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t.biz}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{t.date}</div>
                      </div>
                      <span className="font-num" style={{ fontWeight: 700, color: t.amount.startsWith('+') ? 'var(--teal)' : 'var(--coral)' }}>
                        {t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default PersonalPage;

