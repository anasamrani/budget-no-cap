export interface BalanceEntry {
	id: string;
	date: string; // 'YYYY-MM-DD'
	subcategory: string;
	priority: number; // of the sub-category, 1 (highest) .. 3 (lowest)
	category: string;
	amount: number; // always positive
	isIncoming: boolean;
}

export interface MonthlyTotal {
	label: string; // 'Apr'
	amount: number; // spending only
}
