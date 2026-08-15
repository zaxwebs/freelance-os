drop index if exists public.contract_templates_user_updated_idx;
drop trigger if exists contract_templates_set_updated_at on public.contract_templates;
alter table public.contract_templates drop column if exists updated_at;
create index if not exists contract_templates_user_idx
    on public.contract_templates(user_id);
