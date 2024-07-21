import { NextFunction, Request, Response } from "express";
import { getUserOrRole } from "../services/user";
import { getPermissionByRoleIdByResource } from "../services/permission";

export const hasPermission = (resource: string, action: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					code: 401,
					success: false,
					errors: [`AuthorizeUser is not logged in yet`],
				});
			}

			const user = await getUserOrRole(req.userId);
			if (!user || !user.role) {
				return res.status(401).json({
					code: 401,
					success: false,
					errors: [`User does not have permission to ${action}.`],
				});
			}
			if (user.role.root) {
				return next();
			}
			// Tạo chuỗi tài nguyên đầy đủ, ví dụ: 'user.update'
			const permissionResource = `${resource}.${action}`;

			// Tìm quyền trong bảng Permissions
			const permission = await getPermissionByRoleIdByResource(user.role.id, permissionResource);

			if (!permission) {
				return res.status(401).json({
					code: 401,
					success: false,
					errors: [`User does not have permission to ${action}.`],
				});
			}
			return next();
		} catch (error) {
			return res.status(500).json({
				code: 500,
				success: false,
				errors: [`Error checking permissions`],
			});
		}
	};
};
