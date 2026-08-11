import fs from 'node:fs/promises';

const SOURCE_URL = 'https://kehilotcard.co.il/api/public/benefits';
const DATA_FILE = 'src/data/benefitsData.js';

async function fetchWithRetry(url, attempts = 4, timeoutMs = 30000) {
  let lastError;

  for (let i = 1; i <= attempts; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (i < attempts) {
        const waitMs = i * 1200;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  throw lastError;
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/["'׳״]/g, '')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ');
}

function extractUrls(text) {
  const source = String(text || '');
  const matches = source.match(/https?:\/\/[^\s)]+/gi) || [];
  return [...new Set(matches.map((url) => url.replace(/[.,;!?]+$/, '')))];
}

function extractPhones(text) {
  const source = String(text || '');
  const regex = /(?:\+972[-\s]?)?0\d{1,2}[-\s]?\d{7}|\*\d{3,6}/g;
  const matches = source.match(regex) || [];
  const cleaned = matches.map((phone) => phone.replace(/\s+/g, ' ').trim());
  return [...new Set(cleaned)];
}

function branchFromApi(branch) {
  const city = String(branch?.city || '').trim();
  const address = String(branch?.address || '').trim();
  const name = String(branch?.name || '').trim();

  return {
    city: city || 'לא זמין',
    address: address || city || 'לא זמין',
    name,
    phone: null,
  };
}

function uniqueBranches(branches) {
  const seen = new Set();
  const result = [];

  for (const branch of branches) {
    const city = String(branch?.city || '').trim();
    const address = String(branch?.address || '').trim();
    const key = `${city}::${address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(branch);
  }

  return result;
}

const response = await fetchWithRetry(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch source data: HTTP ${response.status}`);
}

const payload = await response.json();
const stores = Array.isArray(payload?.stores) ? payload.stores : [];

const storeByName = new Map(
  stores.map((store) => [normalizeName(store?.name), store]),
);

const currentRaw = await fs.readFile(DATA_FILE, 'utf8');
const jsonPayload = currentRaw
  .replace(/^\s*export\s+const\s+BENEFITS_BUSINESSES\s*=\s*/, '')
  .replace(/;\s*$/, '');
const businesses = JSON.parse(jsonPayload);

const enriched = businesses.map((biz) => {
  const norm = normalizeName(biz.name);
  const store = storeByName.get(norm);

  const benefitText = String(store?.benefit_text || biz.benefitText || '').trim();
  const websites = extractUrls(benefitText);
  const phones = extractPhones(benefitText);

  const apiBranches = Array.isArray(store?.branches)
    ? uniqueBranches(store.branches.map(branchFromApi))
    : [];

  const fallbackBranch = {
    city: String(biz.region || 'לא זמין').trim() || 'לא זמין',
    address: String(biz.addr || biz.region || 'לא זמין').trim() || 'לא זמין',
    name: '',
    phone: phones[0] || null,
  };

  const branches = apiBranches.length > 0 ? apiBranches : [fallbackBranch];

  // If only one phone was found, attach it to all branches as the only verified phone available.
  const withPhones = phones.length === 1
    ? branches.map((branch) => ({ ...branch, phone: phones[0] }))
    : branches;

  return {
    ...biz,
    website: websites[0] || '',
    phones,
    branches: withPhones,
    infoVerifiedFrom: store ? 'kehilotcard-public-api' : 'local-legacy-data',
  };
});

const output = `export const BENEFITS_BUSINESSES = ${JSON.stringify(enriched, null, 2)};\n`;
await fs.writeFile(DATA_FILE, output, 'utf8');

const summary = {
  totalBusinesses: enriched.length,
  matchedToOfficialApi: enriched.filter((biz) => biz.infoVerifiedFrom === 'kehilotcard-public-api').length,
  withWebsite: enriched.filter((biz) => biz.website).length,
  withPhones: enriched.filter((biz) => Array.isArray(biz.phones) && biz.phones.length > 0).length,
  withBranches: enriched.filter((biz) => Array.isArray(biz.branches) && biz.branches.length > 0).length,
};

console.log('Enrichment completed:', JSON.stringify(summary, null, 2));
