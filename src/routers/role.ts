import { Router } from "express";
import RoleController from "../controllers/role";
import { body, param } from "express-validator";
import { authAccessToken, hasPermission, validate } from "../middlewares";

const router = Router();

router.post(
	"/",
	authAccessToken,
	hasPermission("role", "create"),
	validate([body("name").isLength({ min: 2 }), body("description"), body("root").isBoolean()]),
	async (req, res) => {
		const controller = new RoleController();
		const response = await controller.createRole(req.body);
		return res.status(response.code).send(response);
	}
);

router.get("/", authAccessToken, hasPermission("role", "list"), async (_req, res) => {
	const controller = new RoleController();
	const response = await controller.getRoles();
	return res.status(response.code).send(response);
});

router.get(
	"/:id",
	authAccessToken,
	hasPermission("role", "detail"),
	validate([param("id").isNumeric()]),
	async (req, res) => {
		const controller = new RoleController();
		const id = req.params.id;
		const response = await controller.getRole(id);
		return res.status(response.code).send(response);
	}
);
router.put(
	"/:id",
	authAccessToken,
	hasPermission("role", "update"),
	validate([param("id").isNumeric()]),
	async (req, res) => {
		const controller = new RoleController();
		const id = req.params.id;
		const data = req.body;

		const response = await controller.updateRole(id, data);
		return res.status(response.code).send(response);
	}
);
export default router;
