import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

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
export const getUsers = async (): Promise<User[]> => {
	const data = await AppDataSource.getRepository(User)
		.createQueryBuilder("user")
		.select(["user.id", "user.username", "user.firstName", "user.lastName", "user.email"]) // Liệt kê các trường bạn muốn lấy
		.getMany();
	return data;
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
