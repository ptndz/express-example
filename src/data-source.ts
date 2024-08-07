import "reflect-metadata";
import path from "path";
import { __prod__ } from "./constants";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Role } from "./entity/Role";
import { Permissions } from "./entity/Permissions";

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
	entities: [User, Role, Permissions],

	migrations: [path.join(__dirname, "/migrations/*")],
});
