import * as fs from "fs";
import * as crypto from "crypto";

export function calculateChecksum(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash("sha256"); // Chọn thuật toán băm (SHA-256)
		const stream = fs.createReadStream(filePath);

		stream.on("data", (chunk) => {
			hash.update(chunk);
		});

		stream.on("end", () => {
			const checksum = hash.digest("hex");
			resolve(checksum); // Trả về checksum tính toán
		});

		stream.on("error", (err) => {
			reject(err);
		});
	});
}
export function calculateChecksumData(fileBuffer: string | Buffer): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			const hash = crypto.createHash("sha256"); // Chọn thuật toán băm (SHA-256)
			hash.update(fileBuffer);
			const checksum = hash.digest("hex");
			resolve(checksum);
		} catch (error) {
			reject(null);
		}
	});
}
