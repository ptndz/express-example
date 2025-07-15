import { Router } from "express";
import * as fs from "fs/promises"; // Sử dụng fs/promises để làm việc với async/await
import * as path from "path";
import { authAccessToken } from "../middlewares"; // Giả sử chỉ admin mới có quyền

// Middleware để kiểm tra quyền admin (bạn có thể tự định nghĩa)
// import { isAdmin } from "../middlewares/permission";

const router = Router();
const definitionsPath = path.join(__dirname, "../definitions");

// Helper function để đảm bảo thư mục tồn tại
const ensureDirectoryExists = async () => {
  try {
    await fs.access(definitionsPath);
  } catch (error) {
    await fs.mkdir(definitionsPath, { recursive: true });
  }
};

/**
 * POST /api/v1/entity-definitions
 * Tạo một file định nghĩa entity mới.
 * Body: { "name": "Category", "tableName": "categories", "columns": { ... } }
 */
router.post(
  "/",
  authAccessToken,
  /* isAdmin, */ async (req, res) => {
    try {
      const definition = req.body;
      if (!definition.name) {
        return res
          .status(400)
          .json({ success: false, message: "Entity 'name' is required." });
      }

      const fileName = `${definition.name.toLowerCase()}.entity.json`;
      const filePath = path.join(definitionsPath, fileName);

      await ensureDirectoryExists();
      await fs.writeFile(filePath, JSON.stringify(definition, null, 2));

      return res.status(201).json({
        success: true,
        message: `Entity definition '${definition.name}' created. Please restart the server to apply changes.`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create entity definition.",
        error,
      });
    }
  }
);

/**
 * GET /api/v1/entity-definitions
 * Lấy danh sách tất cả các định nghĩa hiện có.
 */
router.get(
  "/",
  authAccessToken,
  /* isAdmin, */ async (_req, res) => {
    try {
      await ensureDirectoryExists();
      const files = await fs.readdir(definitionsPath);
      const definitions = [];

      for (const file of files) {
        if (path.extname(file) === ".json") {
          const content = await fs.readFile(
            path.join(definitionsPath, file),
            "utf-8"
          );
          definitions.push(JSON.parse(content));
        }
      }
      res.json({ success: true, data: definitions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve definitions.",
        error,
      });
    }
  }
);

/**
 * DELETE /api/v1/entity-definitions/:name
 * Xóa một file định nghĩa.
 */
router.delete(
  "/:name",
  authAccessToken,
  /* isAdmin, */ async (req, res) => {
    try {
      const entityName = req.params.name.toLowerCase();
      const fileName = `${entityName}.entity.json`;
      const filePath = path.join(definitionsPath, fileName);

      await fs.unlink(filePath);

      res.json({
        success: true,
        message: `Entity definition '${entityName}' deleted. Please restart the server to apply changes.`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete definition.",
        error,
      });
    }
  }
);

// Bạn có thể tự viết thêm cho GET /:name (lấy chi tiết) và PUT /:name (cập nhật)
// theo logic tương tự.

export const definitionRouter = router;
