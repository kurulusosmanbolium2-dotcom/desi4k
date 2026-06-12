import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { getVideos, getAllVideos, incrementViews } from "../lib/firestore";
import type { Videos } from "../types/video";
import { getTags, formatViews, formatDuration } from "../types/video";

const LOGO = "https://i.ibb.co.com/KJR1M1S/Airbrush-IMAGE-ENHANCER-1780990857633-1780990857634.png";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const viewCountedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    viewCountedRef.current = false;
    setLoading(true); setError(null); setVideo(null); setRelated([]); setDescExpanded(false);

    Promise.all([getVideos(id), getAllVideos()])
      .then(([vid, allVids]) => {
        if (!vid) { setError("Video not found."); return; }
        setVideo(vid);
        const vidTags = getTags(vid.tags);
        const rel = allVids.filter((v) => v.id !== id)
          .filter((v) => getTags(v.tags).some((t) => vidTags.includes(t)))
          .slice(0, 8);
        setRelated(rel.length > 0 ? rel : allVids.filter((v) => v.id !== id).slice(0, 8));
      })
      .catch(() => setError("Failed to load video."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !video || viewCountedRef.current) return;
    viewCountedRef.current = true;
    incrementViews(id).catch(() => {});
  }, [id, video]);

  if (loading) return <SkeletonPage />;

  if (error || !video) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0f18", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎬</div>
          <p style={{ fontSize: 18, color: "#e8e8e8", marginBottom: 16 }}>{error || "Video not found"}</p>
          <Link href="/" style={{ display: "inline-block", background: "#f5c518", color: "#111", fontWeight: 700, padding: "10px 22px", borderRadius: 10, textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tags = getTags(video.tags);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f18", color: "#e8e8e8", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#090b14", borderBottom: "1px solid #1e2234", padding: "0 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: "#bbb", fontSize: 22, textDecoration: "none" }}>←</Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src={LOGO} alt="Logo" style={{ height: 38, width: "auto", objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <style>{`@media(min-width:900px){.vp-grid{display:grid!important;grid-template-columns:2fr 1fr!important;gap:24px!important}}`}</style>
        <div className="vp-grid" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* VIDEO + INFO */}
          <div>
            <div style={{ background: "#000", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
              <video
                src={video.src} poster={video.thumb} controls
                style={{ width: "100%", aspectRatio: "16/9", background: "#000", display: "block" }}
                controlsList="nodownload"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.4, margin: "0 0 12px" }}>
                {video.title}
              </h1>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#666", marginBottom: 14, flexWrap: "wrap" }}>
                <span>👁 {formatViews(video.views)} views</span>
                {video.duration && <span>⏱ {formatDuration(video.duration)}</span>}
              </div>

              {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ background: "#1a1d2a", border: "1px solid #2a2d3a", color: "#aaa", fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {video.description && (
                <div style={{ background: "#111320", borderRadius: 10, padding: "14px 16px", border: "1px solid #1e2234" }}>
                  <p style={{
                    fontSize: 13, color: "#bbb", lineHeight: 1.7,
                    whiteSpace: "pre-wrap", margin: 0, overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: descExpanded ? (999 as unknown as number) : 3,
                    WebkitBoxOrient: "vertical" as const,
                  }}>
                    {video.description}
                  </p>
                  {video.description.length > 150 && (
                    <button onClick={() => setDescExpanded(!descExpanded)}
                      style={{ marginTop: 8, background: "none", border: "none", color: "#f5c518", fontSize: 12, cursor: "pointer", padding: 0 }}>
                      {descExpanded ? "▲ Show less" : "▼ Show more"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RELATED */}
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
              Related Videos
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {related.map((v) => <RelatedCard key={v.id} video={v} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedCard({ video }: { video: Video }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/video/${video.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: "flex", gap: 10, padding: 8, borderRadius: 10, background: hover ? "#13162a" : "transparent", border: hover ? "1px solid #1e2234" : "1px solid transparent", transition: "all 0.15s", cursor: "pointer" }}
      >
        <div style={{ position: "relative", width: 140, flexShrink: 0, borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", background: "#111" }}>
          <img src={video.thumb} alt={video.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.05)" : "scale(1)", transition: "transform 0.3s" }}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/140x79/13162a/555?text=No+Thumb"; }} />
          {video.duration && (
            <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.85)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: hover ? "#f5c518" : "#e0e0e0",
            lineHeight: 1.35, overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            marginBottom: 6, transition: "color 0.15s",
          }}>
            {video.title}
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>👁 {formatViews(video.views)}</div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0f18", fontFamily: "Inter, sans-serif" }}>
      <div style={{ height: 64, background: "#090b14", borderBottom: "1px solid #1e2234" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#13162a", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ height: 22, background: "#13162a", borderRadius: 6, width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 14, background: "#13162a", borderRadius: 6, width: "30%", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
        }
