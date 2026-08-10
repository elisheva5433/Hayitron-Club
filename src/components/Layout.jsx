import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AiChat from './AiChat';

function Layout() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand" to="/">
            <img src="/לוגו הלב היהודי-02.png" alt="הלב היהודי" style={{ height: '48px', objectFit: 'contain' }} />
          </NavLink>
          <nav className="top-nav">
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/">בית</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/cards">הכרטיסים</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/benefits">הטבות</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/community">קהילה</NavLink>
            {isAdmin && <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin">ניהול</NavLink>}
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/personal">אזור אישי</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem', padding: '3.5rem 0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <img src="/לוגו הלב היהודי-02.png" alt="הלב היהודי" style={{ height: '36px', objectFit: 'contain' }} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>פורטל הטבות, קהילה וקבוצות רכישה לחברי המועדון ולבתי עסק שותפים ברחבי הארץ.</p>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '0.75rem' }}>ניווט</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><NavLink to="/cards" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>הכרטיסים שלנו</NavLink></li>
              <li><NavLink to="/benefits" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>אינדקס הטבות</NavLink></li>
              <li><NavLink to="/benefits" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>אינדקס חנויות</NavLink></li>
              <li><NavLink to="/community" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>קהילה וקבוצות רכישה</NavLink></li>
              <li><NavLink to="/personal" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>אזור אישי</NavLink></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '0.75rem' }}>מידע</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><NavLink to="/cards" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>הצטרפות עסקים</NavLink></li>
              <li><span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>שאלות ותשובות</span></li>
              <li><span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>צור קשר</span></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '0.75rem' }}>מוקד שירות</div>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, margin: 0 }}>
              03-1234567<br />
              support@hayitron.co.il<br />
              א׳–ה׳ 08:00–19:00
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
            <span>תקנון ותנאי שימוש · מדיניות פרטיות</span>
            <span>© 2026 מועדון היתרון. כל הזכויות שמורות.</span>
          </div>
        </div>
      </footer>
      <AiChat />
    </div>
  );
}

export default Layout;

