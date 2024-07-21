import { Route, Tags, Post, Body } from "tsoa";
import { createUser, getUser, getUserByUserName, IUserPayload } from "../services/user";

import argon2 from "argon2";
import { IResponse, Token } from "../types";
import { JwtGenerateTokens, JwtSignAccessToken, JwtVerifyRefreshToken } from "../utils/jwt";

import { DAY_TIME } from "../constants";

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

	@Post("/refresh-token")
	public async refreshToken(
		@Body() body: { refreshToken: string }
	): Promise<IResponse<{ accessToken: string | null }>> {
		const refreshToken = body.refreshToken;

		if (!refreshToken)
			return {
				code: 403,
				success: false,
				message: "Refresh Token is required!",
			};

		try {
			const decodeUser = await JwtVerifyRefreshToken(refreshToken);

			if (decodeUser.error) {
				return {
					code: 500,
					success: false,
					message: decodeUser.error.message,
				};
			}
			if (!decodeUser.data) {
				return {
					code: 500,
					success: false,
					message: "Error",
				};
			}
			const existingUser = await getUser(decodeUser.data?.userId);
			if (!existingUser) {
				return {
					code: 404,
					success: false,
					message: "User Not found.",
				};
			}

			const token = await JwtSignAccessToken({ userId: existingUser.id }, DAY_TIME);
			if (token.error) {
				return {
					code: 500,
					success: false,
					message: "Error",
				};
			}

			return {
				success: true,
				code: 200,
				data: { accessToken: token.data },
			};
		} catch (error) {
			return {
				success: true,
				code: 500,
				message: "Error",
			};
		}
	}
}
