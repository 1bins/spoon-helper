
const BASE = 'https://www.googleapis.com/youtube/v3';
const KEY = process.env.YOUTUBE_API_KEY!;

// 검색 리스트 결과 타입 정의
type SearchListResp = {
  nextPageToken?: string;
  items?: Array<{
    id: { videoId?: string };
    snippet?: { publishedAt?: string };
  }>;
};

function assertEnv() {
  if (!KEY) throw new Error('YOUTUBE_API_KEY가 없습니다.');
}

/**
 * channelId와 기간(ISO)으로 업로드된 영상 ID 전체 수집
 * - publishedAfter / publishedBefore (UTC 권장)
 * - 최대 50개씩 페이지네이션
 */
export async function listVideoIdsInRange(
  channelId: string,
  startISO: string,
  endISO: string
): Promise<{ videoIds: string[]; mapPublishedAt: Record<string, string> }> {
  assertEnv();

  let pageToken: string | undefined;
  const ids: string[] = [];
  const mapPublishedAt: Record<string, string> = {};

  do {
    const qs = new URLSearchParams({
      key: KEY,
      part: 'id,snippet',
      channelId,
      type: 'video',
      order: 'date',
      maxResults: '50',
      publishedAfter: startISO,
      publishedBefore: endISO,
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${BASE}/search?${qs.toString()}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`search.list 실패: ${res.status} ${res.statusText} ${msg}`);
    }

    const data = (await res.json()) as SearchListResp;

    for (const it of data.items || []) {
      const vid = it.id.videoId;
      if (vid) {
        ids.push(vid);
        if (it.snippet?.publishedAt) {
          mapPublishedAt[vid] = it.snippet.publishedAt;
        }
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return { videoIds: ids, mapPublishedAt };
}
