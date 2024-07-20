import { Request, Response, Router } from "express";
import useUser from "./user";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
	res.send("Server");
});
router.use("/users", useUser);

export default router;
