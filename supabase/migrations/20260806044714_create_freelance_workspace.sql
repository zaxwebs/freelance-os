create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) > 0),
    company text,
    email text,
    color text not null default '#171717',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id uuid references public.clients(id) on delete set null,
    name text not null check (length(trim(name)) > 0),
    description text,
    status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'archived')),
    color text not null default '#171717',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    project_id uuid references public.projects(id) on delete set null,
    title text not null check (length(trim(title)) > 0),
    description text,
    status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
    due_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Users can manage their own clients" on public.clients;
create policy "Users can manage their own clients"
on public.clients for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own projects" on public.projects;
create policy "Users can manage their own projects"
on public.projects for all
using (auth.uid() = user_id)
with check (
    auth.uid() = user_id
    and (client_id is null or exists (
        select 1 from public.clients
        where clients.id = client_id and clients.user_id = auth.uid()
    ))
);

drop policy if exists "Users can manage their own tasks" on public.tasks;
create policy "Users can manage their own tasks"
on public.tasks for all
using (auth.uid() = user_id)
with check (
    auth.uid() = user_id
    and (project_id is null or exists (
        select 1 from public.projects
        where projects.id = project_id and projects.user_id = auth.uid()
    ))
);
