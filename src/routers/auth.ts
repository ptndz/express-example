import { Router } from "express";
import { body } from "express-validator";
import AuthController from "../controllers/auth";
import { authAccessToken, validate } from "../middlewares";

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
	validate([body("username").isLength({ min: 4 }), body("password").isLength({ min: 5 })]),
	async (req, res) => {
		const controller = new AuthController();
		const response = await controller.login(req.body);
		return res.status(response.code).send(response);
	}
);
router.post(
	"/refresh-token",

	validate([body("refreshToken").isLength({ min: 5 })]),
	async (req, res) => {
		const controller = new AuthController();
		const response = await controller.refreshToken(req.body);
		return res.status(response.code).send(response);
	}
);
router.get("/me", authAccessToken, async (req, res) => {
	const controller = new AuthController();
	const response = await controller.getMe(req);
	return res.status(response.code).send(response);
});
export default router;
