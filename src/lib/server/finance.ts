import { supportedCurrencies } from '$lib/app/currency';
import type { WorkspaceClient } from '$lib/server/workspace';

export const defaultFinanceCurrency = 'USD';

export type ExchangeRateSnapshot = {
	rate: number;
	rateDate: string;
	source: string;
};

export async function getBaseCurrency(_supabase: WorkspaceClient, _userId: string) {
	return defaultFinanceCurrency;
}

export async function getDisplayCurrency(supabase: WorkspaceClient, userId: string) {
	const { data, error } = await supabase.from('finance_settings').select('display_currency_code').eq('user_id', userId).maybeSingle();
	if (error) throw error;
	return data?.display_currency_code ?? defaultFinanceCurrency;
}

export function getEffectiveBillingCurrency(clientCurrency?: string | null, projectCurrency?: string | null, invoiceCurrency?: string | null) {
	return invoiceCurrency || projectCurrency || clientCurrency || defaultFinanceCurrency;
}

export function convertBaseAmount(value: number | string | null | undefined, rate: number, currencyCode: string) {
	const amount = Number(value ?? 0) * rate;
	const minorUnits = supportedCurrencies.find((currency) => currency.code === currencyCode)?.minorUnits ?? 2;
	return Number(amount.toFixed(minorUnits));
}

export async function getExchangeRate(
	supabase: WorkspaceClient,
	userId: string,
	baseCurrencyCode: string,
	quoteCurrencyCode: string,
	rateDate = new Date().toISOString().slice(0, 10)
): Promise<ExchangeRateSnapshot> {
	if (baseCurrencyCode === quoteCurrencyCode) return { rate: 1, rateDate, source: 'identity' };

	const { data: cachedRate, error: cacheError } = await supabase
		.from('finance_exchange_rates')
		.select('rate,rate_date,source')
		.eq('user_id', userId)
		.eq('base_currency_code', baseCurrencyCode)
		.eq('quote_currency_code', quoteCurrencyCode)
		.lte('rate_date', rateDate)
		.order('rate_date', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (!cacheError && cachedRate) return { rate: Number(cachedRate.rate), rateDate: cachedRate.rate_date, source: cachedRate.source };

	const endpoint = `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(baseCurrencyCode)}/${encodeURIComponent(quoteCurrencyCode)}?date=${encodeURIComponent(rateDate)}`;
	const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
	if (!response.ok) throw new Error(`Exchange rate unavailable for ${baseCurrencyCode}/${quoteCurrencyCode}.`);
	const payload = (await response.json()) as { date?: string; rate?: number };
	const rate = Number(payload.rate);
	if (!Number.isFinite(rate) || rate <= 0) throw new Error(`Exchange rate unavailable for ${baseCurrencyCode}/${quoteCurrencyCode}.`);

	const snapshot = { rate, rateDate: payload.date ?? rateDate, source: 'frankfurter' };
	const { error: insertError } = await supabase.from('finance_exchange_rates').upsert(
		{
			user_id: userId,
			base_currency_code: baseCurrencyCode,
			quote_currency_code: quoteCurrencyCode,
			rate,
			rate_date: snapshot.rateDate,
			source: snapshot.source
		},
		{ onConflict: 'user_id,base_currency_code,quote_currency_code,rate_date,source' }
	);
	// A cache write should never prevent a valid conversion from being used.
	// The next request can retry the cache without changing the saved snapshot.
	void insertError;
	return snapshot;
}

export function isSupportedCurrency(value: string) {
	return supportedCurrencies.some((currency) => currency.code === value);
}

export function isValidDate(value: string) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidDateRange(issueDate: string, dueDate: string) {
	return isValidDate(issueDate) && isValidDate(dueDate) && dueDate >= issueDate;
}

export function getDisplayInvoiceStatus(status: string, dueDate: string, amountPaid: number, total: number) {
	if (status === 'void' || status === 'paid') return status;
	if (amountPaid >= total && total > 0) return 'paid';
	if (dueDate < new Date().toISOString().slice(0, 10)) return 'overdue';
	return status;
}
