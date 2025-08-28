import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import { Server as SocketIO } from "socket.io";
import swaggerUi from "swagger-ui-express";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { execute, subscribe } from "graphql";
import type { ServerCleanup } from "graphql-ws";
import addLog from "./config/addLog";
import configureMorgan from "./config/log";
import { ORIGIN, __prod__ } from "./constants";
import { AppDataSource, initDataSource } from "./data-source";

import { socketMiddleware, csrfProtection, authAccessToken } from "./middlewares";
import { setupRouters } from "./routers";
import socket from "./routers/socket";
import { generateMergedSwaggerSpec } from "./swagger";
import { i18n, setLocale } from "./translation";
import { makeExecutableDocuments } from "./graphql";
dotenv.config();

const logDirectory = path.join(__dirname, "logs");
let isReloading = false;
const waitForUnlock = () =>
  new Promise<void>((resolve) => {
    if (!isReloading) return resolve();
    const timer = setInterval(() => {
      if (!isReloading) {
        clearInterval(timer);
        resolve();
      }
    }, 10);
  });

initDataSource()
  .then(async () => {
    const app: Express = express();
    const server = new http.Server(app);

    const port = process.env.PORT;

    // Middleware để chờ mutex khi reload
    app.use(async (_req, _res, next) => {
      await waitForUnlock();
      next();
    });

    app.use(express.json({ limit: "64mb" }));
    app.use(express.urlencoded({ limit: "64mb", extended: true }));
    app.use(cookieParser());
    app.use(csrfProtection);
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

    function shouldCompress(req: Request, res: Response) {
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
    let { schema, middleware: graphqlMiddleware } = await makeExecutableDocuments();
    app.use("/graphql", authAccessToken, (req, res, next) =>
      graphqlMiddleware(req, res, next)
    );
    const wsServer = new WebSocketServer({ server, path: "/graphql" });
    let serverCleanup: ServerCleanup = useServer(
      {
        schema,
        execute,
        subscribe,
        context: (ctx) => ({ req: ctx.extra.request as any }),
      },
      wsServer
    );
    app.get("/csrf-token", (req, res) => {
      res.json({ csrfToken: req.cookies["csrf-token"] });
    });
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

    const watcher = chokidar.watch(
      path.join(__dirname, "definitions", "*.json"),
      { ignoreInitial: true }
    );
    watcher.on("all", async () => {
      isReloading = true;
      try {
        await AppDataSource.destroy();
        await initDataSource();
        const result = await makeExecutableDocuments();
        schema = result.schema;
        graphqlMiddleware = result.middleware;
        await serverCleanup.dispose();
        serverCleanup = useServer(
          {
            schema,
            execute,
            subscribe,
            context: (ctx) => ({ req: ctx.extra.request as any }),
          },
          wsServer
        );
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          isReloading = false;
        }, 300);
      }
    });

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
