# Freelance OS

Freelance OS is the focused workspace for people who do their best work independently.

It brings the work around your freelance business into one calm, connected place: keep client relationships clear, organize every project, stay on top of the next task, and carry the engagement through proposals, invoices, expenses, and financial visibility.

## A better way to run freelance work

Freelancers need more than a task list and less than an enterprise suite. Freelance OS is designed around that middle ground: enough structure to keep work moving, enough context to make good decisions, and none of the clutter that gets in the way.

- Organize work around clients, projects, and the tasks that move it forward.
- Keep conversations, project context, deadlines, and business details connected.
- Move smoothly from an opportunity to active delivery and final payment.
- See what needs attention without building a complicated system first.
- Add the financial and client-facing tools you need as your practice grows.

## Features

### Clients, projects, and tasks

The core workspace keeps your engagements understandable and actionable.

- Client directory with search, pagination, contact details, billing addresses, tax information, and default currency
- Project tracking with client relationships, descriptions, statuses, billing currency, and connected work
- Task queue with status, priority, due dates, search, project filters, pagination, and quick creation
- Detailed client and project views with connected tasks, invoices, expenses, and useful metrics
- Overview dashboard with open tasks, project activity, and business signals
- Workspace-wide search for quickly finding the work that matters

### Proposals and client work

Create polished proposals that give prospective work a clear shape and make it easy to carry an accepted engagement into delivery.

- Proposal creation and editing with line items and automatic totals
- Overview, scope, timeline, payment terms, notes, and terms sections
- Issue dates, validity dates, currencies, and clear proposal statuses
- Draft, sent, viewed, accepted, declined, and expired states
- Authenticated proposal previews
- Accepted proposals can become projects, with an optional deposit invoice

### Invoices, expenses, and finance

Keep the business side of freelance work close to the work itself.

- Invoice register with pagination, status filters, line items, due dates, and previews
- Issuer and client identity snapshots that preserve historical invoice details
- Draft, sent, partially paid, paid, overdue, and void invoice states
- Payment recording, including partial payments
- Project, client, and invoice-linked expenses
- Finance dashboard for display-currency reporting and an internal USD ledger
- Other income and cash-outflow transactions
- Exchange-rate snapshots for supported currencies

### Workspace settings

- Magic-link authentication through Supabase Auth
- Profile and avatar settings
- Display-currency preferences
- Invoice identity, address, tax, payment terms, and footer settings
- Responsive application shell built with Geist, Tailwind CSS, shadcn-svelte, Bits UI, and Lucide icons

## Why freelancers choose Freelance OS

- **Focused:** built for independent work instead of adapted from a large enterprise system.
- **Connected:** client, project, task, proposal, invoice, and expense context stays together.
- **Flexible:** start with the organization you need and grow into deeper business management naturally.
- **Clear:** simple statuses, useful registers, and focused views make the next action obvious.
- **Professional:** give your work a more consistent, reliable operating rhythm from first contact to payment.

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

## Roadmap

- Public, expiring proposal and invoice links
- Client-facing portal and email delivery
- Online payment links and payment reminders
- Automated tests for financial and proposal workflows
- Transactional proposal conversion and richer reporting
