import { Role } from "../entity/Role";

export type IRolePayload = Omit<Role, "id" | "createAt" | "updateAt" | "users"> & {
	permissions?: Array<string>;
	$add?: any;
	$clear?: any;
};

export const createRole = async (role: IRolePayload): Promise<Role> => {
	const data = await Role.create(role);
	return await data.save();
};

export const getRoles = async (): Promise<Role[]> => {
	return await Role.find();
};

export const getRole = async (id: string): Promise<Role | null> => {
	if (id === undefined) {
		return null;
	}
	const role = await Role.findOne({ where: { id } });
	if (!role) return null;
	return role;
};
export const updateRole = async (id: string, updateData: Partial<Role>): Promise<Role | null> => {
	if (id === undefined) {
		return null;
	}

	await Role.update(id, updateData);
	const role = await Role.findOne({ where: { id } });
	if (!role) return null;
	return role;
};
