import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import { IRolePayload, createRole, getRole, getRoles } from "../services/role";
import { Role } from "../entity/Role";
import { IResponse } from "../types";

@Route("roles")
@Tags("Role")
export default class RoleController {
	@Post("/")
	public async createRole(@Body() body: IRolePayload): Promise<IResponse<Role>> {
		const role = await createRole(body);
		return {
			code: 200,
			success: true,
			data: role,
		};
	}
	@Get("/")
	public async getRoles(): Promise<IResponse<Array<Role>>> {
		const roles = await getRoles();
		return {
			code: 200,
			success: true,
			data: roles,
		};
	}
	@Get("/:id")
	public async getRole(@Path() id: string): Promise<IResponse<Role>> {
		const role = await getRole(id);
		if (role) {
			return {
				code: 200,
				success: true,
				data: role,
			};
		}
		return {
			code: 404,
			success: false,
			message: "Khong ton tai",
		};
	}
}
