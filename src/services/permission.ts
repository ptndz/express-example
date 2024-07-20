import { Permissions } from "../entity/Permissions";

export type IPermissionPayload = Omit<Permissions, "id" | "createAt" | "updateAt">;

export const createPermission = async (permission: IPermissionPayload): Promise<Permissions> => {
	const data = await Permissions.create(permission);
	return await data.save();
};

export const getPermissions = async (): Promise<Permissions[]> => {
	return await Permissions.find();
};

export const getPermissionByRoleId = async (roleId: string): Promise<Permissions | null> => {
	if (roleId === undefined) {
		return null;
	}
	const role = await Permissions.findOne({ where: { role_id: roleId } });
	if (!role) return null;
	return role;
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
