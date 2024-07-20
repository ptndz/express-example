import { User } from "../entity/User";
import { IError } from "../types";

export type IUserPayload = Omit<User, "id" | "createAt" | "updateAt"> & {
	roleId: string;
};

export const createUser = async (user: IUserPayload): Promise<User | IError> => {
	try {
		const data = await User.create(user);
		return await data.save();
	} catch (error: any) {
		return {
			errors: error.code,
		};
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
	return await User.find();
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
