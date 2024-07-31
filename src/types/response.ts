export interface IResponse<T> {
	code: number;
	success: boolean;
	message?: string;
	errors?: any;
	data?: T;
}
export interface Token {
	refreshToken: string | null;
	accessToken: string | null;
	expires_in: number;
}

export interface PaginationMeta {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
}

export interface Pagination<T> extends PaginationMeta {
	items: T[];
}
