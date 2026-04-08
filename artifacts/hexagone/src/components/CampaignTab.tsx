import { useState, useEffect, useCallback } from "react";
import { CampaignLeadIntake } from "./CampaignLeadIntake";
import { CampaignLeadCard } from "./CampaignLeadCard";

interface Campaign {
  id: number;
  name: string;
  description?: string;
  targetAudience?: string;
  product: string;
  sourceUrl?: string;
  status: string;
  createdAt: string;
}

interface CampaignLead {
  id: number;
  campaignId: number;
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
  apiBase: string;
}

const MADINATY_ICP = {
  name: "Egyptian Expats KSA — Madinaty Investment",
  description: "Egyptian expats in Saudi Arabia in Tech/Medical sectors. Target secondary home buyers for Madinaty, New Cairo. Fit Score threshold: 4.5/5.0.",
  targetAudience: "Egyptian expats, Saudi Arabia, Tech / Medical, Married, 30-55, Income $6k+/mo",
  product: "Madinaty Secondary Home Investment — New Cairo",
  sourceUrl: "https://www.facebook.com/groups/2791019307842181/members",
};

const STATUS_FILTER_OPTS = [
  ["all", "All Leads"],
  ["new", "🆕 New"],
  ["contacted", "📞 Contacted"],
  ["engaged", "💬 Engaged"],
  ["qualified", "✅ Qualified"],
  ["proposal", "📋 Proposal"],
  ["closed", "🏁 Closed"],
];

