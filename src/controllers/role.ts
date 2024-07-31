import { Route, Tags, Post, Body, Get, Path, Security, Put } from "tsoa";
import { IRolePayload, createRole, getRole, getRoles, updateRole } from "../services/role";
import { Role } from "../entity/Role";
import { IResponse } from "../types";
import { createListPermissions, getPermissionsByRoleId } from "../services/permission";
import { removeKeyObject } from "../utils";
import { removeRoleListUsers, updateRoleListUsers } from "../services/user";

@Route("roles")
@Tags("Role")
export default class RoleController {
	@Security("Bearer")
	@Security("Cookie")
	@Post("/")
	public async createRole(@Body() body: IRolePayload): Promise<IResponse<Role>> {
		const role = await createRole(body);
		return {
			code: 200,
			success: true,
			data: role,
		};
	}
	@Security("Bearer")
	@Security("Cookie")
	@Get("/")
	public async getRoles(): Promise<IResponse<Array<Role>>> {
		const roles = await getRoles();
		return {
			code: 200,
			success: true,
			data: roles,
		};
	}
	@Security("Bearer")
	@Security("Cookie")
	@Get("/:id")
	public async getRole(@Path() id: string): Promise<IResponse<Role>> {
		const role = await getRole(id);
		const permission = await getPermissionsByRoleId(id);

		if (role) {
			if (permission) {
				role.permissions = permission;
			}
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
	@Security("Bearer")
	@Security("Cookie")
	@Put("/:id")
	public async updateRole(
		@Path() id: string,
		@Body() body: Partial<IRolePayload>
	): Promise<IResponse<Role>> {
		if (body.permissions) {
			await createListPermissions(id, body.permissions);
		}

		if (body.$add && body.$add.users) {
			await updateRoleListUsers(id, body.$add.users);
		}

		if (body.$clear && body.$clear.users) {
			await removeRoleListUsers(body.$clear.users);
		}
		const data = removeKeyObject(body, ["permissions", "$add", "$clear"]);
		const role = await updateRole(id, data);
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
