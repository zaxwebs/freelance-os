export const supportedCurrencies = [
	{ code: 'USD', name: 'US Dollar', minorUnits: 2 },
	{ code: 'EUR', name: 'Euro', minorUnits: 2 },
	{ code: 'GBP', name: 'British Pound', minorUnits: 2 },
	{ code: 'INR', name: 'Indian Rupee', minorUnits: 2 },
	{ code: 'CAD', name: 'Canadian Dollar', minorUnits: 2 },
	{ code: 'AUD', name: 'Australian Dollar', minorUnits: 2 },
	{ code: 'NZD', name: 'New Zealand Dollar', minorUnits: 2 },
	{ code: 'CHF', name: 'Swiss Franc', minorUnits: 2 },
	{ code: 'SGD', name: 'Singapore Dollar', minorUnits: 2 },
	{ code: 'AED', name: 'UAE Dirham', minorUnits: 2 },
	{ code: 'JPY', name: 'Japanese Yen', minorUnits: 0 }
] as const;

export type SupportedCurrencyCode = (typeof supportedCurrencies)[number]['code'];

export function getMinorUnits(currencyCode: string) {
	return supportedCurrencies.find((currency) => currency.code === currencyCode)?.minorUnits ?? 2;
}

export function formatMoney(value: number | string | null | undefined, currencyCode: string) {
	const numericValue = Number(value ?? 0);
	if (!Number.isFinite(numericValue)) return '—';

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currencyCode,
		currencyDisplay: 'symbol',
		minimumFractionDigits: getMinorUnits(currencyCode),
		maximumFractionDigits: getMinorUnits(currencyCode)
	}).format(numericValue);
}

export function formatAmountWithCode(value: number | string | null | undefined, currencyCode: string) {
	return `${formatMoney(value, currencyCode)} ${currencyCode}`;
}

export function parseMoney(value: string, currencyCode: string) {
	const numericValue = Number(value.replace(/,/g, '').trim());
	if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
	return Number(numericValue.toFixed(getMinorUnits(currencyCode)));
}
