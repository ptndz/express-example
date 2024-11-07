import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  Security,
  Tags,
} from "tsoa";

import { Bookmark } from "../entity/Bookmark";
import {
  createBookmark,
  deleteBookmark,
  getAllBookmarks,
  getBookmarkById,
  ICreateBookmarkPayload,
  IUpdateBookmarkPayload,
  updateBookmark,
} from "../services/bookmark";
import { summarizeWebpage } from "../services/summarize";
import { IResponse, Pagination } from "../types";
import { removeKeyObject } from "../utils";

@Route("bookmarks")
@Tags("Bookmark")
export default class BookmarkController {
  @Security("Bearer")
  @Security("Cookie")
  @Post("/")
  public async createBookmark(
    @Body() body: ICreateBookmarkPayload
  ): Promise<IResponse<Bookmark>> {
    const summarize = await summarizeWebpage(body.url);

    body.summarize = summarize?.translated_text;
    console.log(body);

    const bookmark = await createBookmark(body);

    if (bookmark) {
      // Không có trường nào cần loại bỏ trong Tag, nhưng nếu có, hãy thêm vào đây
      const data = removeKeyObject(bookmark, []) as Bookmark;
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 501,
      success: false,
      message: "Có lỗi xảy ra khi tạo bookmark.",
    };
  }

  @Security("Bearer")
  @Security("Cookie")
  @Get("/")
  public async getAllBookmarks(
    @Query("page") page: number,
    @Query("limit") limit: number
  ): Promise<IResponse<Pagination<Bookmark>>> {
    const bookmarksResult = await getAllBookmarks(page, limit);
    if (bookmarksResult) {
      return {
        code: 200,
        success: true,
        data: bookmarksResult,
      };
    }
    return {
      code: 501,
      success: false,
      message: "Không thể lấy danh sách thẻ.",
    };
  }

  @Security("Bearer")
  @Security("Cookie")
  @Get("/{id}")
  public async getBookmarkById(
    @Path() id: number
  ): Promise<IResponse<Bookmark>> {
    const bookmark = await getBookmarkById(id);
    if (bookmark) {
      const data = removeKeyObject(bookmark, []) as Bookmark;
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 404,
      success: false,
      message: `Không tìm thấy thẻ với ID: ${id}.`,
    };
  }

  @Security("Bearer")
  @Security("Cookie")
  @Put("/{id}")
  public async updateBookmark(
    @Path() id: number,
    @Body() body: IUpdateBookmarkPayload
  ): Promise<IResponse<Bookmark>> {
    const bookmark = await updateBookmark(id, body);
    if (bookmark) {
      const data = removeKeyObject(bookmark, []) as Bookmark;
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 501,
      success: false,
      message: "Có lỗi xảy ra khi cập nhật thẻ.",
    };
  }

  @Security("Bearer")
  @Security("Cookie")
  @Delete("/{id}")
  public async deleteBookmark(
    @Path() id: number
  ): Promise<IResponse<{ message: string }>> {
    const isDeleted = await deleteBookmark(id);
    if (isDeleted) {
      return {
        code: 200,
        success: true,
        message: "Thẻ đã được xóa thành công.",
      };
    }
    return {
      code: 501,
      success: false,
      message: "Có lỗi xảy ra khi xóa thẻ.",
    };
  }
}
