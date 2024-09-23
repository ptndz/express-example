import { Repository } from "typeorm";
import addLog from "../config/addLog";
import { AppDataSource } from "../data-source";
import { Bookmark } from "../entity/Bookmark";
import { BookmarkTag } from "../entity/BookmarkTag";
import { Tag } from "../entity/Tag";
import { User } from "../entity/User";
import { Pagination } from "../types";

/**
 * Loại dữ liệu để tạo một bookmark mới.
 */
export type ICreateBookmarkPayload = {
  userId: string;
  url: string;
  title: string;
  description?: string;
  image: string;
  summarize?: string;
  tagIds?: number[]; // Mảng ID của các thẻ
};

/**
 * Loại dữ liệu để cập nhật một bookmark.
 */
export type IUpdateBookmarkPayload = Partial<{
  url: string;
  title: string;
  description: string;
  image: string;
  summarize?: string;
  tagIds: number[]; // Mảng ID của các thẻ
}>;

/**
 * Lấy Repository của các Entity cần thiết từ AppDataSource.
 */
const bookmarkRepository: Repository<Bookmark> =
  AppDataSource.getRepository(Bookmark);
const userRepository: Repository<User> = AppDataSource.getRepository(User);
const tagRepository: Repository<Tag> = AppDataSource.getRepository(Tag);
const bookmarkTagRepository: Repository<BookmarkTag> =
  AppDataSource.getRepository(BookmarkTag);

/**
 * Tạo một bookmark mới.
 * @param bookmarkPayload Dữ liệu bookmark cần tạo.
 * @returns Bookmark vừa được tạo hoặc `null` nếu có lỗi.
 */
export const createBookmark = async (
  bookmarkPayload: ICreateBookmarkPayload
): Promise<Bookmark | null> => {
  try {
    const { userId, tagIds, ...bookmarkData } = bookmarkPayload;

    // Tìm người dùng theo userId
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User với ID ${userId} không tồn tại.`);
    }

    // Tạo bookmark mới
    const bookmark = bookmarkRepository.create({
      ...bookmarkData,
      user: user,
    });

    // Lưu bookmark
    const savedBookmark = await bookmarkRepository.save(bookmark);

    // Nếu có tagIds, tạo các BookmarkTag liên kết
    if (tagIds && tagIds.length > 0) {
      const arrayTagIds: any = [];
      tagIds.map((id) => {
        arrayTagIds.push({
          id: id,
        });
      });
      const tags = await tagRepository.find({
        where: [...arrayTagIds],
      });
      const bookmarkTags = tags.map((tag) => {
        const bt = bookmarkTagRepository.create({
          bookmark: savedBookmark,
          tag: tag,
        });
        return bt;
      });
      await bookmarkTagRepository.save(bookmarkTags);
      // Gán lại các bookmarkTags cho bookmark
      savedBookmark.bookmarkTags = bookmarkTags;
    }

    // Lấy lại bookmark với các relations
    return await bookmarkRepository.findOne({
      where: { id: savedBookmark.id },
      relations: ["user", "bookmarkTags", "bookmarkTags.tag"],
    });
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

/**
 * Lấy thông tin bookmark theo ID.
 * @param id ID của bookmark.
 * @returns Bookmark nếu tìm thấy, ngược lại `null`.
 */
export const getBookmarkById = async (id: number): Promise<Bookmark | null> => {
  try {
    const bookmark = await bookmarkRepository.findOne({
      where: { id },
      relations: ["user", "bookmarkTags", "bookmarkTags.tag"],
    });
    return bookmark;
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

/**
 * Lấy danh sách bookmark với hỗ trợ phân trang.
 * @param pagination Thông tin phân trang.
 * @returns Đối tượng chứa danh sách bookmark và tổng số bookmark.
 */
export const getAllBookmarks = async (
  page = 1,
  limit = 2
): Promise<Pagination<Bookmark> | null> => {
  try {
    const [bookmarks, total] = await bookmarkRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createAt: "DESC" },
      relations: ["user", "bookmarkTags", "bookmarkTags.tag"],
    });
    const totalPages = Math.ceil(total / limit);
    return {
      total: total,
      per_page: limit,
      current_page: page,
      last_page: totalPages,
      items: bookmarks,
    };
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

/**
 * Cập nhật thông tin bookmark.
 * @param id ID của bookmark cần cập nhật.
 * @param bookmarkPayload Dữ liệu bookmark cần cập nhật.
 * @returns Bookmark sau khi được cập nhật hoặc `null` nếu có lỗi.
 */
export const updateBookmark = async (
  id: number,
  bookmarkPayload: IUpdateBookmarkPayload
): Promise<Bookmark | null> => {
  try {
    const { tagIds, ...updateData } = bookmarkPayload;

    // Tìm bookmark theo ID
    const bookmark = await bookmarkRepository.findOne({
      where: { id },
      relations: ["bookmarkTags", "bookmarkTags.tag"],
    });
    if (!bookmark) {
      return null;
    }

    // Cập nhật các thuộc tính cơ bản
    bookmarkRepository.merge(bookmark, updateData);
    const updatedBookmark = await bookmarkRepository.save(bookmark);

    // Nếu có tagIds, cập nhật các BookmarkTag liên kết
    if (tagIds) {
      // Xóa các BookmarkTag hiện tại
      await bookmarkTagRepository.delete({ bookmark: { id: bookmark.id } });

      // Tạo mới các BookmarkTag theo tagIds
      if (tagIds.length > 0) {
        const tags = await tagRepository.findByIds(tagIds);
        const newBookmarkTags = tags.map((tag) => {
          const bt = bookmarkTagRepository.create({
            bookmark: updatedBookmark,
            tag: tag,
          });
          return bt;
        });
        await bookmarkTagRepository.save(newBookmarkTags);
        // Gán lại các bookmarkTags cho bookmark
        updatedBookmark.bookmarkTags = newBookmarkTags;
      }
    }

    // Lấy lại bookmark với các relations
    return await bookmarkRepository.findOne({
      where: { id: updatedBookmark.id },
      relations: ["user", "bookmarkTags", "bookmarkTags.tag"],
    });
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

/**
 * Xóa bookmark theo ID.
 * @param id ID của bookmark cần xóa.
 * @returns `true` nếu xóa thành công, ngược lại `false`.
 */
export const deleteBookmark = async (id: number): Promise<boolean> => {
  try {
    const result = await bookmarkRepository.delete(id);
    return result.affected !== undefined;
  } catch (error: any) {
    addLog(error, "error");
    return false;
  }
};
