create index if not exists finance_expenses_client_idx on public.finance_expenses(client_id);
create index if not exists finance_expenses_invoice_idx on public.finance_expenses(invoice_id);
create index if not exists invoice_line_items_user_idx on public.invoice_line_items(user_id);
create index if not exists invoice_line_items_project_idx on public.invoice_line_items(project_id);
create index if not exists invoice_line_items_source_expense_idx on public.invoice_line_items(source_expense_id);
create index if not exists invoice_payments_user_idx on public.invoice_payments(user_id);
