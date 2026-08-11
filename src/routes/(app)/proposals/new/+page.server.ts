import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supportedCurrencies } from '$lib/app/currency';
import { getEffectiveBillingCurrency, isSupportedCurrency, isValidDate } from '$lib/server/finance';
import { parseProposalLineItems, proposalTotals } from '$lib/server/proposals';
import { getCurrentUser } from '$lib/server/workspace';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const user = await getCurrentUser(supabase);
	if (!user) throw redirect(303, '/');
	const clientsResult = await supabase.from('clients').select('id,name,company,default_currency_code').order('name');
	if (clientsResult.error) throw clientsResult.error;
	return {
		clients: clientsResult.data ?? [],
		currencies: supportedCurrencies,
		defaultClientId: url.searchParams.get('client') ?? ''
	};
};

export const actions: Actions = {
	createProposal: async ({ request, locals: { supabase } }) => {
		const user = await getCurrentUser(supabase);
		if (!user) return fail(401, { message: 'Sign in before creating a proposal.' });

		const formData = await request.formData();
		const clientId = String(formData.get('client_id') ?? '').trim();
		const title = String(formData.get('title') ?? '').trim();
		const overview = String(formData.get('overview') ?? '').trim() || null;
		const issueDate = String(formData.get('issue_date') ?? '').trim();
		const validUntil = String(formData.get('valid_until') ?? '').trim() || null;
		const submittedCurrencyCode = String(formData.get('currency_code') ?? '').trim().toUpperCase();
		const lineItemsResult = parseProposalLineItems(String(formData.get('line_items') ?? ''));
		const sendNow = formData.get('send_now') === 'on';

		if (!clientId) return fail(400, { message: 'Choose a client.' });
		if (!title) return fail(400, { message: 'Add a proposal title.' });
		if (!isValidDate(issueDate) || (validUntil && !isValidDate(validUntil)) || (validUntil && validUntil < issueDate)) return fail(400, { message: 'Choose valid dates, with the valid-until date on or after the issue date.' });
		if ('error' in lineItemsResult) return fail(400, { message: lineItemsResult.error });

		const clientResult = await supabase.from('clients').select('id,default_currency_code').eq('id', clientId).single();
		if (clientResult.error || !clientResult.data) return fail(400, { message: 'Choose a valid client.' });

		const currencyCode = getEffectiveBillingCurrency(clientResult.data.default_currency_code, undefined, submittedCurrencyCode || undefined);
		if (!isSupportedCurrency(currencyCode)) return fail(400, { message: 'Choose a supported currency.' });
		const totals = proposalTotals(lineItemsResult.items);
		const proposalNumber = `PROP-${issueDate.slice(0, 4)}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
		const sentAt = sendNow ? new Date().toISOString() : null;

		const { data: proposal, error: proposalError } = await supabase.from('proposals').insert({
			user_id: user.id,
			client_id: clientId,
			proposal_number: proposalNumber,
			title,
			overview,
			status: sendNow ? 'sent' : 'draft',
			issue_date: issueDate,
			valid_until: validUntil,
			currency_code: currencyCode,
			subtotal: totals.subtotal,
			tax_total: totals.taxTotal,
			total: totals.total,
			scope: String(formData.get('scope') ?? '').trim() || null,
			timeline: String(formData.get('timeline') ?? '').trim() || null,
			payment_terms: String(formData.get('payment_terms') ?? '').trim() || null,
			notes: String(formData.get('notes') ?? '').trim() || null,
			terms: String(formData.get('terms') ?? '').trim() || null,
			sent_at: sentAt
		}).select('id').single();
		if (proposalError || !proposal) return fail(400, { message: proposalError?.message ?? 'Could not create the proposal.' });

		const { error: lineItemError } = await supabase.from('proposal_line_items').insert(lineItemsResult.items.map((item, index) => ({
			user_id: user.id,
			proposal_id: proposal.id,
			position: index,
			description: item.description,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			tax_rate: item.taxRate,
			amount: item.amount
		})));
		if (lineItemError) {
			await supabase.from('proposals').delete().eq('id', proposal.id);
			return fail(400, { message: lineItemError.message });
		}

		redirect(303, `/proposals/${proposal.id}`);
	}
};
