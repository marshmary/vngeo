# Data Models - Vietnam Economic Zones

> Generated: 2026-05-16 | Scan Level: Exhaustive

## TypeScript Type Definitions

### Zone Types (`src/types/zone.types.ts`)

#### `EconomicZone`

| Field | Type | Description |
|-------|------|-------------|
| id | string | Zone identifier (e.g., 'zone-1') |
| name | string | English name |
| nameVi | string | Vietnamese name |
| region | string | Region description |
| color | string | Hex color for map display |
| coordinates | [number, number] | [lat, lng] center point |
| boundaries? | FeatureCollection | GeoJSON boundary data |
| industries | string[] | Key industries |
| population | string | Population figure |
| gdp | string | GDP value |
| keyFacts | string[] | Notable facts |
| description | string | English description |
| descriptionVi | string | Vietnamese description |
| establishedYear | number | Year established (all 1986) |
| majorCities | string[] | Major cities in zone |
| area | string | Area in km² |
| economicActivities | { agriculture: number, industry: number, services: number } | Sector percentages |

#### `MapState`

| Field | Type | Default |
|-------|------|---------|
| selectedZone | string \| null | null |
| mapCenter | [number, number] | [16.0471, 108.2068] |
| zoomLevel | number | 6 |
| zones | EconomicZone[] | [] |
| isLoading | boolean | false |
| error | string \| null | null |

#### `Document`

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | File name |
| type | string | MIME type |
| size | number | Bytes |
| zoneId | string | Associated zone |
| content | string | Base64 encoded |
| uploadDate | string | ISO date |
| tags | string[] | Tags |

#### `QAItem`

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| question | string | English question |
| questionVi | string | Vietnamese question |
| answer | string | English answer |
| answerVi | string | Vietnamese answer |
| zoneId | string | Associated zone |
| category | string | Category |
| tags | string[] | Tags |

---

### Auth Types (`src/types/auth.types.ts`)

#### `AuthState`

| Field | Type | Description |
|-------|------|-------------|
| user | User \| null | Supabase user |
| session | Session \| null | Supabase session |
| isLoading | boolean | Loading state |
| error | string \| null | Error message |
| isAdmin | boolean | Admin role flag |

#### `LoginFormData`

| Field | Type |
|-------|------|
| email | string |
| password | string |

#### `SignUpFormData`

| Field | Type |
|-------|------|
| email | string |
| password | string |
| username? | string |

---

### Quiz Types (`src/types/quiz.types.ts`)

#### `Quiz`

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| title | string | Quiz title |
| description | string | Description |
| questions | QuizQuestion[] | Questions array |
| difficulty | 'easy' \| 'medium' \| 'hard' | Difficulty level |
| status | 'draft' \| 'published' \| 'archived' | Publication status |
| timeLimit? | number | Minutes |
| createdAt | string | ISO date |
| updatedAt | string | ISO date |

#### `QuizQuestion`

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| question | string | Question text |
| options | QuizOption[] | Answer options |
| explanation? | string | Answer explanation |
| allowMultipleAnswers | boolean | Multiple selection |
| order | number | Display order |

#### `QuizOption`

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| text | string | Option text |
| isCorrect | boolean | Correct answer flag |

---

### Analytics Types (`src/types/analytics.types.ts`)

#### `PageVisit`

| Field | Type |
|-------|------|
| id | string |
| page_path | string |
| page_title? | string |
| referrer? | string |
| session_id | string |
| visitor_id | string |
| user_id? | string |
| is_authenticated | boolean |
| user_agent? | string |
| device_type? | DeviceType |
| browser? | string |
| os? | string |
| country_code? | string |
| visit_timestamp | string |
| session_duration? | number |
| created_at | string |

#### `AnalyticsStats`

| Field | Type |
|-------|------|
| total_visits | number |
| total_visits_today | number |
| unique_visitors_total | number |
| unique_visitors_today | number |
| avg_session_duration | number |
| most_visited_page? | { page_path, page_title?, visit_count } |

#### Supporting types: `HourlyVisitData`, `MostVisitedPage`, `DeviceBreakdown`, `BrowserStats`, `VisitTrendData`, `SessionInfo`, `DeviceInfo`, `AnalyticsDateRange`, `AnalyticsFilters`

---

### Settings Types (`src/types/settings.types.ts`)

#### `GeneralSetting`

| Field | Type |
|-------|------|
| id | string |
| key | string |
| value | string |
| description? | string |
| created_at | string |
| updated_at | string |

#### `SettingKey` = `'map_drawing_video_url' | 'feedback_form_url'`

---

## Zone-Province Mapping

Six economic zones mapped to 63 Vietnamese provinces:

| Zone | Name | Color | Provinces |
|------|------|-------|-----------|
| zone-1 | Northern Mountains | #ef4444 | 14 provinces |
| zone-2 | Red River Delta | #f97316 | 11 provinces |
| zone-3 | Central Coast | #eab308 | 14 provinces |
| zone-4 | Central Highlands | #22c55e | 5 provinces |
| zone-5 | Southeast | #3b82f6 | 6 provinces |
| zone-6 | Mekong Delta | #8b5cf6 | 13 provinces |

Province data sourced from GADM (`/vietnam-map-data/gadm41_VNM_1.json`). Country outline from `gadm41_VNM_0.json`.
