# vngeo - Vietnam Economic Zones

An interactive educational web application for learning about Vietnam's economic zones through maps, quizzes, and analytics.

## Quick Start

### Using Cloud Supabase (Production)

```bash
npm install
npm run dev
```

### Using Local Supabase (Development)

For local development with a full Supabase instance:

```bash
# Setup local Supabase environment
bash setup-local-supabase.sh

# Start local Supabase services
docker compose up -d

# Install dependencies and start the app
npm install
npm run dev
```

See [docs/local-development.md](./docs/local-development.md) for detailed local setup instructions.

## Features

- **Interactive Map**: Explore Vietnam's economic zones with detailed information
- **Quiz System**: Test knowledge with customizable quizzes
- **Document Management**: Upload and manage educational documents
- **Analytics Dashboard**: Track page visits and user engagement
- **Bilingual Interface**: Vietnamese and English language support
- **Dark Mode & High Contrast**: Accessibility features for educational use

## Technology Stack

- **Frontend**: React 19.1, TypeScript 5.8, Vite 4.5
- **Styling**: Tailwind CSS 3.4, Framer Motion
- **State**: Zustand 5.0
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Internationalization**: i18next (Vietnamese fallback)

## Project Structure

```
vngeo/
├── src/
│   ├── components/      # React components
│   ├── lib/            # Supabase client and utilities
│   ├── pages/          # Page components
│   ├── services/       # Service layer (static methods)
│   ├── stores/         # Zustand state stores
│   └── types/          # TypeScript type definitions
├── docs/               # Project documentation
├── supabase-volumes/   # Local Supabase configuration
├── docker-compose.yml  # Local Supabase services
└── setup-local-supabase.sh  # Setup script for local development
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Documentation

- [Local Development Setup](./docs/local-development.md) - Complete guide for local Supabase development
- [Integration Guide](./docs/local-development-integration-guide.md) - How the app integrates with local Supabase
- [Project Overview](./docs/project-overview.md) - High-level project documentation
- [Architecture](./docs/architecture.md) - System architecture and design decisions

## Local Development

The project supports local development with a full Supabase instance running in Docker:

1. **Setup**: Run `bash setup-local-supabase.sh` to generate credentials
2. **Start**: Run `docker compose up -d` to start all services
3. **Develop**: The app automatically connects to `http://localhost:8000`
4. **Studio**: Access dashboard at `http://localhost:3001`

See [docs/local-development.md](./docs/local-development.md) for complete instructions.

## Environment Variables

The app uses different Supabase configurations for local and cloud environments:

- **Local**: Automatically configured by `setup-local-supabase.sh` (creates `.env.local`)
- **Cloud**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`

See [`.env.example`](./.env.example) for all available environment variables.

## Service Layer

All backend interactions go through service classes in `src/lib/services/`:
- `AuthService` - Authentication (sign up, sign in, sign out)
- `QuizService` - Quiz CRUD operations
- `QuizDraftService` - Quiz draft management
- `DocumentService` - File upload/download
- `AnalyticsService` - Page visit tracking and analytics
- `SettingsService` - General app settings
- `DocumentsPageService` - Document page logic

## Deployment

The application is currently deployed on Netlify and uses Supabase cloud for the backend.

## License

[Your License Here]
