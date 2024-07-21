import { Router } from "express";
import AuthController from "../controllers/auth";
import { body } from "express-validator";
import { validate } from "../middlewares";

const router = Router();

router.post(
	"/register",
	validate([
		body("username").isLength({ min: 5 }),
		body("email").isEmail(),
		body("firstName").trim(),
		body("lastName").trim(),
		body("password").isLength({ min: 5 }),
	]),
	async (req, res) => {
		const controller = new AuthController();

		const response = await controller.register(req.body);
		return res.status(response.code).send(response);
	}
);

router.post(
	"/login",
	validate([body("username").isLength({ min: 5 }), body("password").isLength({ min: 5 })]),
	async (req, res) => {
		const controller = new AuthController();
		const response = await controller.login(req.body);
		return res.status(response.code).send(response);
	}
);

export default router;
