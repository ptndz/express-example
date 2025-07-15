import { Router } from "express";
import ApiBotController from "../controllers/api/bot";
const router = Router();

router.post("/bot:token/sendMessage", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).send({
      code: 400,
      success: false,
      message: "Token is required.",
    });
  }
  const controller = new ApiBotController();

  const response = await controller.sendMessage(token, req.body);
  return res.status(response.code).send(response);
});
router.post("/bot:token/callbackQuery", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).send({
      code: 400,
      success: false,
      message: "Token is required.",
    });
  }
  const controller = new ApiBotController();

  const response = await controller.callbackQuery(token, req.body);
  return res.status(response.code).send(response);
});
router.post("/bot:token/getUpdates", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).send({
      code: 400,
      success: false,
      message: "Token is required.",
    });
  }
  const { offset = 0, limit = 100 } = req.body;
  const controller = new ApiBotController();

  const response = await controller.getUpdates(token, offset, limit);
  return res.status(response.code).send(response);
});
router.post("/bot:token/setWebhook", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(400).send({
      code: 400,
      success: false,
      message: "Token is required.",
    });
  }
  const controller = new ApiBotController();

  const response = await controller.setWebhook(token, req.body);
  return res.status(response.code).send(response);
});

export default router;
