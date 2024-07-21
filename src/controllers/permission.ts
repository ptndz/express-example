import { Route, Tags, Post, Body, Get, Path } from "tsoa";
import {
	IPermissionPayload,
	createPermission,
	getPermissionByRoleId,
	getPermissions,
} from "../services/permission";
import { Permissions } from "../entity/Permissions";
import { IResponse } from "../types";

@Route("permissions")
@Tags("Permissions")
export default class PermissionController {
	@Post("/")
	public async createPermission(@Body() body: IPermissionPayload): Promise<IResponse<Permissions>> {
		const permission = await createPermission(body);
		return {
			code: 200,
			success: true,
			data: permission,
		};
	}
	@Get("/")
	public async getPermissions(): Promise<IResponse<Array<Permissions>>> {
		const permissions = await getPermissions();
		return {
			code: 200,
			success: true,
			data: permissions,
		};
	}
	@Get("/:id")
	public async getPermissionByRoleId(@Path() id: string): Promise<IResponse<Permissions>> {
		const permission = await getPermissionByRoleId(id);
		if (permission) {
			return {
				code: 200,
				success: true,
				data: permission,
			};
		}
		return {
			code: 404,
			success: false,
			message: "Khong ton tai",
		};
	}
}
