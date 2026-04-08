import { useState, useEffect } from "react";
import { Lead, IntelPost, ActiveTab } from "./types";
import { CoverBanner } from "./components/CoverBanner";
import { ProfileRow } from "./components/ProfileRow";
import { TabBar } from "./components/TabBar";
import { VVIPTab } from "./components/VVIPTab";
import { IntelligenceTab } from "./components/IntelligenceTab";
import { IngestionTab } from "./components/IngestionTab";
import { VisionTab } from "./components/VisionTab";
import { Sidebar } from "./components/Sidebar";
import { CampaignTab } from "./components/CampaignTab";

type ExtendedTab = ActiveTab | "campaign";

const STORAGE_KEY_LEADS = "hexagone_leads_v2";
const STORAGE_KEY_INTEL = "hexagone_intel_v2";

const API_BASE = "";

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadIntel(): IntelPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTEL);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);
  const [intel, setIntel] = useState<IntelPost[]>(loadIntel);
  const [activeTab, setActiveTab] = useState<ExtendedTab>("campaign");
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INTEL, JSON.stringify(intel));
  }, [intel]);

  function handleLeadsFound(newLeads: Lead[]) {
    setLeads((prev) => [...newLeads, ...prev]);
    setActiveTab("vvip");
  }

  function handleIntelPost(post: IntelPost) {
    setIntel((prev) => [post, ...prev]);
    setActiveTab("intelligence");
  }

  function handleUpdateLead(id: string, changes: Partial<Lead>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
  }

  function handleDeleteLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  function handleDeleteIntel(id: string) {
    setIntel((prev) => prev.filter((p) => p.id !== id));
  }

  function confirmWipe() {
    setLeads([]);
    setIntel([]);
    setShowWipeConfirm(false);
    setActiveTab("campaign");
  }

  const tabs = [
    { id: "campaign" as ExtendedTab, label: "🇸🇦 Madinaty Campaign", icon: "" },
    { id: "vvip" as ExtendedTab, label: "Lead Vault", icon: "👥", count: leads.length },
    { id: "intelligence" as ExtendedTab, label: "Market Intel", icon: "📡", count: intel.length },
    { id: "ingestion" as ExtendedTab, label: "Ingestion", icon: "⚡" },
    { id: "vision" as ExtendedTab, label: "Vision Engine", icon: "🔮" },
  ];

  return (
    <div className="terminal-bg min-h-screen" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.03) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 60%), #030712" }}>
      <div className="max-w-6xl mx-auto">
        <CoverBanner />
        <ProfileRow leads={leads} onWipe={() => setShowWipeConfirm(true)} />
        <TabBar active={activeTab as string} onSelect={(t) => setActiveTab(t as ExtendedTab)} tabs={tabs} />

        <div className="flex gap-6 p-4">
          <div className="flex-1 min-w-0">
            {activeTab === "campaign" && <CampaignTab apiBase={API_BASE} />}
            {activeTab === "vvip" && <VVIPTab leads={leads} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} />}
            {activeTab === "intelligence" && <IntelligenceTab posts={intel} onDelete={handleDeleteIntel} />}
            {activeTab === "ingestion" && <IngestionTab onLeadsFound={handleLeadsFound} onIntelPost={handleIntelPost} />}
            {activeTab === "vision" && <VisionTab leads={leads} />}
          </div>

          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <Sidebar leads={leads} />
            </div>
          </div>
        </div>
      </div>

      {showWipeConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(3,7,18,0.9)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowWipeConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full animate-slide-up glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#f87171" }}>Wipe All Local Data?</h3>
            <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
              This clears your local lead vault and intel archive ({leads.length} leads, {intel.length} posts).
              Campaign data in the database is not affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowWipeConfirm(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: "#1e293b", color: "#94a3b8" }}>Cancel</button>
              <button onClick={confirmWipe} className="flex-1 py-2 rounded-lg text-sm font-bold" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>Wipe Local</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
