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

const STORAGE_KEY_LEADS = "hexagone_leads_v1";
const STORAGE_KEY_INTEL = "hexagone_intel_v1";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("ingestion");
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INTEL, JSON.stringify(intel));
  }, [intel]);

  useEffect(() => {
    if (leads.length > 0 && activeTab === "ingestion") {
      setActiveTab("vvip");
    }
  }, []);

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

  function handleWipe() {
    setShowWipeConfirm(true);
  }

  function confirmWipe() {
    setLeads([]);
    setIntel([]);
    setShowWipeConfirm(false);
    setActiveTab("ingestion");
  }

  const tabs = [
    { id: "vvip" as ActiveTab, label: "Leads", icon: "👥", count: leads.length },
    { id: "intelligence" as ActiveTab, label: "Market Intel", icon: "📡", count: intel.length },
    { id: "ingestion" as ActiveTab, label: "Ingestion Hub", icon: "⚡" },
    { id: "vision" as ActiveTab, label: "Vision Engine", icon: "🔮" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      <div className="max-w-6xl mx-auto">
        <CoverBanner />
        <ProfileRow leads={leads} onWipe={handleWipe} />
        <TabBar active={activeTab} onSelect={setActiveTab} tabs={tabs} />

        <div className="flex gap-0 sm:gap-6 p-0 sm:p-4">
          <div className="flex-1 min-w-0">
            {activeTab === "vvip" && (
              <VVIPTab leads={leads} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} />
            )}
            {activeTab === "intelligence" && (
              <IntelligenceTab posts={intel} onDelete={handleDeleteIntel} />
            )}
            {activeTab === "ingestion" && (
              <IngestionTab onLeadsFound={handleLeadsFound} onIntelPost={handleIntelPost} />
            )}
            {activeTab === "vision" && (
              <VisionTab leads={leads} />
            )}
          </div>

          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4 pt-4">
              <Sidebar leads={leads} />
            </div>
          </div>
        </div>
      </div>

      {showWipeConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowWipeConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full animate-slide-up"
            style={{ background: "#0f172a", border: "1px solid rgba(239,68,68,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#f87171" }}>Wipe All Data?</h3>
            <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
              This will permanently delete all {leads.length} leads and {intel.length} intelligence posts from the vault. 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#1e293b", color: "#94a3b8" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmWipe}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
              >
                Wipe Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
