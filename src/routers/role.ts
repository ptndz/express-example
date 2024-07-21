import { Router } from "express";
import RoleController from "../controllers/role";
import { body, param } from "express-validator";
import { validate } from "../middlewares";

const router = Router();

router.post(
	"/",
	validate([body("name").isLength({ min: 2 }), body("description"), body("root").isBoolean()]),
	async (req, res) => {
		const controller = new RoleController();
		const response = await controller.createRole(req.body);
		return res.status(response.code).send(response);
	}
);

router.get("/", async (_req, res) => {
	const controller = new RoleController();
	const response = await controller.getRoles();
	return res.status(response.code).send(response);
});

router.get("/:id", validate([param("id").isNumeric()]), async (req, res) => {
	const controller = new RoleController();
	const id = req.params.id;
	const response = await controller.getRole(id);
	return res.status(response.code).send(response);
});
export default router;
