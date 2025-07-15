import { Body, Get, Path, Post, Query, Route, Tags } from "tsoa";

import {
  callbackQueryService,
  getUpdatesService,
  sendMessageService,
  setWebhookService,
} from "../../services/bot";
import {
  ICallbackQueryPayload,
  IResponse,
  ISendMessagePayload,
  ISetWebhookPayload,
} from "../../types";

@Route("api/{token}")
@Tags("API")
export default class ApiBotController {
  @Post("/sendMessage")
  public async sendMessage(
    @Path() token: string,
    @Body() body: ISendMessagePayload
  ): Promise<IResponse<any>> {
    const result = await sendMessageService(token, body);

    if (result) {
      return {
        code: 200,
        success: true,
        data: result,
      };
    }
    return {
      code: 404,
      success: false,
      message: "Bot not found.",
    };
  }

  @Post("/callbackQuery")
  public async callbackQuery(
    @Path() token: string,
    @Body() body: ICallbackQueryPayload
  ): Promise<IResponse<any>> {
    const result = await callbackQueryService(token, body);

    if (result) {
      return {
        code: 200,
        success: true,
        data: result,
      };
    }
    return {
      code: 404,
      success: false,
      message: "Bot not found.",
    };
  }

  @Get("/getUpdates")
  public async getUpdates(
    @Path() token: string,
    @Query("offset") offset: number = 0,
    @Query("limit") limit: number = 100
  ): Promise<IResponse<any[]>> {
    const updates = await getUpdatesService(token, offset, limit);

    if (updates) {
      return {
        code: 200,
        success: true,
        data: updates,
      };
    }
    return {
      code: 404,
      success: false,
      message: "Bot not found.",
    };
  }

  @Post("/setWebhook")
  public async setWebhook(
    @Path() token: string,
    @Body() body: ISetWebhookPayload
  ): Promise<IResponse<boolean>> {
    const success = await setWebhookService(token, body);

    if (success) {
      return {
        code: 200,
        success: true,
        data: true,
      };
    }
    return {
      code: 404,
      success: false,
      message: "Bot not found.",
    };
  }
}
