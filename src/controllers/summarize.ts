import { Get, Query, Route, Security, Tags } from "tsoa";

import { summarizeWebpage } from "../services/summarize";
import { IResponse } from "../types";

@Route("summarize")
@Tags("Summarize")
export default class SummarizeController {
  @Security("Bearer")
  @Security("Cookie")
  @Get("/")
  public async summarizeWeb(@Query("url") url: string): Promise<
    IResponse<{
      text: string;
      translated_text: string;
    }>
  > {
    const data = await summarizeWebpage(url);
    if (!data) {
      return {
        code: 400,
        success: false,
        message: "Tao bi loi",
      };
    }
    return {
      code: 200,
      success: true,
      data: data,
    };
  }
}
