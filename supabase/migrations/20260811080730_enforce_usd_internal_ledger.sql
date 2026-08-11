-- The ledger is always normalized to USD. Currency selection belongs to
-- source documents and to the reporting/display layer.
update public.finance_settings
set base_currency_code = 'USD'
where base_currency_code <> 'USD';

do $$
begin
    if exists (select 1 from public.finance_transactions where base_currency_code <> 'USD') then
        raise exception 'Cannot enforce USD ledger: finance_transactions contains non-USD snapshots';
    end if;
    if exists (select 1 from public.finance_expenses where base_currency_code <> 'USD') then
        raise exception 'Cannot enforce USD ledger: finance_expenses contains non-USD snapshots';
    end if;
    if exists (select 1 from public.invoices where base_currency_code <> 'USD') then
        raise exception 'Cannot enforce USD ledger: invoices contains non-USD snapshots';
    end if;
    if exists (select 1 from public.invoice_payments where base_currency_code <> 'USD') then
        raise exception 'Cannot enforce USD ledger: invoice_payments contains non-USD snapshots';
    end if;
end
$$;

alter table public.finance_settings
    drop constraint if exists finance_settings_base_currency_code_usd_check;
alter table public.finance_settings
    add constraint finance_settings_base_currency_code_usd_check check (base_currency_code = 'USD');

alter table public.finance_transactions
    drop constraint if exists finance_transactions_base_currency_code_usd_check;
alter table public.finance_transactions
    add constraint finance_transactions_base_currency_code_usd_check check (base_currency_code = 'USD');

alter table public.finance_expenses
    drop constraint if exists finance_expenses_base_currency_code_usd_check;
alter table public.finance_expenses
    add constraint finance_expenses_base_currency_code_usd_check check (base_currency_code = 'USD');

alter table public.invoices
    drop constraint if exists invoices_base_currency_code_usd_check;
alter table public.invoices
    add constraint invoices_base_currency_code_usd_check check (base_currency_code = 'USD');

alter table public.invoice_payments
    drop constraint if exists invoice_payments_base_currency_code_usd_check;
alter table public.invoice_payments
    add constraint invoice_payments_base_currency_code_usd_check check (base_currency_code = 'USD');
