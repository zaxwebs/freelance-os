# Freelance OS

Freelance OS is a compact workspace for tracking clients, projects, and the next actions that move freelance work forward.

It is built for independent designers, developers, and SEO specialists who want one focused place to manage active engagements without the overhead of a large project-management suite.

## Features

- Client directory with contact details and connected work
- Project tracking with status, descriptions, progress, and client relationships
- Task queue with status, priority, due dates, search, and project filters
- Quick-create dialogs for tasks, projects, and clients
- Detailed project and client views with connected tasks and metrics
- Magic-link authentication through Supabase
- Row-level security so each account only sees its own workspace
- Compact, responsive UI built with Geist, Tailwind CSS, shadcn-svelte, and Lucide icons

## Stack

- SvelteKit 2 and Svelte 5
- TypeScript
- Tailwind CSS 4
- shadcn-svelte and Bits UI
- Supabase Auth and Postgres
- Vite

## Getting started

### 1. Install dependencies

```sh
npm install
```

### 2. Configure Supabase

Copy the example environment file and add the public URL and publishable key for your Supabase project:

```sh
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set these values in `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Apply the SQL files in `supabase/migrations/` to your Supabase project. The app expects the `clients`, `projects`, and `tasks` tables with row-level security enabled.

### 3. Start the development server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Sign in with a magic link from the email address configured in Supabase Auth.

## Scripts

```sh
npm run dev       # Start the development server
npm run check     # Run Svelte and TypeScript diagnostics
npm run build     # Create a production build
npm run preview   # Preview the production build locally
```

## Project structure

```text
src/
  lib/components/       Shared UI and application components
  lib/server/           Supabase and workspace server helpers
  routes/               SvelteKit pages, layouts, and form actions
supabase/migrations/    Database schema and security policies
static/                 Public assets
```

## Deployment

Build the app with `npm run build`, then deploy it with the SvelteKit adapter for your hosting platform. Configure the same `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment variables in the hosting platform, and add the deployed URL to the Supabase Auth redirect URL allowlist.