export function CampaignTab({ apiBase }: Props) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntake, setShowIntake] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<"all" | "qualified" | "tier2">("all");
  const [creating, setCreating] = useState(false);

  async function initCampaign() {
    setCreating(true);
    try {
      const res = await fetch(`${apiBase}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(MADINATY_ICP),
      });
      const c = await res.json();
      setCampaign(c);
      setLeads([]);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  const fetchLeads = useCallback(async (campaignId: number) => {
    const res = await fetch(`${apiBase}/api/campaigns/${campaignId}/leads`);
    const data = await res.json();
    setLeads(data);
  }, [apiBase]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/campaigns`);
        const campaigns: Campaign[] = await res.json();
        const madinaty = campaigns.find((c) => c.sourceUrl?.includes("2791019307842181") || c.name.includes("Madinaty") || c.name.includes("Egyptian Expats"));
        if (madinaty) {
          setCampaign(madinaty);
          await fetchLeads(madinaty.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [apiBase, fetchLeads]);

  async function handleLeadAdded() {
    if (campaign) await fetchLeads(campaign.id);
    setShowIntake(false);
  }

  function exportCSV() {
    if (!leads.length) return;
    const headers = ["Name", "Phone", "Sector", "Location", "Seniority", "Fit Score", "Status", "Pitch Headline", "Created"];
    const rows = leads.map((l) => [l.name, l.phone || "", l.sector || "", l.location || "", l.seniority || "", l.fitScore, l.status, (l.pitchHeadline || "").replace(/,/g, ";"), new Date(l.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `madinaty_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredLeads = leads
    .filter((l) => statusFilter === "all" || l.status === statusFilter)
    .filter((l) => scoreFilter === "all" || (scoreFilter === "qualified" ? l.fitScore >= 4.5 : l.fitScore >= 3.0 && l.fitScore < 4.5))
    .sort((a, b) => b.fitScore - a.fitScore);

  const qualified = leads.filter((l) => l.fitScore >= 4.5).length;
  const tier2 = leads.filter((l) => l.fitScore >= 3.0 && l.fitScore < 4.5).length;
  const avgScore = leads.length > 0 ? (leads.reduce((a, l) => a + l.fitScore, 0) / leads.length).toFixed(1) : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#64748b" }}>
        <div className="text-2xl animate-spin">⬡</div>
        <span>Loading campaign intelligence...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 gap-4">
        <div className="text-5xl">🇸🇦</div>
        <div className="text-xl font-bold text-center" style={{ color: "#d4af37" }}>Madinaty Investment Campaign</div>
        <div className="text-sm text-center max-w-md" style={{ color: "#64748b" }}>
          This campaign targets Egyptian expats in Saudi Arabia working in Tech or Medical sectors. The system will score each lead against the Madinaty ICP and generate a personalized property investment pitch.
        </div>
        <div className="p-4 rounded-xl max-w-md w-full text-sm space-y-1" style={{ background: "#0f172a", border: "1px solid rgba(212,175,55,0.15)" }}>
          <div style={{ color: "#d4af37" }} className="font-semibold mb-2">📋 ICP Criteria</div>
          {[["🇪🇬 Egyptian nationality/origin", "+1.2"],["🇸🇦 Based in Saudi Arabia", "+1.0"],["💻🏥 Tech or Medical sector", "+1.0"],["🏅 Senior / Manager+", "+0.8"],["👨‍👩‍👧 Family (married, children)", "+0.5"],["🏘 Egypt family / visits", "+0.5"],["💰 Income $6k+/mo signal", "+0.6"],["🏠 Property interest mentioned", "+0.7"]].map(([c, s]) => (
            <div key={c} className="flex justify-between">
              <span style={{ color: "#94a3b8" }}>{c}</span>
              <span style={{ color: "#10b981" }}>{s}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 font-bold" style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}>
            <span style={{ color: "#d4af37" }}>Qualified Threshold</span>
            <span style={{ color: "#10b981" }}>≥ 4.5 / 5.0</span>
          </div>
        </div>
        <button
          onClick={initCampaign}
          disabled={creating}
          className="px-8 py-3 rounded-xl font-bold"
          style={{ background: "linear-gradient(135deg,#d4af37,#a8882a)", color: "#020617" }}
        >
          {creating ? "Initializing..." : "🚀 Launch Campaign"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.2)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇸🇦</span>
              <span className="font-black" style={{ color: "#d4af37", fontSize: 15 }}>{campaign.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                ACTIVE
              </span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{campaign.targetAudience}</div>
            {campaign.sourceUrl && (
              <div className="text-xs mt-1">
                <span style={{ color: "#475569" }}>Source: </span>
                <a href={campaign.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "#3b82f6" }}>
                  Facebook Group Members ↗
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={leads.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37", opacity: leads.length === 0 ? 0.4 : 1 }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => setShowIntake(!showIntake)}
              className="text-xs px-3 py-1.5 rounded-lg font-bold"
              style={{ background: showIntake ? "rgba(212,175,55,0.15)" : "linear-gradient(135deg,#d4af37,#a8882a)", color: showIntake ? "#d4af37" : "#020617" }}
            >
              {showIntake ? "✕ Close" : "➕ Add Lead"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3">
          {[
            { label: "Total", val: leads.length, color: "#d4af37" },
            { label: "Tier 1 ≥4.5", val: qualified, color: "#10b981" },
            { label: "Tier 2 ≥3.0", val: tier2, color: "#f59e0b" },
            { label: "Avg Score", val: avgScore, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: "rgba(2,6,23,0.4)" }}>
              <div className="font-black tabular-nums" style={{ color: s.color, fontSize: 18 }}>{s.val}</div>
              <div className="text-xs" style={{ color: "#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {showIntake && (
        <div className="animate-slide-up">
          <CampaignLeadIntake campaignId={campaign.id} apiBase={apiBase} onLeadAdded={handleLeadAdded} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(212,175,55,0.15)", color: "#94a3b8", outline: "none" }}
        >
          {STATUS_FILTER_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value as "all" | "qualified" | "tier2")}
          className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(212,175,55,0.15)", color: "#94a3b8", outline: "none" }}
        >
          <option value="all">All Scores</option>
          <option value="qualified">✅ Tier 1 (≥4.5)</option>
          <option value="tier2">⚠️ Tier 2 (3.0-4.5)</option>
        </select>
        <div className="text-xs ml-auto" style={{ color: "#475569" }}>
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: "rgba(15,23,42,0.4)", border: "1px dashed rgba(212,175,55,0.12)" }}
        >
          <div className="text-3xl mb-2">🇸🇦</div>
          <div className="font-semibold" style={{ color: "#64748b" }}>
            {leads.length === 0 ? "No leads in this campaign yet" : "No leads match your filters"}
          </div>
          <div className="text-sm mt-1" style={{ color: "#374151" }}>
            {leads.length === 0 ? "Click '+ Add Lead' to start qualifying Egyptian expats from the group" : "Try adjusting the filters above"}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <CampaignLeadCard
              key={lead.id}
              lead={lead}
              apiBase={apiBase}
              campaignId={campaign.id}
              onUpdate={() => fetchLeads(campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
