interface Tab {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

interface Props {
  active: string;
  onSelect: (tab: string) => void;
  tabs: Tab[];
}

export function TabBar({ active, onSelect, tabs }: Props) {
  return (
    <div
      className="flex overflow-x-auto"
      style={{ background: "rgba(3,7,18,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212,175,55,0.12)" }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${isActive ? "tab-active" : ""}`}
            style={{
              color: isActive ? "#d4af37" : "#4b5563",
              background: isActive ? "rgba(212,175,55,0.06)" : "transparent",
              borderBottom: `2px solid ${isActive ? "#d4af37" : "transparent"}`,
              marginBottom: -2,
              outline: "none",
              letterSpacing: "0.01em",
            }}
          >
            {tab.icon && <span style={{ fontSize: 14 }}>{tab.icon}</span>}
            <span style={{ fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: isActive ? "#d4af37" : "rgba(75,85,99,0.3)",
                  color: isActive ? "#020617" : "#6b7280",
                  minWidth: 18,
                  textAlign: "center",
                  lineHeight: 1,
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
