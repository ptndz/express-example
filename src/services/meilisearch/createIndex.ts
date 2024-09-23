import dotenv from "dotenv";

dotenv.config();

import { Index, MeiliSearch } from "meilisearch";
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST as string,
  apiKey: process.env.MEILISEARCH_API_KEY as string,
});

export async function createIndex(
  indexName: string,
  primaryKey: string
): Promise<Index<Record<string, any>>> {
  try {
    const task = await client.createIndex(indexName, { primaryKey });
    console.log(`Index "${task.indexUid}" đã được tạo thành công.`);
    const index = client.index(task.indexUid || indexName);
    return index;
  } catch (error: any) {
    if (error.code === "index_already_exists") {
      console.log(`Index "${indexName}" đã tồn tại.`);
      return client.getIndex(indexName);
    } else {
      console.error("Error creating index:", error);
      throw error;
    }
  }
}
