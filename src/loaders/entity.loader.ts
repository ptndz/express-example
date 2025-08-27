import fs from "fs";
import path from "path";
import { EntitySchema } from "typeorm";
import { schemaFromJson, EntityJson } from "./entity-schema-factory";

export type DynamicRegistry = {
  defs: Map<string, EntityJson>;
  schemas: Map<string, EntitySchema>;
};

export const loadDynamicEntities = (dir: string): DynamicRegistry => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const defs = new Map<string, EntityJson>();
  const schemas = new Map<string, EntitySchema>();

  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const def = JSON.parse(raw) as EntityJson;
    defs.set(def.name, def);
    schemas.set(def.name, schemaFromJson(def));
    console.log(`[EntityLoader] Loaded entity: ${def.name}`);
  }

  return { defs, schemas };
};

