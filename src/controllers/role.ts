import { Body, Get, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { Role } from "../entity/Role";
import {
  createListPermissions,
  getResourcePermissionsByRoleId,
  removeListPermissions,
} from "../services/permission";
import {
  IRolePayload,
  createRole,
  getRole,
  getRoles,
  updateRole,
} from "../services/role";
import { removeRoleListUsers, updateRoleListUsers } from "../services/user";
import { IResponse } from "../types";
import { removeKeyObject } from "../utils";
import { transactionContext } from "../utils/transactions";

@Route("roles")
@Tags("Role")
export default class RoleController {
  @Security("Bearer")
  @Security("Cookie")
  @Post("/")
  public async createRole(
    @Body() body: IRolePayload
  ): Promise<IResponse<Role>> {
    const role = await createRole(body);
    if (!role) {
      return {
        code: 400,
        success: false,
        message: "Tao bi loi",
      };
    }
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
    const permission = await getResourcePermissionsByRoleId(id);

    if (role) {
      if (permission) {
        (role.permissions as unknown as string[]) = permission;
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
    try {
      const roleUpdate = await transactionContext(
        async (transactionManager) => {
          if (body.$clear && body.$clear.users) {
            await removeRoleListUsers(body.$clear.users, transactionManager);
          }
          if (body.$clear && body.$clear.permissions) {
            await removeListPermissions(
              id,
              body.$clear.permissions,
              transactionManager
            );
          }
          if (body.$add && body.$add.permissions) {
            await createListPermissions(
              id,
              body.$add.permissions,
              transactionManager
            );
          }

          if (body.$add && body.$add.users) {
            await updateRoleListUsers(id, body.$add.users, transactionManager);
          }
          const data = removeKeyObject(body, ["permissions", "$add", "$clear"]);
          const role = await updateRole(id, data, transactionManager);
          return role;
        }
      );
      console.log(roleUpdate);
      if (roleUpdate) {
        return {
          code: 200,
          success: true,
          data: roleUpdate,
        };
      }
      return {
        code: 404,
        success: false,
        message: "Khong ton tai",
      };
    } catch {
      return {
        code: 500,
        success: false,
        message: "Khong ton tai",
      };
    }
  }
}
