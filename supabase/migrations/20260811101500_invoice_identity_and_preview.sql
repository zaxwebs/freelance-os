create table if not exists public.workspace_invoice_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    business_name text,
    legal_name text,
    business_email text,
    business_phone text,
    business_website text,
    business_address text,
    tax_id_label text,
    tax_id text,
    logo_path text,
    default_payment_terms_days integer not null default 14 check (default_payment_terms_days between 0 and 365),
    default_payment_instructions text,
    footer_note text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.clients
    add column if not exists billing_address text,
    add column if not exists tax_id_label text,
    add column if not exists tax_id text;

alter table public.invoices
    add column if not exists issuer_snapshot jsonb not null default '{}'::jsonb,
    add column if not exists client_snapshot jsonb not null default '{}'::jsonb,
    add column if not exists snapshot_at timestamptz;

drop trigger if exists workspace_invoice_settings_set_updated_at on public.workspace_invoice_settings;
create trigger workspace_invoice_settings_set_updated_at
before update on public.workspace_invoice_settings
for each row execute function public.set_updated_at();

alter table public.workspace_invoice_settings enable row level security;

drop policy if exists "Users can manage their own invoice settings" on public.workspace_invoice_settings;
create policy "Users can manage their own invoice settings"
on public.workspace_invoice_settings for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.workspace_invoice_settings from anon;
grant select, insert, update, delete on table public.workspace_invoice_settings to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'invoice-assets',
    'invoice-assets',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their invoice assets" on storage.objects;
create policy "Users can upload their invoice assets"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'invoice-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can read their invoice asset metadata" on storage.objects;
create policy "Users can read their invoice asset metadata"
on storage.objects for select
to authenticated
using (
    bucket_id = 'invoice-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can update their invoice assets" on storage.objects;
create policy "Users can update their invoice assets"
on storage.objects for update
to authenticated
using (
    bucket_id = 'invoice-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
    bucket_id = 'invoice-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can delete their invoice assets" on storage.objects;
create policy "Users can delete their invoice assets"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'invoice-assets'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);
