export interface IResponse<T> {
	code: number;
	success: boolean;
	message?: string;
	errors?: Array<string>;
	data?: T;
}
export interface Token {
	refreshToken: string | null;
	accessToken: string | null;
}

export interface IData<T> {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
	items: Array<T>;
}
