import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import path from "path";
import { ParsedQs } from "qs";
import "reflect-metadata";
import { Server as SocketIO } from "socket.io";
import swaggerUi from "swagger-ui-express";
import addLog from "./config/addLog";
import configureMorgan from "./config/log";
import { ORIGIN, __prod__ } from "./constants";
import { AppDataSource } from "./data-source";

import { socketMiddleware } from "./middlewares";
import { setupRouters } from "./routers";
import socket from "./routers/socket";
import { generateMergedSwaggerSpec } from "./swagger";
import { i18n, setLocale } from "./translation";
dotenv.config();

const logDirectory = path.join(__dirname, "logs");
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
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    __prod__ ? configureMorgan(app, logDirectory) : app.use(morgan("dev"));

    app.set("trust proxy", 1);

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );
    app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
    app.use(
      compression({
        level: 6,
        threshold: 100 * 1000,
        filter: shouldCompress,
      })
    );

    function shouldCompress(
      req: express.Request<
        ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
      >,
      res: express.Response
    ) {
      if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
      }
      // fallback to standard filter function
      return compression.filter(req, res);
    }

    app.use(express.static("public"));
    const mergedSwaggerSpec = generateMergedSwaggerSpec();
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(mergedSwaggerSpec));
    app.use(setLocale);
    const apiRouter = await setupRouters();
    app.use("/", apiRouter);
    app.use((_req, res) => {
      res.status(404).json({
        code: 404,
        success: false,
        message: i18n.t("response.trangKhongTonTai"),
      });
    });

    const io = new SocketIO(server, {
      cors: {
        origin: ORIGIN,
        credentials: true,
      },
    });

    io.engine.use(
      helmet({
        crossOriginResourcePolicy: false,
      })
    );
    io.use((socket, next) => {
      socketMiddleware(socket, next);
    });
    socket(io);
    // startSync();
    server.listen(port, () => {
      process.on("exit", function () {
        server.close();
      });
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error: any) => {
    addLog(error, "error");
    console.error(error);
  });
