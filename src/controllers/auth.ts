import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import { createUser, getUsers, getUser, IUserPayload } from "../services/user";
import { User } from "../entity/User";
import { getRole } from "../services/role";
import { IError } from "../types";

@Route("auth")
@Tags("User")
export default class UserController {
	@Post("/login")
	public async login(@Body() body: {
    username:string,
    password:string
  }): Promise<User | IError> {
		const role = await getRole(body.roleId);
		role && role != null ? (body.role = role) : null;
		const user = await createUser(body);
		return user;
	}
	@Get("/")
	public async getUsers(): Promise<Array<User>> {
		return getUsers();
	}
	@Get("/:id")
	public async getUser(@Path() id: string): Promise<User | null> {
		return getUser(id);
	}
}
