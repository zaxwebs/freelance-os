alter table public.clients
    add column if not exists default_currency_code text not null default 'USD';

alter table public.clients
    drop constraint if exists clients_default_currency_code_check;
alter table public.clients
    add constraint clients_default_currency_code_check check (default_currency_code ~ '^[A-Z]{3}$');

alter table public.projects
    add column if not exists billing_currency_code text;

alter table public.projects
    drop constraint if exists projects_billing_currency_code_check;
alter table public.projects
    add constraint projects_billing_currency_code_check check (billing_currency_code is null or billing_currency_code ~ '^[A-Z]{3}$');

alter table public.finance_settings
    add column if not exists display_currency_code text not null default 'USD';

alter table public.finance_settings
    drop constraint if exists finance_settings_display_currency_code_check;
alter table public.finance_settings
    add constraint finance_settings_display_currency_code_check check (display_currency_code ~ '^[A-Z]{3}$');

create table if not exists public.finance_exchange_rates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    base_currency_code text not null default 'USD' check (base_currency_code ~ '^[A-Z]{3}$'),
    quote_currency_code text not null check (quote_currency_code ~ '^[A-Z]{3}$'),
    rate numeric(20, 10) not null check (rate > 0),
    rate_date date not null,
    source text not null default 'frankfurter',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, base_currency_code, quote_currency_code, rate_date, source),
    check (base_currency_code <> quote_currency_code)
);

alter table public.invoices
    add column if not exists base_currency_code text not null default 'USD',
    add column if not exists exchange_rate_to_usd numeric(20, 10) not null default 1,
    add column if not exists exchange_rate_date date not null default current_date,
    add column if not exists base_subtotal numeric(20, 4) not null default 0,
    add column if not exists base_tax_total numeric(20, 4) not null default 0,
    add column if not exists base_discount_total numeric(20, 4) not null default 0,
    add column if not exists base_total numeric(20, 4) not null default 0,
    add column if not exists base_amount_paid numeric(20, 4) not null default 0;

alter table public.invoices
    drop constraint if exists invoices_base_currency_code_check;
alter table public.invoices
    add constraint invoices_base_currency_code_check check (base_currency_code ~ '^[A-Z]{3}$');

alter table public.invoices
    drop constraint if exists invoices_exchange_rate_to_usd_check;
alter table public.invoices
    add constraint invoices_exchange_rate_to_usd_check check (exchange_rate_to_usd > 0);

alter table public.invoice_payments
    add column if not exists base_currency_code text not null default 'USD',
    add column if not exists base_amount numeric(20, 4) not null default 0,
    add column if not exists exchange_rate_to_usd numeric(20, 10) not null default 1,
    add column if not exists exchange_rate_date date not null default current_date;

alter table public.invoice_payments
    drop constraint if exists invoice_payments_base_currency_code_check;
alter table public.invoice_payments
    add constraint invoice_payments_base_currency_code_check check (base_currency_code ~ '^[A-Z]{3}$');

alter table public.invoice_payments
    drop constraint if exists invoice_payments_base_amount_check;
alter table public.invoice_payments
    add constraint invoice_payments_base_amount_check check (base_amount >= 0);

alter table public.invoice_payments
    drop constraint if exists invoice_payments_exchange_rate_to_usd_check;
alter table public.invoice_payments
    add constraint invoice_payments_exchange_rate_to_usd_check check (exchange_rate_to_usd > 0);

update public.invoices
set base_currency_code = 'USD',
    exchange_rate_to_usd = 1,
    exchange_rate_date = issue_date,
    base_subtotal = subtotal,
    base_tax_total = tax_total,
    base_discount_total = discount_total,
    base_total = total,
    base_amount_paid = amount_paid
where base_currency_code is null or base_currency_code = 'USD';

update public.invoice_payments
set base_currency_code = 'USD',
    base_amount = amount,
    exchange_rate_to_usd = 1,
    exchange_rate_date = payment_date
where base_currency_code is null or base_currency_code = 'USD';

create index if not exists finance_exchange_rates_lookup_idx
    on public.finance_exchange_rates(user_id, base_currency_code, quote_currency_code, rate_date desc);
create index if not exists clients_default_currency_idx
    on public.clients(user_id, default_currency_code);
create index if not exists projects_billing_currency_idx
    on public.projects(user_id, billing_currency_code);

drop trigger if exists finance_exchange_rates_set_updated_at on public.finance_exchange_rates;
create trigger finance_exchange_rates_set_updated_at
before update on public.finance_exchange_rates
for each row execute function public.set_updated_at();

create or replace function public.refresh_invoice_payment_totals()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    target_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
    paid_total numeric(20, 4);
    base_paid_total numeric(20, 4);
begin
    select coalesce(sum(amount), 0), coalesce(sum(base_amount), 0)
    into paid_total, base_paid_total
    from public.invoice_payments
    where invoice_id = target_invoice_id;

    update public.invoices
    set amount_paid = least(paid_total, total),
        base_amount_paid = least(base_paid_total, base_total),
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

alter table public.finance_exchange_rates enable row level security;

drop policy if exists "Users can manage their own finance exchange rates" on public.finance_exchange_rates;
create policy "Users can manage their own finance exchange rates"
on public.finance_exchange_rates for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.finance_exchange_rates from anon;
grant select, insert, update, delete on table public.finance_exchange_rates to authenticated;
