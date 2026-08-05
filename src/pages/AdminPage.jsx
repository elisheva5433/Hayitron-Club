import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminUsers } from '../services/api';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { member } = useAuth();

  useEffect(() => {
    async function loadUsers() {
      try {
        if (!member?.email) {
          throw new Error('יש להתחבר כדי לצפות בלוח הניהול');
        }

        const data = await getAdminUsers('demo-jwt-token');
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [member]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <h2>לוח ניהול</h2>
          <p>סקירה מהירה של החברים והסטטוס שלהם.</p>
        </div>

        {error ? <div className="badge">{error}</div> : null}

        <div className="card card-body">
          <h3>משתמשים רשומים</h3>
          {loading ? (
            <p>טוען...</p>
          ) : (
            <div className="benefit-list">
              {users.map((user) => (
                <article key={user.id} className="benefit-item">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <small>יתרה: ₪{user.balance} · סטטוס: {user.status}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminPage;
