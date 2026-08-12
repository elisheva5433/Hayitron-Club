const page = await fetch('https://kehilotcard.co.il/benefits').then((r) => r.text());
const matches = [...page.matchAll(/\/api\/public\/[^"'\s<)]+/g)].map((x) => x[0]);
const unique = [...new Set(matches)];
console.log('public endpoints found in page:', unique.length);
for (const endpoint of unique.slice(0, 80)) {
  console.log(endpoint);
}

const payload = await fetch('https://kehilotcard.co.il/api/public/benefits').then((r) => r.json());
const sample = (payload.stores || [])[0] || {};
console.log('sample store payload keys:', Object.keys(sample));
console.log('sample store payload snippet:');
console.log(JSON.stringify(sample, null, 2).slice(0, 2500));
