import { useState, useEffect, useCallback } from "react";

interface SellerPost {
  id: number;
  rawText: string;
  sourceGroupUrl?: string;
  sourceGroupName?: string;
  postUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactPhones?: string[];
  contactEmail?: string;
  propertyDetails?: string;
  location?: string;
  keywordsMatched?: string[];
  triggerCategory?: string;
  motivationScore: number;
  withinLast24h: boolean;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Props { apiBase: string; }

const TRIGGER_META: Record<string, { label: string; color: string; icon: string }> = {
  urgent_sale:     { label: "Urgent Sale",       color: "#ef4444", icon: "⚡" },
  traveling:       { label: "Owner Traveling",   color: "#f59e0b", icon: "✈️" },
  below_market:    { label: "Below Market",      color: "#10b981", icon: "💰" },
  motivated_seller:{ label: "Motivated Seller",  color: "#8b5cf6", icon: "🔥" },
  madinaty_location:{ label: "Madinaty / New Cairo", color: "#3b82f6", icon: "📍" },
  direct_owner:    { label: "Direct Owner",      color: "#d4af37", icon: "👤" },
  general:         { label: "General Signal",    color: "#64748b", icon: "🔹" },
};

const STATUS_OPTS = [
  ["new","🆕 New"],["contacted","📞 Contacted"],
  ["negotiating","🤝 Negotiating"],["closed","🏁 Closed"],["disqualified","❌ Skip"],
];

const GROUP_DEFAULTS = [
  { name: "Madinaty Residents", url: "https://www.facebook.com/groups/2791019307842181" },
  { name: "New Cairo Real Estate", url: "https://www.facebook.com/groups/newcairorealestate" },
  { name: "Custom…", url: "" },
];

const SCAN_KEYWORDS = [
  "urgent sale","traveling","below market price","direct owner",
  "مدينتي","Madinaty","motivated seller","سعر منخفض","بدون سمسار","بيع عاجل",
];

const PLACEHOLDER = `Paste the raw Facebook post text here…

Example 1 — Urgent:
  URGENT SALE – Madinaty Phase 3, 3-bed apartment 180 sqm
  Owner traveling abroad next week, must sell.
  Below market price: 4.2M EGP negotiable.
  Direct owner, no broker fees.
  Contact: Ahmed – 01012345678

Example 2 — Arabic:
  بيع عاجل في مدينتي المرحلة 5
  شقة 145 متر، 3 غرف، سعر أقل من السوق
  المالك مسافر - اتصل: 01098765432`;

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "#ef4444" : score >= 50 ? "#f59e0b" : score >= 30 ? "#10b981" : "#64748b";
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, height: 5, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

export function SellerScannerTab({ apiBase }: Props) {
  const [posts, setPosts] = useState<SellerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState("");
  const [groupName, setGroupName] = useState(GROUP_DEFAULTS[0].name);
  const [groupUrl, setGroupUrl] = useState(GROUP_DEFAULTS[0].url);
  const [customGroupUrl, setCustomGroupUrl] = useState("");
  const [withinLast24h, setWithinLast24h] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<SellerPost | null>(null);
  const [catFilter, setCatFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/intel/seller-posts`);
      if (res.ok) setPosts(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [apiBase]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleScan() {
    if (!raw.trim()) return;
    setScanning(true);
    try {
      const res = await fetch(`${apiBase}/api/intel/scan-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: raw,
          sourceGroupName: groupName === "Custom…" ? "Custom Group" : groupName,
          sourceGroupUrl: groupName === "Custom…" ? customGroupUrl : groupUrl,
          withinLast24h,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { post } = await res.json();
      setLastResult(post);
      setRaw("");
      await fetchPosts();
      setExpandedId(post.id);
    } catch (e) { console.error(e); }
    setScanning(false);
  }

