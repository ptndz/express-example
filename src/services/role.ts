import { EntityManager } from "typeorm";
import { Role } from "../entity/Role";

export type IRolePayload = {
  name: string;
  description?: string | undefined;
  root?: boolean | undefined;
  $add?: Record<string, string[]> | undefined;
  $clear?: Record<string, string[]> | undefined;
};

export const createRole = async (role: IRolePayload): Promise<Role | null> => {
  try {
    const data = Role.create(role);
    return await data.save();
  } catch (error) {
    return null;
  }
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
export const updateRole = async (
  id: string,
  updateData: Partial<Role>,
  manager: EntityManager
): Promise<Role | null> => {
  if (id === undefined) {
    return null;
  }
  const roleRepository = manager.getRepository(Role);
  await roleRepository.update(id, updateData);
  const role = await Role.findOne({ where: { id } });
  if (!role) return null;
  return role;
};
