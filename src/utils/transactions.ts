import { EntityManager } from "typeorm";
import { AppDataSource } from "../data-source";

export const transactionContext = async (
  serviceMethod: (transactionManager: EntityManager) => any
) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const data = await serviceMethod(queryRunner.manager);
    await queryRunner.commitTransaction();
    await queryRunner.release();
    return data;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return null;
  }
};