  async function updateStatus(id: number, status: string, notes: string) {
    await fetch(`${apiBase}/api/intel/seller-posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    await fetchPosts();
  }

  async function deletePost(id: number) {
    await fetch(`${apiBase}/api/intel/seller-posts/${id}`, { method: "DELETE" });
    setPosts(p => p.filter(x => x.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  function exportCSV() {
    if (!filtered.length) return;
    const headers = ["ID","Name","Phone","Email","Location","Property","Category","Score","Status","24h","Scanned"];
    const rows = filtered.map(p => [p.id, p.contactName||"", p.contactPhone||"", p.contactEmail||"", p.location||"", (p.propertyDetails||"").replace(/,/g,";"), p.triggerCategory||"", p.motivationScore, p.status, p.withinLast24h?"yes":"no", new Date(p.createdAt).toLocaleDateString()]);
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `seller_scanner_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const filtered = posts
    .filter(p => catFilter === "all" || p.triggerCategory === catFilter)
    .filter(p => p.motivationScore >= scoreFilter);

  const highAlert = filtered.filter(p => p.motivationScore >= 60).length;
  const categories = [...new Set(posts.map(p => p.triggerCategory||"general"))];

  return (
    <div className="space-y-4 p-4">

      {/* Scanner Header */}
      <div className="glass rounded-2xl p-4 glow-gold">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              <span className="font-black" style={{ color: "#d4af37", fontSize: 15 }}>Motivated Seller Scanner</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                LIVE · 24h FILTER
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              Paste posts from Madinaty / New Cairo groups. Extracts contacts & scores seller motivation.
            </p>
          </div>
          <button onClick={exportCSV} disabled={!filtered.length} className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37", opacity: filtered.length ? 1 : 0.4 }}>
            📥 Export CSV
          </button>
        </div>

        {/* Keyword triggers */}
        <div className="mb-3">
          <div className="text-xs mb-1.5 font-semibold" style={{ color: "#64748b" }}>ACTIVE SCAN FILTERS</div>
          <div className="flex flex-wrap gap-1.5">
            {SCAN_KEYWORDS.map(kw => (
              <span key={kw} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)", color: "#a8882a" }}>
                "{kw}"
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.04)", border: "1px dashed rgba(212,175,55,0.2)", color: "#475569" }}>
              + 24 more
            </span>
          </div>
        </div>

        {/* Group selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1" style={{ color: "#64748b" }}>Facebook Group</label>
            <select value={groupName} onChange={e => { const g = GROUP_DEFAULTS.find(x => x.name === e.target.value); setGroupName(e.target.value); setGroupUrl(g?.url || ""); }}
              style={{ width: "100%", background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 8, color: "#94a3b8", padding: "7px 10px", fontSize: 12, outline: "none" }}>
              {GROUP_DEFAULTS.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
            </select>
          </div>
          {groupName === "Custom…" && (
            <div className="sm:col-span-2">
              <label className="block text-xs mb-1" style={{ color: "#64748b" }}>Custom Group URL</label>
              <input value={customGroupUrl} onChange={e => setCustomGroupUrl(e.target.value)} placeholder="https://facebook.com/groups/..."
                style={{ width: "100%", background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 8, color: "#f1f5f9", padding: "7px 10px", fontSize: 12, outline: "none" }} />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1" style={{ color: "#64748b" }}>Post Age</label>
            <div className="flex gap-1.5">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setWithinLast24h(v)}
                  className="flex-1 text-xs py-1.5 rounded-lg font-semibold"
                  style={{ background: withinLast24h === v ? (v ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.1)") : "#0a0f1e", border: `1px solid ${withinLast24h === v ? (v ? "rgba(16,185,129,0.3)" : "rgba(148,163,184,0.2)") : "rgba(212,175,55,0.1)"}`, color: withinLast24h === v ? (v ? "#10b981" : "#94a3b8") : "#475569" }}>
                  {v ? "⏱ < 24h" : "Older"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Paste area */}
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={6} placeholder={PLACEHOLDER}
          style={{ width: "100%", background: "#060d1a", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, color: "#f1f5f9", padding: "10px 12px", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", lineHeight: 1.7 }} />

        {lastResult && (
          <div className="mt-2 p-3 rounded-xl animate-fade flex items-center gap-3"
            style={{ background: lastResult.motivationScore >= 50 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${lastResult.motivationScore >= 50 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
            <div className="text-2xl font-black tabular-nums" style={{ color: lastResult.motivationScore >= 50 ? "#ef4444" : "#10b981" }}>{lastResult.motivationScore}</div>
            <div className="flex-1 text-xs" style={{ color: "#94a3b8" }}>
              <span className="font-semibold" style={{ color: "#f1f5f9" }}>Post scanned.</span>{" "}
              Motivation score: {lastResult.motivationScore}/100 · Triggers: {(lastResult.keywordsMatched || []).length} matched
              {lastResult.contactPhone && <> · 📞 <span style={{ color: "#d4af37" }}>{lastResult.contactPhone}</span></>}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs" style={{ color: "#374151" }}>{raw.length > 0 ? `${raw.length} chars · ready to scan` : "Paste a post to begin"}</span>
          <div className="flex gap-2">
            <button onClick={() => { setRaw(""); setLastResult(null); }} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(148,163,184,0.06)", color: "#4b5563" }}>Clear</button>
            <button onClick={handleScan} disabled={!raw.trim() || scanning}
              className="text-sm px-5 py-2 rounded-xl font-bold"
              style={{ background: raw.trim() ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(239,68,68,0.1)", color: raw.trim() ? "#fff" : "#64748b", cursor: raw.trim() ? "pointer" : "not-allowed" }}>
              {scanning ? "Scanning…" : "🕵️ Scan Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Scanned", val: posts.length, color: "#d4af37" },
            { label: "🔴 High Alert (≥60)", val: highAlert, color: "#ef4444" },
            { label: "✈️ Traveling", val: posts.filter(p=>p.triggerCategory==="traveling").length, color: "#f59e0b" },
            { label: "💰 Below Market", val: posts.filter(p=>p.triggerCategory==="below_market").length, color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <div className="font-black text-xl tabular-nums" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {posts.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, color: "#94a3b8", padding: "6px 10px", fontSize: 12, outline: "none" }}>
            <option value="all">All Triggers</option>
            {categories.map(c => <option key={c} value={c}>{TRIGGER_META[c]?.icon} {TRIGGER_META[c]?.label || c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#475569" }}>Min score:</span>
            {[0, 30, 50, 70].map(v => (
              <button key={v} onClick={() => setScoreFilter(v)}
                className="text-xs px-2 py-1 rounded-lg font-semibold"
                style={{ background: scoreFilter === v ? "rgba(212,175,55,0.15)" : "transparent", border: `1px solid ${scoreFilter === v ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.08)"}`, color: scoreFilter === v ? "#d4af37" : "#4b5563" }}>
                {v === 0 ? "All" : `${v}+`}
              </button>
            ))}
          </div>
          <span className="text-xs ml-auto" style={{ color: "#374151" }}>{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2" style={{ color: "#374151" }}>
          <span className="animate-spin">⬡</span> Loading scanner…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "rgba(15,23,42,0.3)", border: "1px dashed rgba(212,175,55,0.1)" }}>
          <div className="text-4xl mb-2">🕵️</div>
          <div className="font-semibold" style={{ color: "#4b5563" }}>{posts.length === 0 ? "No posts scanned yet" : "No posts match your filters"}</div>
          <div className="text-sm mt-1" style={{ color: "#374151" }}>Paste a Facebook post above to start scanning</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const meta = TRIGGER_META[post.triggerCategory || "general"];
            const isHigh = post.motivationScore >= 60;
            const isOpen = expandedId === post.id;
            return (
              <div key={post.id} className="rounded-2xl overflow-hidden card-hover animate-slide-up"
                style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)", border: `1px solid ${isHigh ? "rgba(239,68,68,0.2)" : "rgba(212,175,55,0.08)"}` }}>
                {isHigh && <div style={{ height: 2, background: "linear-gradient(90deg,#ef4444,#f59e0b,transparent)" }} />}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }}>
                          {meta.icon} {meta.label}
                        </span>
                        {post.withinLast24h && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>⏱ 24h</span>
                        )}
                        {isHigh && <span className="text-xs font-bold" style={{ color: "#ef4444" }}>🔴 HIGH ALERT</span>}
                        <span className="text-xs ml-auto" style={{ color: "#374151" }}>{new Date(post.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        {post.contactName && <span className="font-semibold" style={{ color: "#f1f5f9" }}>👤 {post.contactName}</span>}
                        {post.contactPhone && (
                          <span className="flex items-center gap-1.5">
                            <a href={`tel:${post.contactPhone}`} className="font-mono font-bold" style={{ color: "#d4af37" }}>📞 {post.contactPhone}</a>
                            <button onClick={() => copy(post.contactPhone!, `phone-${post.id}`)}
                              className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.08)", color: copied === `phone-${post.id}` ? "#10b981" : "#64748b" }}>
                              {copied === `phone-${post.id}` ? "✓" : "Copy"}
                            </button>
                            <a href={`https://wa.me/${post.contactPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                              className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>
                              WhatsApp ↗
                            </a>
                          </span>
                        )}
                        {(post.contactPhones || []).length > 1 && (
                          <span className="text-xs" style={{ color: "#64748b" }}>+{(post.contactPhones!).length - 1} more number{(post.contactPhones!).length > 2 ? "s" : ""}</span>
                        )}
                        {post.contactEmail && <span style={{ color: "#60a5fa" }}>✉ {post.contactEmail}</span>}
                        {post.location && <span style={{ color: "#94a3b8" }}>📍 {post.location}</span>}
                      </div>

                      {post.propertyDetails && (
                        <div className="mt-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(212,175,55,0.05)", color: "#94a3b8", border: "1px solid rgba(212,175,55,0.08)" }}>
                          🏠 {post.propertyDetails}
                        </div>
                      )}

                      <div className="mt-2">
                        <ScoreBar score={post.motivationScore} />
                      </div>

                      {(post.keywordsMatched || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(post.keywordsMatched || []).map(kw => (
                            <span key={kw} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.06)", color: "#f87171", fontStyle: "italic" }}>
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <select value={post.status} onChange={e => updateStatus(post.id, e.target.value, post.notes||"")}
                        className="text-xs rounded-lg px-2 py-1 cursor-pointer"
                        style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8", outline: "none" }}>
                        {STATUS_OPTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <div className="flex gap-1">
                        <button onClick={() => setExpandedId(isOpen ? null : post.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(148,163,184,0.06)", color: "#64748b" }}>{isOpen ? "▲" : "▼"}</button>
                        <button onClick={() => deletePost(post.id)} className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.05)", color: "#64748b" }}>✕</button>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 animate-fade">
                      <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: "#060d1a", border: "1px solid rgba(255,255,255,0.04)", color: "#64748b", fontFamily: "monospace", maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                        {post.rawText}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => copy(post.rawText, `raw-${post.id}`)} className="text-xs px-2 py-1 rounded" style={{ background: "rgba(148,163,184,0.06)", color: "#64748b" }}>
                          {copied === `raw-${post.id}` ? "✓ Copied" : "Copy raw text"}
                        </button>
                        {post.postUrl && <a href={post.postUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded" style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa" }}>Open post ↗</a>}
                        <a href={`https://wa.me/${(post.contactPhone||"").replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", display: post.contactPhone ? "inline" : "none" }}>
                          WhatsApp ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
