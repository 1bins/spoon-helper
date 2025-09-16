// lib/youtube/listVideoIds.ts
const BASE = 'https://www.googleapis.com/youtube/v3';

function assertEnv() {
  if (!process.env.YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY가 없습니다');
}

async function fetchJSON<T>(url: string) {
  const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`${url} 실패: ${res.status} ${res.statusText} ${msg}`);
  }
  return (await res.json()) as T;
}

/** 채널의 업로드 전용 플레이리스트 ID 가져오기 */
export async function getUploadsPlaylistId(channelId: string) {
  assertEnv();
  const qs = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY!,
    part: 'contentDetails',
    id: channelId,
  });
  const data = await fetchJSON<{
    items: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  }>(`${BASE}/channels?${qs.toString()}`);

  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('업로드 플레이리스트 ID를 찾지 못했습니다');
  return uploads;
}

/** 기간 내 videoId 목록 (playlistItems.list 기반, 호출당 1unit) */
export async function listVideoIdsInRange(
  channelId: string,
  startISO: string,
  endISO: string
): Promise<{ videoIds: string[]; mapPublishedAt: Record<string, string> }> {
  assertEnv();

  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('날짜 파라미터가 유효하지 않습니다');

  const uploadsId = await getUploadsPlaylistId(channelId);

  let pageToken: string | undefined;
  const ids: string[] = [];
  const mapPublishedAt: Record<string, string> = {};
  let stop = false;

  do {
    const qs = new URLSearchParams({
      key: process.env.YOUTUBE_API_KEY!,
      part: 'snippet',
      playlistId: uploadsId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });

    type Item = { snippet?: { publishedAt?: string; resourceId?: { videoId?: string } } };
    const data = await fetchJSON<{ items: Item[]; nextPageToken?: string }>(
      `${BASE}/playlistItems?${qs.toString()}`
    );

    for (const it of data.items || []) {
      const publishedAt = it.snippet?.publishedAt;
      const vid = it.snippet?.resourceId?.videoId;
      if (!publishedAt || !vid) continue;
      const ts = new Date(publishedAt).getTime();

      if (ts > end) {
        // 기간 상한보다 최신 → 스킵
        continue;
      }
      if (ts < start) {
        // 시작일보다 과거 → 더 내려갈 필요 없음 (조기 종료)
        stop = true;
        break;
      }

      ids.push(vid);
      mapPublishedAt[vid] = publishedAt;
    }

    if (stop) break;
    pageToken = data.nextPageToken;
  } while (pageToken);

  return { videoIds: ids, mapPublishedAt };
}
