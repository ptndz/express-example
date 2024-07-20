import { Role } from "../entity/Role";

export type IRolePayload = Omit<Role, "id" | "createAt" | "updateAt" | "users" | "permissions">;

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
