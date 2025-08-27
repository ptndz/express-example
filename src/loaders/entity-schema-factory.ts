import { EntitySchema, EntitySchemaOptions } from "typeorm";

type ColumnDef = {
  type: string;
  primary?: boolean;
  generated?: "increment" | "uuid";
  unique?: boolean;
  nullable?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  default?: any;
  enumValues?: string[];
  createDate?: boolean;
  updateDate?: boolean;
  deleteDate?: boolean;
  version?: boolean;
  name?: string;
  comment?: string;
};

type RelationDef = {
  type: "many-to-one" | "one-to-many" | "many-to-many" | "one-to-one";
  target: string;
  inverseSide?: string;
  joinColumn?: boolean | { name?: string; referencedColumnName?: string };
  joinTable?: boolean | { name?: string };
  cascade?: boolean | ("insert" | "update" | "remove")[];
  eager?: boolean;
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
  onUpdate?: "CASCADE" | "RESTRICT" | "NO ACTION";
};

type IndexDef = { columns: string[]; unique?: boolean; where?: string };

export type EntityJson = {
  name: string;
  tableName?: string;
  columns: Record<string, ColumnDef>;
  relations?: Record<string, RelationDef>;
  indices?: IndexDef[];
  softDelete?: boolean;
  permissions?: Record<"read" | "create" | "update" | "delete", string[]>;
  resourceName?: string;
};

export function schemaFromJson(def: EntityJson) {
  const columns: any = {};
  for (const [prop, col] of Object.entries(def.columns)) {
    const c: any = { type: col.type as any };
    if (col.name) c.name = col.name;
    if (col.primary) c.primary = true;
    if (col.generated) c.generated = col.generated;
    if (col.unique) c.unique = true;
    if (col.nullable) c.nullable = true;
    if (col.length) c.length = col.length;
    if (col.precision) c.precision = col.precision;
    if (col.scale) c.scale = col.scale;
    if (col.default !== undefined) c.default = col.default;
    if (col.enumValues) c.enum = col.enumValues;
    if (col.createDate) c.createDate = true;
    if (col.updateDate) c.updateDate = true;
    if (col.deleteDate) c.deleteDate = true;
    if (col.version) c.version = true;
    if (col.comment) c.comment = col.comment;
    columns[prop] = c;
  }

  const relations: any = {};
  for (const [prop, rel] of Object.entries(def.relations || {})) {
    relations[prop] = {
      type: rel.type,
      target: rel.target,
      inverseSide: rel.inverseSide,
      joinColumn: rel.joinColumn,
      joinTable: rel.joinTable,
      cascade: rel.cascade ?? false,
      eager: rel.eager ?? false,
      onDelete: rel.onDelete,
      onUpdate: rel.onUpdate,
    };
  }

  const options: EntitySchemaOptions<any> = {
    name: def.name,
    tableName: def.tableName,
    columns,
    relations,
    indices: (def.indices || []).map((i) => ({
      columns: i.columns,
      unique: !!i.unique,
      where: i.where,
    })),
  };

  return new EntitySchema(options);
}

