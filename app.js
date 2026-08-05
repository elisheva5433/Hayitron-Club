const state = {
  view: 'home',
  loggedIn: false,
  member: { name: 'נועה שגיא', cardNumber: '4291 8830 1122 4457', balance: 342, status: 'active' },
  statusMessage: '',
  benefitsSearch: '',
  benefitsCat: 'הכל',
  benefitsRegion: 'כל הארץ',
  storesCatIndex: 0,
  votedOptionId: null,
  forumPosts: [
    { author: 'מיכל א.', time: 'לפני שעתיים', text: 'האם יש המלצה למוצר לחודש הבא?' },
    { author: 'אורי ב.', time: 'אתמול', text: 'ההנחה על המקרר הייתה ממש שווה.' },
  ],
};

const cardTypes = [
  {
    id: 'basic',
    title: 'כרטיס בסיסי',
    tone: 'basic',
    price: '₪19 לחודש',
    perks: ['הטבות בסיסיות', 'אינדקס מלא', 'גישה לקהילה'],
  },
  {
    id: 'vip',
    title: 'כרטיס פרימיום',
    tone: 'vip',
    price: '₪49 לחודש',
    perks: ['הנחות עומק', 'הגרלות VIP', 'עדיפות בקבוצות רכישה'],
  },
  {
    id: 'family',
    title: 'כרטיס עסקי / משפחתי',
    tone: 'family',
    price: '₪89 לחודש',
    perks: ['עד 5 מוטבים', 'דוח שימוש', 'ניהול רשאות'],
  },
];

const benefits = [
  { name: 'מסעדת הבית של אמא', category: 'מסעדנות', region: 'גוש דן', perk: '15% הנחה על כל התפריט', address: 'רוטשילד 45, תל אביב' },
  { name: 'קליניקת שיניים לבן', category: 'בריאות ורפואה', region: 'השרון', perk: '20% הנחה על טיפולים', address: 'סוקולוב 12, הרצליה' },
  { name: 'סטודיו פילאטיס תנועה', category: 'פנאי ותיירות', region: 'ירושלים והסביבה', perk: 'מנוי חודשי במחיר -30%', address: 'עמק רפאים 8, ירושלים' },
  { name: 'בוטיק אורבן קלוז', category: 'אופנה', region: 'חיפה והצפון', perk: '2 ב-1 על כל הפריטים', address: 'הרצל 33, חיפה' },
];

const storeCategories = [
  {
    title: 'רשתות קמעונאיות',
    subtitle: 'שיווק וצרכנות',
    stores: ['שופרסל', 'קוקה-קולה', 'איקאה'],
  },
  {
    title: 'בריאות ופנאי',
    subtitle: 'ספורט, טיפוח ובריאות',
    stores: ['ספורטלימיט', 'נטורלוק', 'מכון כושר'],
  },
  {
    title: 'אופנה ו lifestyle',
    subtitle: 'לבוש ואבזור',
    stores: ['קסטרו', 'פוקס', 'אופנה 24'],
  },
];

const voteOptions = [
  { id: 'stroller', name: 'עגלת תינוקות פרימיום', votes: 142, price: '₪890' },
  { id: 'freezer', name: 'מקפיא 5 מגירות', votes: 97, price: '₪1,290' },
  { id: 'oven', name: 'תנור אפייה משולב', votes: 118, price: '₪2,190' },
];

const faqs = [
  { q: 'איך משנים את סטטוס הכרטיס?', a: 'בחלון האזור האישי אפשר להפעיל או לבדוק את סטטוס הכרטיס.' },
  { q: 'איך מצטרפים לקבוצת רכישה?', a: 'נכנסים לעמוד הקהילה, בוחרים מוצר ומצביעים על האפשרות המועדפת.' },
  { q: 'האם אפשר להוסיף בית עסק כשותף?', a: 'כן, דרך דף הצטרפות עסקים ניתן להגיש בקשה.' },
];

const app = document.getElementById('app');

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'הפעולה נכשלה');
  }
  return data;
}

function render(view) {
  state.view = view;
  app.innerHTML = viewMap[view]();
  updateActiveNav();
  if (view === 'benefits') renderBenefitsList();
  if (view === 'stores') renderStores();
  if (view === 'community') renderCommunity();
}

function updateActiveNav() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.classList.toggle('active', el.dataset.nav === state.view);
  });
}

