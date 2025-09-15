import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type InputType = 'handle' | 'user' | 'channelId';
type Parsed = { type: InputType; value: string };

const BASE = 'https://www.googleapis.com/youtube/v3';
const KEY = process.env.YOUTUBE_API_KEY; // 서버에서만 접근 가능

if (!KEY) {
  throw new Error('환경변수 YOUTUBE_API_KEY가 설정되지 않았습니다.');
}

// 0) 입력 파싱 (@핸들 | user/xxx | channel/UCxxxx | 전체 URL)
function parseInput(raw: string): Parsed {
  const trimmed = raw.trim();
  const afterDomain = trimmed.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '');

  if (trimmed.startsWith('@')) return { type: 'handle', value: trimmed };
  if (afterDomain.startsWith('user/')) {
    return { type: 'user', value: afterDomain.replace(/^user\//, '').split(/[/?#]/)[0] };
  }
  if (afterDomain.startsWith('channel/')) {
    return { type: 'channelId', value: afterDomain.replace(/^channel\//, '').split(/[/?#]/)[0] };
  }
  if (/^UC[0-9A-Za-z_-]{22}$/.test(trimmed)) return { type: 'channelId', value: trimmed };

  // 그냥 'spoon' 처럼 들어오면 핸들로 가정
  return { type: 'handle', value: trimmed.startsWith('@') ? trimmed : `@${trimmed}` };
}

// 1) 공통 fetch 헬퍼 (에러 처리 + 쿼리스트링)
async function yt<T>(endpoint: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ key: KEY!, ...params }).toString();
  const res = await fetch(`${BASE}/${endpoint}?${qs}`, {
    // App Router 서버 fetch: 기본 내장됨 (node-fetch 설치 불필요)
    cache: 'no-store',
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`YouTube API 실패: ${res.status} ${res.statusText} ${msg}`);
  }
  return (await res.json()) as T;
}

// 2) 채널 ID 조회
async function resolveChannelId(parsed: Parsed): Promise<string | null> {
  if (parsed.type === 'channelId') {
    // id 검증
    const r = await yt<{ items: Array<{ id: string }> }>('channels', { part: 'id', id: parsed.value });
    return r.items?.[0]?.id ?? null;
  }
  if (parsed.type === 'handle') {
    const handle = parsed.value.startsWith('@') ? parsed.value : `@${parsed.value}`;
    const r = await yt<{ items: Array<{ id: string }> }>('channels', { part: 'id', forHandle: handle });
    return r.items?.[0]?.id ?? null;
  }
  // user/xxx (레거시 유저네임)
  const r = await yt<{ items: Array<{ id: string }> }>('channels', { part: 'id', forUsername: parsed.value });
  return r.items?.[0]?.id ?? null;
}

// ========== 실제 API 핸들러(GET) ==========
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get('input'); // 예: @스푼, user/spoon, channel/UCxxxx, 전체 URL

    if (!input) {
      return NextResponse.json({ error: 'input 쿼리 파라미터가 필요합니다.' }, { status: 400 });
    }

    const parsed = parseInput(input);
    const channelId = await resolveChannelId(parsed);

    if (!channelId) {
      return NextResponse.json({ error: '채널을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, channelId });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : '서버 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}