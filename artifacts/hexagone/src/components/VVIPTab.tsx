import { useState, useMemo } from "react";
import { Lead, LeadCategory } from "../types";
import { LeadCard } from "./LeadCard";
import { CATEGORY_LABELS } from "../lib/leadEngine";

interface Props {
  leads: Lead[];
  onUpdate: (id: string, changes: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

type SortKey = "priority" | "createdAt" | "category" | "name";

export function VVIPTab({ leads, onUpdate, onDelete }: Props) {
  const [filterCat, setFilterCat] = useState<LeadCategory | "all">("all");
  const [filterVVIP, setFilterVVIP] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [search, setSearch] = useState("");

  const categories: LeadCategory[] = [...new Set(leads.map((l) => l.category))];

  const filtered = useMemo(() => {
    let result = [...leads];
    if (filterCat !== "all") result = result.filter((l) => l.category === filterCat);
    if (filterVVIP) result = result.filter((l) => l.isVVIP);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.rawText.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortKey === "priority") return b.priority - a.priority;
      if (sortKey === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === "category") return a.category.localeCompare(b.category);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [leads, filterCat, filterVVIP, sortKey, search]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search leads..."
          className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(212,175,55,0.15)",
            color: "#f1f5f9",
            outline: "none",
          }}
        />

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as LeadCategory | "all")}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(212,175,55,0.15)",
            color: "#94a3b8",
            outline: "none",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{
            background: "#0f172a",
            border: "1px solid rgba(212,175,55,0.15)",
            color: "#94a3b8",
            outline: "none",
          }}
        >
          <option value="priority">Sort: Priority</option>
          <option value="createdAt">Sort: Newest</option>
          <option value="category">Sort: Category</option>
          <option value="name">Sort: Name</option>
        </select>

        <button
          onClick={() => setFilterVVIP(!filterVVIP)}
          className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: filterVVIP ? "linear-gradient(135deg, #d4af37, #a8882a)" : "rgba(212,175,55,0.08)",
            border: filterVVIP ? "none" : "1px solid rgba(212,175,55,0.2)",
            color: filterVVIP ? "#020617" : "#d4af37",
          }}
        >
          VVIP Only
        </button>
      </div>

      <div className="text-xs" style={{ color: "#475569" }}>
        Showing {filtered.length} of {leads.length} leads
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ background: "#0f172a", border: "1px dashed rgba(212,175,55,0.15)" }}
        >
          <div className="text-4xl mb-3">🔮</div>
          <div className="text-base font-semibold" style={{ color: "#64748b" }}>
            {leads.length === 0 ? "No leads in the vault yet" : "No leads match your filters"}
          </div>
          <div className="text-sm mt-1" style={{ color: "#374151" }}>
            {leads.length === 0 ? "Go to the Ingestion Hub to process raw data" : "Try adjusting your search or filters"}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
