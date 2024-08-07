import { Request, Response, Router } from "express";
import useUser from "./user";
import useRole from "./role";
import useAuth from "./auth";
import usePermission from "./permission";
const router = Router();

router.get("/", (_req: Request, res: Response) => {
	res.send("Server");
});
router.use("/users", useUser);
router.use("/roles", useRole);
router.use("/permissions", usePermission);
router.use("/auth", useAuth);

export default router;
