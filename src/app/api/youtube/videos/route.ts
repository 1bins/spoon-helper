import { NextRequest, NextResponse } from "next/server";
import { fetchVideosDetails } from "@/lib/youtube/fetchVideoDetails";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids: unknown = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids: string[]가 필요합니다.'}, {status: 400});
    }

    const stringIds = ids.filter((x): x is string => typeof x === 'string');

    const items = await fetchVideosDetails(stringIds);
    return NextResponse.json({ total: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}