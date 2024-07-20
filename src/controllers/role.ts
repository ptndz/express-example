import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import { IRolePayload, createRole, getRole, getRoles } from "../services/role";
import { Role } from "../entity/Role";

@Route("roles")
@Tags("Role")
export default class RoleController {
	@Post("/")
	public async createRole(@Body() body: IRolePayload): Promise<Role> {
		return createRole(body);
	}
	@Get("/")
	public async getRoles(): Promise<Array<Role>> {
		return getRoles();
	}
	@Get("/:id")
	public async getRole(@Path() id: string): Promise<Role | null> {
		return getRole(id);
	}
}
