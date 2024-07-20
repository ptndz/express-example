import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Socket } from "socket.io";
import { Request } from "express-serve-static-core";
export const socketMiddleware = async (
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
	next: {
		(err?: ExtendedError | undefined): void;
		(arg0: Error | undefined): void;
	}
) => {
	let req = socket.request as Request;
	console.log(req);

	const accessToken = socket.handshake.auth.token;
	if (!accessToken) {
		next(new Error("Socket authentication error"));
	}

	// const decodedUser = await JwtVerifyAccessToken(accessToken as string);
	// if (decodedUser.error) {
	//   next(new Error("Socket authentication error"));
	// }

	// req.user = decodedUser.data?.user;
	next();
};
