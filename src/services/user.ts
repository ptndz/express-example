import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { IData } from "../types";

export type IUserPayload = Omit<User, "id" | "createAt" | "updateAt"> & {
	roleId: string;
};

export const createUser = async (user: IUserPayload): Promise<User | null> => {
	try {
		const data = await User.create(user);
		return await data.save();
	} catch (error: any) {
		return null;
	}
};

export const getUserByUserName = async (username: string): Promise<User | null> => {
	const user = await User.findOne({
		where: {
			username,
		},
	});
	if (!user) return null;
	return user;
};
export const getUsers = async (page = 1, limit = 2): Promise<IData<User>> => {
	const [items, total] = await AppDataSource.getRepository(User).findAndCount({
		skip: (page - 1) * limit,
		take: limit,
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

export const getUser = async (id: string): Promise<User | null> => {
	const user = await User.findOne({
		where: {
			id,
		},
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

	const updatedUser = await User.findOne({
		where: {
			id,
		},
	});
	return updatedUser;
};
export const updateRoleListUsers = async (roleId: string, userIds: string[]) => {
	try {
		const roleRepository = AppDataSource.getRepository(Role);
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
		const userRepository = AppDataSource.getRepository(User);
		const users = await userRepository.find({
			where: [...arrayUserId],
		});

		if (users.length !== users.length) {
			return null;
		}
		users.forEach((user) => {
			user.role = role;
		});

		const result = await userRepository.save(users);
		return result;
	} catch (error) {
		return null;
	}
};
export const removeRoleListUsers = async ( userIds: string[]) => {
	try {
		
		const arrayUserId: any = [];
		userIds.map((id) => {
			arrayUserId.push({
				id: id,
			});
		});
		const userRepository = AppDataSource.getRepository(User);
		const users = await userRepository.find({
			where: [...arrayUserId],
		});

		if (users.length !== users.length) {
			return null;
		}
		users.forEach((user) => {
			user.role = null;
		});

		const result = await userRepository.save(users);
		return result;
	} catch (error) {
		return null;
	}
};
