import { useState } from "react";

interface CampaignLead {
  id: number;
  name: string;
  phone?: string;
  profileUrl?: string;
  sector?: string;
  location?: string;
  seniority?: string;
  fitScore: number;
  fitBreakdown?: Record<string, number>;
  pitchHeadline?: string;
  pitchBody?: string;
  pitchHooks?: string[];
  closingMove?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Props {
  lead: CampaignLead;
  apiBase: string;
  campaignId: number;
  onUpdate: () => void;
}

const STATUS_OPTS = [
  ["new", "🆕 New"],
  ["contacted", "📞 Contacted"],
  ["engaged", "💬 Engaged"],
  ["qualified", "✅ Qualified"],
  ["proposal", "📋 Proposal Sent"],
  ["closed", "🏁 Closed"],
  ["disqualified", "❌ Disqualified"],
];

const SECTOR_ICONS: Record<string, string> = { tech: "💻", medical: "🏥", other: "🔹", unknown: "❓" };

export function CampaignLeadCard({ lead, apiBase, campaignId, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pitchTab, setPitchTab] = useState<"headline" | "body" | "hooks" | "closing">("headline");
  const [copied, setCopied] = useState("");

  const scoreColor = lead.fitScore >= 4.5 ? "#10b981" : lead.fitScore >= 3.0 ? "#f59e0b" : "#ef4444";
  const scoreBg = lead.fitScore >= 4.5 ? "rgba(16,185,129,0.08)" : lead.fitScore >= 3.0 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
  const qualified = lead.fitScore >= 4.5;

  async function updateStatus(status: string) {
    await fetch(`${apiBase}/api/campaigns/${campaignId}/leads/${lead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: lead.notes }),
    });
    onUpdate();
  }

  async function deleteLead() {
    await fetch(`${apiBase}/api/campaigns/${campaignId}/leads/${lead.id}`, { method: "DELETE" });
    onUpdate();
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  const pitchText = pitchTab === "headline" ? (lead.pitchHeadline || "") : pitchTab === "body" ? (lead.pitchBody || "") : pitchTab === "closing" ? (lead.closingMove || "") : (lead.pitchHooks || []).join("\n\n");

  return (
    <div
      className="rounded-2xl overflow-hidden card-hover animate-slide-up"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)", border: `1px solid ${qualified ? "rgba(16,185,129,0.2)" : "rgba(212,175,55,0.1)"}` }}
    >
      {qualified && <div style={{ height: 2, background: "linear-gradient(90deg, #10b981, #d4af37, transparent)" }} />}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
            style={{ background: `${scoreColor}18`, border: `1.5px solid ${scoreColor}44`, color: scoreColor }}
          >
            {lead.name[0]?.toUpperCase() || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold" style={{ color: "#f1f5f9" }}>{lead.name}</span>
              {qualified && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff" }}>
                  ✓ QUALIFIED
                </span>
              )}
              {lead.sector && lead.sector !== "unknown" && (
                <span className="text-xs" style={{ color: "#64748b" }}>{SECTOR_ICONS[lead.sector]} {lead.sector}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-0.5 text-xs" style={{ color: "#64748b" }}>
              {lead.phone && <a href={`tel:${lead.phone}`} style={{ color: "#d4af37" }}>📞 {lead.phone}</a>}
              {lead.location && <span>📍 {lead.location}</span>}
              {lead.seniority && lead.seniority !== "unknown" && <span>🏅 {lead.seniority}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-xl font-black tabular-nums" style={{ color: scoreColor }}>{lead.fitScore.toFixed(1)}</div>
              <div className="text-xs" style={{ color: "#475569" }}>/5.0</div>
            </div>
            <select
              value={lead.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="text-xs rounded-lg px-2 py-1 cursor-pointer"
              style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", color: "#94a3b8", outline: "none" }}
            >
              {STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm px-2 py-1 rounded-lg"
              style={{ background: "rgba(148,163,184,0.08)", color: "#64748b" }}
            >
              {expanded ? "▲" : "▼"}
            </button>
            <button
              onClick={deleteLead}
              className="text-sm px-2 py-1 rounded-lg"
              style={{ background: "rgba(239,68,68,0.06)", color: "#64748b" }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: "#475569" }}>
            <span>Fit Score</span>
            <span style={{ color: scoreColor }}>{lead.fitScore.toFixed(1)} / 5.0 {lead.fitScore >= 4.5 ? "— Tier 1" : lead.fitScore >= 3.0 ? "— Tier 2" : "— Below threshold"}</span>
          </div>
          <div style={{ height: 5, background: "#1e293b", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ width: `${(lead.fitScore / 5) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)`, borderRadius: 9999 }} />
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade">
            {lead.fitBreakdown && (
              <div className="p-3 rounded-xl" style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.06)" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: "#d4af37" }}>📊 Fit Breakdown</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(lead.fitBreakdown).filter(([,v]) => v > 0).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs px-2 py-1 rounded" style={{ background: "rgba(16,185,129,0.06)" }}>
                      <span style={{ color: "#94a3b8" }}>{k.replace(/_/g, " ")}</span>
                      <span style={{ color: "#10b981" }}>+{v.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(lead.pitchHeadline || lead.pitchBody) && (
              <div className="p-3 rounded-xl" style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.1)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold" style={{ color: "#d4af37" }}>⚡ Generated Pitch</div>
                  <button
                    onClick={() => copy(pitchText, pitchTab)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "rgba(212,175,55,0.1)", color: copied === pitchTab ? "#10b981" : "#d4af37" }}
                  >
                    {copied === pitchTab ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(["headline", "body", "hooks", "closing"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPitchTab(t)}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: pitchTab === t ? "#d4af37" : "rgba(212,175,55,0.08)", color: pitchTab === t ? "#020617" : "#a8882a", fontWeight: pitchTab === t ? 700 : 400 }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                {pitchTab === "headline" && <p className="text-sm font-semibold italic" style={{ color: "#f1f5f9" }}>{lead.pitchHeadline}</p>}
                {pitchTab === "body" && <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{lead.pitchBody}</p>}
                {pitchTab === "hooks" && (
                  <div className="space-y-2">
                    {(lead.pitchHooks || []).map((h, i) => (
                      <div key={i} className="flex gap-2 text-xs leading-relaxed">
                        <span style={{ color: "#d4af37" }}>▶</span>
                        <span style={{ color: "#94a3b8" }}>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
                {pitchTab === "closing" && <p className="text-xs leading-relaxed italic" style={{ color: "#94a3b8" }}>{lead.closingMove}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
