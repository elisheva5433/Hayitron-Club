import fs from 'node:fs/promises';

const SOURCE_URL = 'https://kehilotcard.co.il/api/public/benefits';
const OUTPUT_FILE = 'src/data/benefitsData.js';

function extractDiscountLabel(text) {
  const source = String(text || '');
  if (!source.trim()) return 'פרטי ההטבה לפי המועדון';

  const regex = /(\d+(?:[.,]\d+)?)\s*%|(\d+(?:[.,]\d+)?)\s*אחוז/gi;
  const values = [];
  let match = regex.exec(source);

  while (match) {
    const value = (match[1] || match[2] || '').replace(',', '.');
    if (value) values.push(`${value}%`);
    match = regex.exec(source);
  }

  const unique = [...new Set(values)];
  if (unique.length) return `${unique.join(' + ')} הנחה`;

  const firstSentence = source
    .split(/[\n.!?]/)
    .map((part) => part.trim())
    .find(Boolean);

  if (!firstSentence) return 'פרטי ההטבה לפי המועדון';
  return firstSentence.length > 75 ? `${firstSentence.slice(0, 72)}...` : firstSentence;
}

function normalizeLogo(logoUrl) {
  const raw = String(logoUrl || '').trim();
  if (!raw) return '/logos/magic-kass.svg';
  return raw.startsWith('http') ? raw : `https://kehilotcard.co.il${raw}`;
}

