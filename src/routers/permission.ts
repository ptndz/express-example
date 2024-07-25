import { Router } from "express";
import PermissionController from "../controllers/permission";
import { body, param } from "express-validator";
import { authAccessToken, hasPermission, validate } from "../middlewares";

const router = Router();

router.post(
	"/",
	authAccessToken,
	hasPermission("permissions", "create"),
	validate([
		body("role_id").optional().isNumeric().withMessage("roleId should be a numeric value"),
		body("resource").trim(),
		body("value").trim(),
	]),
	async (req, res) => {
		const controller = new PermissionController();

		const response = await controller.createPermission(req.body);
		return res.status(response.code).send(response);
	}
);

router.get("/", authAccessToken, hasPermission("permissions", "list"), async (_req, res) => {
	const controller = new PermissionController();
	const response = await controller.getPermissions();
	return res.status(response.code).send(response);
});

router.get("/list", authAccessToken, async (_req, res) => {
	const controller = new PermissionController();
	const response = await controller.getList();
	return res.status(response.code).send(response);
});
router.get(
	"/:id",
	authAccessToken,
	hasPermission("permissions", "detail"),
	validate([param("id").notEmpty().trim()]),
	async (req, res) => {
		const controller = new PermissionController();
		const id = req.params.id;
		const response = await controller.getPermissionByRoleId(id);
		return res.status(response.code).send(response);
	}
);
router.put(
	"/:id",
	authAccessToken,
	hasPermission("permissions", "update"),

	async (req, res) => {
		const controller = new PermissionController();
		const id = req.params.id;
		const data = req.body;
		const response = await controller.updatePermission(id, data);
		return res.status(response.code).send(response);
	}
);
router.delete(
	"/:id",
	authAccessToken,
	hasPermission("permissions", "delete"),

	async (req, res) => {
		const controller = new PermissionController();
		const id = req.params.id;
		const response = await controller.deletePermission(id);
		return res.status(response.code).send(response);
	}
);
export default router;
