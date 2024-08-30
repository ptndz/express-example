import {Route, Tags, Post, Security, Request, Body} from "tsoa";
import {IResponse} from "../types";
import {createDevice, getDeviceByUserId} from "../services/device";
import * as express from "express";
import {getUser} from "../services/user";
import {AppDataSource} from "../data-source";

@Route("notification")
@Tags("Notification")
export default class NotificationController {
    @Security("Bearer")
    @Post("/subscription")
    public async createDevice(
        @Body() body: {
            subscription: string, agent: string
        },
        @Request() req: express.Request
    ): Promise<IResponse<string>> {
        if (req.userId) {
            const existingUser = await getUser(req.userId);
            if (!existingUser) {
                return {
                    code: 404,
                    success: false,
                    message: "Not found",
                };

            }
            const existingDevice = await getDeviceByUserId(req.userId);

            const ip = req.ip || "0";

            if (existingDevice) {
                existingDevice.ip = ip;
                existingDevice.agent = body.agent;
                existingDevice.subscription = JSON.stringify(body.subscription);
                await AppDataSource.manager.save(existingDevice);
            }

            await createDevice({
                ip: ip,
                subscription: JSON.stringify(body.subscription),
                agent: body.agent,
                user: existingUser
            });

            return {
                code: 200,
                success: true,
                message: "Success",
                data: ip
            }
        }
        return {
            code: 401,
            success: false,
            message: "Unauthorized"
        };
    }
}