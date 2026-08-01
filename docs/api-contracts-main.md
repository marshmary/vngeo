# API Contracts - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## Supabase Database Tables

### `general_settings`

Key-value store for application settings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| key | VARCHAR(255) | UNIQUE, NOT NULL |
| value | TEXT | NOT NULL |
| description | TEXT | |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

**RLS:** Public SELECT; authenticated INSERT/UPDATE/DELETE.

**Known keys:** `map_drawing_video_url`, `feedback_form_url`

---

### `quizzes`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| title | TEXT | NOT NULL |
| description | TEXT | |
| difficulty | TEXT | CHECK IN ('easy','medium','hard') |
| status | TEXT | DEFAULT 'draft', CHECK IN ('draft','published','archived') |
| time_limit | INTEGER | (minutes) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| created_by | UUID | FK → auth.users |

**RLS:** Published visible to all; owners can CRUD own quizzes. FOR ALL policies have WITH CHECK clauses.

---

### `quiz_questions`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| quiz_id | UUID | FK → quizzes ON DELETE CASCADE |
| question | TEXT | NOT NULL |
| explanation | TEXT | |
| allow_multiple_answers | BOOLEAN | DEFAULT false |
| order_index | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### `quiz_options`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| question_id | UUID | FK → quiz_questions ON DELETE CASCADE |
| text | TEXT | NOT NULL |
| is_correct | BOOLEAN | DEFAULT false |
| order_index | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | |

---

### `page_visits`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| page_path | TEXT | NOT NULL |
| page_title | TEXT | |
| referrer | TEXT | |
| session_id | TEXT | |
| visitor_id | TEXT | |
| user_id | UUID | FK → auth.users |
| is_authenticated | BOOLEAN | DEFAULT false |
| user_agent | TEXT | |
| device_type | TEXT | |
| browser | TEXT | |
| os | TEXT | |
| country_code | TEXT | |
| visit_timestamp | TIMESTAMPTZ | |
| session_duration | INTEGER | (seconds) |
| created_at | TIMESTAMPTZ | |

**RLS:** Public INSERT; authenticated SELECT.

**Indexes:** visit_timestamp, session_id, visitor_id, page_path, user_id, composite (visit_timestamp, page_path, device_type).

---

## Supabase RPC Functions

| Function | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `get_total_visits()` | none | INTEGER | Total visit count |
| `get_visits_by_date_range(start_date, end_date)` | two dates | TABLE(date, total_visits, unique_visitors) | Visit trend data |
| `get_hourly_visits_24h()` | none | TABLE(hour_timestamp, visit_count) | Last 24 hours hourly |
| `get_most_visited_pages(limit_count, start_date)` | int, date | TABLE(page_path, page_title, visit_count, unique_visitors) | Top pages |
| `cleanup_old_analytics()` | none | void | Maintenance |

---

## Supabase Storage

- **Bucket:** `documents` (configurable via `VITE_SUPABASE_STORAGE_BUCKET`)
- **Max file size:** 50MB (configurable via `VITE_SUPABASE_MAX_FILE_SIZE`)
- **RLS:** Authenticated users can upload/read; admin-only delete.

---

## Client-Side Services API

### AuthService

| Method | Parameters | Returns | Throws |
|--------|-----------|---------|--------|
| `signIn({ email, password })` | LoginFormData | AuthData | Yes |
| `signUp({ email, password, username })` | SignUpFormData | AuthData | Yes |
| `signOut()` | none | void | Yes |
| `getSession()` | none | Session \| null | No |
| `getUser()` | none | User \| null | No |
| `onAuthStateChange(callback)` | function | Subscription | No |
| `checkIsAdmin()` | none | boolean | No (catches) |
| `setUserRole(role)` | 'admin' \| 'user' | void | No |

### AnalyticsService

| Method | Parameters | Returns |
|--------|-----------|---------|
| `trackPageVisit(data)` | CreatePageVisitData | boolean |
| `updateSessionDuration(sessionId, duration)` | string, number | boolean |
| `getAnalyticsStats()` | none | AnalyticsStats \| null |
| `getHourlyVisits24h()` | none | HourlyVisitData[] |
| `getMostVisitedPages(limit?, startDate?)` | number, Date | MostVisitedPage[] |
| `getDeviceBreakdown(days?)` | number | DeviceBreakdown[] |
| `getBrowserStats(days?)` | number | BrowserStats[] |
| `getVisitTrend(days?)` | number | VisitTrendData[] |
| `getAllVisits(limit?)` | number | PageVisit[] |

### QuizService

| Method | Parameters | Returns |
|--------|-----------|---------|
| `getAllQuizzes()` | none | Quiz[] |
| `getPublishedQuizzes()` | none | Quiz[] |
| `getQuizById(quizId)` | string | Quiz |
| `createQuiz(title, desc, difficulty)` | string, string, string | Quiz |
| `updateQuizMetadata(quizId, updates)` | string, object | void |
| `saveQuiz(quiz)` | Quiz | void |
| `deleteQuiz(quizId)` | string | void |

### QuizDraftService (localStorage)

| Method | Parameters | Returns |
|--------|-----------|---------|
| `saveDraft(quizId, quiz)` | string, Quiz | void |
| `loadDraft(quizId)` | string | {quiz, savedAt} \| null |
| `deleteDraft(quizId)` | string | void |
| `hasDraft(quizId)` | string | boolean |

### DocumentService

| Method | Parameters | Returns |
|--------|-----------|---------|
| `listFiles(path?)` | string | StorageFile[] |
| `uploadFile(file, path?)` | File, string | string |
| `uploadFiles(files, path?)` | File[], string | string[] |
| `createFolder(name, parentPath?)` | string, string | string |
| `deleteFile(filePath)` | string | void |
| `deleteFiles(paths)` | string[] | void |
| `deleteFolder(path)` | string | void |
| `getPublicUrl(path)` | string | string |
| `downloadFile(path)` | string | Blob |
| `moveFile(from, to)` | string, string | void |

### SettingsService

| Method | Parameters | Returns |
|--------|-----------|---------|
| `getSetting(key)` | SettingKey | string \| null |
| `getAllSettings()` | none | GeneralSetting[] |
| `updateSetting(key, value)` | SettingKey, string | boolean |
| `upsertSetting(key, value, desc?)` | SettingKey, string, string | boolean |

### GADMService (singleton)

| Method | Parameters | Returns |
|--------|-----------|---------|
| `loadGADMData()` | none | GADMData |
| `generateZoneGeoJSON()` | none | ZoneGeoJSON |
| `getProvinceList()` | none | string[] |
