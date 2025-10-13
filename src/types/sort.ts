export type SortKey = 'title' | 'publishedAt' | 'viewCount' | 'likeCount' | 'commentCount';
export type SortDir = 'asc' | 'desc';
export interface SortState {
  key: SortKey;
  dir: SortDir;
}