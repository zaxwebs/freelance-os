drop policy if exists "Users can manage their own contract templates" on public.contract_templates;
create policy "Users can manage their own contract templates"
on public.contract_templates for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
