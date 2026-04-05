import { Lead } from "../types";
import { exportToCSV, CATEGORY_LABELS } from "../lib/leadEngine";

interface Props {
  leads: Lead[];
  onWipe: () => void;
}

export function ProfileRow({ leads, onWipe }: Props) {
  const vvipCount = leads.filter((l) => l.isVVIP).length;

  function handleExport() {
    const csv = exportToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hexagone_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const categories = [...new Set(leads.map((l) => l.category))];

  return (
    <div
      className="relative px-6 pb-4 pt-0"
      style={{ background: "#0a0f1e", borderBottom: "1px solid rgba(212,175,55,0.1)" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div
          className="relative flex-shrink-0"
          style={{ marginTop: -48 }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black"
            style={{
              background: "linear-gradient(135deg, #d4af37, #a8882a)",
              border: "4px solid #020617",
              boxShadow: "0 0 24px rgba(212,175,55,0.4)",
            }}
          >
            ⬡
          </div>
          <div
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#d4af37", color: "#020617" }}
          >
            ✦
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-2xl font-black tracking-wide"
            style={{ color: "#d4af37", fontFamily: "serif", lineHeight: 1.1 }}
          >
            L'Hexagone Intelligence
          </div>
          <div className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            Strategic Lead Command Center · {leads.length} total leads · {vvipCount} VVIP
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37" }}
                >
                  {CATEGORY_LABELS[c]}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleExport}
            disabled={leads.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #d4af37, #a8882a)",
              color: "#020617",
              opacity: leads.length === 0 ? 0.4 : 1,
              cursor: leads.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={onWipe}
            disabled={leads.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              opacity: leads.length === 0 ? 0.4 : 1,
              cursor: leads.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            🗑 Wipe Vault
          </button>
        </div>
      </div>
    </div>
  );
}
