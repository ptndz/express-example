import { EntityManager } from "typeorm";
import addLog from "../config/addLog";
import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { Pagination } from "../types";

export type IUserPayload = Omit<User, "id" | "createAt" | "updateAt"> & {
  roleId: string;
};

export const createUser = async (user: IUserPayload): Promise<User | null> => {
  try {
    const data = User.create(user);
    return await data.save();
  } catch (error: any) {
    addLog(error, "error");
    return null;
  }
};

export const getUserByUserName = async (
  username: string
): Promise<User | null> => {
  const user = await User.findOne({
    where: {
      username,
    },
    relations: ["role"],
  });
  if (!user) return null;

  return {
    ...user,
    role_id: user.role ? user.role.id : null,
    role: undefined,
  } as any;
};
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await User.findOne({
    where: {
      email,
    },
    relations: ["role"],
  });
  if (!user) return null;

  return {
    ...user,
    role_id: user.role ? user.role.id : null,
    role: undefined,
  } as any;
};
export const getUserByRoleId = async (
  roleId: string,
  page = 1,
  limit = 2
): Promise<Pagination<User>> => {
  const [items, total] = await AppDataSource.getRepository(User).findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    where: {
      role: {
        id: roleId,
      },
    },
  });
  const totalPages = Math.ceil(total / limit);
  return {
    total: total,
    per_page: limit,
    current_page: page,
    last_page: totalPages,
    items: items,
  };
};
export const getUsers = async (
  page = 1,
  limit = 100
): Promise<Pagination<User>> => {
  const [items, total] = await AppDataSource.getRepository(User).findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    relations: ["role"],
  });
  const transformedItems = items.map((user) => ({
    ...user,
    role_id: user.role ? user.role.id : null, // Assuming `role` has an `id` field
    role: undefined,
  })) as any;

  const totalPages = Math.ceil(total / limit);
  return {
    total: total,
    per_page: limit,
    current_page: page,
    last_page: totalPages,
    items: transformedItems,
  };
};

export const getUser = async (id: string): Promise<User | null> => {
  const user = await User.findOne({
    where: {
      id,
    },
    relations: ["role"],
  });
  if (!user) return null;
  return user;
};

export const getUserOrRole = async (id: string): Promise<User | null> => {
  const user = await User.findOne({
    where: { id: id },
    relations: ["role"],
  });
  if (!user) return null;
  return user;
};
export const updateUser = async (id: string, updatedData: Partial<User>) => {
  await User.update(id, updatedData);

  return await User.findOne({
    where: {
      id,
    },
  });
};
export const updateRoleListUsers = async (
  roleId: string,
  userIds: string[],
  manager: EntityManager
) => {
  try {
    if (roleId === undefined || userIds.length === 0) {
      return null;
    }
    const roleRepository = manager.getRepository(Role);
    const role = await roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      return null;
    }
    const arrayUserId: any = [];
    userIds.map((id) => {
      arrayUserId.push({
        id: id,
      });
    });
    const userRepository = manager.getRepository(User);
    const users = await userRepository.find({
      where: [...arrayUserId],
    });

    if (users.length !== users.length) {
      return null;
    }
    users.forEach((user) => {
      user.role = role;
    });

    return await userRepository.save(users);
  } catch (error) {
    return null;
  }
};
export const removeRoleListUsers = async (userIds: string[] ,manager: EntityManager) => {
  try {
    if (userIds.length === 0) {
      return null;
    }

    const arrayUserId: any = [];
  

    userIds.map((id) => {
      arrayUserId.push({
        id: id,
      });
    });
    const userRepository = manager.getRepository(User);
    const users = await userRepository.find({
      where: [...arrayUserId],
    });
    console.log(users);

    if (users.length !== users.length) {
      return null;
    }
    users.forEach((user) => {
      user.role = null;
    });

    return await manager.save(users);
  } catch (error) {
    addLog(error, "error");
    return null;
  }
};
