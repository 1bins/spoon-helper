import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) return NextResponse.json({ error: "fetch failed" }, { status: 502 });

  const buf = await res.arrayBuffer();
  const ct = res.headers.get("content-type") ?? "image/jpeg";
  return new NextResponse(buf, {
    headers: {
      "content-type": ct,
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}
