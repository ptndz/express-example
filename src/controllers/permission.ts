import { Route, Tags, Post, Body, Get, Path, Security } from "tsoa";
import {
	IPermissionPayload,
	createPermission,
	getEntityTableNames,
	getPermissionByRoleId,
	getPermissions,
} from "../services/permission";
import { Permissions } from "../entity/Permissions";
import { IResponse } from "../types";

@Route("permissions")
@Tags("Permissions")
export default class PermissionController {
	@Security("Bearer")
	@Post("/")
	public async createPermission(@Body() body: IPermissionPayload): Promise<IResponse<Permissions>> {
		const permission = await createPermission(body);
		return {
			code: 200,
			success: true,
			data: permission,
		};
	}
	@Security("Bearer")
	@Get("/")
	public async getPermissions(): Promise<IResponse<Array<Permissions>>> {
		const permissions = await getPermissions();
		return {
			code: 200,
			success: true,
			data: permissions,
		};
	}
	@Security("Bearer")
	@Get("/list")
	public async getList(): Promise<IResponse<Array<string>>> {
		const permissions = await getEntityTableNames();
		const actions: string[] = ["list", "create", "detail"];

		const result: string[] = [];

		permissions.forEach((permission) => {
			actions.forEach((action) => {
				result.push(`${permission}.${action}`);
			});
		});

		return {
			code: 200,
			success: true,
			data: result,
		};
	}
	@Security("Bearer")
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
