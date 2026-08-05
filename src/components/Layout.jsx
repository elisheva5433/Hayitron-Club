import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand" to="/">
            <span className="brand-mark">✦</span>
            <span>מועדון היתרון</span>
          </NavLink>
          <nav className="top-nav">
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/">בית</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/cards">הכרטיסים</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/benefits">הטבות</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/community">קהילה</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin">ניהול</NavLink>
            <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/personal">אזור אישי</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <h3>מועדון היתרון</h3>
            <p>פלטפורמה דיגיטלית להטבות, כרטיסי חבר וקהילה עם אלפי עסקים שותפים.</p>
          </div>
          <div>
            <h4>למה זה טוב?</h4>
            <ul>
              <li>גישה מהירה להטבות</li>
              <li>ניהול כרטיסים במקום אחד</li>
              <li>השתתפות בקבוצות רכישה</li>
              <li>קהילה פעילה ומשתפת</li>
            </ul>
          </div>
          <div>
            <h4>יצירת קשר</h4>
            <p>03-1234567</p>
            <p>support@hayitron.co.il</p>
          </div>
          <div>
            <h4>ניווט מהיר</h4>
            <ul>
              <li><NavLink to="/cards">הכרטיסים</NavLink></li>
              <li><NavLink to="/benefits">אינדקס הטבות</NavLink></li>
              <li><NavLink to="/community">קהילה</NavLink></li>
              <li><NavLink to="/personal">אזור אישי</NavLink></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '2rem', paddingTop: '1.25rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
            <span>© 2026 מועדון היתרון. כל הזכויות שמורות.</span>
            <span>תנאי שימוש | פרטיות</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

