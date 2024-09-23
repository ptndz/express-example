import dotenv from "dotenv";
import { Index, MeiliSearch } from "meilisearch";
import cron from "node-cron";
import { AppDataSource } from "../../data-source";
import { createIndex } from "./createIndex";
import { BookmarkData, fetchData } from "./fetchData";

dotenv.config();

const BATCH_SIZE = 1000;

export async function syncData(client: MeiliSearch): Promise<void> {
  try {
    // Bước 1: Kết nối TypeORM
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("TypeORM đã được kết nối.");
    }

    // Bước 2: Lấy dữ liệu từ MySQL
    const data: BookmarkData[] = await fetchData();
    console.log(`Đã lấy ${data.length} bản ghi từ MySQL.`);

    // Bước 3: Tạo hoặc lấy index từ MeiliSearch
    const indexName = "bookmarks"; // Thay bằng tên index bạn muốn
    const primaryKey = "id"; // Thay bằng trường chính của bạn
    const index: Index = await createIndex(indexName, primaryKey);

    // Bước 4: Đẩy dữ liệu vào MeiliSearch theo lô
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch: BookmarkData[] = data.slice(i, i + BATCH_SIZE);
      const response = await index.addDocuments(batch);
      await client.waitForTask(response.taskUid);
      console.log(`Đã đẩy batch từ ${i} đến ${i + batch.length}`);
    }

    console.log("Đồng bộ dữ liệu thành công.");
  } catch (error) {
    console.error("Error syncing data:", error);
  }
}

export async function startSync() {
  const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST as string,
    apiKey: process.env.MEILISEARCH_API_KEY as string,
  });

  // Thiết lập cron job để đồng bộ dữ liệu mỗi giờ
  const cronSchedule = process.env.CRON_SCHEDULE || "0 * * * *"; // Mặc định: mỗi giờ

  cron.schedule(cronSchedule, () => {
    console.log("Bắt đầu đồng bộ dữ liệu vào MeiliSearch...");
    syncData(client);
  });

  console.log(
    `Cron job đã được thiết lập để đồng bộ dữ liệu theo lịch: "${cronSchedule}".`
  );
}
