// ============================================================================
// seed-runner.mjs — one-shot local Supabase seeder
// ============================================================================
// Runs inside the `seed` compose service (node:20-alpine + postgresql-client).
// Invoked automatically by `docker compose up` via the seed service. Cross-
// platform: the whole stack starts with a single `docker compose up -d` on
// both Windows and Unix — no host bash required.
//
// ORDER OF OPERATIONS (all inside the compose network):
//   1. SENTINEL — if /seed-sentinel/.seeded exists, exit 0 (already done).
//      This makes the seed run ONCE per fresh sentinel volume. Re-runs of
//      `docker compose up` skip it, so local edits to quizzes/settings/docs
//      survive restarts. `docker compose down -v` wipes the sentinel + redo.
//
//   2. WAIT FOR GOTRUE — auth.users doesn't exist until GoTrue runs its
//      migrations, which happens AFTER the db's initdb phase. Poll until
//      `to_regclass('auth.users')` returns non-null. This is the race that
//      previously forced host-side `seed-local-users.sh` to run manually.
//
//   3. APPLY SQL — psql executes 06-seed-users.sql then 07-seed-content.sql.
//      Both are idempotent (ON CONFLICT / TRUNCATE) and guarded by
//      to_regclass(), so a missing table logs + skips instead of crashing.
//
//   4. UPLOAD DOCUMENTS — walk /seed-docs/documents/, POST every file to the
//      storage-api via Kong (http://kong:8000/storage/v1/object/documents/<path>).
//      Must go through Kong, not storage:5000 directly — Kong owns the
//      /storage/v1/ prefix and strips it (strip_path) before forwarding.
//      storage-api's own routes are at the root (/object/...), so hitting it
//      directly with a /storage/v1/ path returns 404.
//      with x-upsert: true (idempotent). Vietnamese diacritics + spaces are
//      per-segment URL-encoded. Skipped gracefully if /seed-docs is empty.
//
//   5. WRITE SENTINEL — touch /seed-sentinel/.seeded so step 1 skips next time.
//
// ENV (provided by the seed service in docker-compose.yml):
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME  — postgres connection
//   SERVICE_ROLE_KEY                                  — storage auth (bypasses RLS)
//   STORAGE_INTERNAL_URL                              — e.g. http://storage:5000
//   STORAGE_BUCKET                                    — "documents"
//   SEED_DIR                                          — /seed-sql (06,07)
//   DOCS_DIR                                          — /seed-docs/documents
//   SENTINEL_FILE                                     — /seed-sentinel/.seeded
// ============================================================================
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  SERVICE_ROLE_KEY, STORAGE_INTERNAL_URL, STORAGE_BUCKET,
  SEED_DIR, DOCS_DIR, SENTINEL_FILE,
} = process.env;

const C = { reset: '\x1b[0m', dim: '\x1b[2m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', blue: '\x1b[34m' };
const log = (m) => console.log(`${C.blue}[seed]${C.reset} ${m}`);
const ok  = (m) => console.log(`${C.green}[seed] ✓ ${m}${C.reset}`);
const warn= (m) => console.log(`${C.yellow}[seed] ! ${m}${C.reset}`);
const die = (m) => { console.error(`${C.red}[seed] ✗ ${m}${C.reset}`); process.exit(1); };

// ── 1. SENTINEL — run once per fresh volume ───────────────────────────────
if (existsSync(SENTINEL_FILE)) {
  ok(`already seeded (${SENTINEL_FILE} present) — skipping. Run 'docker compose down -v' to re-seed.`);
  process.exit(0);
}
log('sentinel absent — proceeding with first-boot seed');

// ── 2. WAIT FOR GOTRUE (auth.users must exist before 06-seed-users.sql) ───
const psqlEnv = { ...process.env, PGPASSWORD: DB_PASSWORD };

