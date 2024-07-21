import { Route, Tags, Post, Body } from "tsoa";
import { createUser, getUserByUserName, IUserPayload } from "../services/user";

import argon2 from "argon2";
import { IResponse, Token } from "../types";
import { JwtGenerateTokens } from "../utils/jwt";

@Route("auth")
@Tags("Auth")
export default class AuthController {
	@Post("/login")
	public async login(
		@Body() body: { username: string; password: string }
	): Promise<IResponse<Token>> {
		try {
			const user = await getUserByUserName(body.username);
			if (!user) {
				return {
					code: 401,
					success: false,
					message: "Tai khoan khong ton tai",
				};
			}
			if (await argon2.verify(user?.password, body.password)) {
				const token = await JwtGenerateTokens({
					userId: user.id,
				});
				if (token.error) {
					return {
						code: 500,
						success: false,
						message: token.error.message,
					};
				}

				return {
					code: 200,
					success: true,
					data: {
						refreshToken: token.refreshToken,
						accessToken: token.accessToken,
					},
				};
			} else {
				return {
					code: 401,
					success: false,
					message: "Tai khoan khong ton tai",
				};
			}
		} catch (error) {
			return {
				code: 500,
				success: false,
				errors: ["Error"],
			};
		}
	}
	@Post("/register")
	public async register(@Body() body: IUserPayload): Promise<IResponse<boolean>> {
		const hashPassword = await argon2.hash(body.password);
		body.password = hashPassword;
		const user = await createUser(body);

		if (user) {
			return {
				code: 200,
				success: true,
				data: true,
			};
		}
		return {
			code: 400,
			success: false,
			data: false,
		};
	}
}
