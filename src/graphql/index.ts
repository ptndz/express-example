import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from './schema-builder';
import type { Request } from 'express';

export interface GraphQLContext {
  req: Request;
}

export const makeExecutableDocuments = async () => {
  const schema = buildSchema();
  const server = new ApolloServer<GraphQLContext>({ schema });
  await server.start();
  return expressMiddleware(server, {
    context: async ({ req }: { req: Request }) => ({ req }),
  });
};

export const createGraphQLMiddleware = makeExecutableDocuments;
