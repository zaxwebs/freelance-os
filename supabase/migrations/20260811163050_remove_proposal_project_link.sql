drop policy if exists "Users can manage their own proposals" on public.proposals;
drop index if exists public.proposals_project_idx;
alter table public.proposals drop column if exists project_id;

create policy "Users can manage their own proposals"
on public.proposals for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1 from public.clients
        where clients.id = proposals.client_id and clients.user_id = (select auth.uid())
    )
);
