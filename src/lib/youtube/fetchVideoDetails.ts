import { isoToSeconds } from "./isoDuration";

const BASE = 'https://www.googleapis.com/youtube/v3';
const KEY = process.env.YOUTUBE_API_KEY!;

// ----- Shorts 판별: /shorts/{id} HEAD 트릭 -----
async function isShortsByURL(videoId: string): Promise<boolean> {
  const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
    method: 'HEAD',
    redirect: 'manual',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (res.status === 200) return true;
  if (res.status === 303) return false;

  return false;
}

function createLimiter(n: number) {
  let active = 0;
  const queue: Array<() => void> = [];
  const next = () => {
    active--;
    if (queue.length) queue.shift()!();
  };
  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= n) await new Promise<void>(r => queue.push(r));
    active++;
    try {
      const v = await fn();
      return v;
    } finally {
      next();
    }
  };
}

export type VideoDetail = {
  videoId: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  durationSeconds: number;
  isShort: boolean;
};

type ApiResp = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description?: string;
      publishedAt: string;
      thumbnails?: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
    contentDetails: { duration: string };
    statistics?: { viewCount?: string; likeCount?: string; commentCount?: string; }
  }>;
};

export async function fetchVideosDetails(videoIds: string[]): Promise<VideoDetail[]> {
  if (!KEY) throw new Error('YOUTUBE_API_KEY가 없습니다');

  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  const temp: Array<VideoDetail & { _title?: string; _description?: string }> = [];

  for (const ids of chunks) {
    const qs = new URLSearchParams({
      key: KEY,
      part: 'snippet,contentDetails,statistics',
      id: ids.join(','),
      maxResults: '50',
    }).toString();

    const res = await fetch(`${BASE}/videos?${qs}`, { cache: 'no-store', next: { revalidate: 0 } });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`videos.list 실패: ${res.status} ${res.statusText} ${msg}`);
    }
    const data = (await res.json()) as ApiResp;

    for (const v of data.items || []) {
      const secs = isoToSeconds(v.contentDetails.duration);

      temp.push({
        videoId: v.id,
        title: v.snippet.title,
        _title: v.snippet.title,
        _description: v.snippet.description ?? '',
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail:
          v.snippet.thumbnails?.medium?.url ||
          v.snippet.thumbnails?.high?.url ||
          v.snippet.thumbnails?.default?.url ||
          '',
        publishedAt: v.snippet.publishedAt,
        viewCount: parseInt(v.statistics?.viewCount || '0', 10),
        likeCount: parseInt(v.statistics?.likeCount || '0', 10),
        commentCount: parseInt(v.statistics?.commentCount || '0', 10),
        durationSeconds: secs,
        isShort: secs < 180,
      });
    }
  }

  // ===== Shorts 최종 교정 단계 =====
  // 1) 180초 초과면 무조건 false
  // 2) 180초 이하만 /shorts HEAD 검사 (동시성 제한 5)
  // 3) 보조휴리스틱: #shorts 해시태그가 제목/설명에 있으면 가산점 (HEAD 실패 시만 사용)

  const limit = createLimiter(5);
  await Promise.all(
    temp.map(item =>
      limit(async () => {
        if (item.durationSeconds > 180) {
          item.isShort = false;
          return;
        }

        // 2-1) /shorts HEAD 트릭
        let byURL: boolean | null = null;
        try {
          byURL = await isShortsByURL(item.videoId);
        } catch {
          byURL = null;
        }

        if (byURL === true) {
          item.isShort = true;
          item.url = `https://www.youtube.com/shorts/${item.videoId}`;
          return;
        }
        if (byURL === false) {
          item.isShort = false;
          item.url = `https://www.youtube.com/watch?v=${item.videoId}`;
          return;
        }

        // 3) 보조 휴리스틱 (HEAD 결과 모호할 때만)
        const hasHashtag =
          /#shorts/i.test(item._title || '') || /#shorts/i.test(item._description || '');
        if (item.durationSeconds <= 180 && hasHashtag) {
          item.isShort = true;
          item.url = `https://www.youtube.com/shorts/${item.videoId}`;
        } else {
          item.isShort = false;
          item.url = `https://www.youtube.com/watch?v=${item.videoId}`;
        }
      })
    )
  );

  // 최신 업로드 순 정렬
  temp.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  // 내부 보조필드 제거
  const all: VideoDetail[] = temp.map(({ _title, _description, ...rest }) => rest);
  return all;
}
