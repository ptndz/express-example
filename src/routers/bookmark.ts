import { Router } from "express";
import { body, param, query } from "express-validator";
import BookmarkController from "../controllers/bookmark";
import { authAccessToken, hasPermission, validate } from "../middlewares";

const router = Router();
const controller = new BookmarkController();

router.post(
  "/",
  authAccessToken,
  hasPermission("bookmark", "create"),
  validate([
    body("url")
      .isLength({ min: 1 })
      .withMessage("URL không được để trống")
      .trim(),

    body("title")
      .isLength({ min: 1 })
      .withMessage("Tiêu đề không được để trống")
      .trim()
      .escape(),
    body("image")
      .isLength({ min: 1 })
      .withMessage("ảnh không được để trống")
      .trim(),

    body("tagIds").optional().isArray().withMessage("TagIds phải là một mảng"),
    body("description")
      .isLength({ min: 1 })
      .withMessage("ảnh không được để trống")
      .trim()
      .escape(),
  ]),
  async (req, res) => {
    const userId = req.userId;
    req.body.userId = userId;

    const response = await controller.createBookmark(req.body);
    return res.status(response.code).send(response);
  }
);

router.get(
  "/",
  authAccessToken,
  hasPermission("bookmark", "list"),
  validate([
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page phải là số nguyên lớn hơn hoặc bằng 1"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit phải là số nguyên lớn hơn hoặc bằng 1"),
  ]),
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const response = await controller.getAllBookmarks(page, limit);
    return res.status(response.code).send(response);
  }
);

router.get(
  "/:id",
  authAccessToken,
  hasPermission("bookmark", "detail"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.getBookmarkById(id);
    return res.status(response.code).send(response);
  }
);

router.put(
  "/:id",
  authAccessToken,
  hasPermission("bookmark", "update"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
    body("url")
      .isLength({ min: 1 })
      .withMessage("URL không được để trống")
      .trim(),
    body("title")
      .isLength({ min: 1 })
      .withMessage("Tiêu đề không được để trống")
      .trim()
      .escape(),
    body("image")
      .isLength({ min: 1 })
      .withMessage("ảnh không được để trống")
      .trim(),
    body("tagIds").optional().isArray().withMessage("TagIds phải là một mảng"),
    body("description")
      .isLength({ min: 1 })
      .withMessage("ảnh không được để trống")
      .trim()
      .escape(),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.updateBookmark(id, req.body);
    return res.status(response.code).send(response);
  }
);

router.delete(
  "/:id",
  authAccessToken,
  hasPermission("bookmark", "delete"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.deleteBookmark(id);
    return res.status(response.code).send(response);
  }
);

export default router;
