---
project_name: 'vngeo'
user_name: 'marshmary'
date: '2026-05-16'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'dont_miss_rules']
status: 'complete'
rule_count: 45
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **React 19.1** + **TypeScript 5.8** (strict mode, `erasableSyntaxOnly`)
- **Vite 4.5** — `@/` maps to `./src/` (configured in both vite.config.ts and tsconfig)
- **Tailwind CSS 3.4** — v3 config format (module.exports), NOT v4 CSS-based config
- **Zustand 5.0** — v5 double-call API: `create<T>()(middleware(...))`
- **Supabase JS 2.58** — client at `@/lib/supabase.ts`, env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **React Router DOM 7.9** — `BrowserRouter` with wrapper components for protected routes
- **React Leaflet 5.0** + **Leaflet 1.9** — CSS imported in `@/index.css` via `@import 'leaflet/dist/leaflet.css'`
- **i18next 25.5** — fallback language is 'vi' (Vietnamese), NOT 'en'
- **Vitest 3.2** + Testing Library — installed but no tests exist yet
- **clsx** is in package.json but unused — use template literals for conditional classes

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript strict mode** — `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all enabled
- **`verbatimModuleSyntax: true`** — MUST use `import type { X }` for type-only imports; bare `import { X }` fails for types
- **`erasableSyntaxOnly: true`** — no `enum`, no `namespace`, no constructor parameter properties
- **Path alias `@/`** — mandatory for cross-directory imports; relative imports only for same-directory siblings
- **Default exports** for React components; **named exports** for stores, services, utilities
- **Import order**: React/lib → `@/` internals → relative files → CSS
- **Error handling pattern**: `error instanceof Error ? error.message : 'Fallback string'`
- **Async store actions**: wrap in try/catch, always set `isLoading: false` in finally or both branches

### Framework-Specific Rules

- **Components**: `const X: React.FC<XProps> = ({ ... }) => {}` with props interface above, default export at bottom
- **Zustand stores**: separate `State`/`Actions` interfaces → `type Store = State & Actions` → `create<Store>()(persist(...))` with `partialize` for localStorage
- **Never call Supabase directly in components** — route all queries through `@/services/` static classes
- **Services**: static class methods (e.g. `AuthService.signIn()`), caching at service level when needed
- **i18n**: use `t('key')` for static UI strings; use `language === 'vi' ? x : y` for data-driven bilingual content
- **Fallback language is 'vi'** (Vietnamese), NOT 'en'
- **Protected routes**: wrap with `<AdminRoute>` or `<ProtectedRoute>` component
- **Styling**: Tailwind utility classes only; `@apply` in `@/index.css` for reusable patterns; inline styles only for dynamic values Tailwind can't handle
- **Animations**: use Framer Motion for interactive animations (hover/tap/fade)
- **Icons**: Font Awesome via `@fortawesome/react-fontawesome` — no other icon libraries

### Testing Rules

- **No tests exist yet** — Vitest + Testing Library are installed but unused
- **When adding tests**: add `"test": "vitest"` script to package.json first
- **Test file naming**: co-locate with source using `.test.ts` / `.test.tsx` suffix
- **Component tests**: use `@testing-library/react` + `@testing-library/user-event`
- **Unit/service tests**: use Vitest directly
- **E2E tests**: use Playwright (browser automation) — NOT for unit/component tests
- **Supabase mocking**: mock `@/lib/supabase` module when testing services

### Code Quality & Style Rules

- **ESLint flat config** with typescript-eslint, react-hooks (exhaustive-deps), react-refresh (default exports only for components)
- **File naming**: components/pages = PascalCase, services/stores/utils = camelCase, types = kebab-case + `.types.ts` suffix
- **Constants**: UPPER_SNAKE_CASE (`VIETNAM_MAP_CENTER`, `DEFAULT_ZOOM_LEVEL`)
- **Store hooks**: `useXxxStore` naming pattern
- **Components by domain**: `admin/`, `auth/`, `common/`, `map/`, `zone/` under `src/components/`
- **One component/service per file**
- **No comments by default** — code should be self-documenting through naming
- **Conditional classNames**: use template literals, not clsx (clsx is installed but unused)
- **Production build**: `console.log`, `console.info`, `console.debug` are stripped; `console.error` and `console.warn` are kept

### Development Workflow Rules

- **Branch**: `main` is the primary branch — **never commit directly to main**
- **New features/fixes**: always checkout to a new branch before starting work
- **Commit messages**: conventional commits format — `feat:`, `fix:`, `docs:` etc.
- **Build command**: `npm run build` runs `tsc -b && vite build` — TS errors block the build
- **Lint**: `npm run lint` runs ESLint on all `.ts`/`.tsx` files
- **No CI/CD pipeline** configured in repo

### Tooling & Plugins

- **Chrome DevTools MCP** — use for development testing: inspect UI, debug interactions, check network requests, analyze performance, take screenshots for visual verification
- **Playwright** — use for writing and running E2E tests (browser automation), NOT for dev-time debugging
- **TS/JS LSP server plugin** — available for code intelligence (go to definition, find references, hover info)
- **Supabase plugin** — available for Supabase tasks (database, auth, migrations, RLS); if missing or not authenticated, ask user to install/authenticate before proceeding with Supabase-related work
- **Always verify plugins are installed** before using them — if a required plugin is missing, ask the user to install it

### Critical Don't-Miss Rules

- **NEVER commit to main directly** — always create a feature/fix branch first
- **NEVER call `supabase` directly in components** — always go through `@/services/` classes
- **NEVER use `enum`** — `erasableSyntaxOnly` forbids it; use `const` objects or union types instead
- **NEVER import types without `import type`** — `verbatimModuleSyntax` will break the build
- **NEVER use Tailwind v4 syntax** — this project uses v3 config format (`module.exports = {...}`)
- **NEVER use clsx** — it's installed but unused; use template literals for conditional classNames
- **NEVER hardcode English as fallback** — i18next fallback is `'vi'` (Vietnamese)
- **NEVER put all Zustand state in `persist`** — always use `partialize` to exclude loading states, error states, and large data arrays
- **Supabase env vars are validated at startup** — missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws immediately
- **Zone data is static** — loaded from `VIETNAM_ECONOMIC_ZONES` in `@/utils/constants.ts`, NOT from Supabase
- **Map data is static** — GeoJSON loaded from `/public/vietnam-map-data/`, NOT from Supabase
- **Auth state is async-initialized** — `initializeAuth()` must be called on app load; stores subscribe to Supabase auth state changes
- **Sidebar layout uses inline `marginLeft`** — dynamically adjusts based on collapsed state, not a CSS class

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-05-16
