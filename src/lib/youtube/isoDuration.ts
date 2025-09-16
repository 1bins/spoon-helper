export function isoToSeconds(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [, h, min, s] = m.map(v => (v ? parseInt(v, 10) : 0));
  return (h || 0) * 3600 + (min || 0) * 60 + (s || 0);
}