create table if not exists public.finance_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    base_currency_code text not null default 'USD' check (base_currency_code ~ '^[A-Z]{3}$'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('income', 'expense')),
    description text not null check (length(trim(description)) > 0),
    amount numeric(20, 4) not null check (amount > 0),
    currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
    base_amount numeric(20, 4) not null check (base_amount >= 0),
    base_currency_code text not null check (base_currency_code ~ '^[A-Z]{3}$'),
    exchange_rate numeric(20, 10) not null default 1 check (exchange_rate > 0),
    exchange_rate_date date not null default current_date,
    exchange_rate_source text not null default 'manual' check (exchange_rate_source in ('manual', 'provider')),
    transaction_date date not null default current_date,
    client_id uuid references public.clients(id) on delete set null,
    project_id uuid references public.projects(id) on delete set null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists finance_transactions_user_date_idx on public.finance_transactions(user_id, transaction_date desc);
create index if not exists finance_transactions_user_type_idx on public.finance_transactions(user_id, type);
create index if not exists finance_transactions_client_idx on public.finance_transactions(client_id);
create index if not exists finance_transactions_project_idx on public.finance_transactions(project_id);

drop trigger if exists finance_settings_set_updated_at on public.finance_settings;
create trigger finance_settings_set_updated_at
before update on public.finance_settings
for each row execute function public.set_updated_at();

drop trigger if exists finance_transactions_set_updated_at on public.finance_transactions;
create trigger finance_transactions_set_updated_at
before update on public.finance_transactions
for each row execute function public.set_updated_at();

alter table public.finance_settings enable row level security;
alter table public.finance_transactions enable row level security;

drop policy if exists "Users can manage their own finance settings" on public.finance_settings;
create policy "Users can manage their own finance settings"
on public.finance_settings for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and base_currency_code ~ '^[A-Z]{3}$');

drop policy if exists "Users can manage their own finance transactions" on public.finance_transactions;
create policy "Users can manage their own finance transactions"
on public.finance_transactions for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and currency_code ~ '^[A-Z]{3}$'
    and base_currency_code ~ '^[A-Z]{3}$'
    and (client_id is null or exists (
        select 1 from public.clients
        where clients.id = finance_transactions.client_id and clients.user_id = (select auth.uid())
    ))
    and (project_id is null or exists (
        select 1 from public.projects
        where projects.id = finance_transactions.project_id and projects.user_id = (select auth.uid())
    ))
);

revoke all on table public.finance_settings, public.finance_transactions from anon;
grant select, insert, update, delete on table public.finance_settings, public.finance_transactions to authenticated;
