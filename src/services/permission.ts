import { EntityManager } from "typeorm";
import { PERMISSIONS_ACTIONS } from "../constants";
import { AppDataSource } from "../data-source";
import { Permissions } from "../entity/Permissions";

export type IPermissionPayload = Omit<
  Permissions,
  "id" | "createAt" | "updateAt"
>;

export const createPermission = async (
  permission: IPermissionPayload
): Promise<Permissions> => {
  const data = Permissions.create(permission);
  return await data.save();
};
export const removeListPermissions = async (
  roleId: string,
  permissions: string[],
  manager: EntityManager
): Promise<Permissions[]> => {
  if (roleId === undefined || permissions.length === 0) {
    return [];
  }
  const listPermissions: any = [];
  permissions.map((item) => {
    listPermissions.push({
      role_id: roleId,
      resource: item,
    });
  });
  const permissionRepository = manager.getRepository(Permissions);

  const existingPermissions = await permissionRepository.find({
    where: [...listPermissions],
  });
  // Tạo tập hợp các ID của các permission cần xóa
  const idsToDelete = existingPermissions.map((p) => p.id);

  // Xóa các permission đã tìm được
  await permissionRepository.delete(idsToDelete);

  // Trả về các permission đã bị xóa
  return existingPermissions;
};
export const createListPermissions = async (
  roleId: string,
  permissions: string[],
  manager: EntityManager
): Promise<Permissions[]> => {
  if (roleId === undefined || permissions.length === 0) {
    return [];
  }
  const listPermissions: any = [];
  permissions.map((item) => {
    listPermissions.push({
      role_id: roleId,
      resource: item,
    });
  });
  const permissionRepository = manager.getRepository(Permissions);

  const existingPermissions = await permissionRepository.find({
    where: [...listPermissions],
  });

  // Filter out resources that already have a permission
  const existingResources = new Set(existingPermissions.map((p) => p.resource));

  const newPermissions = permissions.filter(
    (resource) => !existingResources.has(resource)
  );
  // Map new permissions to Permissions entities
  const data = newPermissions.map((item) => {
    const permission = new Permissions();
    permission.role_id = roleId;
    permission.resource = item;
    permission.value = item;
    return permission;
  });

  // Save new permissions to the database
  if (data.length > 0) {
    return await manager.save(data);
  }

  return []; // Return an empty array if no new permissions were created
};
export const getPermissions = async (): Promise<Permissions[]> => {
  return await Permissions.find();
};

export const getPermissionsByRoleId = async (
  roleId: string
): Promise<Permissions[] | null> => {
  if (roleId === undefined) {
    return null;
  }
  const permissions = await Permissions.find({ where: { role_id: roleId } });
  if (!permissions) return null;
  return permissions;
};
export const getResourcePermissionsByRoleId = async (
  roleId: string
): Promise<string[] | null> => {
  const permissions = await getPermissionsByRoleId(roleId);
  if (!permissions) return null;

  const resourcePermissions = permissions.map(
    (permission) => permission.resource
  );
  return resourcePermissions;
};
export const getPermission = async (
  permission: string
): Promise<Permissions | null> => {
  if (permission === undefined) {
    return null;
  }
  return await Permissions.findOne({ where: { id: permission } });
};
export const updatePermission = async (
  id: string,
  updateData: Partial<Permissions>
) => {
  await Permissions.update(id, updateData);
  return await Permissions.findOne({ where: { id } });
};
export const deletePermission = async (id: string) => {
  await Permissions.delete(id);

  return true;
};
export const getPermissionByRoleIdByResource = async (
  roleId: string,
  resource: string
): Promise<Permissions | null> => {
  if (roleId === undefined) {
    return null;
  }
  const permission = await Permissions.findOne({
    where: { role_id: roleId, resource: resource },
  });
  if (!permission) return null;
  return permission;
};
export const getEntityTableNames = async () => {
  const entityMetadatas = AppDataSource.entityMetadatas;
  return entityMetadatas.map((metadata) => metadata.tableName);
};
export const getPermissionResourceActions = async () => {
  const permissions = await getEntityTableNames();
  const result: string[] = [];

  permissions.forEach((permission) => {
    PERMISSIONS_ACTIONS.forEach((action) => {
      result.push(`${permission}.${action}`);
    });
  });
  return result;
};
