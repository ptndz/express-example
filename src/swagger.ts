import * as fs from "fs";
import * as path from "path";
const mapTypeToSwagger = (type: string) => {
  const typeMap: { [key: string]: any } = {
    int: { type: "integer", format: "int32" },
    varchar: { type: "string" },
    text: { type: "string" },
    timestamp: { type: "string", format: "date-time" },
    decimal: { type: "number", format: "float" },
    boolean: { type: "boolean" },
  };
  return typeMap[type] || { type: "string" };
};
export const addEntityToSwagger = (swaggerDef: any, entityDefinition: any) => {
  const entityName = entityDefinition.name;
  const resourcePath = `/${entityDefinition.tableName}`;
  const tag = entityName;

  // Định nghĩa Schema cho component (Phần này đã đúng)
  const properties: any = {};
  for (const [key, value] of Object.entries(entityDefinition.columns as any)) {
    if (!(value as any).primary) {
      properties[key] = mapTypeToSwagger((value as any).type);
    }
  }
  swaggerDef.components.schemas = swaggerDef.components.schemas || {};
  swaggerDef.components.schemas[entityName] = { type: "object", properties };

  // --- BẮT ĐẦU PHẦN BỔ SUNG ---

  const pathIdParameter = {
    name: "id",
    in: "path",
    required: true,
    description: `ID of the ${entityName}`,
    schema: { type: "string" }, // Hoặc 'integer' tùy vào kiểu ID của bạn
  };

  // Định nghĩa GET (List all)
  swaggerDef.paths[resourcePath] = {
    get: {
      tags: [tag],
      summary: `Get all ${entityName}s`,
      responses: {
        "200": {
          description: `A list of ${entityName}s`,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: `#/components/schemas/${entityName}` },
              },
            },
          },
        },
      },
    },
    // Định nghĩa POST (Create new)
    post: {
      tags: [tag],
      summary: `Create a new ${entityName}`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${entityName}` },
          },
        },
      },
      responses: {
        "201": {
          description: `The created ${entityName}`,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${entityName}` },
            },
          },
        },
      },
    },
  };

  // Định nghĩa các paths có ID
  swaggerDef.paths[`${resourcePath}/{id}`] = {
    // Định nghĩa GET (Get by ID)
    get: {
      tags: [tag],
      summary: `Get a single ${entityName} by ID`,
      parameters: [pathIdParameter],
      responses: {
        "200": {
          description: `The requested ${entityName}`,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${entityName}` },
            },
          },
        },
        "404": { description: `${entityName} not found` },
      },
    },
    // Định nghĩa PUT (Update by ID)
    put: {
      tags: [tag],
      summary: `Update an existing ${entityName}`,
      parameters: [pathIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${entityName}` },
          },
        },
      },
      responses: {
        "200": {
          description: `The updated ${entityName}`,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${entityName}` },
            },
          },
        },
        "404": { description: `${entityName} not found` },
      },
    },
    // Định nghĩa DELETE (Delete by ID)
    delete: {
      tags: [tag],
      summary: `Delete a ${entityName} by ID`,
      parameters: [pathIdParameter],
      responses: {
        "204": { description: "Successfully deleted, no content" },
        "404": { description: `${entityName} not found` },
      },
    },
  };

  // --- KẾT THÚC PHẦN BỔ SUNG ---

  console.log(`[Swagger] Added routes for ${entityName}`);
};
/**
 * Hàm chính để tạo ra bản mô tả Swagger cuối cùng
 * Nó sẽ đọc file do tsoa tạo, sau đó gộp các định nghĩa động vào.
 */
export const generateMergedSwaggerSpec = (): any => {
  const tsoaSwaggerPath = path.join(process.cwd(), "public", "swagger.json");
  let swaggerObject: any;

  try {
    // 1. Đọc file swagger.json gốc do tsoa tạo ra
    const tsoaSwaggerContent = fs.readFileSync(tsoaSwaggerPath, "utf-8");
    swaggerObject = JSON.parse(tsoaSwaggerContent);
  } catch (error) {
    console.error(
      "[Swagger] Could not read tsoa-generated swagger.json. Did you run 'npm run build' or 'tsoa spec-and-routes'?",
      error
    );
    // Trả về một object rỗng để tránh crash server
    swaggerObject = {
      openapi: "3.0.0",
      info: { title: "API Docs (Error)", version: "1.0.0" },
      paths: {},
      components: {},
    };
  }

  // 2. Đọc các file .entity.json và thêm vào swaggerObject
  const definitionsPath = path.join(__dirname, "definitions");
  try {
    const files = fs.readdirSync(definitionsPath);
    for (const file of files) {
      if (path.extname(file) === ".json") {
        const filePath = path.join(definitionsPath, file);
        const entityDefinition = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        // Gọi hàm helper để thêm entity này vào đối tượng Swagger đã có
        addEntityToSwagger(swaggerObject, entityDefinition);
      }
    }
  } catch (error) {
    console.warn("[Swagger] Could not read dynamic entity definitions.", error);
  }

  // 3. Trả về đối tượng Swagger đã được gộp hoàn chỉnh
  return swaggerObject;
};
