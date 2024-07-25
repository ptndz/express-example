import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
import { Request, Response, NextFunction } from "express-serve-static-core";
import { JwtVerifyAccessToken } from "../utils";

export const authAccessToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.header("Authorization")
			? req.header("Authorization")?.split(" ")[1]
			: req.cookies["token"];

		if (!accessToken) {
			return res.status(403).json({
				code: 403,
				success: false,
				message: "Access token provided!",
			});
		}
		const decodedUser = await JwtVerifyAccessToken(accessToken as string);
		if (decodedUser.error) {
			return res.status(401).send({
				code: 403,
				success: false,
				message: decodedUser.error.message,
			});
		}

		req.userId = decodedUser.data?.userId;
		return next();
	} catch (error) {
		return res.status(500).json({
			code: 500,
			success: false,
			message: "Server",
		});
	}
};

export const socketMiddleware = async (
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
	next: {
		(err?: ExtendedError | undefined): void;
		(arg0: Error | undefined): void;
	}
) => {
	let req = socket.request as Request;

	const accessToken = socket.handshake.auth.token;
	if (!accessToken) {
		next(new Error("Socket authentication error"));
	}

	const decodedUser = await JwtVerifyAccessToken(accessToken as string);
	if (decodedUser.error) {
		next(new Error("Socket authentication error"));
	}

	req.userId = decodedUser.data?.userId;
	next();
};
