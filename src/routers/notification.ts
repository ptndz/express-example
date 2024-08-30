import {Request, Response, Router} from "express";
import NotificationController from "../controllers/notification";

const router = Router();

router.post(
    "/subscription",
    async (req: Request, res: Response) => {
        const {subscription, agent} = req.body;
        const controller = new NotificationController();
        const response = await controller.createDevice(subscription, agent)
        return res.status(response.code).json(response)
    }
);

export default router;
