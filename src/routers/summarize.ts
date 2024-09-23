import { Router } from "express";
import SummarizeController from "../controllers/summarize";
import { authAccessToken } from "../middlewares";

const router = Router();
const controller = new SummarizeController();

router.get("/", authAccessToken, async (req, res) => {
  const url = req.query.url as string;
  const response = await controller.summarizeWeb(url);
  return res.status(response.code).send(response);
});

export default router;
