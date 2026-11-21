// Hand the GTA 6 meme post to the make.fun gate: copy POST.json from the
// bot directory into the output directory, but only after the post address
// inside it has been checked. Anything wrong makes the program fail loudly
// instead of silently handing over a bad entry.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function die(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourceFile = resolve(botDir, 'POST.json');
const targetFile = resolve(outDir, 'POST.json');

if (!existsSync(sourceFile)) {
  die(`no POST.json found under ${botDir}; the X post URL is required`);
}

let raw: string;
try {
  raw = readFileSync(sourceFile, 'utf8');
} catch (err) {
  die(`could not read ${sourceFile}: ${(err as Error).message}`);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  die(`POST.json is not valid JSON: ${(err as Error).message}`);
}

const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || url.length === 0) {
  die('POST.json "url" field is missing or empty; the X post URL is required');
}
if (!url.startsWith('https://x.com/')) {
  die('POST.json "url" must point at x.com, not another site');
}
if (!url.includes('/status/')) {
  die('POST.json "url" must be a post link: it needs a /status/ part');
}

mkdirSync(outDir, { recursive: true });
try {
  writeFileSync(targetFile, raw);
} catch (err) {
  die(`could not write ${targetFile}: ${(err as Error).message}`);
}

console.log(`gta6-meme-x-01: handed the post over: ${url} -> ${targetFile}`);
