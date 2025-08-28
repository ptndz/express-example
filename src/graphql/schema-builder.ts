import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { AppDataSource, dynamicRegistry } from '../data-source';
import { ensureAllowed } from './authz';
import { buildFilter } from './filter-builder';
import { ListFilter } from '../types';
import { pubsub } from '../pubsub';

const scalarType = (t: string) => {
  switch (t) {
    case 'int':
    case 'integer':
      return GraphQLInt;
    case 'float':
    case 'decimal':
      return GraphQLFloat;
    case 'boolean':
      return GraphQLBoolean;
    default:
      return GraphQLString;
  }
};

export const buildSchema = () => {
  const queryFields: any = {};
  const mutationFields: any = {};
  const subscriptionFields: any = {};

  for (const [entity, def] of dynamicRegistry.defs.entries()) {
    const fields: any = {};
    Object.entries(def.columns).forEach(([name, col]: any) => {
      fields[name] = { type: scalarType(col.type) };
    });

    const type = new GraphQLObjectType({ name: def.name, fields });
    const inputType = new GraphQLInputObjectType({
      name: `${def.name}CreateInput`,
      fields,
    });
    const updateType = new GraphQLInputObjectType({
      name: `${def.name}UpdateInput`,
      fields,
    });
    const pageType = new GraphQLObjectType({
      name: `${def.name}Page`,
      fields: {
        data: { type: new GraphQLList(type) },
        total: { type: GraphQLInt },
      },
    });

    const repo = AppDataSource.getRepository(entity);
    const lc = entity.charAt(0).toLowerCase() + entity.slice(1);

    queryFields[`${lc}List`] = {
      type: pageType,
      args: {
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        sort: { type: GraphQLString },
        order: { type: GraphQLString },
        q: { type: GraphQLString },
        where: { type: GraphQLString },
        include: { type: new GraphQLList(GraphQLString) },
      },
      resolve: async (_src: any, args: ListFilter & { q?: string }, ctx: any) => {
        ensureAllowed(ctx, entity, 'read');
        const opts = buildFilter(args);
        const [data, total] = await repo.findAndCount(opts as any);
        return { data, total };
      },
    };

    queryFields[`${lc}ById`] = {
      type,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        include: { type: new GraphQLList(GraphQLString) },
      },
      resolve: async (_src: any, { id, include }: any, ctx: any) => {
        ensureAllowed(ctx, entity, 'read');
        return repo.findOne({ where: { id }, relations: include } as any);
      },
    };

    queryFields[`${lc}Count`] = {
      type: GraphQLInt,
      args: {
        q: { type: GraphQLString },
        where: { type: GraphQLString },
      },
      resolve: async (_src: any, args: ListFilter & { q?: string }, ctx: any) => {
        ensureAllowed(ctx, entity, 'read');
        const opts = buildFilter(args);
        return repo.count(opts as any);
      },
    };

    mutationFields[`${lc}Create`] = {
      type,
      args: { data: { type: new GraphQLNonNull(inputType) } },
      resolve: async (_src: any, { data }: any, ctx: any) => {
        ensureAllowed(ctx, entity, 'create');
        const obj = repo.create(data);
        const saved = await repo.save(obj);
        await pubsub.publish(`${entity.toUpperCase()}_CREATED`, {
          [`${lc}Created`]: saved,
        });
        return saved;
      },
    };

    mutationFields[`${lc}Update`] = {
      type,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        data: { type: new GraphQLNonNull(updateType) },
      },
      resolve: async (_src: any, { id, data }: any, ctx: any) => {
        ensureAllowed(ctx, entity, 'update');
        await repo.update(id, data);
        return repo.findOne({ where: { id } } as any);
      },
    };

    mutationFields[`${lc}Delete`] = {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: async (_src: any, { id }: any, ctx: any) => {
        ensureAllowed(ctx, entity, 'delete');
        await repo.delete(id);
        return true;
      },
    };

    subscriptionFields[`${lc}Created`] = {
      type,
      subscribe: () => pubsub.asyncIterator(`${entity.toUpperCase()}_CREATED`),
    };
  }

  const query = new GraphQLObjectType({ name: 'Query', fields: queryFields });
  const mutation = new GraphQLObjectType({ name: 'Mutation', fields: mutationFields });
  const subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  });
  return new GraphQLSchema({ query, mutation, subscription });
};
