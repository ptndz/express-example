import * as fs from "fs";
import * as path from "path";
import { EntitySchema } from "typeorm";

const definitionsPath = path.join(__dirname, "..", "definitions");

export const loadEntitySchemas = (): EntitySchema[] => {
  const schemas: EntitySchema[] = [];

  const files = fs.readdirSync(definitionsPath);

  for (const file of files) {
    if (path.extname(file) === ".json") {
      const schemaDefinition = JSON.parse(
        fs.readFileSync(path.join(definitionsPath, file), "utf-8")
      );

      schemas.push(
        new EntitySchema({
          name: schemaDefinition.name,
          tableName: schemaDefinition.tableName,
          columns: schemaDefinition.columns,
          relations: schemaDefinition.relations || {},
        })
      );

      console.log(`[EntityLoader] Loaded entity: ${schemaDefinition.name}`);
    }
  }

  return schemas;
};
