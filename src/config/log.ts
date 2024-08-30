import { Application } from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { dateNow } from "../utils";

export default function configureMorgan(app: Application, logDirectory: string = "logs") {
	// Kiểm tra và tạo thư mục logs nếu chưa tồn tại
	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory, { recursive: true });
	}

	// Lấy ngày hiện tại để sử dụng trong tên file log
	const logDate = `${dateNow().yyyy}_${dateNow().mm}_${dateNow().dd}`;
	const accessLogStream = fs.createWriteStream(path.join(logDirectory, `log_${logDate}.log`), {
		flags: "a", // Mở file trong chế độ thêm mới log vào cuối file
	});

	// Cấu hình Morgan để ghi log vào file log đã tạo
	app.use(morgan("combined", { stream: accessLogStream }));
}
