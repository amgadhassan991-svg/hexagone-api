import { useState } from "react";
import { Lead, LeadStatus } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS } from "../lib/leadEngine";

interface Props {
  lead: Lead;
  onUpdate: (id: string, changes: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

export function LeadCard({ lead, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(lead.notes);

  const catColor = CATEGORY_COLORS[lead.category];

  function saveNotes() {
    onUpdate(lead.id, { notes: notesValue });
    setEditingNotes(false);
  }

  return (
    <div
      className="card-hover rounded-xl overflow-hidden animate-slide-up"
      style={{ background: "#0f172a", border: `1px solid rgba(212,175,55,0.12)` }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${catColor}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 font-bold"
              style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}
            >
              {lead.name[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base" style={{ color: "#f1f5f9" }}>{lead.name}</span>
                {lead.isVVIP && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "linear-gradient(135deg, #d4af37, #a8882a)", color: "#020617" }}
                  >
                    VVIP ✦
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <a
                  href={`tel:${lead.phone}`}
                  className="text-sm font-mono transition-colors"
                  style={{ color: "#d4af37" }}
                >
                  📞 {lead.phone}
                </a>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${catColor}18`, color: catColor }}>
                  {CATEGORY_LABELS[lead.category]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={lead.status}
              onChange={(e) => onUpdate(lead.id, { status: e.target.value as LeadStatus })}
              className="text-xs rounded-lg px-2 py-1 font-medium cursor-pointer"
              style={{
                background: "#1e293b",
                border: "1px solid rgba(148,163,184,0.2)",
                color: "#94a3b8",
                outline: "none",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm px-2 py-1 rounded-lg transition-colors"
              style={{ background: "rgba(148,163,184,0.08)", color: "#64748b" }}
            >
              {expanded ? "▲" : "▼"}
            </button>
            <button
              onClick={() => onDelete(lead.id)}
              className="text-sm px-2 py-1 rounded-lg transition-colors hover:text-red-400"
              style={{ background: "rgba(239,68,68,0.06)", color: "#64748b" }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1" style={{ color: "#64748b" }}>
              <span>Priority Score</span>
              <span style={{ color: lead.priority >= 60 ? "#f59e0b" : "#94a3b8" }}>{lead.priority}/100</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, background: "#1e293b" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${lead.priority}%`,
                  background: lead.priority >= 60
                    ? "linear-gradient(90deg, #f59e0b, #d4af37)"
                    : "linear-gradient(90deg, #3b82f6, #6366f1)",
                }}
              />
            </div>
          </div>
          <div className="text-xs" style={{ color: "#475569" }}>
            {new Date(lead.createdAt).toLocaleDateString()}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade">
            <div className="p-3 rounded-lg" style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.08)" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#d4af37" }}>📄 Raw Intelligence</div>
              <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                {lead.rawText.slice(0, 400)}{lead.rawText.length > 400 ? "..." : ""}
              </p>
            </div>

            <div className="p-3 rounded-lg" style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.08)" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#d4af37" }}>⚡ Strategic Hooks</div>
              <div className="space-y-2">
                {lead.strategicHooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ color: "#d4af37", fontSize: 10, marginTop: 2 }}>▶</span>
                    <p className="text-xs leading-relaxed italic" style={{ color: "#94a3b8" }}>{hook}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.08)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold" style={{ color: "#d4af37" }}>📝 Notes</div>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ color: "#d4af37", background: "rgba(212,175,55,0.1)" }}
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={3}
                    placeholder="Add strategic notes..."
                    className="w-full text-xs p-2 rounded resize-none"
                    style={{
                      background: "#1e293b",
                      border: "1px solid rgba(212,175,55,0.2)",
                      color: "#f1f5f9",
                      outline: "none",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveNotes}
                      className="text-xs px-3 py-1 rounded font-semibold"
                      style={{ background: "#d4af37", color: "#020617" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingNotes(false); setNotesValue(lead.notes); }}
                      className="text-xs px-3 py-1 rounded"
                      style={{ background: "#1e293b", color: "#94a3b8" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs" style={{ color: notesValue ? "#94a3b8" : "#374151" }}>
                  {notesValue || "No notes yet — click Edit to add intelligence."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
