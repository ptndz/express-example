import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import { createUser, getUsers, getUser, IUserPayload } from "../services/user";
import { User } from "../entity/User";
import { getRole } from "../services/role";
import { IResponse } from "../types";

@Route("users")
@Tags("User")
export default class UserController {
	@Post("/")
	public async createUser(@Body() body: IUserPayload): Promise<IResponse<User>> {
		const role = await getRole(body.roleId);
		role && role != null ? (body.role = role) : null;
		const user = await createUser(body);
		if (user) {
			return {
				code: 200,
				success: true,
				data: user,
			};
		}
		return {
			code: 501,
			success: false,
			message: "Tao bi loi",
		};
	}
	@Get("/")
	public async getUsers(): Promise<IResponse<Array<User>>> {
		const users = await getUsers();
		return {
			code: 200,
			success: true,
			data: users,
		};
	}
	@Get("/:id")
	public async getUser(@Path() id: string): Promise<IResponse<User>> {
		const user = await getUser(id);
		if (user) {
			return {
				code: 200,
				success: true,
				data: user,
			};
		}
		return {
			code: 404,
			success: false,
			message: "Khong ton tai",
		};
	}
}
