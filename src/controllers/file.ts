import { Route, Tags, Post, Get, Security, Request, UploadedFiles, Query } from "tsoa";
import { createFile, getFileByCheckSumAnhSize, getFiles } from "../services/file";
import { File } from "../entity/File";
import { IResponse, Media, Pagination } from "../types";
import { getUser } from "../services/user";
import { calculateChecksumData } from "../services/checksum";
import removeVietNam from "../utils/removeVietnameseTones";
import path from "path";
import fs from "fs";
import { dateNow, removeKeyObject } from "../utils";
import { mkdirp } from "mkdirp";
import mime from "mime-types";
import { APP_URL } from "../constants";
const pathFolderUpload = process.env.PATH_FOlDER_UPLOAD || "public";
@Route("files")
@Tags("File")
export default class FileController {
	@Security("Bearer")
	@Security("Cookie")
	@Get("/")
	public async getFiles(
		@Query("page") page: number,
		@Query("limit") limit: number
	): Promise<IResponse<Pagination<Media>>> {
		const files = await getFiles(page, limit);

		files.items = files.items.map((file: any) => ({
			...file,
			url: encodeURI(`${APP_URL}/${file.path}/${file.name}`),
		}));
		const medias: any = files;
		return {
			code: 200,
			success: true,
			data: medias,
		};
	}

	@Security("Bearer")
	@Security("Cookie")
	@Post("/")
	public async createFile(
		@UploadedFiles() files: Express.Multer.File[],
		@Request() req: Express.Request
	): Promise<IResponse<File>> {
		if (!files) {
			return { code: 400, success: false, message: "No files uploaded" };
		}
		try {
			const userId = req.userId;
			if (!userId) {
				return { code: 401, success: false, message: "Unauthorized" };
			}
			const user = await getUser(userId);
			if (!user) {
				return { code: 404, success: false, message: "User not found" };
			}
			const media: any = [];
			await Promise.all(
				files.map(async (file: Express.Multer.File) => {
					const checksum = await calculateChecksumData(file.buffer);
					const existingFile = await getFileByCheckSumAnhSize(checksum, String(file.size));
					if (existingFile) {
						const dataFile = await createFile(existingFile);
						const dataFile2 = removeKeyObject(dataFile, ["user"]);
						dataFile2.url = encodeURI(`${APP_URL}/${dataFile2.path}/${dataFile2.name}`);
						media.push(dataFile);
						console.log(
							`File with checksum ${checksum} and size ${file.size} already exists. Skipping.`
						);
						return; // Bỏ qua file hiện tại và tiếp tục với file tiếp theo
					}
					const filename = file.originalname.replace(/\..+$/, "");
					const mimeType = mime.lookup(file.originalname);
					const extname = path.extname(file.originalname);

					const filenameRemoveVietNam = removeVietNam(filename).split(" ").join("");

					const newFilename = `${
						dateNow().yearNoTiles
					}-${Date.now()}-${filenameRemoveVietNam}${extname}`;

					const typeDir = mimeType ? mimeType.split("/")[0] : "others";

					const pathYearMonth = `files/${typeDir}/${dateNow().yyyy}/${dateNow().mm}/${
						dateNow().dd
					}`;

					await mkdirp(path.join(pathFolderUpload, pathYearMonth));

					const filePath = path.join(pathFolderUpload, pathYearMonth, newFilename);

					fs.writeFile(filePath, file.buffer, function (err) {
						if (err) {
							return {
								status: false,
								code: 400,
								message: "Not File",
							};
						}
						return;
					});

					const data: any = {
						name: newFilename,
						disk: pathFolderUpload,
						path: pathYearMonth,
						size: String(file.size),
						type: file.mimetype,
						user: user,
						checksum: checksum,
					};

					const dataFile = await createFile(data);
					const dataFile2 = removeKeyObject(dataFile, ["user"]);
					dataFile2.url = encodeURI(`${APP_URL}/${dataFile2.path}/${dataFile2.name}`);
					media.push(dataFile);
				})
			);

			return { code: 200, success: true, message: "Files uploaded successfully", data: media };
		} catch (error) {
			return { code: 500, success: false, message: "Internal server error" };
		}
	}
	@Get("/download/u/{uuid}")
	public async downloadFile(): Promise<void> {}

	@Get("/{yyyy}/{mm}/{dd}/{name}")
	public async getFile(): Promise<void> {}
}
