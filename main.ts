// Entry for the GTA 6 meme bounty: the post on X is the entry, and this
// program's only job is to hand the post's address (POST.json) to the gate.
// It validates POST.json first so a missing or malformed entry fails loudly
// instead of copying garbage to the output.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_PATH = join(BOT_DIR, 'POST.json');
if (!existsSync(POST_PATH)) {
  console.error(`POST.json not found in ${BOT_DIR} — the X post URL is required.`);
  process.exit(1);
}
let postUrl: unknown;
try {
  const parsed: unknown = JSON.parse(readFileSync(POST_PATH, 'utf8'));
  postUrl = (parsed as { url?: unknown }).url;
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof postUrl !== 'string' || !postUrl.startsWith('https://x.com/')) {
  console.error('POST.json must contain a valid X post URL in its "url" field.');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(POST_PATH, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
