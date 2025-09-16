// app/api/youtube/channelId/route.ts
import { NextResponse } from 'next/server';

const BASE = 'https://www.googleapis.com/youtube/v3';

function pickHandleOrUserOrChannel(input: string) {
  const t = input.trim();
  if (t.startsWith('@')) return { type: 'handle', value: t.replace(/^@+/, '') };
  const idxUser = t.indexOf('user/');
  if (idxUser >= 0) return { type: 'user', value: t.slice(idxUser + 5) };
  const idxCh = t.indexOf('channel/');
  if (idxCh >= 0) return { type: 'channelId', value: t.slice(idxCh + 8) };
  if (t.startsWith('UC')) return { type: 'channelId', value: t }; // 식별자 직접 입력
  return { type: 'handle', value: t };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get('input') || '';

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY가 없습니다' }, { status: 500 });
    }

    const { type, value } = pickHandleOrUserOrChannel(input);
    let channelId = '';

    if (type === 'channelId') {
      channelId = value;
    } else if (type === 'handle') {
      const qs = new URLSearchParams({ key: process.env.YOUTUBE_API_KEY!, part: 'id', forHandle: value });
      const res = await fetch(`${BASE}/channels?${qs.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      channelId = data?.items?.[0]?.id || '';
    } else if (type === 'user') {
      const qs = new URLSearchParams({ key: process.env.YOUTUBE_API_KEY!, part: 'id', forUsername: value });
      const res = await fetch(`${BASE}/channels?${qs.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      channelId = data?.items?.[0]?.id || '';
    }

    if (!channelId) return NextResponse.json({ error: '채널 ID를 찾을 수 없습니다' }, { status: 404 });
    return NextResponse.json({ channelId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message: '서버 오류';
    return NextResponse.json({ error: message || 'channelId resolve 실패' }, { status: 500 });
  }
}
