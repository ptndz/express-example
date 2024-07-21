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
