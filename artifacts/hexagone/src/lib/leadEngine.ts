import { Lead, LeadCategory, IntelPost } from "../types";

const PHONE_REGEX = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
const NAME_PATTERNS = [
  /(?:name|contact|reach|call)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /(?:^|\n)\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\s*(?:\n|$)/gm,
  /(?:Hi|Hello|Hey)\s+(?:I[''`]?m\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
];

const CATEGORY_KEYWORDS: Record<LeadCategory, string[]> = {
  usa: ["usa", "united states", "america", "us visa", "green card", "immigration", "citizenship", "america"],
  school: ["school", "student", "university", "college", "education", "degree", "study", "campus", "enrollment"],
  airbnb: ["airbnb", "rental", "rent", "property", "accommodation", "stay", "host", "listing", "short term"],
  youtube: ["youtube", "channel", "subscriber", "views", "content creator", "influencer", "monetize", "adsense"],
  urgent: ["urgent", "asap", "immediately", "emergency", "critical", "now", "deadline", "today"],
  general: [],
};

export function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_REGEX) || [];
  return [...new Set(matches.map((p) => p.replace(/\s/g, "").trim()))];
}

export function extractName(text: string): string {
  for (const pattern of NAME_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      if (words.every((w) => /^[A-Z]/.test(w) && w.length > 1)) return line;
    }
  }
  return "Unknown";
}

export function detectCategory(text: string): LeadCategory {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === "general") continue;
    if (keywords.some((kw) => lower.includes(kw))) return cat as LeadCategory;
  }
  return "general";
}

export function computePriority(text: string, category: LeadCategory): number {
  let score = 0;
  const lower = text.toLowerCase();
  if (category === "urgent") score += 40;
  if (category === "usa") score += 30;
  if (CATEGORY_KEYWORDS.urgent.some((kw) => lower.includes(kw))) score += 20;
  if (lower.includes("ready") || lower.includes("interested")) score += 10;
  if (lower.includes("budget") || lower.includes("money") || lower.includes("invest")) score += 15;
  if (lower.includes("asap") || lower.includes("today") || lower.includes("now")) score += 25;
  return Math.min(score, 100);
}

export function generateStrategicHooks(category: LeadCategory, text: string): string[] {
  const base: Record<LeadCategory, string[]> = {
    usa: [
      "🇺🇸 Your American dream starts with one conversation — let's map your pathway together.",
      "The difference between where you are and where you want to be is strategic guidance. I provide exactly that.",
      "Every successful US-bound client I've worked with started exactly where you are right now.",
    ],
    school: [
      "🎓 Education is the most powerful investment you'll ever make — let's maximize yours.",
      "The right institution + the right strategy = a degree that opens every door.",
      "I've guided students into programs they never thought possible. Your story can be next.",
    ],
    airbnb: [
      "🏠 Your property has untapped income potential waiting to be unlocked.",
      "The short-term rental market rewards those who move first and move smart.",
      "Every night your property sits empty is revenue walking out the door — let's fix that.",
    ],
    youtube: [
      "📺 Your audience exists — they're waiting for someone exactly like you to show up.",
      "Monetization is a strategy problem, not a luck problem. I solve strategy problems.",
      "The creators dominating your niche started with zero subscribers and one good decision.",
    ],
    urgent: [
      "⚡ Time is the one resource you can't recover — let's move on this today.",
      "Urgent situations require decisive action. I'm ready to move the moment you are.",
      "The window of opportunity won't stay open. Let's capture this right now.",
    ],
    general: [
      "Every transformation begins with a single committed conversation.",
      "I work with people who are serious about results. Something tells me you're one of them.",
      "The clients who achieve the most didn't wait for the perfect moment — they created it.",
    ],
  };
  return base[category] || base.general;
}

export function processRawText(raw: string): Lead[] {
  const lines = raw.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b.length > 20);
  const leads: Lead[] = [];

  for (const block of lines) {
    const phones = extractPhones(block);
    if (phones.length === 0) continue;

    const category = detectCategory(block);
    const priority = computePriority(block, category);

    leads.push({
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: extractName(block),
      phone: phones[0],
      rawText: block,
      category,
      status: "new",
      priority,
      isVVIP: priority >= 40,
      createdAt: new Date().toISOString(),
      notes: "",
      strategicHooks: generateStrategicHooks(category, block),
      source: "Manual Ingestion",
    });
  }

  return leads;
}

export function processIntelPost(raw: string): IntelPost {
  const excerpt = raw.slice(0, 200).replace(/\n/g, " ").trim();
  const lower = raw.toLowerCase();
  let tag = "General Intelligence";
  if (lower.includes("market") || lower.includes("trend")) tag = "Market Trend";
  else if (lower.includes("competitor") || lower.includes("competition")) tag = "Competitive Intel";
  else if (lower.includes("price") || lower.includes("cost")) tag = "Pricing Signal";
  else if (lower.includes("client") || lower.includes("customer")) tag = "Client Insight";

  return {
    id: `intel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    rawText: raw,
    createdAt: new Date().toISOString(),
    tag,
    excerpt,
  };
}

export function exportToCSV(leads: Lead[]): string {
  const headers = ["ID", "Name", "Phone", "Category", "Status", "Priority", "VVIP", "Created", "Source", "Notes"];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.phone,
    l.category,
    l.status,
    l.priority,
    l.isVVIP ? "YES" : "NO",
    new Date(l.createdAt).toLocaleDateString(),
    l.source,
    l.notes.replace(/,/g, ";"),
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  usa: "🇺🇸 USA Path",
  school: "🎓 Education",
  airbnb: "🏠 Airbnb",
  youtube: "📺 YouTube",
  urgent: "⚡ Urgent",
  general: "🔮 General",
};

export const CATEGORY_COLORS: Record<LeadCategory, string> = {
  usa: "#3b82f6",
  school: "#8b5cf6",
  airbnb: "#f97316",
  youtube: "#ef4444",
  urgent: "#f59e0b",
  general: "#6b7280",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "🆕 New",
  contacted: "📞 Contacted",
  qualified: "✅ Qualified",
  closed: "🏁 Closed",
};
