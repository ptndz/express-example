import {Device} from "../entity/Device";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";


export type IDevicePayload = {
    agent: string; ip: string; subscription: string; user: User
}

export const createDevice = async (device: IDevicePayload): Promise<Device> => {
    const newDevice = Device.create();
    newDevice.ip = device.ip;
    newDevice.agent = device.agent;
    newDevice.subscription = device.subscription;
    newDevice.user = device.user;

    await AppDataSource.manager.save(newDevice);

    return newDevice
};
export const getDeviceByUserId = async (userId: string): Promise<Device | null> => {
    const data = Device.findOneBy({
        user: {
            id: userId,
        }
    });
    if (!data) return null;
    return data
}