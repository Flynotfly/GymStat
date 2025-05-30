export interface PaginatedResponse<T> {
  count: number;
  results: T[];
  next?: string;
  previous?: string;
}