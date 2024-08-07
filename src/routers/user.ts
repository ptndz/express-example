import { Router } from "express";
import UserController from "../controllers/user";
import { body, param } from "express-validator";
import { authAccessToken, hasPermission, validate } from "../middlewares";

const router = Router();

router.post(
	"/",
	authAccessToken,
	hasPermission("user", "create"),
	validate([
		body("username").isLength({ min: 5 }),
		body("email").isEmail(),
		body("firstName").trim(),
		body("lastName").trim(),
		body("password").isLength({ min: 5 }),
		body("roleId").optional().isNumeric().withMessage("roleId should be a numeric value"),
	]),
	async (req, res) => {
		const controller = new UserController();

		const response = await controller.createUser(req.body);
		return res.status(response.code).send(response);
	}
);

router.get("/", authAccessToken, hasPermission("user", "list"), async (_req, res) => {
	const controller = new UserController();
	const response = await controller.getUsers();
	return res.status(response.code).send(response);
});

router.get(
	"/:id",
	authAccessToken,
	hasPermission("user", "detail"),
	validate([param("id").notEmpty().trim()]),
	async (req, res) => {
		const controller = new UserController();
		const id = req.params.id;
		const response = await controller.getUser(id);
		return res.status(response.code).send(response);
	}
);
export default router;
