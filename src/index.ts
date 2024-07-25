import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ORIGIN, __prod__ } from "./constants";
import socket from "./routers/socket";
import { socketMiddleware } from "./middlewares/auth";
import router from "./routers";
import { AppDataSource } from "./data-source";
import swaggerUi from "swagger-ui-express";

AppDataSource.initialize()
	.then(async () => {
		const app: Express = express();
		const server = new http.Server(app);

		const port = process.env.PORT;

		app.use(express.json({ limit: "64mb" }));
		app.use(express.urlencoded({ limit: "64mb", extended: true }));
		app.use(cookieParser());
		app.use(
			cors({
				origin: ORIGIN,
				methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
				credentials: true,
				optionsSuccessStatus: 200,
			})
		);

		app.use(morgan("dev"));
		app.set("trust proxy", 1);

		app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
		app.use(
			compression({
				level: 6,
				threshold: 100 * 1000,
				filter: shouldCompress,
			})
		);

		function shouldCompress(
			req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
			res: express.Response<any, Record<string, any>>
		) {
			if (req.headers["x-no-compression"]) {
				// don't compress responses with this request header
				return false;
			}
			// fallback to standard filter function
			return compression.filter(req, res);
		}
		app.use(express.static("public"));
		app.use(
			"/docs",
			swaggerUi.serve,
			swaggerUi.setup(undefined, {
				swaggerOptions: {
					url: "/swagger.json",
				},
			})
		);
		app.use("/", router);
		const io = new SocketIO(server, {
			cors: {
				origin: ORIGIN,
				credentials: true,
			},
		});

		io.engine.use(helmet());
		io.use((socket, next) => {
			socketMiddleware(socket, next);
		});
		socket(io);

		server.listen(port, () => {
			process.on("exit", function () {
				server.close();
			});
			console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
		});
	})
	.catch((error: any) => console.error(error));
