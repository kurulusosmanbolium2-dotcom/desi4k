import { useState, useEffect } from "react";
import { Link } from "wouter";
import { getAllVideos } from "../lib/firestore";
import type { Videos } from "../types/videos";
import { formatViews, formatDuration } from "../types/videos";

const LOGO = "https://i.ibb.co.com/KJR1M1S/Airbrush-IMAGE-ENHANCER-1780990857633-1780990857634.png";

export default function HomePage() {
  const [videos, setVideos] = useState<Videos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllVideos()
      .then(setVideos)
      .catch((err: Error) => {
        const msg = err?.message ?? "";
        if (msg.includes("not found") || msg.includes("not-found")) {
          setError("Firestore database not found. Firebase Console → Firestore Database → Create database করো, তারপর reload দাও।");
        } else if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
          setError("Firestore permission denied. Security Rules আপডেট করো।");
        } else {
          setError("Videos load হয়নি: " + msg);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) =>
    v.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f18", color: "#e8e8e8", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#090b14", borderBottom: "1px solid #1e2234", padding: "0 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={LOGO} alt="Logo" style={{ height: 42, width: "auto", objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </Link>
          <div style={{ flex: 1, maxWidth: 420 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1d2a", border: "1px solid #2a2d3a", borderRadius: 10, padding: "8px 12px" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f5c518" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#fff", flex: 1 }}
              />
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
            {search ? `Results for "${search}"` : "Latest Videos"}
          </h1>
          <span style={{ fontSize: 13, color: "#555" }}>
            {loading ? "Loading..." : `${filtered.length} videos`}
          </span>
        </div>

        {error && (
          <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", padding: "14px 18px", borderRadius: 10, marginBottom: 24, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <p style={{ fontSize: 16, color: "#888" }}>No videos found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map((v) => <VideoCard key={v.id} videos={v} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function VideoCard({ videos }: { videos: Videos }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/videos/${videos.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          borderRadius: 12, overflow: "hidden", background: "#13162a",
          border: hover ? "1px solid rgba(245,197,24,0.4)" : "1px solid #1e2234",
          transition: "border 0.2s", cursor: "pointer",
        }}
      >
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#111", overflow: "hidden" }}>
          <img
            src={videos.thumb} alt={videos.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform 0.3s" }}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/480x270/13162a/555?text=No+Thumbnail"; }}
          />
          {hover && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f5c518", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" fill="#111" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          )}
          {video.duration && (
            <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 5 }}>
              {formatDuration(videos.duration)}
            </div>
          )}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: hover ? "#f5c518" : "#e8e8e8",
            lineHeight: 1.35, marginBottom: 8, overflow: "hidden",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const, transition: "color 0.2s",
          }}>
            {video.title}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
            <span>👁 {formatViews(videos.views)} views</span>
            {videos.duration && <span>⏱ {formatDuration(video.duration)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "#13162a", border: "1px solid #1e2234" }}>
          <div style={{ width: "100%", aspectRatio: "16/9", background: "#1a1d2a", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, background: "#1a1d2a", borderRadius: 6, width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 11, background: "#1a1d2a", borderRadius: 6, width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