function renderHome() {
  return `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <h1>מועדון היתרון שמחבר בין חברים, עסקים וקהילה</h1>
          <p>הטבות, כרטיסי חבר, קבוצות רכישה וחוויית שימוש אחת — כל זה במקום אחד, בעיצוב נוח למובייל.</p>
          <div class="hero-actions">
            <button class="btn-primary" data-nav="cards" type="button">לגלות את הכרטיסים</button>
            <button class="btn-secondary" data-nav="benefits" type="button">לצפות בהטבות</button>
          </div>
        </div>
        <div class="card card-body">
          <h3>מה מצפה לכם?</h3>
          <ul>
            <li>הנחות במקומות שאתם משתמשים בהם</li>
            <li>ניהול כרטיסים ואזור אישי</li>
            <li>השתתפות בקבוצות רכישה</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>כרטיסי חבר</h2>
          <p>בחרו את המסלול שמתאים לכם.</p>
        </div>
        <div class="grid-3">
          ${cardTypes.map((card) => `
            <article class="membership-card ${card.tone}">
              <h3>${card.title}</h3>
              <div style="font-size: 1.2rem; font-weight: 800; margin-top: 0.6rem;">${card.price}</div>
              <ul>
                ${card.perks.map((perk) => `<li>${perk}</li>`).join('')}
              </ul>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderCards() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>הכרטיסים שלנו</h2>
          <p>התחילו עם בסיסי, גשו ל- VIP או ניהלו מסגרת משפחתית/עסקית.</p>
        </div>
        <div class="grid-3">
          ${cardTypes.map((card) => `
            <article class="card card-body">
              <h3>${card.title}</h3>
              <p>${card.price}</p>
              <ul>
                ${card.perks.map((perk) => `<li>${perk}</li>`).join('')}
              </ul>
              <button class="btn-secondary btn-small" data-nav="business" type="button">לבחירת מסלול</button>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderBenefits() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>אינדקס ההטבות</h2>
          <p>חפשו לפי שם, קטגוריה או אזור.</p>
        </div>
        <div class="search-row">
          <input id="benefit-search" placeholder="חיפוש לפי שם עסק או הטבה" />
          <select id="benefit-cat">
            <option>הכל</option>
            <option>מסעדנות</option>
            <option>אופנה</option>
            <option>בריאות ורפואה</option>
            <option>פנאי ותיירות</option>
          </select>
          <select id="benefit-region">
            <option>כל הארץ</option>
            <option>גוש דן</option>
            <option>השרון</option>
            <option>ירושלים והסביבה</option>
            <option>חיפה והצפון</option>
          </select>
        </div>
        <div class="card card-body" style="margin-top: 1rem;">
          <div id="benefit-count" class="badge">0 בתי עסק</div>
          <div id="benefit-list" style="margin-top: 1rem;"></div>
        </div>
      </div>
    </section>
  `;
}

function renderBenefitsList() {
  const input = document.getElementById('benefit-search');
  const cat = document.getElementById('benefit-cat');
  const region = document.getElementById('benefit-region');
  const list = document.getElementById('benefit-list');
  const count = document.getElementById('benefit-count');

  function filterBenefits() {
    const term = (input?.value || '').trim().toLowerCase();
    const selectedCat = cat?.value || 'הכל';
    const selectedRegion = region?.value || 'כל הארץ';

    const filtered = benefits.filter((item) => {
      const matchSearch = !term || item.name.toLowerCase().includes(term) || item.perk.toLowerCase().includes(term);
      const matchCat = selectedCat === 'הכל' || item.category === selectedCat;
      const matchRegion = selectedRegion === 'כל הארץ' || item.region === selectedRegion;
      return matchSearch && matchCat && matchRegion;
    });

    count.textContent = `${filtered.length} בתי עסק`;
    list.innerHTML = filtered.length
      ? filtered.map((item) => `
          <article class="benefit-item" style="margin-bottom: 0.8rem;">
            <h3>${item.name}</h3>
            <p>${item.perk}</p>
            <small>${item.address}</small>
          </article>
        `).join('')
      : '<div class="empty-state">לא נמצאו תוצאות. נסו לשנות את המסננים.</div>';
  }

  [input, cat, region].forEach((el) => el?.addEventListener('input', filterBenefits));
  [cat, region].forEach((el) => el?.addEventListener('change', filterBenefits));
  filterBenefits();
}

function renderStores() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>אינדקס חנויות</h2>
          <p>הצטרפו לרשתות השותפות עם הטבות ייעודיות.</p>
        </div>
        <div class="card card-body">
          ${storeCategories.map((category, index) => `
            <button class="btn-ghost" type="button" style="margin-left:0.5rem; margin-bottom:0.7rem; ${index === state.storesCatIndex ? 'background: var(--paper-2);' : ''}" onclick="selectStoreCategory(${index})">
              ${category.title}
            </button>
          `).join('')}
          <div style="margin-top: 1rem;">
            <h3>${storeCategories[state.storesCatIndex].title}</h3>
            <p>${storeCategories[state.storesCatIndex].subtitle}</p>
            <div class="grid-3" style="margin-top: 1rem;">
              ${storeCategories[state.storesCatIndex].stores.map((store) => `
                <article class="store-item">${store}</article>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function selectStoreCategory(index) {
  state.storesCatIndex = index;
  render('stores');
}

function renderCommunity() {
  const totalVotes = voteOptions.reduce((sum, item) => sum + item.votes, 0);
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>קהילה וקבוצות רכישה</h2>
          <p>הצביעו על המוצר הבא לחודש, וכתבו גם אתם על החוויה שלכם.</p>
        </div>
        <div class="card card-body" style="margin-bottom: 1rem;">
          <h3>הצבעה פתוחה</h3>
          <div id="vote-list"></div>
        </div>
        <div class="grid-2">
          <div class="card card-body">
            <h3>פורום הקהילה</h3>
            <div id="forum-list"></div>
            <form id="forum-form" style="margin-top: 1rem;">
              <input id="forum-input" placeholder="הוסיפו פוסט" />
              <button class="btn-secondary btn-small" style="margin-top:0.6rem;" type="submit">פרסם</button>
            </form>
          </div>
          <div class="card card-body">
            <h3>מוצר חודשי</h3>
            <p>הצבעה זו מסייעת לקבוע את המוצר הבא שייכנס לקבוצת הרכישה.</p>
            <p><strong>סה"כ הצבעות:</strong> ${totalVotes}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCommunityContent() {
  const list = document.getElementById('vote-list');
  if (list) {
    list.innerHTML = voteOptions.map((item) => {
      const pct = Math.round((item.votes / voteOptions.reduce((sum, option) => sum + option.votes, 0)) * 100);
      const selected = state.votedOptionId === item.id;
      return `
        <div class="vote-item" style="margin-bottom: 0.7rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:0.8rem;">
            <strong>${item.name}</strong>
            <button class="btn-small ${selected ? 'btn-secondary' : 'btn-ghost'}" type="button" onclick="castVote('${item.id}')">${selected ? 'נבחר' : 'להצביע'}</button>
          </div>
          <p>${item.price}</p>
          <p>${item.votes} הצבעות • ${pct}%</p>
        </div>
      `;
    }).join('');
  }

  const forumList = document.getElementById('forum-list');
  if (forumList) {
    forumList.innerHTML = state.forumPosts.map((post) => `
      <article class="post-item" style="margin-bottom: 0.7rem;">
        <strong>${post.author}</strong>
        <div style="font-size: 0.85rem; color: rgba(23,27,46,0.65);">${post.time}</div>
        <p>${post.text}</p>
      </article>
    `).join('');
  }
}

function castVote(id) {
  if (state.votedOptionId === id) return;
  const prev = voteOptions.find((option) => option.id === state.votedOptionId);
  if (prev) prev.votes -= 1;
  const next = voteOptions.find((option) => option.id === id);
  if (next) next.votes += 1;
  state.votedOptionId = id;
  renderCommunityContent();
}

function renderPersonal() {
  if (!state.loggedIn) {
    return `
      <section class="section">
        <div class="container">
          <div class="section-title">
            <h2>האזור האישי</h2>
            <p>התחברו כדי לראות את כרטיסכם, היתרה והפעולות הזמינות.</p>
          </div>
          ${state.statusMessage ? `<div class="badge" style="margin-bottom: 1rem;">${state.statusMessage}</div>` : ''}
          <div class="grid-2">
            <div class="card card-body">
              <h3>התחברות</h3>
              <form id="login-form">
                <div class="form-grid">
                  <div><label>אימייל</label><input id="login-email" type="email" required /></div>
                  <div><label>סיסמה</label><input id="login-password" type="password" required /></div>
                </div>
                <button class="btn-secondary" style="margin-top: 1rem;" type="submit">התחברות</button>
              </form>
            </div>
            <div class="card card-body">
              <h3>הרשמה</h3>
              <form id="register-form">
                <div class="form-grid">
                  <div><label>שם מלא</label><input id="register-name" required /></div>
                  <div><label>אימייל</label><input id="register-email" type="email" required /></div>
                  <div><label>סיסמה</label><input id="register-password" type="password" required /></div>
                  <div><label>מספר כרטיס</label><input id="register-card" placeholder="4291 8830 1122 4457" /></div>
                </div>
                <button class="btn-primary" style="margin-top: 1rem;" type="submit">הרשמה</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>שלום ${state.member.name}</h2>
          <p>הנה מצב הכרטיס והפעולות שלכם.</p>
        </div>
        <div class="personal-grid">
          <div class="card card-body">
            <h3>סטטוס הכרטיס</h3>
            <div class="status-pill status-active">${state.member.status === 'active' ? 'פעיל' : state.member.status}</div>
            <p><strong>מספר כרטיס:</strong> ${state.member.cardNumber}</p>
            <p><strong>יתרה:</strong> ₪${state.member.balance}</p>
            <button class="btn-secondary btn-small" id="topup-button" type="button">לטעינה</button>
            <form id="topup-form" style="display:none; margin-top: 0.8rem;">
              <input id="topup-amount" type="number" placeholder="סכום לטעינה" />
              <button class="btn-primary btn-small" style="margin-top: 0.6rem;" type="submit">אישור</button>
            </form>
          </div>
          <div class="card card-body">
            <h3>פעולות אחרונות</h3>
            <div class="transaction-item">22.07 - מסעדת הבית של אמא - ₪186</div>
            <div class="transaction-item">18.07 - טעינת כרטיס +₪300</div>
            <div class="transaction-item">11.07 - קליניקת שיניים לבן - ₪240</div>
            <button class="btn-ghost" style="margin-top: 0.8rem;" id="logout-button" type="button">התנתקות</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBusiness() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>הצטרפות עסקים</h2>
          <p>הגישו בקשה להיות שותף במועדון וחשפו את ההטבות שלכם לחברים.</p>
        </div>
        <div class="card card-body">
          <form id="business-form">
            <div class="form-grid">
              <div><label>שם העסק</label><input required /></div>
              <div><label>שם איש קשר</label><input required /></div>
              <div><label>טלפון</label><input required /></div>
              <div><label>דוא"ל</label><input type="email" required /></div>
              <div><label>קטגוריה</label><select><option>מסעדנות</option><option>אופנה</option><option>בריאות</option><option>פנאי</option></select></div>
              <div><label>הצעה להטבה</label><input required /></div>
            </div>
            <button class="btn-secondary" style="margin-top: 1rem;" type="submit">שלח בקשה</button>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderFaq() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>שאלות נפוצות</h2>
          <p>הנה התשובות המהירות ביותר.</p>
        </div>
        <div class="card card-body">
          ${faqs.map((item, index) => `
            <article class="faq-item" style="margin-bottom: 0.7rem;">
              <button class="btn-ghost" style="width:100%; justify-content:flex-start;" type="button" onclick="toggleFaq(${index})">${item.q}</button>
              <div id="faq-body-${index}" style="display:none; margin-top:0.7rem;">${item.a}</div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function toggleFaq(index) {
  const body = document.getElementById(`faq-body-${index}`);
  if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function renderContact() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>צור קשר</h2>
          <p>נשמח לשמוע מכם, בין אם מדובר בשאלה, שיתוף פעולה או בקשת שירות.</p>
        </div>
        <div class="card card-body">
          <form id="contact-form">
            <div class="form-grid">
              <div><label>שם</label><input required /></div>
              <div><label>אימייל</label><input type="email" required /></div>
              <div><label>נושא</label><input required /></div>
            </div>
            <textarea style="margin-top: 0.8rem;" placeholder="הודעה"></textarea>
            <button class="btn-secondary" style="margin-top: 0.8rem;" type="submit">שלח</button>
          </form>
        </div>
      </div>
    </section>
  `;
}

const viewMap = {
  home: renderHome,
  cards: renderCards,
  benefits: renderBenefits,
  stores: renderStores,
  community: renderCommunity,
  personal: renderPersonal,
  business: renderBusiness,
  faq: renderFaq,
  contact: renderContact,
};

function bindEvents() {
  document.addEventListener('click', (event) => {
    const navTarget = event.target.closest('[data-nav]');
    if (navTarget) {
      render(navTarget.dataset.nav);
      if (navTarget.dataset.nav !== 'personal') {
        document.getElementById('mobile-nav')?.classList.remove('open');
      }
      return;
    }

    const topupButton = event.target.closest('#topup-button');
    if (topupButton) {
      document.getElementById('topup-form').style.display = 'block';
    }

    const logoutButton = event.target.closest('#logout-button');
    if (logoutButton) {
      state.loggedIn = false;
      state.statusMessage = 'התנתקת בהצלחה';
      render('personal');
    }
  });

  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-nav')?.classList.toggle('open');
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.id === 'login-form') {
      event.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        const data = await apiRequest('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        state.member = data.user;
        state.loggedIn = true;
        state.statusMessage = 'התחברת בהצלחה';
        render('personal');
      } catch (error) {
        state.statusMessage = error.message;
        render('personal');
      }
    }

    if (event.target.id === 'register-form') {
      event.preventDefault();
      const payload = {
        name: document.getElementById('register-name').value.trim(),
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value,
        cardNumber: document.getElementById('register-card').value.trim(),
      };
      try {
        const data = await apiRequest('/api/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        state.member = data.user;
        state.loggedIn = true;
        state.statusMessage = 'ההרשמה הצליחה';
        render('personal');
      } catch (error) {
        state.statusMessage = error.message;
        render('personal');
      }
    }

    if (event.target.id === 'topup-form') {
      event.preventDefault();
      const amount = Number(document.getElementById('topup-amount').value || 0);
      try {
        const data = await apiRequest('/api/topup', {
          method: 'POST',
          body: JSON.stringify({ email: state.member.email, amount }),
        });
        state.member.balance = data.balance;
        state.statusMessage = `טען/ה ${amount} ₪ בהצלחה`;
        render('personal');
      } catch (error) {
        state.statusMessage = error.message;
        render('personal');
      }
    }

    if (event.target.id === 'business-form') {
      event.preventDefault();
      alert('הבקשה נשלחה בהצלחה. ניצור איתכם קשר בהקדם.');
    }

    if (event.target.id === 'contact-form') {
      event.preventDefault();
      alert('ההודעה נשלחה. תודה!');
    }

    if (event.target.id === 'forum-form') {
      event.preventDefault();
      const input = document.getElementById('forum-input');
      if (input?.value.trim()) {
        state.forumPosts.unshift({ author: state.loggedIn ? state.member.name : 'אורח', time: 'עכשיו', text: input.value.trim() });
        input.value = '';
        renderCommunityContent();
      }
    }
  });

  const aiLauncher = document.getElementById('ai-launcher');
  const aiPanel = document.getElementById('ai-panel');
  const aiClose = document.getElementById('ai-close');
  const aiForm = document.getElementById('ai-form');
  const aiInput = document.getElementById('ai-input');
  const aiMessages = document.getElementById('ai-messages');

  aiLauncher?.addEventListener('click', () => {
    aiPanel?.classList.toggle('hidden');
    if (!aiPanel?.classList.contains('hidden')) {
      addAiMessage('bot', 'שלום! אני יכול לעזור לגבי יתרה, הטבות, כרטיסים או קבוצות רכישה.');
    }
  });

  aiClose?.addEventListener('click', () => aiPanel?.classList.add('hidden'));

  aiForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = aiInput?.value.trim();
    if (!question) return;
    addAiMessage('user', question);
    aiInput.value = '';
    addAiMessage('bot', aiReply(question));
  });

  function addAiMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot';
    bubble.textContent = text;
    aiMessages.appendChild(bubble);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function aiReply(question) {
    const q = question.toLowerCase();
    if (q.includes('יתרה')) return `היתרה הנוכחית בכרטיס שלכם היא ₪${state.member.balance}.`;
    if (q.includes('כרטיס') || q.includes('הפעל')) return 'כדי להפעיל כרטיס חדש, עברו לאזור האישי והזינו את מספר הכרטיס ותעודת הזהות.';
    if (q.includes('הטבה') || q.includes('הנחה')) return 'אפשר לחפש הטבות לפי קטגוריה, אזור או שם עסק בעמוד ההטבות.';
    if (q.includes('קבוצה') || q.includes('הצבעה')) return 'פתוחה כיום הצבעה על שלושה מוצרים לחודש הבא בקהילה.';
    return 'אני יכול לעזור בנושאי יתרה, כרטיסים, הטבות וקבוצות רכישה.';
  }
}

function start() {
  render('home');
  bindEvents();
  renderCommunityContent();
}

window.addEventListener('DOMContentLoaded', start);
