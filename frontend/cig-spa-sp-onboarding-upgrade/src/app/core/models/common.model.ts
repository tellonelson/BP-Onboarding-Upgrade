export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PageParams {
  page: number;
  size: number;
  sort?: SortParams;
}
