// lib/youtube/fetchVideoDetails.ts
// 서버 전용 유틸 (API 라우트에서 사용)
import { isoToSeconds } from './isoDuration';

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

const BASE = 'https://www.googleapis.com/youtube/v3';
const SHORTS_URL = (id: string) => `https://www.youtube.com/shorts/${id}`;
const WATCH_URL  = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** 동시성 제한 유틸 (간단 버전) */
async function mapWithConcurrency<T, R>(
  arr: T[],
  limit: number,
  mapper: (t: T, idx: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(arr.length) as R[];
  let i = 0;

  async function worker() {
    while (i < arr.length) {
      const cur = i++;
      out[cur] = await mapper(arr[cur], cur);
    }
  }

  const workers = Array.from({ length: Math.min(limit, arr.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

/**
 * /shorts/:id HEAD 요청으로 숏폼 여부 판별
 * - 200 이면 Shorts UI로 제공 → true
 * - 30x 이면 /watch로 리다이렉트 → false
 * - 그 외 / 에러 → null
 */
async function isShortsByURL(videoId: string): Promise<boolean | null> {
  try {
    const res = await fetch(SHORTS_URL(videoId), {
      method: 'HEAD',
      redirect: 'manual', // 리다이렉트 추적 금지
      // 유튜브는 HEAD 허용. 4xx/5xx 등 네트워크 이슈는 null 처리
    });

    const status = res.status;
    const loc = res.headers.get('location') || '';

    if (status === 200) return true; // Shorts 페이지로 바로 응답
    if (status >= 300 && status < 400) {
      // 일반적으로 /watch 로 리다이렉트됨
      if (loc.includes('/watch')) return false;
      return false; // 보수적으로 false
    }
    return null;
  } catch {
    return null;
  }
}

function chunk<T>(arr: T[], size = 50) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function fetchVideosDetails(videoIds: string[]): Promise<VideoDetail[]> {
  if (!process.env.YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY가 없습니다');

  const unique = Array.from(new Set(videoIds)).filter(Boolean);
  const chunks = chunk(unique, 50);
  const results: VideoDetail[] = [];

  for (const ids of chunks) {
    const qs = new URLSearchParams({
      key: process.env.YOUTUBE_API_KEY!,
      part: 'snippet,contentDetails,statistics', // 반드시 contentDetails 포함
      id: ids.join(','),
      maxResults: '50',
    });

    type ApiResp = {
      items: Array<{
        id: string;
        snippet?: {
          title?: string;
          publishedAt?: string;
          thumbnails?: {
            maxres?: { url?: string };
            standard?: { url?: string };
            high?: { url?: string };
            medium?: { url?: string };
            default?: { url?: string };
          };
        };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
      }>;
    };

    const res = await fetch(`${BASE}/videos?${qs.toString()}`, { cache: 'no-store', next: { revalidate: 0 } });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`videos.list 실패: ${res.status} ${res.statusText} ${msg}`);
    }
    const data = (await res.json()) as ApiResp;

    for (const it of data.items || []) {
      const title = it.snippet?.title || '';
      const durationIso = it.contentDetails?.duration || '';
      const durationSec = isoToSeconds(durationIso);

      // 프로젝트 스펙: 3분(180초) 미만이면 숏폼으로 간주 (fallback)
      const isShortByDuration = durationSec > 0 ? durationSec < 180 : false;

      const thumb =
        it.snippet?.thumbnails?.maxres?.url ||
        it.snippet?.thumbnails?.standard?.url ||
        it.snippet?.thumbnails?.high?.url ||
        it.snippet?.thumbnails?.medium?.url ||
        it.snippet?.thumbnails?.default?.url ||
        '';

      results.push({
        videoId: it.id,
        title,
        url: WATCH_URL(it.id), // 기본값은 watch
        thumbnail: thumb,
        publishedAt: it.snippet?.publishedAt || '',
        viewCount: Number(it.statistics?.viewCount || 0),
        likeCount: Number(it.statistics?.likeCount || 0),
        commentCount: Number(it.statistics?.commentCount || 0),
        durationSeconds: durationSec,
        isShort: isShortByDuration,
      });
    }
  }

  // 🔎 URL 프루빙 (동시성 제한: 8개씩)
  // - API 쿼터와 무관 (YouTube 웹 HEAD 요청)
  await mapWithConcurrency(results, 8, async (item) => {
    const byURL = await isShortsByURL(item.videoId);
    if (byURL === true) {
      item.isShort = true;
      item.url = SHORTS_URL(item.videoId);
    } else if (byURL === false) {
      item.isShort = false;
      item.url = WATCH_URL(item.videoId);
    }
    // null 인 경우: duration 기준값(3분) 유지
    return item;
  });

  return results;
}
