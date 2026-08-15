create table if not exists public.contract_templates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) > 0),
    content text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists contract_templates_user_idx
    on public.contract_templates(user_id);

alter table public.contract_templates enable row level security;

drop policy if exists "Users can manage their own contract templates" on public.contract_templates;
create policy "Users can manage their own contract templates"
on public.contract_templates for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.contract_templates from anon;
grant select, insert, update, delete on table public.contract_templates to authenticated;
