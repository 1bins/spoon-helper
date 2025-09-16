// app/api/youtube/list/route.ts
import { NextResponse as NR } from 'next/server';
import { listVideoIdsInRange } from '@/lib/youtube/listVideoIds';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!channelId || !start || !end) {
      return NR.json({ error: 'channelId, start, end 파라미터가 필요합니다' }, { status: 400 });
    }

    const { videoIds, mapPublishedAt } = await listVideoIdsInRange(channelId, start, end);
    const items = videoIds.map((id) => ({ videoId: id, publishedAt: mapPublishedAt[id] }));

    return NR.json({ total: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message: '서버 오류';
    return NR.json({ error: message || 'list 실패' }, { status: 500 });
  }
}
