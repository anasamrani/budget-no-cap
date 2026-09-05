export interface Subcategory {
	subcategory_id: string;
	sc_name: string;
	priority: number; // 1 (highest) .. 3 (lowest)
}

export interface Category {
	category_id: string;
	c_name: string;
	subcategory: Subcategory[];
}
