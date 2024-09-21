import argon2d from "argon2";
import { Body, Get, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { User } from "../entity/User";
import { getRole } from "../services/role";
import {
  IUserPayload,
  createUser,
  getUser,
  getUserByRoleId,
  getUsers,
  updateUser,
} from "../services/user";
import { IResponse, Pagination } from "../types";
import { removeKeyObject, removeKeyObjectArray } from "../utils";

@Route("users")
@Tags("User")
export default class UserController {
  @Security("Bearer")
  @Security("Cookie")
  @Post("/")
  public async createUser(
    @Body() body: IUserPayload
  ): Promise<IResponse<User>> {
    const role = await getRole(body.roleId);
    role && role !== null ? (body.role = role) : null;
    const user = await createUser(body);
    if (user) {
      const data = removeKeyObject(user, ["password"]) as User;
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 501,
      success: false,
      message: "Tao bi loi",
    };
  }
  @Security("Bearer")
  @Security("Cookie")
  @Get("/")
  public async getUsers(
    @Query("page") page: number,
    @Query("limit") limit: number
  ): Promise<IResponse<Pagination<User>>> {
    const users = await getUsers(page, limit);
    const data = removeKeyObjectArray(users.items, [
      "password",
      "createAt",
      "updateAt",
    ]);
    users.items = data as User[];
    return {
      code: 200,
      success: true,
      data: users,
    };
  }
  @Security("Bearer")
  @Security("Cookie")
  @Get("/:id")
  public async getUser(@Path() id: string): Promise<IResponse<User & {role_id: string}>> {
    const user = await getUser(id);

    if (user) {
      const roleId = user.role?.id;
      const data = {
        ...removeKeyObject(user, ["password", "createAt", "role"]),
        role_id: roleId
      } as User & { role_id: string };


      return {
        code: 200,
        success: true,
        data: data,
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
  public async updateUser(
    @Path() id: string,
    @Body() user: Partial<User>
  ): Promise<IResponse<User>> {
    if (user.password) {
      user.password = await argon2d.hash(user.password);
    }
    const data = await updateUser(id, user);
    if (data) {
      const Idata = removeKeyObject(data, ["password"]) as User;
      return {
        code: 200,
        success: true,
        data: Idata,
      };
    }
    return {
      code: 500,
      success: false,
      message: "Khong thanh cong",
    };
  }
  @Security("Bearer")
  @Security("Cookie")
  @Get("/role/:id")
  public async getUserByRoleId(
    @Path() id: string,
    @Query("page") page: number,
    @Query("limit") limit: number
  ): Promise<IResponse<Pagination<User>>> {
    const data = await getUserByRoleId(id, page, limit);
    if (data) {
      data.items = removeKeyObjectArray(data.items, [
        "password",
        "createAt",
        "updateAt",
      ]) as User[];
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 500,
      success: false,
      message: "Khong thanh cong",
    };
  }
}
