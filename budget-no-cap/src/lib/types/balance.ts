export interface BalanceEntry {
	id: string;
	date: string; // 'YYYY-MM-DD'
	subcategory: string;
	category: string;
	amount: number; // always positive
	isIncoming: boolean;
}

export interface MonthlyTotal {
	label: string; // 'Apr'
	amount: number; // spending only
}
