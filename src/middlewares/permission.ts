import { NextFunction, Request, Response } from "express";
import { getPermissionByRoleIdByResource } from "../services/permission";
import { getUserOrRole } from "../services/user";
import { Action, Permission, Resource } from "../types/permissions";

export const hasPermission = (resource: Resource, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          code: 401,
          success: false,
          error: [`AuthorizeUser is not logged in yet`],
        });
      }

      const user = await getUserOrRole(req.userId);
      if (!user || !user.role) {
        return res.status(401).json({
          code: 401,
          success: false,
          error: [`User does not have permission to ${action}.`],
        });
      }
      if (user.role.root) {
        return next();
      }
      // Tạo chuỗi tài nguyên đầy đủ, ví dụ: 'user.update'
      const permissionResource: Permission =
        `${resource}.${action}` as Permission;

      // Tìm quyền trong bảng Permissions
      const permission = await getPermissionByRoleIdByResource(
        user.role.id,
        permissionResource
      );

      if (!permission) {
        return res.status(401).json({
          code: 401,
          success: false,
          error: [`User does not have permission to ${action}.`],
        });
      }
      return next();
    } catch (error) {
      return res.status(500).json({
        code: 500,
        success: false,
        error: [`Error checking permissions`],
      });
    }
  };
};
