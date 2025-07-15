import express from "express";
import * as fs from "fs";
import * as path from "path";
import { createGenericRouter } from "../routers/generic";

export const loadDynamicRouters = (): express.Router => {
  const apiRouter = express.Router();
  const definitionsPath = path.join(__dirname, "..", "definitions");

  const files = fs.readdirSync(definitionsPath);

  for (const file of files) {
    if (path.extname(file) === ".json") {
      const entityDefinition = JSON.parse(
        fs.readFileSync(path.join(definitionsPath, file), "utf-8")
      );

      const entityName = entityDefinition.name;
      const tableName = entityDefinition.tableName;
      const resourceName = tableName.slice(0, -1);

      console.log(`[RouterLoader] Creating routes for /${tableName}`);
      // Chỉ tạo router sau khi AppDataSource đã sẵn sàng
      const genericRouter = createGenericRouter(entityName, resourceName);
      apiRouter.use(`/${tableName}`, genericRouter);
    }
  }

  return apiRouter;
};
