export interface Video {
  id: string; title: string; src: string; description: string;
  keyword: string; thumb: string; tags: string[] | string;
  views: number; duration: string | number;
}
export function getTags(t: string[]|string): string[] {
  if (Array.isArray(t)) return t;
  return typeof t === "string" ? t.split(",").map(x=>x.trim()).filter(Boolean) : [];
}
export function formatViews(v: number) {
  if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
  return String(v??0);
}
export function formatDuration(d: string|number) {
  if (typeof d === "number") { const m=Math.floor(d/60),s=d%60; return `${m}:${String(s).padStart(2,"0")}`; }
  return String(d??"");
}
