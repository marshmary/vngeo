# Local Development Integration Guide

This guide explains how the vngeo application integrates with the local Supabase environment and how to verify everything works correctly.

## Environment Variable Switching

The application uses Vite's environment variable system to switch between local and cloud Supabase instances.

### Local Development
When you run `./setup-local-supabase.sh`, it creates two files:
- `.env` - Contains environment variables for Docker Compose
- `.env.local` - Contains VITE_ prefixed variables for the React app (auto-loaded by Vite)

The `.env.local` file contains:
```bash
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=<generated-local-key>
```

### Cloud Production
To switch back to cloud Supabase:
1. Delete or rename `.env.local`
2. Copy values from `.env.example` to create a new `.env.local` with cloud credentials

## Service Layer Integration

All service classes use the Supabase client from `src/lib/supabaseClient.ts`, which automatically reads from the environment variables. No code changes are needed when switching between local and cloud.

### Service Classes

1. **AuthService** (`src/services/authService.ts`)
   - Uses: `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`
   - Local: Auto-confirm enabled, no email verification required

2. **QuizService** (`src/services/quizService.ts`)
   - Uses: `supabase.from('quizzes').select()`, `.insert()`, `.update()`, `.delete()`
   - Local: All quiz tables available with RLS policies

3. **DocumentService** (`src/services/documentService.ts`)
   - Uses: `supabase.storage.from('documents')`
   - Local: documents bucket available with 50MB limit

4. **AnalyticsService** (`src/services/analyticsService.ts`)
   - Uses: `supabase.from('page_visits').insert()`, and RPC functions
   - Local: All analytics RPC functions available

5. **SettingsService** (`src/services/settingsService.ts`)
   - Uses: `supabase.from('general_settings').select()`
   - Local: general_settings table available

6. **DocumentsPageService** (`src/services/documentsPageService.ts`)
   - Uses: DocumentService and SettingsService

7. **GADMService** (`src/services/gadmService.ts`)
   - Uses: GeoJSON boundary data (static, not Supabase-dependent)
   - Local: No changes needed, uses static data files

## Integration Testing Steps

### Prerequisites
1. Docker Desktop is running
2. Local Supabase is started: `docker compose up -d`
3. Environment is configured: `./setup-local-supabase.sh`
4. Vite dev server is running: `npm run dev`
5. Verify `.env.local` exists: `ls -la .env.local`
6. Verify Docker services are healthy: `docker compose ps`

### Test Checklist

#### 1. Application Startup
- [ ] Dev server starts without errors
- [ ] No environment variable validation errors
- [ ] Console shows successful connection to `http://localhost:8000`

#### 2. Authentication Flow
- [ ] Navigate to `/login`
- [ ] Sign up with email/password (should succeed without email verification)
- [ ] Sign in with same credentials
- [ ] Verify session is created (check localStorage)
- [ ] Sign out works correctly

#### 3. Quiz Functionality
- [ ] Navigate to `/quizzes`
- [ ] View list of quizzes (empty initially)
- [ ] Navigate to `/admin/quiz/new` (if admin)
- [ ] Create a new quiz with questions and options
- [ ] Save quiz (verify no 403 errors)
- [ ] Publish quiz
- [ ] Take quiz as a user
- [ ] Verify quiz results display

#### 4. Document Management
- [ ] Navigate to `/documents`
- [ ] Upload a PDF document (under 50MB)
- [ ] Verify upload completes successfully
- [ ] View document in list
- [ ] Download document
- [ ] Delete document

#### 5. Analytics Dashboard
- [ ] Navigate to `/admin`
- [ ] View analytics dashboard
- [ ] Verify page visit tracking works
- [ ] Check that RPC functions return data:
  - `get_total_visits()`
  - `get_visits_by_date_range()`
  - `get_hourly_visits_24h()`
  - `get_most_visited_pages()`

#### 6. General Settings
- [ ] Verify map drawing video URL is accessible
- [ ] Verify feedback form URL is accessible

#### 7. i18n (Vietnamese/English)
- [ ] Switch to Vietnamese
- [ ] Verify all UI text is in Vietnamese
- [ ] Switch back to English
- [ ] Verify all UI text is in English

#### 8. Cloud Switching
- [ ] Stop local Supabase: `docker compose down`
- [ ] Clear browser localStorage and session storage (to prevent cached auth conflicts)
- [ ] Delete `.env.local`
- [ ] Create new `.env.local` with cloud credentials (from `.env.example`)
- [ ] Restart dev server
- [ ] Verify app works with cloud backend

**Important**: Never run local and cloud Supabase simultaneously to avoid port conflicts on localhost:8000.

## Troubleshooting

### Connection Issues
- **Problem**: "Failed to fetch" errors
- **Solution**: Verify Docker is running and `docker compose ps` shows all services healthy

### Auth Issues
- **Problem**: Sign up fails or requires email verification
- **Solution**: Check `GOTRUE_MAILER_AUTOCONFIRM=true` in docker-compose.yml

### Storage Issues
- **Problem**: File upload fails
- **Solution**: Verify storage container is running and documents bucket exists

### RPC Function Issues
- **Problem**: "function does not exist" errors
- **Solution**: Verify all SQL migration scripts ran successfully

## Notes

- No source code modifications are required for local development
- All service classes work transparently with both local and cloud Supabase
- The only difference is the environment configuration
- RLS policies are identical in both environments
