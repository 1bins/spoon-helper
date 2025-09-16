// app/api/youtube/videos/route.ts
import { NextResponse as NRes } from 'next/server';
import { fetchVideosDetails } from '@/lib/youtube/fetchVideoDetails';

export async function POST(req: Request) {
  try {
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NRes.json({ error: 'ids 배열이 필요합니다' }, { status: 400 });
    }

    const items = await fetchVideosDetails(ids);
    return NRes.json({ total: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return NRes.json({ error: message || 'videos 실패' }, { status: 500 });
  }
}