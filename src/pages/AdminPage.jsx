import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  createBanner,
  createBroadcast,
  createPurchaseGroup,
  getAdminAuditLogs,
  getAdminSummary,
  getAdminPosts,
  getPurchaseGroups,
  getAdminUsers,
  updateAdminPost,
  updateAdminUser,
  updateBanner,
  updatePurchaseGroup,
  updateVotingWindow,
} from '../services/api';
import * as XLSX from 'xlsx';

const CHART_COLORS = ['#2f6f62', '#c9a050', '#c1483d', '#6c7a9a', '#184f41'];

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { member, isAdmin } = useAuth();
  const [summary, setSummary] = useState({
    kpis: { totalUsers: 0, activeUsers: 0, issuedCards: 0, activeCards: 0, totalVolume: 0 },
    votes: [],
    votingOpen: false,
    banners: [],
    broadcasts: [],
  });
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterText, setNewsletterText] = useState('');
  const [newsletterDelivery, setNewsletterDelivery] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', placement: 'עמוד הבית', imagePath: '', imageBase64: '' });
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({ title: '', category: 'בית וגינה', region: 'כל הארץ', supplier: '', closesAt: '', inventory: '', targetPrice: '' });
  const [postFilter, setPostFilter] = useState('all');
  const [userQuery, setUserQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    async function loadAdmin() {
      if (!isAdmin || !member?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [summaryData, usersData, auditData] = await Promise.all([
          getAdminSummary(member.email),
          getAdminUsers(member.email),
          getAdminAuditLogs(member.email, 80),
        ]);
        setSummary(summaryData);
        setUsers(usersData.users || []);
        setAuditLogs(auditData.logs || []);
        const groupsData = await getPurchaseGroups(member.email);
        setGroups(groupsData.groups || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [isAdmin, member?.email]);

  async function refreshUsersAndSummary() {
    if (!member?.email) {
      return;
    }

    const [summaryData, usersData, auditData] = await Promise.all([
      getAdminSummary(member.email),
      getAdminUsers(member.email),
      getAdminAuditLogs(member.email, 80),
    ]);
    setSummary(summaryData);
    setUsers(usersData.users || []);
    setAuditLogs(auditData.logs || []);
    const groupsData = await getPurchaseGroups(member.email);
    setGroups(groupsData.groups || []);
  }

  async function handlePostStatus(postId, status) {
    try {
      await updateAdminPost(member.email, postId, { status });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportToExcel() {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(users.map((user) => ({
      שם: user.name,
      אימייל: user.email,
      סטטוס: user.status,
      יתרה: user.balance,
      כרטיס: user.cardNumber,
      תפקיד: user.role,
    })));
    XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
    XLSX.writeFile(workbook, 'hayitron-admin-users.xlsx');
  }

  async function handleVotingToggle() {
    try {
      await updateVotingWindow(member.email, !summary.votingOpen);
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUserStatus(userId, nextStatus) {
    try {
      await updateAdminUser(member.email, userId, { status: nextStatus });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCredit(userId) {
    const value = window.prompt('סכום זיכוי ידני בש"ח', '50');
    if (!value) {
      return;
    }

    try {
      await updateAdminUser(member.email, userId, { creditAmount: Number(value) });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBannerSubmit(event) {
    event.preventDefault();
    if (!bannerForm.title.trim()) {
      return;
    }

    try {
      await createBanner(member.email, bannerForm);
      setBannerForm({ title: '', placement: 'עמוד הבית', imagePath: '', imageBase64: '' });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleBannerFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBannerForm((current) => ({
        ...current,
        imageBase64: String(reader.result || ''),
        imagePath: file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleBannerStatus(bannerId, status) {
    try {
      await updateBanner(member.email, bannerId, { status });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendNewsletter() {
    if (!newsletterSubject.trim() || !newsletterText.trim()) {
      return;
    }

    try {
      const result = await createBroadcast(member.email, { subject: newsletterSubject, body: newsletterText });
      setNewsletterDelivery(result.delivery || null);
      setNewsletterSubject('');
      setNewsletterText('');
      setShowNewsletter(false);
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGroupSubmit(event) {
    event.preventDefault();
    if (!groupForm.title.trim()) {
      return;
    }

    try {
      await createPurchaseGroup(member.email, groupForm);
      setGroupForm({ title: '', category: 'בית וגינה', region: 'כל הארץ', supplier: '', closesAt: '', inventory: '', targetPrice: '' });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGroupStatus(groupId, nextStatus) {
    try {
      await updatePurchaseGroup(member.email, groupId, { status: nextStatus });
      await refreshUsersAndSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!isAdmin) {
    return (
      <section style={{ background: 'var(--ink)', color: 'white', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 className="font-display" style={{ color: 'white', marginBottom: '0.5rem' }}>גישה מוגבלת</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>דף זה מיועד למנהלים בלבד.</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return <section className="section-pad"><div className="container">טוען נתוני ניהול...</div></section>;
  }

  const filteredUsers = users.filter((user) => {
    const query = userQuery.trim();
    if (!query) {
      return true;
    }
    return user.name.includes(query) || user.email.includes(query) || String(user.cardNumber || '').includes(query);
  });

  const filteredPosts = summary.posts.filter((post) => postFilter === 'all' || post.status === postFilter);

  return (
    <>
      <section style={{ background: 'var(--ink)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container">
          <h2 className="font-display" style={{ margin: 0, color: 'white' }}>לוח ניהול מערכת</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0 0' }}>ניהול מנהלים בלבד</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {error && <div style={{ color: 'var(--coral)', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}
          {newsletterDelivery ? (
            <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(47,111,98,0.08)' }}>
              <strong>סטטוס דיוור:</strong> {newsletterDelivery.provider === 'resend' ? `נשלח ל-${newsletterDelivery.delivered} נמענים תקינים מתוך ${newsletterDelivery.requestedRecipients || newsletterDelivery.delivered}` : `לא נשלח. חסר חיבור פעיל ל-Resend, ${newsletterDelivery.skipped} נמענים דולגו`}
              {typeof newsletterDelivery.invalidRecipients === 'number' && newsletterDelivery.invalidRecipients > 0 ? (
                <div style={{ marginTop: '0.3rem', color: 'var(--coral)' }}>זוהו {newsletterDelivery.invalidRecipients} כתובות אימייל לא תקינות ונופו אוטומטית.</div>
              ) : null}
              {newsletterDelivery.providerError ? (
                <div style={{ marginTop: '0.3rem', color: 'var(--coral)' }}>שגיאת ספק דיוור: {newsletterDelivery.providerError}</div>
              ) : null}
            </div>
          ) : null}

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <div className="eyebrow" style={{ color: 'var(--teal)', marginBottom: '0.5rem' }}>משתמשים פעילים</div>
              <div className="font-num" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)' }}>{summary.kpis.activeUsers}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>מתוך {summary.kpis.totalUsers} חברי מערכת</div>
            </div>
            <div className="card card-body">
              <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '0.5rem' }}>כרטיסים שהונפקו</div>
              <div className="font-num" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)' }}>{summary.kpis.issuedCards}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{summary.kpis.activeCards} כרטיסים פעילים כרגע</div>
            </div>
            <div className="card card-body">
              <div className="eyebrow" style={{ color: 'var(--coral)', marginBottom: '0.5rem' }}>סה״כ יתרות</div>
              <div className="font-num" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)' }}>₪{summary.kpis.totalVolume}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>בחשבונות משתמשים</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>תוצאות הצבעה מובילות</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {summary.votes.length ? summary.votes.map((vote) => (
                  <div key={vote.optionId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{vote.optionId}</span>
                      <span className="font-num">{vote.count}</span>
                    </div>
                    <div style={{ height: '10px', borderRadius: '999px', background: 'var(--paper-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Number(vote.count) * 12)}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--teal))' }} />
                    </div>
                  </div>
                )) : <div style={{ color: 'var(--ink-soft)' }}>עדיין אין נתוני הצבעה להצגה.</div>}
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>סטטוס חודשי</h3>
              <div className="tile" style={{ background: summary.votingOpen ? 'rgba(47,111,98,0.08)' : 'rgba(193,72,61,0.08)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>חלון הצבעה</div>
                <div style={{ color: 'var(--ink-soft)', marginBottom: '1rem' }}>{summary.votingOpen ? 'פתוח להצבעות החודש' : 'סגור כרגע'}</div>
                <button className={summary.votingOpen ? 'btn-ghost' : 'btn-teal'} onClick={handleVotingToggle} type="button">
                  {summary.votingOpen ? 'סגור הצבעה חודשית' : 'פתח הצבעה חודשית'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>פילוח עסקאות לפי קטגוריה</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={summary.charts.categories}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      {summary.charts.categories.map((entry, index) => <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>פילוח עסקאות לפי אזור</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={summary.charts.regions} dataKey="total" nameKey="label" outerRadius={90} innerRadius={45} paddingAngle={3}>
                      {summary.charts.regions.map((entry, index) => <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>עסקים מובילים</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {summary.charts.businesses.map((item) => (
                  <div key={item.label} className="tile" style={{ padding: '0.8rem 0.9rem' }}>
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div className="font-num" style={{ color: 'var(--teal)' }}>₪{Math.round(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>ניהול קבוצות רכישה</h3>
              <form onSubmit={handleGroupSubmit} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                <input placeholder="שם קבוצת רכישה" value={groupForm.title} onChange={(event) => setGroupForm((current) => ({ ...current, title: event.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <select value={groupForm.category} onChange={(event) => setGroupForm((current) => ({ ...current, category: event.target.value }))}>
                    <option>בית וגינה</option>
                    <option>חינוך</option>
                    <option>מסעדנות</option>
                    <option>פנאי ותיירות</option>
                  </select>
                  <select value={groupForm.region} onChange={(event) => setGroupForm((current) => ({ ...current, region: event.target.value }))}>
                    <option>כל הארץ</option>
                    <option>גוש דן</option>
                    <option>ירושלים והסביבה</option>
                    <option>חיפה והצפון</option>
                  </select>
                  <input type="number" placeholder="מחיר יעד" value={groupForm.targetPrice} onChange={(event) => setGroupForm((current) => ({ ...current, targetPrice: event.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <input placeholder="ספק" value={groupForm.supplier} onChange={(event) => setGroupForm((current) => ({ ...current, supplier: event.target.value }))} />
                  <input type="date" value={groupForm.closesAt} onChange={(event) => setGroupForm((current) => ({ ...current, closesAt: event.target.value }))} />
                  <input type="number" placeholder="מלאי" value={groupForm.inventory} onChange={(event) => setGroupForm((current) => ({ ...current, inventory: event.target.value }))} />
                </div>
                <button className="btn-primary" type="submit">צור קבוצה</button>
              </form>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {groups.map((group) => (
                  <div key={group.id} className="tile" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{group.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{group.category} · {group.region}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>₪{group.targetPrice} · {group.participants} נרשמים · {group.supplier || 'ללא ספק'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>סגירה: {group.closesAt || 'לא הוגדר'} · מלאי: {group.inventory || 0}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn-ghost" style={{ marginTop: 0 }} onClick={() => handleGroupStatus(group.id, 'planning')} type="button">תכנון</button>
                      <button className="btn-teal" style={{ marginTop: 0 }} onClick={() => handleGroupStatus(group.id, 'open')} type="button">פתוח</button>
                      <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => handleGroupStatus(group.id, 'closed')} type="button">סגור</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>ביצועי קבוצות רכישה</h3>
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <BarChart data={groups} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="title" width={130} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="participants" radius={[0, 8, 8, 0]} fill="#2f6f62" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Voting Windows */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>ניהול חלונות הצבעה</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[{ id: 'current', month: 'החודש הנוכחי', status: summary.votingOpen ? 'open' : 'closed', votes: summary.votes.reduce((sum, item) => sum + Number(item.count || 0), 0) }].map((w) => (
                <div key={w.id} className="tile" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{w.month}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{w.votes} קולות</div>
                  </div>
                  <button
                    className={w.status === 'open' ? 'btn-teal' : 'btn-ghost'}
                    onClick={handleVotingToggle}
                    type="button"
                    style={{ minWidth: '100px' }}
                  >
                    {w.status === 'open' ? '📖 פתוח' : '🔒 סגור'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Users Management */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: '1.25rem' }}>ניהול משתמשים</h3>
              <button className="btn-primary" onClick={exportToExcel} type="button">📥 ייצוא Excel</button>
            </div>
            <input placeholder="חיפוש לפי שם, מייל או מספר כרטיס" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--line)' }}>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>שם</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>אימייל</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>סטטוס</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>יתרה</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700 }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 15).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '0.75rem' }}>{u.name}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          background: u.status === 'active' ? 'rgba(47,111,98,0.12)' : 'rgba(193,72,61,0.12)',
                          color: u.status === 'active' ? 'var(--teal)' : 'var(--coral)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}>
                          {u.status === 'active' ? '✓ פעיל' : '✗ חסום'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>₪{u.balance}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginTop: 0 }} onClick={() => handleUserStatus(u.id, u.status === 'active' ? 'inactive' : 'active')} type="button">
                            {u.status === 'active' ? 'חסום' : 'הפעל'}
                          </button>
                          <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginTop: 0 }} onClick={() => handleCredit(u.id)} type="button">זיכוי</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length > 15 && <p style={{ marginTop: '0.75rem', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>הצגת 15 מתוך {filteredUsers.length} משתמשים</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h3 className="font-display" style={{ margin: 0, fontSize: '1.25rem' }}>ניהול פורום וסינון תכנים</h3>
                <select value={postFilter} onChange={(event) => setPostFilter(event.target.value)} style={{ maxWidth: '180px' }}>
                  <option value="all">כל הפוסטים</option>
                  <option value="visible">גלויים</option>
                  <option value="flagged">מסומנים</option>
                  <option value="hidden">מוסתרים</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredPosts.map((post) => (
                  <div key={post.id} className="tile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                      <strong>{post.author}</strong>
                      <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{post.createdAt}</span>
                    </div>
                    <p style={{ marginTop: 0 }}>{post.text}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn-ghost" style={{ marginTop: 0 }} onClick={() => handlePostStatus(post.id, 'visible')} type="button">אשר</button>
                      <button className="btn-ghost" style={{ marginTop: 0 }} onClick={() => handlePostStatus(post.id, 'flagged')} type="button">סמן לבדיקה</button>
                      <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => handlePostStatus(post.id, 'hidden')} type="button">הסתר</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>ביצועי סקרים</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {summary.surveys.map((survey) => (
                  <div key={survey.id} className="tile">
                    <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{survey.title}</div>
                    <div style={{ display: 'grid', gap: '0.55rem' }}>
                      {survey.answers.map((answer) => (
                        <div key={answer.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                            <span>{answer.label}</span>
                            <span className="font-num">{answer.count}</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--paper-2)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, Number(answer.count))}%`, height: '100%', background: 'var(--coral)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>ניהול באנרים ופרסום</h3>
              <form onSubmit={handleBannerSubmit} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                <input placeholder="כותרת באנר" value={bannerForm.title} onChange={(event) => setBannerForm((current) => ({ ...current, title: event.target.value }))} />
                <select value={bannerForm.placement} onChange={(event) => setBannerForm((current) => ({ ...current, placement: event.target.value }))}>
                  <option>עמוד הבית</option>
                  <option>עמוד הטבות</option>
                  <option>עמוד קהילה</option>
                </select>
                <input type="file" accept="image/*" onChange={handleBannerFileChange} />
                <input placeholder="או נתיב תמונה קיים, למשל /uploads/banner-1.jpg" value={bannerForm.imagePath} onChange={(event) => setBannerForm((current) => ({ ...current, imagePath: event.target.value }))} />
                <button className="btn-primary" type="submit">הוסף באנר</button>
              </form>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {summary.banners.map((banner) => (
                  <div key={banner.id} className="tile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{banner.title}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>{banner.placement}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{banner.imagePath || 'ללא תמונה'}</div>
                      {banner.imagePath ? <img src={banner.imagePath} alt={banner.title} style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '10px', marginTop: '0.5rem' }} /> : null}
                    </div>
                    <button className={banner.status === 'active' ? 'btn-ghost' : 'btn-teal'} style={{ marginTop: 0 }} onClick={() => handleBannerStatus(banner.id, banner.status === 'active' ? 'draft' : 'active')} type="button">
                      {banner.status === 'active' ? 'העבר לטיוטה' : 'הפעל'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-body">
              <h3 className="font-display" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>יומן דיוור</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {summary.broadcasts.length ? summary.broadcasts.map((item) => (
                  <div key={item.id} className="tile">
                    <div style={{ fontWeight: 700 }}>{item.subject}</div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>נשלח ל-{item.recipients} מנויים</div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{item.createdAt}</div>
                  </div>
                )) : <div style={{ color: 'var(--ink-soft)' }}>עדיין לא נשלחו הודעות מרוכזות.</div>}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>דיוור ותקשורת</h3>
            {!showNewsletter ? (
              <button className="btn-primary" onClick={() => setShowNewsletter(true)} type="button">✉️ שלח הודעה לכל המשתמשים</button>
            ) : (
              <div className="card card-body" style={{ maxWidth: '600px' }}>
                <input
                  placeholder="כותרת ההודעה"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  style={{ marginBottom: '0.75rem' }}
                />
                <textarea
                  placeholder="כתוב הודעה לכל מנויי המערכת..."
                  value={newsletterText}
                  onChange={(e) => setNewsletterText(e.target.value)}
                  style={{ width: '100%', height: '120px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--line)', fontFamily: 'inherit', resize: 'vertical', direction: 'rtl' }}
                />
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                  <button className="btn-primary" onClick={sendNewsletter} type="button">שלח</button>
                  <button className="btn-ghost" onClick={() => setShowNewsletter(false)} type="button">בטל</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '3rem' }}>
            <h3 className="font-display" style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>יומן פעולות מנהל (Audit)</h3>
            <div className="card card-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {auditLogs.length ? auditLogs.map((log) => (
                  <div key={log.id} className="tile" style={{ padding: '0.8rem 0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{log.action}</strong>
                      <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{log.createdAt}</span>
                    </div>
                    <div style={{ marginTop: '0.3rem', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                      {log.actorEmail} · {log.entityType} #{log.entityId || '-'}
                    </div>
                    {log.details ? (
                      <pre style={{ margin: '0.5rem 0 0', background: 'var(--paper-2)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto' }}>{JSON.stringify(log.details, null, 2)}</pre>
                    ) : null}
                  </div>
                )) : <div style={{ color: 'var(--ink-soft)' }}>עדיין לא נרשמו פעולות ניהול.</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AdminPage;
