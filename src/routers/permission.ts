import { Router } from "express";
import PermissionController from "../controllers/permission";
import { body, param } from "express-validator";
import { validate } from "../middlewares";

const router = Router();

router.post(
	"/",
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

router.get("/", async (_req, res) => {
	const controller = new PermissionController();
	const response = await controller.getPermissions();
	return res.status(response.code).send(response);
});

router.get("/:id", validate([param("id").notEmpty().trim()]), async (req, res) => {
	const controller = new PermissionController();
	const id = req.params.id;
	const response = await controller.getPermissionByRoleId(id);
	return res.status(response.code).send(response);
});
export default router;
