import { FindManyOptions, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "../data-source";

interface FindOptions<T> {
  relations?: string[];
  select?: (keyof T)[];
  exclude?: (keyof T)[];
}

export const createGenericService = <T extends ObjectLiteral>(
  entityName: string
) => {
  // Kiểm tra metadata có tồn tại không
  const metadata = AppDataSource.entityMetadatas.find(
    (meta) => meta.name === entityName
  );

  if (!metadata) {
    throw new Error(
      `[GenericService] Entity "${entityName}" not found in AppDataSource.`
    );
  }

  const repository: Repository<T> = AppDataSource.getRepository(entityName);

  const getSelectOptions = (
    options: FindOptions<T>
  ): (keyof T)[] | undefined => {
    if (options.select && options.select.length > 0) {
      return options.select;
    }

    if (options.exclude && options.exclude.length > 0) {
      const allColumns = metadata.columns.map(
        (col) => col.propertyName
      ) as (keyof T)[];
      return allColumns.filter((col) => !options.exclude?.includes(col));
    }

    return undefined;
  };

  return {
    findAll: (options: FindOptions<T> = {}) => {
      const findOptions: FindManyOptions<T> = {
        relations: options.relations,
        select: getSelectOptions(options),
      };
      return repository.find(findOptions);
    },

    findOne: (id: string | number, options: FindOptions<T> = {}) => {
      const findOptions: FindManyOptions<T> = {
        where: { id: id as any },
        relations: options.relations,
        select: getSelectOptions(options),
      };
      return repository.findOne(findOptions);
    },

    create: (data: any) => {
      const newItem = repository.create(data);
      return repository.save(newItem);
    },

    update: (id: string | number, data: any) => repository.update(id, data),

    delete: (id: string | number) => repository.delete(id),
  };
};
