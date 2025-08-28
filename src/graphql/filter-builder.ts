import { ListFilter, ValidatedFilter } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ORDER_VALUES: Array<ListFilter['order']> = ['ASC', 'DESC'];

export const validateFilter = (args: any = {}): ValidatedFilter => {
  const page = Number.isInteger(args.page) && args.page > 0 ? args.page : DEFAULT_PAGE;
  const limit = Number.isInteger(args.limit) && args.limit > 0 ? args.limit : DEFAULT_LIMIT;
  const sort = typeof args.sort === 'string' && args.sort.length > 0 ? args.sort : undefined;
  const order =
    typeof args.order === 'string' && ORDER_VALUES.includes(args.order.toUpperCase())
      ? (args.order.toUpperCase() as ListFilter['order'])
      : undefined;
  const where = typeof args.where === 'string' ? args.where : undefined;
  const include = Array.isArray(args.include)
    ? args.include.filter((v: unknown): v is string => typeof v === 'string')
    : undefined;
  return { page, limit, sort, order, where, include };
};

export const buildFilter = (args: any) => {
  const { page, limit, sort, order, where, include } = validateFilter(args);
  const skip = (page - 1) * limit;
  const take = limit;
  const options: any = { skip, take };
  if (sort) {
    options.order = { [sort]: order || 'ASC' };
  }
  if (where) {
    try {
      options.where = JSON.parse(where);
    } catch {
      /* ignore JSON error */
    }
  }
  if (include) {
    options.relations = include;
  }
  return options;
};

