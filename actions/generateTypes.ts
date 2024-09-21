import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../src/data-source";
import { getPermissionResourceActions } from "../src/services/permission";
dotenv.config();

const generateTypes = async () => {
  try {
    // 1. Lấy danh sách PermissionResourceActions từ hàm bất đồng bộ
    const PermissionResourceActions = await getPermissionResourceActions();

    // Kiểm tra dữ liệu trả về
    if (!Array.isArray(PermissionResourceActions)) {
      throw new Error(
        "getPermissionResourceActions phải trả về một mảng các chuỗi."
      );
    }

    // 2. Trích xuất các Resource và Action từ PermissionResourceActions
    const resourcesSet = new Set();
    const actionsSet = new Set();

    PermissionResourceActions.forEach((permission) => {
      const [resource, action] = permission.split(".");
      if (resource && action) {
        resourcesSet.add(resource);
        actionsSet.add(action);
      } else {
        console.warn(`Định dạng quyền không hợp lệ: ${permission}`);
      }
    });

    const resources = Array.from(resourcesSet).sort();
    const actions = Array.from(actionsSet).sort();

    // 3. Tạo các định nghĩa kiểu TypeScript
    const resourceTypes =
      `export const RESOURCES = ${JSON.stringify(
        resources,
        null,
        4
      )} as const;\n` + `export type Resource = typeof RESOURCES[number];\n\n`;

    const actionTypes =
      `export const ACTIONS = ${JSON.stringify(actions, null, 4)} as const;\n` +
      `export type Action = typeof ACTIONS[number];\n\n`;

    const permissionType =
      `export type Permission = \n` +
      PermissionResourceActions.map((p) => `    | "${p}"`).join("\n") +
      ";\n\n";

    const combinedTypes = resourceTypes + actionTypes + permissionType;

    // 4. Đường dẫn tới tệp permissions.ts (có thể thay đổi theo cấu trúc dự án của bạn)
    const typesPath = path.join(__dirname, "../src/types/permissions.ts");

    // Tạo thư mục nếu chưa tồn tại
    fs.mkdirSync(path.dirname(typesPath), { recursive: true });

    // Ghi các định nghĩa kiểu vào tệp
    fs.writeFileSync(typesPath, combinedTypes);

    console.log("Types generated successfully.");
  } catch (error) {
    console.error("Error generating types:", error);
  }
};
AppDataSource.initialize()
  .then(async () => {
    // Chạy script
    await generateTypes();
    process.exit();
  })
  .catch((e) => console.log(e));
