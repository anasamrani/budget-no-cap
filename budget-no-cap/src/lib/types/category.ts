export interface Subcategory {
	subcategory_id: string;
	sc_name: string;
}

export interface Category {
	category_id: string;
	c_name: string;
	subcategory: Subcategory[];
}
