alter table public.contracts
    drop column if exists start_date,
    drop column if exists end_date;
