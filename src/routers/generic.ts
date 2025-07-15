import { Router } from "express";
import { authAccessToken, hasPermission } from "../middlewares"; // Import từ file index của middlewares
import { createGenericService } from "../services/generic";

// Hàm tạo router động
export const createGenericRouter = (
  entityName: string,
  resourceName: string
) => {
  const router = Router();

  const service = createGenericService(entityName);

  // Lấy danh sách (READ)
  router.get(
    "/",
    authAccessToken,
    hasPermission(resourceName as any, "list"),
    async (req, res) => {
      try {
        // Đọc các tham số từ query string
        const relations = req.query.relations
          ? (req.query.relations as string).split(",")
          : [];
        const select = req.query.fields
          ? (req.query.fields as string).split(",")
          : [];
        const exclude = req.query.exclude
          ? (req.query.exclude as string).split(",")
          : [];

        const items = await service.findAll({ relations, select, exclude });
        res.json({ success: true, data: items });
      } catch (e) {
        res.status(500).json({ success: false, error: (e as Error).message });
      }
    }
  );

  router.get(
    "/:id",
    authAccessToken,
    hasPermission(resourceName as any, "detail"),
    async (req, res) => {
      try {
        // Đọc các tham số từ query string
        const relations = req.query.relations
          ? (req.query.relations as string).split(",")
          : [];
        const select = req.query.fields
          ? (req.query.fields as string).split(",")
          : [];
        const exclude = req.query.exclude
          ? (req.query.exclude as string).split(",")
          : [];

        const item = await service.findOne(req.params.id, {
          relations,
          select,
          exclude,
        });
        if (!item) {
          return res
            .status(404)
            .json({ success: false, message: `${entityName} not found` });
        }
        return res.json({ success: true, data: item });
      } catch (e) {
        return res
          .status(500)
          .json({ success: false, error: (e as Error).message });
      }
    }
  );

  // Tạo mới (CREATE)
  router.post(
    "/",
    authAccessToken,
    hasPermission(resourceName as any, "create"),
    async (req, res) => {
      const newItem = await service.create(req.body);
      res.status(201).json({ success: true, data: newItem });
    }
  );

  // Cập nhật (UPDATE)
  router.put(
    "/:id",
    authAccessToken,
    hasPermission(resourceName as any, "update"),
    async (req, res) => {
      await service.update(req.params.id, req.body);
      const updatedItem = await service.findOne(req.params.id);
      res.json({ success: true, data: updatedItem });
    }
  );

  // Xóa (DELETE)
  router.delete(
    "/:id",
    authAccessToken,
    hasPermission(resourceName as any, "delete"),
    async (req, res) => {
      await service.delete(req.params.id);
      res.status(204).send();
    }
  );

  return router;
};
