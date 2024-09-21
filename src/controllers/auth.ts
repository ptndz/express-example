import { Body, Get, Post, Request, Route, Security, Tags } from "tsoa";
import {
  createUser,
  getUser,
  getUserByEmail,
  getUserByUserName,
  IUserPayload,
} from "../services/user";

import argon2 from "argon2";
import { IResponse, Token } from "../types";
import {
  JwtGenerateTokens,
  JwtSignAccessToken,
  JwtVerifyRefreshToken,
} from "../utils";

import * as express from "express";
import { DAY_TIME } from "../constants";
import { User } from "../entity/User";
import { i18n } from "../translation";
import { removeKeyObject } from "../utils";

@Route("auth")
@Tags("Auth")
export default class AuthController {
  @Post("/login")
  public async login(
    @Body() body: { username: string; password: string }
  ): Promise<IResponse<Token>> {
    try {
      const user: any = body.username.includes("@")
        ? await getUserByEmail(body.username)
        : await getUserByUserName(body.username);

      if (!user) {
        return {
          code: 404,
          success: false,
          message: i18n.t("response.taiKhoanKhongTonTai"),
        };
      }
      if (await argon2.verify(user?.password, body.password)) {
        const token = await JwtGenerateTokens({
          userId: user.id,
        });
        if (token.error) {
          return {
            code: 500,
            success: false,
            message: token.error.message,
          };
        }
        const data = removeKeyObject(user, ["password"]);
        return {
          code: 200,
          success: true,
          data: {
            ...data,
            refreshToken: token.refreshToken,
            accessToken: token.accessToken,
            expires_in: DAY_TIME,
          },
        };
      } else {
        return {
          code: 404,
          success: false,
          message: i18n.t("response.taiKhoanKhongTonTai"),
        };
      }
    } catch (error) {
      console.log(error);

      return {
        code: 500,
        success: false,
        message: i18n.t("response.serverError"),
      };
    }
  }

  @Post("/register")
  public async register(
    @Body() body: IUserPayload
  ): Promise<IResponse<boolean>> {
    body.password = await argon2.hash(body.password);
    body.image = body.image || "https://i.imgur.com/rLpAsb4.png";
    const user = await createUser(body);

    if (user) {
      return {
        code: 200,
        success: true,
        data: true,
      };
    }
    return {
      code: 400,
      success: false,
      data: false,
      message: i18n.t("response.dangKyTaiKhoanBiTuChoi"),
    };
  }

  @Post("/refresh-token")
  public async refreshToken(
    @Body() body: { refreshToken: string }
  ): Promise<
    IResponse<{
      accessToken: string | null;
      expires_in: number;
      refreshToken: string;
    }>
  > {
    const refreshToken = body.refreshToken;

    if (!refreshToken)
      return {
        code: 403,
        success: false,
        message: i18n.t("response.refreshTokenCanLamMoi"),
      };

    try {
      const decodeUser = await JwtVerifyRefreshToken(refreshToken);

      if (decodeUser.error) {
        return {
          code: 500,
          success: false,
          message: decodeUser.error.message,
        };
      }
      if (!decodeUser.data) {
        return {
          code: 500,
          success: false,
          message: i18n.t("response.serverError"),
        };
      }
      const existingUser = await getUser(decodeUser.data?.userId);
      if (!existingUser) {
        return {
          code: 404,
          success: false,
          message: i18n.t("response.taiKhoanKhongTonTai"),
        };
      }

      const token = await JwtSignAccessToken(
        { userId: existingUser.id },
        DAY_TIME
      );
      if (token.error) {
        return {
          code: 500,
          success: false,
          message: i18n.t("response.serverError"),
        };
      }

      return {
        success: true,
        code: 200,
        data: {
          accessToken: token.data,
          expires_in: DAY_TIME,
          refreshToken: body.refreshToken,
        },
      };
    } catch (error) {
      return {
        success: true,
        code: 500,
        message: i18n.t("response.serverError"),
      };
    }
  }

  @Get("/me")
  @Security("Bearer")
  @Security("Cookie")
  public async getMe(
    @Request() req: express.Request
  ): Promise<IResponse<Partial<User>>> {
    if (req.userId) {
      const user = await getUser(req.userId);
      if (user) {
        const data = removeKeyObject(user, ["password"]);
        return {
          code: 200,
          success: true,
          data: data,
        };
      }
    }

    return {
      code: 404,
      success: false,
      message: i18n.t("response.taiKhoanKhongTonTai"),
    };
  }
}
