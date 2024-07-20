import { User } from "../entity/User";

export type IUserPayload = Omit<User, "id" | "createAt" | "updateAt">;

export const createUser = async (user: IUserPayload): Promise<User> => {
	const data = await User.create(user);
	return await data.save();
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
