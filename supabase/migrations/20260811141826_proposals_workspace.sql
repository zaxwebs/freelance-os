create table if not exists public.proposals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id uuid not null references public.clients(id) on delete restrict,
    project_id uuid references public.projects(id) on delete set null,
    proposal_number text not null,
    title text not null check (length(trim(title)) > 0),
    status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
    issue_date date not null default current_date,
    valid_until date,
    currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
    subtotal numeric(20, 4) not null default 0 check (subtotal >= 0),
    tax_total numeric(20, 4) not null default 0 check (tax_total >= 0),
    total numeric(20, 4) not null default 0 check (total >= 0),
    scope text,
    timeline text,
    payment_terms text,
    notes text,
    terms text,
    sent_at timestamptz,
    accepted_at timestamptz,
    declined_at timestamptz,
    converted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, proposal_number),
    check (valid_until is null or valid_until >= issue_date)
);

create table if not exists public.proposal_line_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    proposal_id uuid not null references public.proposals(id) on delete cascade,
    position integer not null default 0,
    description text not null check (length(trim(description)) > 0),
    quantity numeric(20, 4) not null default 1 check (quantity > 0),
    unit_price numeric(20, 4) not null default 0 check (unit_price >= 0),
    tax_rate numeric(8, 4) not null default 0 check (tax_rate >= 0 and tax_rate <= 100),
    amount numeric(20, 4) not null default 0 check (amount >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists proposals_user_status_idx on public.proposals(user_id, status, issue_date desc);
create index if not exists proposals_client_idx on public.proposals(client_id, issue_date desc);
create index if not exists proposals_project_idx on public.proposals(project_id, issue_date desc);
create index if not exists proposal_line_items_proposal_idx on public.proposal_line_items(proposal_id, position);

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

drop trigger if exists proposal_line_items_set_updated_at on public.proposal_line_items;
create trigger proposal_line_items_set_updated_at
before update on public.proposal_line_items
for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;
alter table public.proposal_line_items enable row level security;

drop policy if exists "Users can manage their own proposals" on public.proposals;
create policy "Users can manage their own proposals"
on public.proposals for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.clients
        where clients.id = proposals.client_id and clients.user_id = (select auth.uid())
    )
    and (project_id is null or exists (
        select 1 from public.projects
        where projects.id = proposals.project_id
          and projects.user_id = (select auth.uid())
          and (projects.client_id = proposals.client_id or projects.client_id is null)
    ))
);

drop policy if exists "Users can manage their own proposal line items" on public.proposal_line_items;
create policy "Users can manage their own proposal line items"
on public.proposal_line_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.proposals
        where proposals.id = proposal_line_items.proposal_id
          and proposals.user_id = (select auth.uid())
    )
);

revoke all on table public.proposals, public.proposal_line_items from anon;
grant select, insert, update, delete on table public.proposals, public.proposal_line_items to authenticated;
