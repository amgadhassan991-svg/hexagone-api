import { IntelPost } from "../types";

interface Props {
  posts: IntelPost[];
  onDelete: (id: string) => void;
}

const TAG_COLORS: Record<string, string> = {
  "Market Trend": "#3b82f6",
  "Competitive Intel": "#8b5cf6",
  "Pricing Signal": "#f59e0b",
  "Client Insight": "#10b981",
  "General Intelligence": "#64748b",
};

export function IntelligenceTab({ posts, onDelete }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-4">
        <div className="text-4xl mb-3">📡</div>
        <div className="text-base font-semibold" style={{ color: "#64748b" }}>
          No market intelligence archived yet
        </div>
        <div className="text-sm mt-1 text-center" style={{ color: "#374151" }}>
          Use the Ingestion Hub to process raw posts.<br />
          Posts with no phone numbers become market intelligence.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="text-xs" style={{ color: "#475569" }}>
        {posts.length} intelligence item{posts.length !== 1 ? "s" : ""} archived
      </div>
      {posts.map((post) => {
        const color = TAG_COLORS[post.tag] || "#64748b";
        return (
          <div
            key={post.id}
            className="card-hover rounded-xl overflow-hidden animate-slide-up"
            style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.08)" }}
          >
            <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
                    >
                      {post.tag}
                    </span>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                    {post.excerpt}{post.rawText.length > 200 ? "..." : ""}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(post.id)}
                  className="text-sm px-2 py-1 rounded flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.06)", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
