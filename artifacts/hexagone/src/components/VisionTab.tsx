import { useMemo } from "react";
import { Lead } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../lib/leadEngine";

interface Props {
  leads: Lead[];
}

const VISION_QUOTES = [
  "The market doesn't care about your effort. It rewards your positioning.",
  "Every lead is a conversation waiting for the right opener.",
  "Urgency without strategy is noise. Strategy without urgency is missed opportunity.",
  "The best time to contact a lead is the moment they self-identify. The second best time is now.",
  "Your pipeline isn't just names and numbers — it's compounding relationships.",
  "Speed creates trust. Silence creates doubt. Choose your action.",
];

const PITCH_FRAMEWORKS = [
  {
    name: "The Pattern Interrupt",
    icon: "⚡",
    description: "Open with something they've never heard in this context. Break the expected script immediately.",
    template: "Most [category] clients I speak with start by telling me [common concern]. What usually surprises them is that the real obstacle is actually something else entirely...",
  },
  {
    name: "The Social Proof Bridge",
    icon: "🌉",
    description: "Connect their situation to someone who achieved what they want.",
    template: "I worked with someone in almost exactly your position three months ago. They started [similar situation], and today [specific outcome]. The difference was one strategic decision...",
  },
  {
    name: "The Urgency Architect",
    icon: "🏗",
    description: "Build urgency from their own timeline, not your pitch pressure.",
    template: "You mentioned [their timeframe]. Working backwards from that, if we're going to hit that window, we'd need to start the first steps within [specific timeframe]. Does that align with how you're thinking about this?",
  },
  {
    name: "The Value Gap",
    icon: "📊",
    description: "Quantify the cost of inaction in their specific context.",
    template: "Every [week/month] without [solution] is [specific cost or missed opportunity]. Over the next [timeframe], that compounds to [larger number]. The question isn't really the investment in changing — it's the cost of staying the same.",
  },
];

export function VisionTab({ leads }: Props) {
  const stats = useMemo(() => {
    const total = leads.length;
    const vvip = leads.filter((l) => l.isVVIP).length;
    const contacted = leads.filter((l) => l.status === "contacted").length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    const closed = leads.filter((l) => l.status === "closed").length;

    const catCounts: Record<string, number> = {};
    for (const l of leads) catCounts[l.category] = (catCounts[l.category] || 0) + 1;

    const avgPriority = total > 0 ? Math.round(leads.reduce((a, l) => a + l.priority, 0) / total) : 0;

    const quote = VISION_QUOTES[Math.floor(Date.now() / 3600000) % VISION_QUOTES.length];

    return { total, vvip, contacted, qualified, closed, catCounts, avgPriority, quote };
  }, [leads]);

  return (
    <div className="p-4 space-y-4">
      <div
        className="p-5 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a1008 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "#a8882a" }}>
          ✦ Daily Strategic Directive
        </div>
        <blockquote className="text-lg font-semibold italic leading-relaxed" style={{ color: "#f1d592" }}>
          "{stats.quote}"
        </blockquote>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.total, color: "#d4af37", icon: "👥" },
          { label: "VVIP Vault", value: stats.vvip, color: "#f59e0b", icon: "✦" },
          { label: "Qualified", value: stats.qualified, color: "#10b981", icon: "✅" },
          { label: "Avg Priority", value: `${stats.avgPriority}/100`, color: "#8b5cf6", icon: "⚡" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl text-center"
            style={{ background: "#0f172a", border: `1px solid ${stat.color}22` }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {Object.keys(stats.catCounts).length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
        >
          <div className="font-semibold text-sm mb-3" style={{ color: "#d4af37" }}>📊 Pipeline by Category</div>
          <div className="space-y-2">
            {Object.entries(stats.catCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#64748b";
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#94a3b8" }}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</span>
                      <span style={{ color }}>{count} lead{count !== 1 ? "s" : ""} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#1e293b" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color, transition: "width 0.8s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
      >
        <div className="font-semibold text-sm mb-1" style={{ color: "#d4af37" }}>📈 Funnel Status</div>
        <div className="text-xs mb-3" style={{ color: "#475569" }}>
          Track where each lead sits in your engagement pipeline
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { label: "New", value: stats.total - stats.contacted - stats.qualified - stats.closed, color: "#3b82f6" },
            { label: "Contacted", value: stats.contacted, color: "#f59e0b" },
            { label: "Qualified", value: stats.qualified, color: "#10b981" },
            { label: "Closed", value: stats.closed, color: "#d4af37" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="text-center flex-shrink-0">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black mx-auto"
                  style={{ background: `${stage.color}18`, color: stage.color }}
                >
                  {stage.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "#64748b" }}>{stage.label}</div>
              </div>
              {i < 3 && <div style={{ color: "#374151", fontSize: 18 }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-xl"
        style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.06)" }}
      >
        <div className="font-semibold text-sm mb-3" style={{ color: "#d4af37" }}>🎯 Pitch Frameworks</div>
        <div className="space-y-3">
          {PITCH_FRAMEWORKS.map((fw) => (
            <div
              key={fw.name}
              className="p-3 rounded-lg"
              style={{ background: "#0a0f1e", border: "1px solid rgba(212,175,55,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{fw.icon}</span>
                <span className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{fw.name}</span>
              </div>
              <p className="text-xs mb-2" style={{ color: "#64748b" }}>{fw.description}</p>
              <p className="text-xs italic leading-relaxed" style={{ color: "#94a3b8", borderLeft: "2px solid rgba(212,175,55,0.2)", paddingLeft: 8 }}>
                {fw.template}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
