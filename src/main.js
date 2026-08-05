const { useState } = React;

const cardTypes = [
  { id: 'basic', title: 'כרטיס בסיסי', tone: 'basic', price: '₪19 לחודש', perks: ['הטבות בסיסיות', 'אינדקס מלא', 'גישה לקהילה'] },
  { id: 'vip', title: 'כרטיס פרימיום', tone: 'vip', price: '₪49 לחודש', perks: ['הנחות עומק', 'הגרלות VIP', 'עדיפות בקבוצות רכישה'] },
  { id: 'family', title: 'כרטיס עסקי / משפחתי', tone: 'family', price: '₪89 לחודש', perks: ['עד 5 מוטבים', 'דוח שימוש', 'ניהול רשאות'] },
];

function App() {
  const [view, setView] = useState('home');
  const [loggedIn, setLoggedIn] = useState(false);
  const [member, setMember] = useState({ name: 'נועה שגיא', cardNumber: '4291 8830 1122 4457', balance: 342, status: 'active', email: 'noa@example.com' });
  const [statusMessage, setStatusMessage] = useState('');

  async function apiRequest(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'הפעולה נכשלה');
    return data;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const data = await apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ email: form.email.value.trim(), password: form.password.value }) });
      setMember(data.user);
      setLoggedIn(true);
      setStatusMessage('התחברת בהצלחה');
      setView('personal');
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    try {
      const data = await apiRequest('/api/register', { method: 'POST', body: JSON.stringify({ name: form.name.value.trim(), email: form.email.value.trim(), password: form.password.value, cardNumber: form.cardNumber.value.trim() }) });
      setMember(data.user);
      setLoggedIn(true);
      setStatusMessage('ההרשמה הצליחה');
      setView('personal');
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function handleTopup(e) {
    e.preventDefault();
    const amount = Number(e.target.amount.value || 0);
    try {
      const data = await apiRequest('/api/topup', { method: 'POST', body: JSON.stringify({ email: member.email, amount }) });
      setMember({ ...member, balance: data.balance });
      setStatusMessage(`טען/ה ${amount} ₪ בהצלחה`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  return React.createElement(
    'div',
    { className: 'app-shell' },
    React.createElement(
      'header',
      { className: 'site-header' },
      React.createElement('div', { className: 'container header-inner' },
        React.createElement('button', { className: 'brand', onClick: () => setView('home') }, React.createElement('span', { className: 'brand-mark' }, '✦'), React.createElement('span', null, 'מועדון היתרון')),
        React.createElement('nav', { className: 'top-nav' },
          ['home','cards','benefits','community','personal'].map((key) => React.createElement('button', { key: key, className: view === key ? 'active' : '', onClick: () => setView(key) }, key === 'home' ? 'בית' : key === 'cards' ? 'הכרטיסים' : key === 'benefits' ? 'הטבות' : key === 'community' ? 'קהילה' : 'אזור אישי')))
        )
      )
    ),
    React.createElement('main', null,
      view === 'home' && React.createElement('section', { className: 'hero' }, React.createElement('div', { className: 'container hero-grid' },
        React.createElement('div', null,
          React.createElement('h1', null, 'מועדון היתרון שמחבר בין חברים, עסקים וקהילה'),
          React.createElement('p', null, 'הטבות, כרטיסי חבר, קבוצות רכישה וחוויית שימוש אחת — כל זה במקום אחד.'),
          React.createElement('div', { className: 'hero-actions' },
            React.createElement('button', { className: 'btn-primary', onClick: () => setView('cards') }, 'לגלות את הכרטיסים'),
            React.createElement('button', { className: 'btn-secondary', onClick: () => setView('benefits') }, 'לצפות בהטבות')
          )
        ),
        React.createElement('div', { className: 'card card-body' },
          React.createElement('h3', null, 'מה מצפה לכם?'),
          React.createElement('ul', null,
            React.createElement('li', null, 'הנחות במקומות שאתם משתמשים בהם'),
            React.createElement('li', null, 'ניהול כרטיסים ואזור אישי'),
            React.createElement('li', null, 'השתתפות בקבוצות רכישה')
          )
        )
      ))),
      view === 'cards' && React.createElement('section', { className: 'section' }, React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'section-title' }, React.createElement('h2', null, 'הכרטיסים שלנו'), React.createElement('p', null, 'בחרו את המסלול שמתאים לכם.')),
        React.createElement('div', { className: 'grid-3' }, cardTypes.map((card) => React.createElement('article', { key: card.id, className: `membership-card ${card.tone}` }, React.createElement('h3', null, card.title), React.createElement('div', { className: 'price' }, card.price), React.createElement('ul', null, card.perks.map((perk) => React.createElement('li', { key: perk }, perk)))))))
      )),
      view === 'benefits' && React.createElement('section', { className: 'section' }, React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'section-title' }, React.createElement('h2', null, 'אינדקס ההטבות'), React.createElement('p', null, 'חפשו לפי שם, קטגוריה או אזור.')),
        React.createElement('div', { className: 'card card-body' }, React.createElement('div', { className: 'benefit-list' },
          React.createElement('article', { className: 'benefit-item' }, React.createElement('h3', null, 'מסעדת הבית של אמא'), React.createElement('p', null, '15% הנחה על כל התפריט'), React.createElement('small', null, 'רוטשילד 45, תל אביב')),
          React.createElement('article', { className: 'benefit-item' }, React.createElement('h3', null, 'קליניקת שיניים לבן'), React.createElement('p', null, '20% הנחה על טיפולים'), React.createElement('small', null, 'סוקולוב 12, הרצליה')),
          React.createElement('article', { className: 'benefit-item' }, React.createElement('h3', null, 'סטודיו פילאטיס תנועה'), React.createElement('p', null, 'מנוי חודשי במחיר -30%'), React.createElement('small', null, 'עמק רפאים 8, ירושלים'))
        ))
      )),
      view === 'community' && React.createElement('section', { className: 'section' }, React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'section-title' }, React.createElement('h2', null, 'קהילה וקבוצות רכישה'), React.createElement('p', null, 'הצביעו על המוצר הבא לחודש, וכתבו גם אתם על החוויה שלכם.')),
        React.createElement('div', { className: 'card card-body' },
          React.createElement('h3', null, 'הצבעה פתוחה'),
          React.createElement('div', { className: 'vote-item' }, 'עגלת תינוקות פרימיום · 142 הצבעות'),
          React.createElement('div', { className: 'vote-item' }, 'מקפיא 5 מגירות · 97 הצבעות'),
          React.createElement('div', { className: 'vote-item' }, 'תנור אפייה משולב · 118 הצבעות')
        )
      )),
      view === 'personal' && React.createElement('section', { className: 'section' }, React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'section-title' }, React.createElement('h2', null, 'האזור האישי'), React.createElement('p', null, 'התחברו כדי לראות את כרטיסכם, היתרה והפעולות הזמינות.')),
        statusMessage ? React.createElement('div', { className: 'badge' }, statusMessage) : null,
        !loggedIn ? React.createElement('div', { className: 'grid-2' },
          React.createElement('div', { className: 'card card-body' },
            React.createElement('h3', null, 'התחברות'),
            React.createElement('form', { onSubmit: handleLogin },
              React.createElement('label', null, 'אימייל'),
              React.createElement('input', { name: 'email', type: 'email', required: true }),
              React.createElement('label', null, 'סיסמה'),
              React.createElement('input', { name: 'password', type: 'password', required: true }),
              React.createElement('button', { className: 'btn-secondary', type: 'submit' }, 'התחברות')
            )
          ),
          React.createElement('div', { className: 'card card-body' },
            React.createElement('h3', null, 'הרשמה'),
            React.createElement('form', { onSubmit: handleRegister },
              React.createElement('label', null, 'שם מלא'),
              React.createElement('input', { name: 'name', required: true }),
              React.createElement('label', null, 'אימייל'),
              React.createElement('input', { name: 'email', type: 'email', required: true }),
              React.createElement('label', null, 'סיסמה'),
              React.createElement('input', { name: 'password', type: 'password', required: true }),
              React.createElement('label', null, 'מספר כרטיס'),
              React.createElement('input', { name: 'cardNumber' }),
              React.createElement('button', { className: 'btn-primary', type: 'submit' }, 'הרשמה')
            )
          )
        ) : React.createElement('div', { className: 'personal-grid' },
          React.createElement('div', { className: 'card card-body' },
            React.createElement('h3', null, 'סטטוס הכרטיס'),
            React.createElement('div', { className: 'status-pill status-active' }, 'פעיל'),
            React.createElement('p', null, React.createElement('strong', null, 'מספר כרטיס:'), ' ', member.cardNumber),
            React.createElement('p', null, React.createElement('strong', null, 'יתרה:'), ' ₪', member.balance),
            React.createElement('form', { onSubmit: handleTopup },
              React.createElement('input', { name: 'amount', type: 'number', placeholder: 'סכום לטעינה' }),
              React.createElement('button', { className: 'btn-primary', type: 'submit' }, 'אישור')
            )
          ),
          React.createElement('div', { className: 'card card-body' },
            React.createElement('h3', null, 'פעולות אחרונות'),
            React.createElement('div', { className: 'transaction-item' }, '22.07 - מסעדת הבית של אמא - ₪186'),
            React.createElement('div', { className: 'transaction-item' }, '18.07 - טעינת כרטיס +₪300'),
            React.createElement('div', { className: 'transaction-item' }, '11.07 - קליניקת שיניים לבן - ₪240'),
            React.createElement('button', { className: 'btn-ghost', onClick: () => { setLoggedIn(false); setStatusMessage('התנתקת בהצלחה'); } }, 'התנתקות')
          )
        )
      ))
    ),
    React.createElement('footer', { className: 'site-footer' }, React.createElement('div', { className: 'container footer-inner' },
      React.createElement('div', null, React.createElement('h3', null, 'מועדון היתרון'), React.createElement('p', null, 'פלטפורמה דיגיטלית להטבות, כרטיסי חבר וקהילה.')),
      React.createElement('div', null, React.createElement('h4', null, 'למה זה טוב?'), React.createElement('ul', null, React.createElement('li', null, 'גישה מהירה להטבות'), React.createElement('li', null, 'ניהול כרטיסים במקום אחד'), React.createElement('li', null, 'שיתוף פעולה עם עסקים'))),
      React.createElement('div', null, React.createElement('h4', null, 'יצירת קשר'), React.createElement('p', null, '03-1234567', React.createElement('br', null), 'support@hayitron.co.il'))
    ))
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
