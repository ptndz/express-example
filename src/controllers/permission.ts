import { Route, Tags, Post, Body, Get, Path, Security, Put, Delete } from "tsoa";
import {
	IPermissionPayload,
	createPermission,
	deletePermission,
	getPermission,
	getPermissionResourceActions,
	getPermissions,
	updatePermission,
} from "../services/permission";
import { Permissions } from "../entity/Permissions";
import { IResponse } from "../types";

@Route("permissions")
@Tags("Permissions")
export default class PermissionController {
	@Security("Bearer")
	@Post("/")
	public async createPermission(@Body() body: IPermissionPayload): Promise<IResponse<Permissions>> {
		const resource = body.resource;
		const permissionsActions = await getPermissionResourceActions();

		if (permissionsActions.includes(resource)) {
			const permission = await createPermission(body);
			return {
				code: 200,
				success: true,
				data: permission,
			};
		}
		return {
			code: 404,
			success: false,
			message: "Khong thanh cong",
		};
	}
	@Security("Bearer")
	@Security("Cookie")
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
	@Security("Cookie")
	@Get("/list")
	public async getList(): Promise<IResponse<Array<string>>> {
		const permissionsActions = await getPermissionResourceActions();
		return {
			code: 200,
			success: true,
			data: permissionsActions,
		};
	}
	@Security("Bearer")
	@Security("Cookie")
	@Get("/:id")
	public async getPermission(@Path() id: string): Promise<IResponse<Permissions>> {
		const permission = await getPermission(id);
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
	@Security("Bearer")
	@Security("Cookie")
	@Put("/:id")
	public async updatePermission(
		@Path() id: string,
		@Body() body: Partial<IPermissionPayload>
	): Promise<IResponse<Permissions>> {
		if (body.resource) {
			const resource = body.resource;
			const permissionsActions = await getPermissionResourceActions();
			if (permissionsActions.includes(resource)) {
				const permission = await updatePermission(id, body);
				if (permission) {
					return {
						code: 200,
						success: true,
						data: permission,
					};
				}
			}
			return {
				code: 404,
				success: false,
				message: "Khong ton tai",
			};
		}
		const permission = await updatePermission(id, body);
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
	@Security("Bearer")
	@Security("Cookie")
	@Delete("/:id")
	public async deletePermission(@Path() id: string): Promise<IResponse<Permissions>> {
		const permission = await deletePermission(id);
		if (permission) {
			return {
				code: 200,
				success: true,
				message: "thanh cong",
			};
		}
		return {
			code: 404,
			success: false,
			message: "Khong ton tai",
		};
	}
}
