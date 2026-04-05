import { useState } from "react";
import { Lead, IntelPost } from "../types";
import { processRawText, processIntelPost } from "../lib/leadEngine";

interface Props {
  onLeadsFound: (leads: Lead[]) => void;
  onIntelPost: (post: IntelPost) => void;
}

export function IngestionTab({ onLeadsFound, onIntelPost }: Props) {
  const [raw, setRaw] = useState("");
  const [lastResult, setLastResult] = useState<{ leads: number; intel: boolean } | null>(null);
  const [processing, setProcessing] = useState(false);

  function handleProcess() {
    if (!raw.trim()) return;
    setProcessing(true);
    setTimeout(() => {
      const leads = processRawText(raw);
      if (leads.length > 0) {
        onLeadsFound(leads);
        setLastResult({ leads: leads.length, intel: false });
      } else {
        const post = processIntelPost(raw);
        onIntelPost(post);
        setLastResult({ leads: 0, intel: true });
      }
      setRaw("");
      setProcessing(false);
    }, 300);
  }

  return (
    <div className="p-4 space-y-4">
      <div
        className="p-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid rgba(212,175,55,0.12)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: "#d4af37" }}>⚡</span>
          <h3 className="font-bold" style={{ color: "#d4af37" }}>Intelligence Ingestion Engine</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: "#64748b" }}>
          Paste raw post content, comments, or messages below. The engine will extract leads with phone numbers 
          and file everything else as market intelligence.
        </p>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={`Paste raw data here...\n\nExample:\n  Hi my name is Sarah Johnson\n  Interested in USA visa process\n  Please call me at 555-867-5309\n  Ready to start immediately\n\nOr paste multiple posts separated by blank lines.`}
          className="w-full p-3 rounded-lg text-sm resize-none font-mono"
          style={{
            background: "#0a0f1e",
            border: "1px solid rgba(212,175,55,0.15)",
            color: "#f1f5f9",
            outline: "none",
            lineHeight: 1.7,
          }}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs" style={{ color: "#374151" }}>
            {raw.length > 0 ? `${raw.length} characters · ${raw.split("\n").length} lines` : "Ready to process"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setRaw(""); setLastResult(null); }}
              className="px-3 py-2 rounded-lg text-sm transition-all"
              style={{ background: "rgba(148,163,184,0.08)", color: "#64748b" }}
            >
              Clear
            </button>
            <button
              onClick={handleProcess}
              disabled={!raw.trim() || processing}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: raw.trim() ? "linear-gradient(135deg, #d4af37, #a8882a)" : "rgba(212,175,55,0.15)",
                color: raw.trim() ? "#020617" : "#64748b",
                cursor: raw.trim() ? "pointer" : "not-allowed",
              }}
            >
              {processing ? "Processing..." : "⚡ Process Intelligence"}
            </button>
          </div>
        </div>
      </div>

      {lastResult && (
        <div
          className="p-4 rounded-xl animate-slide-up"
          style={{
            background: lastResult.leads > 0 ? "rgba(212,175,55,0.08)" : "rgba(59,130,246,0.08)",
            border: `1px solid ${lastResult.leads > 0 ? "rgba(212,175,55,0.25)" : "rgba(59,130,246,0.25)"}`,
          }}
        >
          {lastResult.leads > 0 ? (
            <div>
              <div className="font-bold" style={{ color: "#d4af37" }}>
                ✦ {lastResult.leads} lead{lastResult.leads !== 1 ? "s" : ""} extracted and added to the vault
              </div>
              <div className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Switch to the Leads tab to review, qualify, and engage.
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold" style={{ color: "#60a5fa" }}>
                📡 No phone numbers detected — filed as market intelligence
              </div>
              <div className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Check the Market Intelligence tab for archived posts.
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="p-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
      >
        <div className="font-semibold text-sm mb-3" style={{ color: "#94a3b8" }}>
          📊 Detection Capabilities
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "📞", label: "Phone Extraction", desc: "US format numbers (555-xxx-xxxx, (555) xxx-xxxx, +1...)" },
            { icon: "👤", label: "Name Detection", desc: "Identifies lead names from post context" },
            { icon: "🎯", label: "Category Scoring", desc: "USA · Education · Airbnb · YouTube · Urgent" },
            { icon: "⚡", label: "Priority Engine", desc: "100-point score based on urgency, intent & keywords" },
            { icon: "🔮", label: "Strategic Hooks", desc: "Auto-generates category-specific pitch angles" },
            { icon: "📡", label: "Intel Archive", desc: "Non-lead posts filed as market intelligence" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg"
              style={{ background: "#0a0f1e", border: "1px solid rgba(148,163,184,0.04)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{item.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "#f1f5f9" }}>{item.label}</span>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
