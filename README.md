# Freelance OS

Freelance OS is a focused workspace for independent designers, developers, SEO specialists, and other freelancers. It brings client relationships, proposals, projects, tasks, invoices, expenses, and finance tracking into one place without the overhead of a larger project-management suite.

## Product workflow

```text
Client
  └─ Proposal
       └─ Accepted proposal → Project
                              ├─ Tasks
                              └─ Invoice → Payments

Expenses and other transactions → Finance
```

Proposals belong to clients rather than projects. When a proposal is accepted, it can create a project and optionally create a deposit invoice.

## Features

### Workspace

- Magic-link authentication through Supabase Auth
- Overview dashboard with open tasks, project activity, and finance signals
- Workspace-wide search
- Profile, avatar, display-currency, and invoice identity settings
- Responsive application shell with Geist, Tailwind CSS, shadcn-svelte, Bits UI, and Lucide icons

### Clients, projects, and tasks

- Client directory with search, pagination, contact details, billing address, tax information, and default currency
- Project tracking with client relationships, descriptions, statuses, billing currency, and connected work
- Task queue with status, priority, due dates, search, project filters, pagination, and quick creation
- Detailed client and project views with connected tasks, invoices, expenses, and metrics

### Proposals

- Proposal creation and editing with line items and automatic totals
- Overview, scope, timeline, payment terms, notes, and terms sections
- Issue dates, validity dates, currencies, and proposal statuses
- Draft, sent, viewed, accepted, declined, and expired states
- Authenticated proposal previews
- Accepted proposal conversion into a project, with an optional deposit invoice

### Invoices and finance

- Invoice register with pagination, status filters, line items, due dates, and previews
- Issuer and client identity snapshots so historical invoices retain the details used when issued
- Draft, sent, partially paid, paid, overdue, and void states
- Payment recording, including partial payments
- Project, client, and invoice-linked expenses
- Finance dashboard for display-currency reporting and an internal USD ledger
- Other income and cash-outflow transactions
- Exchange-rate snapshots for supported currencies

## Current scope

Invoice and proposal previews are currently authenticated application views. Public share links, client portals, email delivery, online payment links, reminders, and proposal acceptance from outside the app are not yet included.

## Tech stack

- SvelteKit 2 and Svelte 5
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn-svelte and Bits UI
- Lucide icons
- Supabase Auth, Postgres, Storage, and row-level security
- `@supabase/ssr` for server-side Supabase sessions

## Getting started

### Prerequisites

- Node.js and npm
- A Supabase project

### 1. Install dependencies

```sh
npm install
```

### 2. Configure Supabase

Copy the example environment file:

```sh
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set the following values in `.env`:

```env
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

In Supabase Auth, enable email magic links and add the local application URL to the redirect URL allowlist:

```text
http://localhost:5173/auth/confirm
```

### 3. Apply the database migrations

Apply the SQL files in `supabase/migrations/` to the Supabase project in timestamp order. The migrations create the workspace tables, authentication policies, avatar storage policies, finance and billing tables, multi-currency support, invoice identity and previews, and proposals.

Keep row-level security enabled on all application tables. Each workspace record is scoped to the authenticated account that owns it.

### 4. Start the development server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with a magic link.

## Scripts

```sh
npm run dev       # Start the development server
npm run check     # Run Svelte and TypeScript diagnostics
npm run build     # Create a production build
npm run preview   # Preview the production build locally
```

There is not yet an automated test suite configured in the repository.

## Project structure

```text
src/
  lib/components/       Shared UI and application components
  lib/server/            Supabase and workspace server helpers
  lib/supabase/          Supabase client and environment helpers
  routes/                SvelteKit pages, layouts, and form actions
supabase/migrations/     Database schema and security policies
static/                  Public assets
```

## Deployment

Run a production build with:

```sh
npm run build
```

Deploy the generated SvelteKit application using the adapter supported by your hosting platform. Configure the same `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment variables in production, and add the deployed authentication callback URL to the Supabase Auth redirect URL allowlist.

## Planned improvements

- Public, expiring proposal and invoice links
- Client-facing portal and email delivery
- Online payment links and payment reminders
- Automated tests for financial and proposal workflows
- Transactional proposal conversion and richer reporting
