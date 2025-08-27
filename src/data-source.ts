import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { Bookmark } from "./entity/Bookmark";
import { BookmarkTag } from "./entity/BookmarkTag";
import { Bot } from "./entity/Bot";
import { CallbackQuery } from "./entity/CallbackQuery";
import { Device } from "./entity/Device";
import { File } from "./entity/File";
import { Message } from "./entity/Message";
import { Permissions } from "./entity/Permissions";
import { Role } from "./entity/Role";
import { Tag } from "./entity/Tag";
import { User } from "./entity/User";
import { loadDynamicEntities } from "./loaders/entity.loader";
import type { DynamicRegistry } from "./loaders/entity.loader";

// Tải các entity động từ file JSON
const definitionsDir = path.join(__dirname, "definitions");
export const dynamicRegistry: DynamicRegistry = loadDynamicEntities(definitionsDir);
const dynamicEntities = Array.from(dynamicRegistry.schemas.values());

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  ...(__prod__ ? {} : { synchronize: true }),
  entities: [
    User,
    Role,
    Permissions,
    File,
    Device,
    Bookmark,
    BookmarkTag,
    Tag,
    Bot,
    CallbackQuery,
    Message,
    ...dynamicEntities,
  ],

  migrations: [path.join(__dirname, "/migrations/*")],
});
