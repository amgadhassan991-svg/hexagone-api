import { ActiveTab } from "../types";

interface Tab {
  id: ActiveTab;
  label: string;
  icon: string;
  count?: number;
}

interface Props {
  active: ActiveTab;
  onSelect: (tab: ActiveTab) => void;
  tabs: Tab[];
}

export function TabBar({ active, onSelect, tabs }: Props) {
  return (
    <div
      className="flex overflow-x-auto"
      style={{ background: "#0a0f1e", borderBottom: "2px solid rgba(212,175,55,0.15)" }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              color: isActive ? "#d4af37" : "#64748b",
              background: isActive ? "rgba(212,175,55,0.06)" : "transparent",
              borderBottom: isActive ? "2px solid #d4af37" : "2px solid transparent",
              marginBottom: -2,
              outline: "none",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: isActive ? "#d4af37" : "rgba(148,163,184,0.15)",
                  color: isActive ? "#020617" : "#94a3b8",
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
