import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import {
	IPermissionPayload,
	createPermission,
	getPermissionByRoleId,
	getPermissions,
} from "../services/permission";
import { Permissions } from "../entity/Permissions";

@Route("permissions")
@Tags("Permissions")
export default class PermissionController {
	@Post("/")
	public async createPermission(@Body() body: IPermissionPayload): Promise<Permissions> {
		return createPermission(body);
	}
	@Get("/")
	public async getPermissions(): Promise<Array<Permissions>> {
		return getPermissions();
	}
	@Get("/:id")
	public async getPermissionByRoleId(@Path() id: string): Promise<Permissions | null> {
		return getPermissionByRoleId(id);
	}
}
