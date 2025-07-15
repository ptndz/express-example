import { Request, Response, Router } from "express";
import { loadDynamicRouters } from "../loaders/dynamic-router.loader";
import { i18n } from "../translation";
import useApiBot from "./api";
import useAuth from "./auth";
import useBookmark from "./bookmark";
import { definitionRouter } from "./definition";
import useFile from "./file";
import usePermission from "./permission";
import useRole from "./role";
import useSummarize from "./summarize";
import useTag from "./tag";
import useUser from "./user";
export const setupRouters = async (): Promise<Router> => {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.send(i18n.t("response.xinchao"));
  });
  router.get("/.env", (_req: Request, res: Response) => {
    res.status(404).json({
      code: 404,
      success: false,
      message: i18n.t("response.trangKhongTonTai"),
    });
  });
  router.get("/.git/config", (_req: Request, res: Response) => {
    res.status(404).json({
      code: 404,
      success: false,
      message: i18n.t("response.trangKhongTonTai"),
    });
  });
  router.use("/users", useUser);
  router.use("/roles", useRole);
  router.use("/permissions", usePermission);
  router.use("/auth", useAuth);
  router.use("/files", useFile);
  router.use("/tags", useTag);
  router.use("/bookmarks", useBookmark);
  router.use("/summarize", useSummarize);
  router.use("/api", useApiBot);
  router.use("/api/v1/entity-definitions", definitionRouter);
  const dynamicRouter = await loadDynamicRouters();
  router.use("/api/v1", dynamicRouter);
  return router;
};