// Connection self-test: print exactly what fails so we're not guessing. The
// previous silent catch {} hid connection errors as an endless dot loop.
log(`connection params: host=${DB_HOST} port=${DB_PORT} user=${DB_USER} db=${DB_NAME} password=${DB_PASSWORD ? `<${DB_PASSWORD.length} chars>` : '<MISSING>'}`);
{
  log('running connection self-test (SELECT 1)...');
  try {
    const out = execFileSync('psql',
      ['-t', '-A', '-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-h', DB_HOST, '-p', DB_PORT, '-d', DB_NAME, '-c', 'SELECT 1;'],
      { env: psqlEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    ok(`connected to db (SELECT 1 -> ${out.trim()})`);
  } catch (e) {
    const msg = (e.stderr || e.stdout || e.message || '').toString().trim();
    die(`cannot connect to db as ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}:\n      ${msg}\n` +
        `    This is the root cause of the "stuck polling" symptom — the seed\n` +
        `    was silently retrying a failing connection. Check POSTGRES_PASSWORD\n` +
        `    in .env and that the db container is healthy (docker compose ps).`);
  }
}

function psql(queryOrFile, isFile = false) {
  const args = ['-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-h', DB_HOST, '-p', DB_PORT, '-d', DB_NAME];
  if (isFile) args.push('-f', queryOrFile); else args.push('-c', queryOrFile);
  return execFileSync('psql', args, { env: psqlEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

log(`waiting for GoTrue to create auth.users (polling ${DB_HOST}:${DB_PORT})...`);
let ready = false;
let lastErr = '';
let lastSeenCell = '(no successful query yet)';
for (let attempt = 1; attempt <= 90; attempt++) {
  try {
    // Cast to oid::text: returns the numeric OID if the table exists, NULL if
    // not. Schema-agnostic and display-format-proof (unlike to_regclass alone,
    // which renders as "users" — without the "auth." qualifier — when the
    // table is on the search_path, defeating a string equality check).
    const out = execFileSync('psql',
      ['-t', '-A', '-v', 'ON_ERROR_STOP=1', '-U', DB_USER, '-h', DB_HOST, '-p', DB_PORT, '-d', DB_NAME,
       '-c', "SELECT to_regclass('auth.users')::oid::text;"],
      { env: psqlEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const cell = out.trim();
    lastSeenCell = cell || '(NULL — table does not exist)';
    if (attempt <= 3 || attempt % 10 === 0) {
      log(`  attempt ${attempt}: auth.users oid -> ${JSON.stringify(cell)}`);
    }
    // Non-empty, non-NULL => table exists.
    if (cell && cell.toLowerCase() !== 'null') { ready = true; break; }
  } catch (e) {
    lastErr = (e.stderr || e.stdout || e.message || '').toString().trim().split('\n').pop();
    if (attempt <= 3 || attempt % 10 === 0) {
      log(`  attempt ${attempt}: psql error -> ${lastErr}`);
    }
  }
  await sleep(2000);
}
if (!ready) {
  die(`auth.users never appeared within 180s.\n` +
      `  Last query result: ${JSON.stringify(lastSeenCell)}\n` +
      `  Last psql error:   ${lastErr || '(none — query connected but table absent)'}\n` +
      `  Likely causes:\n` +
      `    - 00-init-base-schema.sh failed at db first boot (check 'docker compose logs db')\n` +
      `    - auth container not healthy (check 'docker compose logs auth')\n` +
      `    - DB credentials mismatch (POSTGRES_PASSWORD in .env)`);
}
ok('auth.users exists — GoTrue has bootstrapped');

// ── 3. APPLY SQL ──────────────────────────────────────────────────────────
// Ordered: users → content → storage policies. The policies file runs LAST
// and AFTER the storage-api clobber window (the seed depends_on storage:
// service_healthy above), so the 4 RLS policies survive to runtime. Applying
// them at db-init time (init/05-) does NOT work — storage-api wipes them on
// its first boot. See 08-storage-policies.sql header.
const sqlFiles = ['06-seed-users.sql', '07-seed-content.sql', '08-storage-policies.sql']
  .map(f => join(SEED_DIR, f))
  .filter(f => existsSync(f));

for (const f of sqlFiles) {
  const label = f.split(sep).pop();
  try {
    log(`applying ${label}...`);
    const out = psql(f, true);
    // surface RAISE NOTICE lines so the operator sees the per-table counts
    out.split('\n').filter(l => l.toLowerCase().includes('notice')).forEach(l => console.log(`${C.dim}  ${l.trim()}${C.reset}`));
    ok(`${label} applied`);
  } catch (e) {
    // A guarded seed (to_regclass skip) still exits 0; a non-zero here is real.
    die(`${label} failed: ${e.stderr || e.message}`);
  }
}

// ── 4. UPLOAD DOCUMENTS to the storage bucket ─────────────────────────────
const docsRoot = DOCS_DIR;
const bucket = STORAGE_BUCKET;
const base = STORAGE_INTERNAL_URL;

if (!existsSync(docsRoot)) {
  warn(`${docsRoot} not found — skipping document upload (SQL seed still applied)`);
} else {
  const files = walk(docsRoot);
  if (files.length === 0) {
    warn('no document files found — skipping upload');
  } else {
    log(`uploading ${files.length} files to bucket '${bucket}'...`);
    let up = 0, fail = 0;
    for (const abs of files) {
      const rel = relative(docsRoot, abs);               // e.g. "Vung Bac Trung Bo/x.pdf"
      const encoded = rel.split(sep).map(encodeURIComponent).join('/');  // preserve '/' separators
      const url = `${base}/storage/v1/object/${bucket}/${encoded}`;
      const buf = readFileSync(abs);
      const mime = abs.endsWith('.pdf') ? 'application/pdf' : 'text/plain';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': mime,
            'x-upsert': 'true',
          },
          body: buf,
        });
        if (res.ok) { up++; }
        else {
          fail++;
          console.error(`${C.red}  ${res.status} ${rel} — ${await res.text()}${C.reset}`);
        }
      } catch (e) {
        fail++;
        console.error(`${C.red}  ERR ${rel} — ${e.message}${C.reset}`);
      }
    }
    if (fail) warn(`documents: ${up}/${files.length} uploaded, ${fail} failed`);
    else ok(`documents: ${up}/${files.length} uploaded`);
    if (fail && up === 0) die('all document uploads failed — check the storage container');
  }
}

// ── 5. WRITE SENTINEL ─────────────────────────────────────────────────────
mkdirSync(SENTINEL_FILE.split(sep).slice(0, -1).join(sep) || '.', { recursive: true });
writeFileSync(SENTINEL_FILE, new Date().toISOString());
ok(`seed complete — sentinel written to ${SENTINEL_FILE}`);
console.log(`${C.green}[seed] ✓ Local Supabase is ready.${C.reset}`);
console.log(`${C.dim}[seed]   admin: admin@vngeo.local / AdminPass123!${C.reset}`);
console.log(`${C.dim}[seed]   Log in and verify quizzes + documents appear.${C.reset}`);
process.exit(0);

// ── helpers ───────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (s.isFile()) out.push(p);
  }
  return out;
}
