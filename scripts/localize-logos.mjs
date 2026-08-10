import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DATA_FILE = path.resolve('src/data/benefitsData.js');
const LOGOS_DIR = path.resolve('public/logos');
const MANIFEST_FILE = path.resolve('public/logos/_manifest.json');

const contentTypeToExt = {
	'image/jpeg': '.jpg',
	'image/jpg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
	'image/gif': '.gif',
	'image/svg+xml': '.svg',
	'image/bmp': '.bmp',
	'image/x-icon': '.ico',
	'image/tiff': '.tiff',
};

function isRemoteLogo(value) {
	return /^https?:\/\//i.test(String(value || ''));
}

function extFromUrl(urlString) {
	try {
		const url = new URL(urlString);
		const ext = path.extname(decodeURIComponent(url.pathname)).toLowerCase();
		if (ext && ext.length <= 6) return ext;
	} catch {
		// Ignore parsing errors and fallback to content-type or .jpg.
	}
	return '';
}

function extFromContentType(contentType) {
	const mime = String(contentType || '').split(';')[0].trim().toLowerCase();
	return contentTypeToExt[mime] || '';
}

async function main() {
	await fs.mkdir(LOGOS_DIR, { recursive: true });

	const moduleUrl = `${pathToFileURL(DATA_FILE).href}?t=${Date.now()}`;
	const imported = await import(moduleUrl);
	const sourceBusinesses = Array.isArray(imported.BENEFITS_BUSINESSES) ? imported.BENEFITS_BUSINESSES : [];

	const fetchedByUrl = new Map();
	const manifest = [];
	const updated = [];
	let downloaded = 0;
	let failed = 0;

	for (const biz of sourceBusinesses) {
		const currentLogo = String(biz.logo || '').trim();

		if (!isRemoteLogo(currentLogo)) {
			updated.push(biz);
			manifest.push({ id: biz.id, name: biz.name, status: 'kept-local', logo: currentLogo });
			continue;
		}

		try {
			let logoPath = fetchedByUrl.get(currentLogo);

			if (!logoPath) {
				const response = await fetch(currentLogo, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					},
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const urlExt = extFromUrl(currentLogo);
				const typeExt = extFromContentType(response.headers.get('content-type'));
				const ext = urlExt || typeExt || '.jpg';
				const fileName = `${biz.id}${ext}`;
				const localPath = path.join(LOGOS_DIR, fileName);

				const bytes = Buffer.from(await response.arrayBuffer());
				await fs.writeFile(localPath, bytes);

				logoPath = `/logos/${fileName}`;
				fetchedByUrl.set(currentLogo, logoPath);
				downloaded += 1;
			}

			updated.push({ ...biz, logo: logoPath });
			manifest.push({ id: biz.id, name: biz.name, status: 'downloaded', from: currentLogo, to: logoPath });
		} catch (error) {
			failed += 1;
			updated.push({ ...biz, logo: '' });
			manifest.push({
				id: biz.id,
				name: biz.name,
				status: 'failed',
				from: currentLogo,
				fallback: 'text-placeholder',
				error: error.message,
			});
		}
	}

	const output = `export const BENEFITS_BUSINESSES = ${JSON.stringify(updated, null, 2)};\n`;
	await fs.writeFile(DATA_FILE, output, 'utf8');
	await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

	console.log(`Businesses processed: ${updated.length}`);
	console.log(`Remote logos downloaded: ${downloaded}`);
	console.log(`Remote logos failed: ${failed}`);
	console.log(`Manifest: ${MANIFEST_FILE}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
