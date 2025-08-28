export interface ListFilter {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  where?: string;
  include?: string[];
}

export type ValidatedFilter = Omit<ListFilter, 'page' | 'limit'> & {
  page: number;
  limit: number;
};

