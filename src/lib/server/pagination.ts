export const PAGE_SIZE = 25;

export function parsePage(value: string | null) {
	const page = Number.parseInt(value ?? '1', 10);
	return Number.isInteger(page) && page > 0 ? page : 1;
}

export function getPagination(requestedPage: number, total: number, pageSize = PAGE_SIZE) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(requestedPage, totalPages);

	return {
		page,
		pageSize,
		total,
		totalPages
	};
}
