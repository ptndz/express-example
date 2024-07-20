import { Socket } from "socket.io";
import { Request } from "express-serve-static-core";
export default function (io: Socket | any) {
	io.on("connection", async function (socket: Socket | any) {
		const req = socket.request as Request;
		const uuid = req.user?.id;
		console.log(uuid);
	});
}
