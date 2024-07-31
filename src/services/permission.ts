import { PERMISSIONS_ACTIONS } from "../constants";
import { AppDataSource } from "../data-source";
import { Permissions } from "../entity/Permissions";

export type IPermissionPayload = Omit<Permissions, "id" | "createAt" | "updateAt">;

export const createPermission = async (permission: IPermissionPayload): Promise<Permissions> => {
	const data = await Permissions.create(permission);
	return await data.save();
};
export const createListPermissions = async (
	roleId: string,
	permissions: string[]
): Promise<Permissions[]> => {
	const listPermissions: any = [];
	permissions.map((item) => {
		listPermissions.push({
			role_id: roleId,
			resource: item,
		});
	});
	const permissionRepository = AppDataSource.getRepository(Permissions);

	const existingPermissions = await permissionRepository.find({
		where: [...listPermissions],
	});

	// Filter out resources that already have a permission
	const existingResources = new Set(existingPermissions.map((p) => p.resource));

	const newPermissions = permissions.filter((resource) => !existingResources.has(resource));
	// Map new permissions to Permissions entities
	const data = newPermissions.map((item) => {
		const permission = new Permissions();
		permission.role_id = roleId;
		permission.resource = item;
		return permission;
	});

	// Save new permissions to the database
	if (data.length > 0) {
		return await permissionRepository.save(data);
	}

	return []; // Return an empty array if no new permissions were created
};
export const getPermissions = async (): Promise<Permissions[]> => {
	return await Permissions.find();
};

export const getPermissionsByRoleId = async (roleId: string): Promise<Permissions[] | null> => {
	if (roleId === undefined) {
		return null;
	}
	const permissions = await Permissions.find({ where: { role_id: roleId } });
	if (!permissions) return null;
	return permissions;
};

export const getPermission = async (permission: string): Promise<Permissions | null> => {
	if (permission === undefined) {
		return null;
	}
	const permissions = await Permissions.findOne({ where: { id: permission } });

	return permissions;
};
export const updatePermission = async (id: string, updateData: Partial<Permissions>) => {
	await Permissions.update(id, updateData);
	const permission = await Permissions.findOne({ where: { id } });
	return permission;
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
	const entityMetadatas = await AppDataSource.entityMetadatas;
	const tableNames = entityMetadatas.map((metadata) => metadata.tableName);
	return tableNames;
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