const legacyBusinesses = [
  {
    id: 'biz-legacy-1',
    name: 'שמלות כלה חן',
    cat: 'אופנה',
    region: 'גוש דן',
    perk: '10% הנחה',
    benefitText: '10% הנחה על כלל המלאי',
    hours: '10:00-19:00',
    addr: '',
    logo: '/logos/shmalot-kala-hen.png',
  },
  {
    id: 'biz-legacy-2',
    name: 'פיצה פון',
    cat: 'מסעדנות',
    region: 'גוש דן',
    perk: '15% הנחה',
    benefitText: '15% הנחה על כל ההזמנה',
    hours: '11:00-23:00',
    addr: '',
    logo: '/logos/pizza-phone.jpg',
  },
  {
    id: 'biz-legacy-3',
    name: 'קונדיטוריית קצבורג',
    cat: 'מסעדנות',
    region: 'ירושלים והסביבה',
    perk: '10% הנחה',
    benefitText: '10% הנחה + משלוח חינם',
    hours: '07:00-21:00',
    addr: 'ירושלים',
    logo: '/logos/IMG-20260805-WA0001.jpg',
  },
  {
    id: 'biz-legacy-4',
    name: 'פיצה מיה - טבריה',
    cat: 'מסעדנות',
    region: 'חיפה והצפון',
    perk: '15% הנחה',
    benefitText: '15% הנחה על כל ההזמנה',
    hours: '11:00-23:00',
    addr: 'טבריה',
    logo: '/logos/pizza-mia.png',
  },
  {
    id: 'biz-legacy-5',
    name: 'יין בסביבה בני ברק',
    cat: 'מסעדנות',
    region: 'גוש דן',
    perk: 'הטבה מיוחדת',
    benefitText: 'בקבוק יין במתנה ברכישה מעל 200 ש"ח',
    hours: '09:00-22:00',
    addr: 'בני ברק',
    logo: '/logos/IMG-20260804-WA0001.jpg',
  },
  {
    id: 'biz-legacy-6',
    name: 'פיצה פסטלה קריית ספר',
    cat: 'מסעדנות',
    region: 'ירושלים והסביבה',
    perk: '15% הנחה',
    benefitText: '15% הנחה על כל ההזמנה',
    hours: '11:00-23:00',
    addr: 'קריית ספר',
    logo: '/logos/IMG-20260804-WA0014.jpg',
  },
  {
    id: 'biz-legacy-7',
    name: 'המסעדה היהודית',
    cat: 'מסעדנות',
    region: 'גוש דן',
    perk: '10% הנחה',
    benefitText: '10% הנחה על התפריט',
    hours: '12:00-23:00',
    addr: '',
    logo: '/logos/hamisada-hayehudit.png',
  },
  {
    id: 'biz-legacy-8',
    name: "ג'אסט מיט",
    cat: 'מסעדנות',
    region: 'גוש דן',
    perk: '10% הנחה',
    benefitText: '10% הנחה על כל הזמנה',
    hours: '11:00-22:00',
    addr: '',
    logo: '/logos/just-meat.jpg',
  },
  {
    id: 'biz-legacy-9',
    name: 'רפטינג נהר הירדן',
    cat: 'פנאי ותיירות',
    region: 'חיפה והצפון',
    perk: '20% הנחה',
    benefitText: '20% הנחה לחברי המועדון',
    hours: '08:00-17:00',
    addr: 'נהר הירדן',
    logo: '/logos/rafting-yarden.png',
  },
  {
    id: 'biz-legacy-10',
    name: 'מיני ישראל',
    cat: 'פנאי ותיירות',
    region: 'ירושלים והסביבה',
    perk: '15% הנחה',
    benefitText: '15% הנחה על כרטיסי כניסה',
    hours: '10:00-18:00',
    addr: 'לטרון',
    logo: '/logos/mini-israel.png',
  },
  {
    id: 'biz-legacy-11',
    name: 'חלום עולמי',
    cat: 'פנאי ותיירות',
    region: 'חיפה והצפון',
    perk: '20% הנחה',
    benefitText: '20% הנחה על פעילויות',
    hours: '09:00-17:00',
    addr: '',
    logo: '/logos/halom-olami.png',
  },
  {
    id: 'biz-legacy-12',
    name: "נינג'ה ישראל",
    cat: 'פנאי ותיירות',
    region: 'גוש דן',
    perk: '15% הנחה',
    benefitText: '15% הנחה על כרטיסי כניסה',
    hours: '09:00-20:00',
    addr: '',
    logo: '/logos/ninja-israel.png',
  },
  {
    id: 'biz-legacy-13',
    name: 'פיינטבול הגושרים',
    cat: 'פנאי ותיירות',
    region: 'חיפה והצפון',
    perk: '20% הנחה',
    benefitText: '20% הנחה לקבוצות',
    hours: '09:00-18:00',
    addr: 'הגושרים',
    logo: '/logos/paintball-hagoshrim.png',
  },
  {
    id: 'biz-legacy-14',
    name: "ג'יפים נהר הירדן",
    cat: 'פנאי ותיירות',
    region: 'חיפה והצפון',
    perk: '15% הנחה',
    benefitText: "15% הנחה על סיורי ג'יפים",
    hours: '08:00-17:00',
    addr: 'נהר הירדן',
    logo: '/logos/IMG-20260804-WA0007.jpg',
  },
  {
    id: 'biz-legacy-15',
    name: "איתמר ג'יפים",
    cat: 'פנאי ותיירות',
    region: 'חיפה והצפון',
    perk: '15% הנחה',
    benefitText: '15% הנחה על סיורים',
    hours: '08:00-17:00',
    addr: '',
    logo: '/logos/IMG-20260804-WA0003.jpg',
  },
  {
    id: 'biz-legacy-16',
    name: 'רייזר בר',
    cat: 'פנאי ותיירות',
    region: 'גוש דן',
    perk: '20% הנחה',
    benefitText: '20% הנחה על פעילויות',
    hours: '09:00-18:00',
    addr: '',
    logo: '/logos/razor-bar.png',
  },
  {
    id: 'biz-legacy-17',
    name: 'עידן גל אופן',
    cat: 'פנאי ותיירות',
    region: 'גוש דן',
    perk: '15% הנחה',
    benefitText: '15% הנחה על פעילויות',
    hours: '09:00-17:00',
    addr: '',
    logo: '/logos/golkapa.svg',
  },
];

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch source data: HTTP ${response.status}`);
}

const payload = await response.json();
const stores = Array.isArray(payload?.stores) ? payload.stores : [];

const mapped = stores.map((store, idx) => {
  const branches = Array.isArray(store?.branches) ? store.branches : [];
  const firstBranch = branches[0] || null;
  const cityFromList = Array.isArray(store?.cities) && store.cities.length
    ? String(store.cities[0] || '').trim()
    : '';

  const city = String(firstBranch?.city || cityFromList || '').trim() || 'כל הארץ';
  const addr = String(firstBranch?.address || '').trim() || city;
  const benefitText = String(store?.benefit_text || '').trim();

  return {
    id: `biz-${store?.store_id || idx + 1}`,
    name: String(store?.name || 'בית עסק').trim(),
    cat: String(store?.category_name || 'כללי').trim(),
    region: city,
    perk: extractDiscountLabel(benefitText),
    benefitText: benefitText || 'פרטי ההטבה לפי המועדון.',
    hours: 'יש לבדוק מול הסניף',
    addr,
    logo: normalizeLogo(store?.logo_url),
  };
});

const byName = new Map(mapped.map((item) => [item.name, item]));
for (const legacy of legacyBusinesses) {
  byName.set(legacy.name, legacy);
}

const merged = [...byName.values()];
const output = `export const BENEFITS_BUSINESSES = ${JSON.stringify(merged, null, 2)};\n`;

await fs.writeFile(OUTPUT_FILE, output, 'utf8');
console.log(`Wrote ${OUTPUT_FILE} with ${merged.length} businesses.`);
