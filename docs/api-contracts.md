# API Contracts — Vietnam Economic Zones (vngeo)

> Verified 2026-08-01 against `src/services/` and `src/lib/supabase.ts`.

## Architecture

vngeo is a Supabase-backed SPA — there is **no custom REST backend**. All data access is mediated by static service classes in `src/services/` (components never call the Supabase client directly). The "API surface" is therefore:

1. **Supabase PostgREST** — typed table queries (`select`/`insert`/`update`/`delete`/`upsert`).
2. **Supabase Auth** — `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser`, `onAuthStateChange`, `updateUser`.
3. **Supabase Storage** — `documents` bucket operations (`list`/`upload`/`remove`/`download`/`move`/`getPublicUrl`/`listBuckets`/`createBucket`).
4. **Supabase RPC** — three stored procedures (see [RPC catalog](#rpc-catalog)).
5. **One static fetch** — `GADMService` reads local GeoJSON (no auth, no edge function).

### Client bootstrap — `src/lib/supabase.ts`

- Singleton `supabase = createClient(url, anonKey, opts)`.
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (via `import.meta.env`).
- **Startup validation:** if either is missing → `console.error` then `throw new Error('Missing Supabase environment variables…')`.
- **Options:** `auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }`, `global.headers: { 'X-Client-Info': 'vngeo@1.0.0' }`.
- Additional env vars consumed by services: `VITE_SUPABASE_STORAGE_BUCKET` (default `'documents'`), `VITE_SUPABASE_MAX_FILE_SIZE` (default `52428800` = 50 MB).

### Cross-cutting patterns

- **`ensureAuthReady()`** — a private helper in `QuizService`, `DocumentService`, `DocumentsPageService`, `SettingsService`, and `AnalyticsService` (retrieval methods) that awaits `supabase.auth.getSession()` before reads, to avoid the cold-load RLS race. Deliberately **omitted** from `AnalyticsService.trackPageVisit` / `updateSessionDuration` so anonymous visitors are tracked.
- **Error policy:** `AuthService`, `QuizService`, `DocumentService`, `DocumentsPageService`, `GADMService` **throw** on error. `SettingsService` and `AnalyticsService` **never throw** (return `null`/`false`/`[]` and log to console). `AuthService.checkIsAdmin` is the one non-throwing AuthService method (catches → `false`).
- **Caching:** see [Caching summary](#caching-summary).

> **Netlify Functions:** `netlify.toml` declares `functions = "netlify/functions"`, but **that directory does not exist** in the repo — no edge/serverless functions ship. There is no health endpoint.

---

## `AuthService` — `src/services/authService.ts`

Supabase Auth only (no table access). All static.

| Method | Supabase operation | Behavior |
|---|---|---|
| `signIn({email, password})` | `auth.signInWithPassword` | Throws; returns `data` |
| `signUp({email, password, username?})` | `auth.signUp` (username → `options.data`, defaults to email prefix) | Throws; returns `data` |
| `signOut()` | `auth.signOut` | Throws |
| `getSession()` | `auth.getSession` | Throws; returns `session` |
| `getUser()` | `auth.getUser` | Throws; returns `user` |
| `onAuthStateChange(cb)` | `auth.onAuthStateChange` | Sync; returns subscription |
| `checkIsAdmin()` | `auth.getUser` → reads `user_metadata.role` or `app_metadata.role === 'admin'` | **Catches → false** |
| `setUserRole(role)` | `auth.updateUser({ data: { role } })` (user_metadata only) | Throws |

---

## `QuizService` — `src/services/quizService.ts`

Tables: `quizzes`, `quiz_questions`, `quiz_options`. 5-min TTL caches (`cache` per-id, `listCache`) cleared on every mutation.

| Method | Operation | Notes |
|---|---|---|
| `getAllQuizzes()` | `select *` from `quizzes` order `updated_at desc` | **Cached** |
| `getPublishedQuizzes()` | `select *` `.eq('status','published')` order `updated_at desc` | Not cached |
| `getQuizById(id)` | `quizzes.select().eq('id').single()` + `quiz_questions.select('*, quiz_options(*)').eq('quiz_id').order('order_index')` (nested join) | **Cached** per-id |
| `createQuiz(title, description, difficulty)` | reads user; `insert({…, status:'draft', created_by})` `.select().single()` | Clears listCache |
| `updateQuizMetadata(id, updates)` | `update` on `quizzes` `.eq('id')` | Clears both caches |
| `saveQuiz(quiz)` | Composite: `updateQuizMetadata` → diff questions (`q-` prefix = new) → insert/update `quiz_questions` + replace `quiz_options` | Not a DB transaction; clears caches |
| `deleteQuiz(id)` | `delete` from `quizzes` `.eq('id')` | Clears caches |
| `clearCache()` | — | Clears both |

**`QuizDraftService`** (same file) — **localStorage only, no Supabase.** Debounced 2s `saveDraft`, `loadDraft`, `deleteDraft`, `hasDraft`, `getAllDraftIds`, `clearAllDrafts`. Key prefix `quiz_draft_`. Used by `QuizEditPage` for autosave.

---

## `DocumentService` — `src/services/documentService.ts`

Storage only. Bucket from `VITE_SUPABASE_STORAGE_BUCKET || 'documents'`; max size from `VITE_SUPABASE_MAX_FILE_SIZE || 52428800`.

| Method | Operation |
|---|---|
| `listFiles(path='')` | `storage.list(path, {limit:100, sortBy:{name:'asc'}})` |
| `uploadFile(file, path='')` | `storage.upload(path, file, {cacheControl:'3600', upsert:false})` (size-validated) |
| `uploadFiles(files, path='')` | `Promise.all(uploadFile)` |
| `createFolder(name, parent='')` | uploads `.folderkeep` placeholder |
| `deleteFile(path)` / `deleteFiles(paths)` | `storage.remove([...])` |
| `deleteFolder(path)` | list + batch delete |
| `getPublicUrl(path)` | `storage.getPublicUrl` (sync, no network) |
| `downloadFile(path)` | `storage.download` → Blob |
| `moveFile(from, to)` | `storage.move` |
| `getFileMetadata(path)` | `storage.list(parent, {search: name})` |
| `ensureBucketExists()` | `listBuckets`; create `{public:false, fileSizeLimit}` if absent |
| `getMaxFileSizeMB()` / `getMaxFileSizeBytes()` | utilities |

No caching, no RPC, no REST.

## `DocumentsPageService` — `src/services/documentsPageService.ts`

Storage only, page-facing read model. 5-min cache + in-flight `pendingRequest` dedup; bypassed by `forceRefresh`.

| Method | Operation |
|---|---|
| `getDocumentsByFolders(forceRefresh=false)` | `storage.list('', {limit:1000})` then parallel `list` per folder + `getPublicUrl` per file; **10s timeout** (`Promise.race`) |
| `getDocumentsFromFolder(folder)` | `storage.list(folder, {limit:1000})` + `getPublicUrl` per file (not cached) |
| `formatFileSize(bytes)` / `getFileTypeIcon(ext)` | utilities |

Throws friendly messages for "bucket not found" / "permission" errors.

---

## `SettingsService` — `src/services/settingsService.ts`

Table: `general_settings`. **Never throws** — returns `null`/`false`/`[]`.

| Method | Operation |
|---|---|
| `getSetting(key)` | `select('value').eq('key').single()` |
| `getAllSettings()` | `select('*').order('key')` |
| `updateSetting(key, value)` | `update({value}).eq('key')` |
| `upsertSetting(key, value, description?)` | `upsert({…}, {onConflict:'key'})` |
| `getMapDrawingVideoUrl()` / `updateMapDrawingVideoUrl(url)` | delegates to get/upsert `map_drawing_video_url` |
| `getFeedbackFormUrl()` / `updateFeedbackFormUrl(url)` | delegates to get/upsert `feedback_form_url` |

`SettingKey = 'map_drawing_video_url' | 'feedback_form_url'`.

---

## `AnalyticsService` — `src/services/analyticsService.ts`

Table: `page_visits` (+ 3 RPCs). **Never throws.** Retrieval methods are auth-gated; tracking writes are **ungated** (anonymous visitors tracked).

| Method | Operation | Gated |
|---|---|---|
| `trackPageVisit(data)` | `insert([data])` into `page_visits` | No |
| `updateSessionDuration(sessionId, duration)` | `update({session_duration}).eq('session_id').is('session_duration', null)` (sets only if null) | No |
| `getAnalyticsStats()` | count all/today (`head,count:'exact'`), dedupe `visitor_id`, avg `session_duration` client-side, calls `getMostVisitedPages(1)` | Yes |
| `getHourlyVisits24h()` | **RPC `get_hourly_visits_24h`** | Yes |
| `getMostVisitedPages(limit=10, startDate?)` | **RPC `get_most_visited_pages({limit_count, start_date})`** (default 30d) | Yes |
| `getVisitTrend(days=30)` | **RPC `get_visits_by_date_range({start_date, end_date})`** | Yes |
| `getDeviceBreakdown(days=30)` | `select('device_type').gte('visit_timestamp', start)`; counted client-side | Yes |
| `getBrowserStats(days=30)` | `select('browser').not('is',null)`; counted client-side | Yes |
| `getAllVisits(limit=100)` | `select('*').order('visit_timestamp', {ascending:false}).limit(limit)` | Yes |
| `detectDevice(ua)` | UA regex → `{device_type, browser, os, user_agent}` (sync) | — |
| `getOrCreateVisitorId()` / `getOrCreateSessionId()` | localStorage `vngeo_visitor_id` / sessionStorage `vngeo_session_id` (sync) | — |

---

## `GADMService` — `src/services/gadmService.ts`

**Not Supabase. Not static** — the only instantiated service (`export const gadmService = new GADMService()`). Reads static GeoJSON.

| Method | Operation |
|---|---|
| `loadGADMData()` | **`fetch('/vietnam-map-data/gadm41_VNM_1.json')`** (static asset via netlify redirect); in-memory cache + 100ms polling; throws on non-OK |
| `filterFeaturesByProvince(data, provinces)` | filter by `properties.NAME_1` (sync) |
| `mergeProvinceGeometries(features)` | flatten Polygon/MultiPolygon coords (sync) |
| `generateZoneGeoJSON()` | builds zone features from `ZONE_PROVINCES`/`ZONE_METADATA` |
| `getProvinceList()` | unique sorted `NAME_1` list |

---

## RPC catalog

| RPC | Args | Caller |
|---|---|---|
| `get_hourly_visits_24h` | — | `AnalyticsService.getHourlyVisits24h` |
| `get_most_visited_pages` | `{ limit_count, start_date }` | `AnalyticsService.getMostVisitedPages` |
| `get_visits_by_date_range` | `{ start_date, end_date }` | `AnalyticsService.getVisitTrend` |

## Table access matrix

| Table | Service(s) | Ops |
|---|---|---|
| `quizzes` | QuizService | select, insert, update, delete |
| `quiz_questions` | QuizService | select (nested), insert, update, delete |
| `quiz_options` | QuizService | select (nested), insert, delete |
| `general_settings` | SettingsService | select, update, upsert |
| `page_visits` | AnalyticsService | insert, update, select |

## Non-Supabase endpoints

| Endpoint | Caller | Auth |
|---|---|---|
| `GET /vietnam-map-data/gadm41_VNM_1.json` | `GADMService.loadGADMData` | none (static asset) |

## Caching summary

| Service | Cache | TTL / invalidation |
|---|---|---|
| `QuizService` | per-id `Map` + list cache | 5 min; cleared on create/update/save/delete |
| `DocumentsPageService` | folder cache + in-flight dedup | 5 min; bypassed by `forceRefresh` |
| `GADMService` | instance field + loading flag | session-permanent |
| `QuizDraftService` | localStorage `quiz_draft_*` | persistence (autosave) |
| `AuthService`, `SettingsService`, `AnalyticsService`, `DocumentService` | none | — |

---

## Related docs

- [Data Models](./data-models.md) — the tables, RLS, and RPC definitions referenced above.
- [Architecture](./architecture.md) — the service-layer pattern in context.
