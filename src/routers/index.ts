import {Request, Response, Router} from "express";
import useUser from "./user";
import useRole from "./role";
import useAuth from "./auth";
import usePermission from "./permission";
import useFile from "./file";
import {i18n} from "../translation";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    res.send(i18n.t("response.xinchao"));
});
router.get("/.env", (_req: Request, res: Response) => {
    res.status(404).json({
        code: 404,
        success: false,
        message: i18n.t("response.trangKhongTonTai")
    });
});
router.get("/.git/config", (_req: Request, res: Response) => {
    res.status(404).json({
        code: 404,
        success: false,
        message: i18n.t("response.trangKhongTonTai")
    });
});
router.use("/users", useUser);
router.use("/roles", useRole);
router.use("/permissions", usePermission);
router.use("/auth", useAuth);
router.use("/files", useFile);

export default router;
