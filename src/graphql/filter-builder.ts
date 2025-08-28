export const buildFilter = (args: any) => {
  const { page = 1, limit = 20, sort, order, where, include } = args || {};
  const skip = (page - 1) * limit;
  const take = limit;
  const options: any = { skip, take };
  if (sort) {
    options.order = { [sort]: (order || 'ASC').toUpperCase() };
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
