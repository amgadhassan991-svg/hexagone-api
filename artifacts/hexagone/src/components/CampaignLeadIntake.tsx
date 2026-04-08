import { useState } from "react";

interface Props {
  campaignId: number;
  apiBase: string;
  onLeadAdded: () => void;
}

export function CampaignLeadIntake({ campaignId, apiBase, onLeadAdded }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileUrl: "",
    rawBio: "",
    sector: "unknown",
    location: "",
    seniority: "unknown",
    familyStatus: "",
    egyptTies: "",
    incomeSignal: "unknown",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; breakdown: Record<string, number> } | null>(null);
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/campaigns/${campaignId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult({ score: data.score, breakdown: data.breakdown });
      setForm({ name: "", phone: "", profileUrl: "", rawBio: "", sector: "unknown", location: "", seniority: "unknown", familyStatus: "", egyptTies: "", incomeSignal: "unknown", notes: "" });
      onLeadAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result ? (result.score >= 4.5 ? "#10b981" : result.score >= 3.0 ? "#f59e0b" : "#ef4444") : "#d4af37";

  return (
    <div style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 16, padding: 20 }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 18 }}>➕</span>
        <span className="font-bold" style={{ color: "#d4af37" }}>Qualify New Lead</span>
        <span className="text-xs ml-auto px-2 py-0.5 rounded-full" style={{ background: "rgba(212,175,55,0.1)", color: "#a8882a" }}>Madinaty ICP v1</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full Name *" value={form.name} onChange={(v) => update("name", v)} placeholder="Ahmed Hassan" />
        <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+966 5x xxx xxxx" />
        <Field label="Facebook Profile URL" value={form.profileUrl} onChange={(v) => update("profileUrl", v)} placeholder="facebook.com/..." className="sm:col-span-2" />

        <div className="sm:col-span-2">
          <label className="block text-xs mb-1" style={{ color: "#64748b" }}>Raw Bio / About / Post Text</label>
          <textarea
            value={form.rawBio}
            onChange={(e) => update("rawBio", e.target.value)}
            rows={3}
            placeholder="Paste their bio, about section, or any post. The engine will extract signals..."
            style={{ width: "100%", background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 8, color: "#f1f5f9", padding: "8px 10px", fontSize: 13, outline: "none", resize: "vertical" }}
          />
        </div>

        <Select label="Sector" value={form.sector} onChange={(v) => update("sector", v)} options={[["unknown","Unknown"],["tech","💻 Tech / IT"],["medical","🏥 Medical"],["other","Other"]]} />
        <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="Riyadh, KSA" />
        <Select label="Seniority" value={form.seniority} onChange={(v) => update("seniority", v)} options={[["unknown","Unknown"],["senior","Senior / Manager+"],["mid","Mid-level"],["junior","Junior"]]} />
        <Select label="Income Signal" value={form.incomeSignal} onChange={(v) => update("incomeSignal", v)} options={[["unknown","Unknown"],["high","High ($8k+/mo)"],["medium","Medium ($4-8k/mo)"],["low","<$4k/mo"]]} />
        <Field label="Family Status" value={form.familyStatus} onChange={(v) => update("familyStatus", v)} placeholder="Married, 2 kids" />
        <Field label="Egypt Ties" value={form.egyptTies} onChange={(v) => update("egyptTies", v)} placeholder="Family in Cairo, visits yearly" />

        <div className="sm:col-span-2">
          <Field label="Notes" value={form.notes} onChange={(v) => update("notes", v)} placeholder="Internal notes..." />
        </div>
      </div>

      {error && <div className="mt-3 text-xs p-2 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>{error}</div>}

      {result && (
        <div className="mt-3 p-3 rounded-xl animate-slide-up flex items-center gap-4" style={{ background: "rgba(16,185,129,0.06)", border: `1px solid ${scoreColor}44` }}>
          <div className="text-center flex-shrink-0">
            <div className="text-3xl font-black tabular-nums" style={{ color: scoreColor }}>{result.score.toFixed(1)}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>FIT SCORE</div>
          </div>
          <div className="flex-1 text-sm" style={{ color: "#94a3b8" }}>
            {result.score >= 4.5 ? "✅ QUALIFIED — Tier 1 lead. Initiate personalized pitch immediately." : result.score >= 3.0 ? "⚠️ Tier 2 — Potential fit. Monitor and nurture." : "❌ Below threshold — File for later re-engagement."}
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!form.name.trim() || loading}
        className="mt-4 w-full py-2.5 rounded-xl font-bold text-sm"
        style={{ background: form.name.trim() ? "linear-gradient(135deg, #d4af37, #a8882a)" : "rgba(212,175,55,0.15)", color: form.name.trim() ? "#020617" : "#64748b", cursor: form.name.trim() ? "pointer" : "not-allowed" }}
      >
        {loading ? "Scoring & Generating Pitch..." : "⚡ Score & Generate Pitch"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs mb-1" style={{ color: "#64748b" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 8, color: "#f1f5f9", padding: "7px 10px", fontSize: 13, outline: "none" }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: "#64748b" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 8, color: "#94a3b8", padding: "7px 10px", fontSize: 13, outline: "none" }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
