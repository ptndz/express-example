import * as fs from 'fs';
import * as path from 'path';
import {stringify} from "../utils";

// Hàm tạo thư mục nếu chưa tồn tại
function createLogFolder(folderName: string): void {
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
    } catch (err) {
        console.error(err);
    }
}

// Hàm thêm log vào file
function addLog(
    msg: any,
    type?: "error" | "log",
    logFolderPath: string = 'logs',
    fileNameFormat: string = `${type ? `${type}_` : ''}${'${date}'}.txt`
): void {
    const now = new Date();
    const logTime = now.toLocaleTimeString('en-GB', {hour12: false}); // Format HH:mm:ss
    const logDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format DDMMYYYY

    const filename = fileNameFormat.replace('${date}', logDate);

    const logText = `${logTime} | ${stringify(msg)}\n`;
    const filePath = path.join(logFolderPath, filename);

    createLogFolder(logFolderPath);
    fs.appendFileSync(filePath, logText, 'utf8');
}

export default addLog;