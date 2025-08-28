import { dynamicRegistry } from '../data-source';
import type { GraphQLContext } from './index';

export const ensureAllowed = (
  ctx: GraphQLContext,
  entity: string,
  action: string
) => {
  const def = dynamicRegistry.defs.get(entity);
  const roles: string[] = (def as any)?.permissions?.[action] || [];
  const role = (ctx.req as any).user?.role;
  if (role && roles.includes(role)) {
    return true;
  }
  throw new Error('Forbidden');
};
