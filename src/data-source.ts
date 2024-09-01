import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { Device } from "./entity/Device";
import { File } from "./entity/File";
import { Permissions } from "./entity/Permissions";
import { Role } from "./entity/Role";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
  ...(__prod__ ? {} : { synchronize: true }),
  entities: [User, Role, Permissions, File, Device],

  migrations: [path.join(__dirname, "/migrations/*")],
});
