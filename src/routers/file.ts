import { Router } from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import fs from "fs";
import mime from "mime-types";
import multer, { MulterError } from "multer";
import path from "path";
import { authAccessToken } from "../middlewares";
import { getFileById } from "../services/file";
import FileController from "../controllers/file";

const router = Router();
const pathFolderUpload = process.env.PATH_FOlDER_UPLOAD || "public";
const multerStorage = multer.memoryStorage();
const upload = multer({
	storage: multerStorage,
});
const uploadFiles = upload.array("files", 10);

const errorArray = [
	"LIMIT_PART_COUNT",
	"LIMIT_FILE_SIZE",
	"LIMIT_FILE_COUNT",
	"LIMIT_FIELD_KEY",
	"LIMIT_FIELD_VALUE",
	"LIMIT_FIELD_COUNT",
	"LIMIT_UNEXPECTED_FILE",
];
const uploads = (req: Request, res: Response, next: NextFunction) => {
	uploadFiles(req, res, (err: any) => {
		if (err instanceof MulterError) {
			if (errorArray.includes(err.code)) {
				return res.json({
					status: false,
					...err,
				});
			}
			return res.json({
				status: false,
				...err,
			});
		}

		return next();
	});
};
router.get("/", authAccessToken, async (req, res) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 2;
	const controller = new FileController();
	const response = await controller.getFiles(page, limit);

	return res.status(response.code).send(response);
});
router.post("/", authAccessToken, uploads, async (req, res) => {
	const files = req.files as unknown as Express.Multer.File[];
	const controller = new FileController();
	const response = await controller.createFile(files, req);

	return res.status(response.code).send(response);
});
router.get("/download/u/:uuid", async (req, res) => {
	const uuid = req.params.uuid;
	if (!uuid) {
		res.json({
			status: false,
			code: 404,
			message: "not file",
		});
	}
	try {
		const existingFile = await getFileById(Number(uuid));
		if (!existingFile) {
			res.json({
				status: false,
				code: 404,
				message: "not file",
			});
		}

		const filePath = path.join(
			existingFile?.disk as string,
			existingFile?.path as string,
			existingFile?.name as string
		);
		const stat = fs.statSync(filePath);
		const fileSize = stat.size;
		const range = req.headers.range;

		if (range) {
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = Math.min(fileSize - 1, parseInt(parts[1], 10)) || fileSize - 1;

			const chunkSize = end - start + 1;
			const file = fs.createReadStream(filePath, { start, end });

			res.writeHead(206, {
				"Content-Range": `bytes ${start}-${end}/${fileSize}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunkSize,
				"Content-Type": existingFile?.type,
				"Access-Control-Allow-Origin": "*",
			});

			file.pipe(res);
		} else {
			res.writeHead(200, {
				"Content-Length": fileSize,
				"Content-Type": existingFile?.type,
				"Access-Control-Allow-Origin": "*",
			});

			fs.createReadStream(filePath).pipe(res);
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			code: 500,
			message: "Internal server error",
		});
	}
});

router.get("/:type/:yyyy/:mm/:dd/:name", async (req, res) => {
	const { type, yyyy, mm, dd, name } = req.params;

	if (!type && !yyyy && !mm && !dd && !name) {
		res.json({
			status: false,
			code: 404,
			message: "not file",
		});
	}
	try {
		const filePath = path.join(pathFolderUpload, "files", type, yyyy, mm, dd, name);

		const stat = fs.statSync(filePath);
		const fileSize = stat.size;
		const range = req.headers.range;
		const fileMimeType = mime.lookup(filePath) || "application/octet-stream";
		if (range) {
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = Math.min(fileSize - 1, parseInt(parts[1], 10)) || fileSize - 1;

			const chunkSize = end - start + 1;
			const file = fs.createReadStream(filePath, { start, end });

			res.writeHead(206, {
				"Content-Range": `bytes ${start}-${end}/${fileSize}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunkSize,
				"Content-Type": fileMimeType,
				"Access-Control-Allow-Origin": "*",
			});

			file.pipe(res);
		} else {
			res.writeHead(200, {
				"Content-Length": fileSize,
				"Content-Type": fileMimeType,
				"Access-Control-Allow-Origin": "*",
			});

			fs.createReadStream(filePath).pipe(res);
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			code: 500,
			message: "Internal server error",
		});
	}
});
export default router;
