import { Lead } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../lib/leadEngine";

interface Props {
  leads: Lead[];
}

export function Sidebar({ leads }: Props) {
  const vvip = leads.filter((l) => l.isVVIP);
  const recent = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const catCounts: Record<string, number> = {};
  for (const l of leads) catCounts[l.category] = (catCounts[l.category] || 0) + 1;

  const topCats = Object.entries(catCounts).sort(([, a], [, b]) => b - a).slice(0, 4);

  return (
    <div className="space-y-4 w-full">
      <div
        className="p-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid rgba(212,175,55,0.12)" }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a8882a" }}>
          Intelligence Stats
        </div>
        <div className="space-y-2">
          {[
            { label: "Total Leads", val: leads.length, color: "#d4af37" },
            { label: "VVIP Status", val: vvip.length, color: "#f59e0b" },
            { label: "Qualified", val: leads.filter((l) => l.status === "qualified").length, color: "#10b981" },
            { label: "Contacted", val: leads.filter((l) => l.status === "contacted").length, color: "#3b82f6" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#64748b" }}>{item.label}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {topCats.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a8882a" }}>
            Top Categories
          </div>
          <div className="space-y-2">
            {topCats.map(([cat, count]) => {
              const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#64748b";
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#94a3b8" }}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</span>
                    <span style={{ color }}>{count}</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 3, background: "#1e293b" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#a8882a" }}>
            Recent Leads
          </div>
          <div className="space-y-2">
            {recent.map((lead) => (
              <div key={lead.id} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(212,175,55,0.12)", color: "#d4af37" }}
                >
                  {lead.name[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "#f1f5f9" }}>{lead.name}</div>
                  <div className="text-xs truncate" style={{ color: "#d4af37" }}>{lead.phone}</div>
                </div>
                {lead.isVVIP && (
                  <span className="text-xs" style={{ color: "#d4af37" }}>✦</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-xl text-center"
        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(168,136,42,0.04) 100%)", border: "1px solid rgba(212,175,55,0.15)" }}
      >
        <div className="text-2xl mb-1">⬡</div>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d4af37" }}>L'Hexagone</div>
        <div className="text-xs mt-0.5" style={{ color: "#475569" }}>Strategic Beast v13.0</div>
      </div>
    </div>
  );
}
