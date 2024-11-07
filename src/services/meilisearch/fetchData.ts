import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Bookmark } from "../../entity/Bookmark";

export interface BookmarkData {
  id: number;
  title: string;
  url: string;
  image: string;
  description: string | null;
  summarize: string | null;
  tags: string[]; // Chỉ lưu tên tag
}

export async function fetchData(): Promise<BookmarkData[]> {
  const bookmarkRepository: Repository<Bookmark> =
    AppDataSource.getRepository(Bookmark);
  try {
    const bookmarks = await bookmarkRepository.find({
      relations: ["bookmarkTags", "bookmarkTags.tag"],
    });

    // Chuyển đổi dữ liệu để phù hợp với MeiliSearch
    const transformedData: BookmarkData[] = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      image: bookmark.image,
      description: bookmark.description,
      summarize: bookmark.summarize,
      tags: bookmark.bookmarkTags.map((bookmarkTag) => bookmarkTag.tag.name),
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching data from MySQL:", error);
    throw error;
  }
}
