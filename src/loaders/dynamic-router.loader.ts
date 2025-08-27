import express from "express";
import { createGenericRouter } from "../routers/generic";
import { singularize } from "../utils";
import { dynamicRegistry } from "../data-source";

export const loadDynamicRouters = (): express.Router => {
  const apiRouter = express.Router();
  for (const def of dynamicRegistry.defs.values()) {
    const entityName = def.name;
    const tableName = def.tableName;
    const resourceName = def.resourceName || singularize(tableName!);

    console.log(`[RouterLoader] Creating routes for /${tableName}`);
    const genericRouter = createGenericRouter(entityName, resourceName);
    apiRouter.use(`/${tableName}`, genericRouter);
  }

  return apiRouter;
};
