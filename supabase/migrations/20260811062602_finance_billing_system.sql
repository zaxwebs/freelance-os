create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id uuid not null references public.clients(id) on delete restrict,
    project_id uuid references public.projects(id) on delete set null,
    invoice_number text not null,
    status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'void')),
    issue_date date not null default current_date,
    due_date date not null default (current_date + 14),
    currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
    subtotal numeric(20, 4) not null default 0 check (subtotal >= 0),
    tax_total numeric(20, 4) not null default 0 check (tax_total >= 0),
    discount_total numeric(20, 4) not null default 0 check (discount_total >= 0),
    total numeric(20, 4) not null default 0 check (total >= 0),
    amount_paid numeric(20, 4) not null default 0 check (amount_paid >= 0),
    notes text,
    payment_instructions text,
    sent_at timestamptz,
    paid_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, invoice_number)
);

create table if not exists public.finance_expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id) on delete set null,
    project_id uuid references public.projects(id) on delete set null,
    invoice_id uuid references public.invoices(id) on delete set null,
    description text not null check (length(trim(description)) > 0),
    category text not null default 'Other',
    amount numeric(20, 4) not null check (amount > 0),
    currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
    base_amount numeric(20, 4) not null check (base_amount >= 0),
    base_currency_code text not null check (base_currency_code ~ '^[A-Z]{3}$'),
    exchange_rate numeric(20, 10) not null default 1 check (exchange_rate > 0),
    expense_date date not null default current_date,
    billable boolean not null default false,
    notes text,
    receipt_path text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.invoice_line_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    project_id uuid references public.projects(id) on delete set null,
    source_expense_id uuid references public.finance_expenses(id) on delete set null,
    position integer not null default 0,
    description text not null check (length(trim(description)) > 0),
    quantity numeric(20, 4) not null default 1 check (quantity > 0),
    unit_price numeric(20, 4) not null default 0 check (unit_price >= 0),
    tax_rate numeric(8, 4) not null default 0 check (tax_rate >= 0 and tax_rate <= 100),
    amount numeric(20, 4) not null default 0 check (amount >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.invoice_payments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    amount numeric(20, 4) not null check (amount > 0),
    payment_date date not null default current_date,
    method text not null default 'bank_transfer' check (method in ('bank_transfer', 'card', 'cash', 'check', 'other')),
    reference text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists invoices_user_status_idx on public.invoices(user_id, status);
create index if not exists invoices_client_idx on public.invoices(client_id, issue_date desc);
create index if not exists invoices_project_idx on public.invoices(project_id, issue_date desc);
create index if not exists invoice_line_items_invoice_idx on public.invoice_line_items(invoice_id, position);
create index if not exists invoice_payments_invoice_idx on public.invoice_payments(invoice_id, payment_date desc);
create index if not exists finance_expenses_user_date_idx on public.finance_expenses(user_id, expense_date desc);
create index if not exists finance_expenses_project_idx on public.finance_expenses(project_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists finance_expenses_set_updated_at on public.finance_expenses;
create trigger finance_expenses_set_updated_at
before update on public.finance_expenses
for each row execute function public.set_updated_at();

drop trigger if exists invoice_line_items_set_updated_at on public.invoice_line_items;
create trigger invoice_line_items_set_updated_at
before update on public.invoice_line_items
for each row execute function public.set_updated_at();

drop trigger if exists invoice_payments_set_updated_at on public.invoice_payments;
create trigger invoice_payments_set_updated_at
before update on public.invoice_payments
for each row execute function public.set_updated_at();

create or replace function public.refresh_invoice_payment_totals()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    target_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
    paid_total numeric(20, 4);
begin
    select coalesce(sum(amount), 0) into paid_total
    from public.invoice_payments
    where invoice_id = target_invoice_id;

    update public.invoices
    set amount_paid = least(paid_total, total),
        status = case
            when status = 'void' then 'void'
            when paid_total >= total and total > 0 then 'paid'
            when paid_total > 0 then 'partially_paid'
            when sent_at is not null then 'sent'
            else 'draft'
        end,
        paid_at = case when paid_total >= total and total > 0 then coalesce(paid_at, now()) else null end
    where id = target_invoice_id;

    return coalesce(new, old);
end;
$$;

drop trigger if exists invoice_payments_refresh_totals on public.invoice_payments;
create trigger invoice_payments_refresh_totals
after insert or update or delete on public.invoice_payments
for each row execute function public.refresh_invoice_payment_totals();

alter table public.invoices enable row level security;
alter table public.finance_expenses enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_payments enable row level security;

drop policy if exists "Users can manage their own invoices" on public.invoices;
create policy "Users can manage their own invoices"
on public.invoices for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.clients
        where clients.id = invoices.client_id and clients.user_id = (select auth.uid())
    )
    and (project_id is null or exists (
        select 1 from public.projects
        where projects.id = invoices.project_id
          and projects.user_id = (select auth.uid())
          and (projects.client_id = invoices.client_id or projects.client_id is null)
    ))
);

drop policy if exists "Users can manage their own finance expenses" on public.finance_expenses;
create policy "Users can manage their own finance expenses"
on public.finance_expenses for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and (client_id is null or exists (
        select 1 from public.clients
        where clients.id = finance_expenses.client_id and clients.user_id = (select auth.uid())
    ))
    and (project_id is null or exists (
        select 1 from public.projects
        where projects.id = finance_expenses.project_id
          and projects.user_id = (select auth.uid())
          and (finance_expenses.client_id is null or projects.client_id = finance_expenses.client_id)
    ))
    and (invoice_id is null or exists (
        select 1 from public.invoices
        where invoices.id = finance_expenses.invoice_id and invoices.user_id = (select auth.uid())
    ))
);

drop policy if exists "Users can manage their own invoice line items" on public.invoice_line_items;
create policy "Users can manage their own invoice line items"
on public.invoice_line_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.invoices
        where invoices.id = invoice_line_items.invoice_id
          and invoices.user_id = (select auth.uid())
          and (invoice_line_items.project_id is null or exists (
              select 1 from public.projects
              where projects.id = invoice_line_items.project_id
                and projects.user_id = (select auth.uid())
                and (projects.client_id = invoices.client_id or projects.client_id is null)
          ))
    )
    and (source_expense_id is null or exists (
        select 1 from public.finance_expenses
        where finance_expenses.id = invoice_line_items.source_expense_id
          and finance_expenses.user_id = (select auth.uid())
    ))
);

drop policy if exists "Users can manage their own invoice payments" on public.invoice_payments;
create policy "Users can manage their own invoice payments"
on public.invoice_payments for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.invoices
        where invoices.id = invoice_payments.invoice_id and invoices.user_id = (select auth.uid())
    )
);

revoke all on table public.invoices, public.finance_expenses, public.invoice_line_items, public.invoice_payments from anon;
grant select, insert, update, delete on table public.invoices, public.finance_expenses, public.invoice_line_items, public.invoice_payments to authenticated;
