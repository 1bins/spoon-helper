export interface SearchVideoItem {
  videoId: string;
  publishedAt: string; // ISO
}

export interface SearchVideoListResponse {
  channelId: string;
  startISO: string;
  endISO: string;
  total: number;
  items: SearchVideoItem[];
}