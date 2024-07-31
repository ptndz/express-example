import { AppDataSource } from "../data-source";
import { File } from "../entity/File";
import { Pagination } from "../types";

export type IFilePayload = Omit<File, "id" | "createAt" | "updateAt">;

export const createFile = async (file: IFilePayload): Promise<File> => {
	const data = await File.create(file);
	return await data.save();
};
export const getFiles = async (page = 1, limit = 10): Promise<Pagination<File>> => {
	const [items, total] = await AppDataSource.getRepository(File).findAndCount({
		skip: (page - 1) * limit,
		take: limit,
	});
	const totalPages = Math.ceil(total / limit);
	return {
		total: total,
		per_page: limit,
		current_page: page,
		last_page: totalPages,
		items: items,
	};
};
export const getFileById = async (id: number): Promise<File | null> => {
	const file = await File.findOne({
		where: {
			id: id,
		},
	});
	return file;
};
export const getFileByCheckSumAnhSize = async (
	checksum: string,
	size: string
): Promise<File | null> => {
	const file = await File.findOne({
		where: {
			checksum: checksum,
			size: size,
		},
	});
	return file;
};
export const updateFile = async (fileId: number, file: IFilePayload): Promise<File | null> => {
	await File.update(fileId, file);
	const data = await File.findOne({
		where: {
			id: fileId,
		},
	});
	return data;
};
