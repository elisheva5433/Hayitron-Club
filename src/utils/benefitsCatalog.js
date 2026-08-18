export function sanitizeText(value) {
  const text = String(value || '');
  if (/׳|Ã|â|×/.test(text)) {
    return 'פרטי ההטבה לפי המועדון';
  }
  return text;
}

const BRANCH_STOPWORDS = new Set([
  'אלעד', 'ביתר', 'ביתר עילית', 'בני ברק', 'בני', 'ברק', 'אשדוד', 'בית שמש', 'שמש', 'ירושלים',
  'מודיעין', 'מודיעין עילית', 'עילית', 'גאולה', 'גבעת', 'גבעת שאול', 'שאול', 'פסגת זאב', 'זאב',
  'קריית אתא', 'קרית אתא', 'אתא', 'פתח תקווה', 'תקווה', 'באר שבע', 'שדרות', 'אופקים', 'נתניה',
  'תל אביב', 'באר-שבע', 'רב', 'רב שפע', 'שפע', 'יחזקאל', 'רמות', 'ביגוד', 'צעצועים', 'קניון',
  'מרכז', 'מגדל', 'מזון', 'גנים', 'רמת גן', 'רמת', 'גן', 'חיפה', 'לוד', 'נתיבות', 'יבנה', 'נוה',
  'באר', 'שבע', 'בית', 'שדרות', 'נתניה', 'גבעתיים', 'כפר', 'אזור', 'באר יעקב', 'רמתיים', 'הוד השרון'
]);

export function normalizePartnerKey(name) {
  const text = String(name || '').trim();
  if (!text) return '';

  const cleaned = text
    .replace(/[–—−]/g, ' - ')
    .replace(/\s*[-–—]\s*/g, ' - ')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const primaryName = cleaned
    .split(' - ')
    .map((part) => part.trim())
    .filter(Boolean)[0] || cleaned;

  const words = primaryName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const knownBrands = ['בזאר שטראוס', 'אקסוס'];
  const canonicalBrand = knownBrands.find((brand) => primaryName.startsWith(brand));
  if (canonicalBrand) return canonicalBrand;

  let index = words.length - 1;
  while (index >= 0) {
    const current = words[index];
    const previous = index > 0 ? words[index - 1] : '';
    const combined = previous ? `${previous} ${current}` : current;

    if (BRANCH_STOPWORDS.has(current) || BRANCH_STOPWORDS.has(combined)) {
      words.splice(index, 1);
      if (previous && BRANCH_STOPWORDS.has(combined) && index > 0) {
        words.splice(index - 1, 1);
        index -= 1;
      }
      index -= 1;
      continue;
    }

    break;
  }

  const finalName = words.join(' ').trim();
  if (!finalName) return primaryName;
  return finalName;
}

export function normalizeSearchValue(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200E\u200F]/g, '')
    .replace(/[\s\-_/]+/g, ' ')
    .trim()
    .toLowerCase();
}

export function matchesBusinessName(name, query) {
  const normalizedName = normalizeSearchValue(name);
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return false;
  }

  const nameWords = normalizedName.split(/\s+/).filter(Boolean);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTokens.every((token) => {
    if (!token) return false;
    if (normalizedName.includes(token)) return true;
    return nameWords.some((word) => word.startsWith(token) || word.endsWith(token));
  });
}

export function getBranchSummary(biz) {
  const branchEntries = Array.isArray(biz.branches) ? biz.branches : [];
  const unique = [];
  const seen = new Set();

  for (const branch of branchEntries) {
    const city = sanitizeText(branch?.city || branch?.region || '');
    const address = sanitizeText(branch?.address || branch?.addr || '');
    const value = [city, address].filter(Boolean).join(' - ');
    if (!value || seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
  }

  if (unique.length > 0) {
    return unique.slice(0, 4).join(' • ');
  }

  return sanitizeText(biz.addr || '');
}
