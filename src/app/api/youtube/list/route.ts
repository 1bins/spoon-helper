import { NextRequest, NextResponse } from 'next/server';
import { listVideoIdsInRange } from '@/lib/youtube/listVideoIds';
import type { SearchVideoListResponse, SearchVideoItem } from '@/lib/youtube/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!channelId || !start || !end) {
      return NextResponse.json(
        { error: 'channelId, start, end 쿼리가 필요합니다.' },
        { status: 400 }
      );
    }

    // ISO 검증 & 정규화
    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();
    if (isNaN(Date.parse(startISO)) || isNaN(Date.parse(endISO))) {
      return NextResponse.json({ error: '유효한 ISO 날짜가 아닙니다.' }, { status: 400 });
    }
    if (new Date(startISO) > new Date(endISO)) {
      return NextResponse.json({ error: '시작일이 종료일보다 이후일 수 없습니다.' }, { status: 400 });
    }

    const { videoIds, mapPublishedAt } = await listVideoIdsInRange(channelId, startISO, endISO);

    const items: SearchVideoItem[] = videoIds.map((id) => ({
      videoId: id,
      publishedAt: mapPublishedAt[id] || '',
    }));

    const payload: SearchVideoListResponse = {
      channelId,
      startISO,
      endISO,
      total: items.length,
      items,
    };

    // 최신 업로드 순 정렬 (원하면 제거)
    payload.items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
