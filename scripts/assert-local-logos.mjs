import { pathToFileURL } from 'node:url';
import path from 'node:path';

const DATA_FILE = path.resolve('src/data/benefitsData.js');

function isRemoteLogo(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

async function main() {
  const moduleUrl = `${pathToFileURL(DATA_FILE).href}?t=${Date.now()}`;
  const imported = await import(moduleUrl);
  const businesses = Array.isArray(imported.BENEFITS_BUSINESSES) ? imported.BENEFITS_BUSINESSES : [];

  const offenders = businesses.filter((biz) => isRemoteLogo(biz.logo));

  if (offenders.length > 0) {
    console.error(`Found ${offenders.length} remote logo URLs in src/data/benefitsData.js`);
    for (const biz of offenders.slice(0, 20)) {
      console.error(`- ${biz.id} | ${biz.name} | ${biz.logo}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`All logos are local-only (${businesses.length} businesses checked).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
