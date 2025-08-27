import { NextFunction, Request, Response } from "express";
import { getPermissionByRoleIdByResource } from "../services/permission";
import { getUserOrRole } from "../services/user";
import { Action, Permission, Resource } from "../types/permissions";
import addLog from "../config/addLog";

export const hasPermission = (resource: Resource, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        addLog("Unauthorized access - missing userId", "error");
        return res.status(401).json({
          code: 401,
          success: false,
          error: ["User is not authenticated"],
        });
      }

      const user = await getUserOrRole(req.userId);
      if (!user || !user.role) {
        addLog(`User ${req.userId} has no role`, "error");
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
        addLog(
          `Role ${user.role.id} lacks permission ${permissionResource}`,
          "error"
        );
        return res.status(401).json({
          code: 401,
          success: false,
          error: [`User does not have permission to ${action}.`],
        });
      }
      return next();
    } catch (error) {
      addLog(error, "error");
      return res.status(500).json({
        code: 500,
        success: false,
        error: ["Error checking permissions"],
      });
    }
  };
};
