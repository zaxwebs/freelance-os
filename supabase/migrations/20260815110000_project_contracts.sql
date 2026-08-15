create table if not exists public.contracts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    project_id uuid not null unique references public.projects(id) on delete cascade,
    template_id uuid references public.contract_templates(id) on delete set null,
    name text not null check (length(trim(name)) > 0),
    content text not null default '',
    start_date date,
    end_date date,
    status text not null default 'draft' check (status in ('draft', 'active', 'ended')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_date is null or start_date is null or end_date >= start_date)
);

create index if not exists contracts_user_id_idx on public.contracts(user_id);
create index if not exists contracts_template_id_idx on public.contracts(template_id);

drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.contracts enable row level security;

drop policy if exists "Users can manage their own contracts" on public.contracts;
create policy "Users can manage their own contracts"
on public.contracts for all
to authenticated
using (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.projects
        where projects.id = contracts.project_id
          and projects.user_id = (select auth.uid())
    )
)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.projects
        where projects.id = contracts.project_id
          and projects.user_id = (select auth.uid())
    )
    and (
        template_id is null
        or exists (
            select 1
            from public.contract_templates
            where contract_templates.id = contracts.template_id
              and contract_templates.user_id = (select auth.uid())
        )
    )
);

revoke all on table public.contracts from anon;
grant select, insert, update, delete on table public.contracts to authenticated;
