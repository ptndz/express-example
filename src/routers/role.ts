import { Router } from "express";
import RoleController from "../controllers/role";
import { body, param } from "express-validator";
import { validate } from "../middlewares";

const router = Router();

router.post(
	"/",
	validate([body("name").isLength({ min: 5 }), body("description"), body("root")]),
	async (req, res) => {
		const controller = new RoleController();
		const response = await controller.createRole(req.body);
		return res.send(response);
	}
);

router.get("/", async (_req, res) => {
	const controller = new RoleController();
	const response = await controller.getRoles();
	return res.send(response);
});

router.get("/:id", validate([param("id").isNumeric()]), async (req, res) => {
	const controller = new RoleController();
	const id = req.params.id;
	const response = await controller.getRole(id);
	return res.send(response);
});
export default router;
