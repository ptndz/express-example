
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
import { Tag } from "../entity/Tag";
import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from "../services/tag";
import { IResponse, Pagination } from "../types";
import { removeKeyObject } from "../utils";

@Route("tags")
@Tags("Tag")
export default class TagController {

  @Security("Bearer")
  @Security("Cookie")
  @Post("/")
  public async createTag(
    @Body() body: { name: string }
  ): Promise<IResponse<Tag>> {
    const tag = await createTag(body);
    if (tag) {
      // Không có trường nào cần loại bỏ trong Tag, nhưng nếu có, hãy thêm vào đây
      const data = removeKeyObject(tag, []) as Tag;
      return {
        code: 200,
        success: true,
        data: data,
      };
    }
    return {
      code: 501,
      success: false,
      message: "Có lỗi xảy ra khi tạo thẻ.",
    };
  }

  @Security("Bearer")
  @Security("Cookie")
  @Get("/")
  public async getAllTags(
    @Query("page") page: number,
    @Query("limit") limit: number
  ): Promise<IResponse<Pagination<Tag>>> {
    const tagsResult = await getAllTags(page, limit);
    if (tagsResult) {
      return {
        code: 200,
        success: true,
        data: tagsResult,
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
  public async getTagById(@Path() id: number): Promise<IResponse<Tag>> {
    const tag = await getTagById(id);
    if (tag) {
      const data = removeKeyObject(tag, []) as Tag;
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
  public async updateTag(
    @Path() id: number,
    @Body() body: { name?: string }
  ): Promise<IResponse<Tag>> {
    const tag = await updateTag(id, body);
    if (tag) {
      const data = removeKeyObject(tag, []) as Tag;
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
  public async deleteTag(
    @Path() id: number
  ): Promise<IResponse<{ message: string }>> {
    const isDeleted = await deleteTag(id);
    if (isDeleted) {
      return {
        code: 200,
        success: true,
        data: { message: "Thẻ đã được xóa thành công." },
      };
    }
    return {
      code: 501,
      success: false,
      message: "Có lỗi xảy ra khi xóa thẻ.",
    };
  }
}
