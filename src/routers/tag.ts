import { Router } from "express";
import { body, param, query } from "express-validator";
import TagController from "../controllers/tag";
import { authAccessToken, hasPermission, validate } from "../middlewares";

const router = Router();
const controller = new TagController();

router.post(
  "/",
  authAccessToken,
  hasPermission("tag", "create"),
  validate([
    body("name")
      .isLength({ min: 1 })
      .withMessage("Tên thẻ không được để trống")
      .trim()
      .escape(),
  ]),
  async (req, res) => {
    const response = await controller.createTag(req.body);
    return res.status(response.code).send(response);
  }
);

/**
 * @route GET /tags
 * @desc Lấy danh sách tất cả các thẻ với hỗ trợ phân trang
 * @access Bảo mật (Bearer hoặc Cookie)
 */
router.get(
  "/",
  authAccessToken,
  hasPermission("tag", "list"),
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

    const response = await controller.getAllTags(page, limit);
    return res.status(response.code).send(response);
  }
);

/**
 * @route GET /tags/:id
 * @desc Lấy thông tin thẻ theo ID
 * @access Bảo mật (Bearer hoặc Cookie)
 */
router.get(
  "/:id",
  authAccessToken,
  hasPermission("tag", "detail"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.getTagById(id);
    return res.status(response.code).send(response);
  }
);

router.put(
  "/:id",
  authAccessToken,
  hasPermission("tag", "update"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
    body("name")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Tên thẻ không được để trống")
      .trim()
      .escape(),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.updateTag(id, req.body);
    return res.status(response.code).send(response);
  }
);

/**
 * @route DELETE /tags/:id
 * @desc Xóa thẻ theo ID
 * @access Bảo mật (Bearer hoặc Cookie)
 */
router.delete(
  "/:id",
  authAccessToken,
  hasPermission("tag", "delete"),
  validate([
    param("id")
      .isInt({ min: 1 })
      .withMessage("ID phải là số nguyên lớn hơn hoặc bằng 1"),
  ]),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const response = await controller.deleteTag(id);
    return res.status(response.code).send(response);
  }
);

export default router;
