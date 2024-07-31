import { Application } from "express";

import morgan from "morgan";

import fs from "fs";
import path from "path";
import { dateNow } from "../utils";

export default function configureMorgan(app: Application, logDirectory: string) {
	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory, { recursive: true });
	}
	const logDate = `${dateNow().yyyy}_${dateNow().mm}_${dateNow().dd}`;
	const accessLogStream = fs.createWriteStream(path.join(logDirectory, `log_${logDate}.log`), {
		flags: "a",
	});

	app.use(morgan("combined", { stream: accessLogStream }));
}
