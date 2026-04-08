import { Router } from "express";
import { db } from "@workspace/db";
import { campaignsTable, campaignLeadsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

type FitCriteria = {
  isEgyptian: boolean;
  inSaudiArabia: boolean;
  sector: "tech" | "medical" | "other" | "unknown";
  seniority: "senior" | "mid" | "junior" | "unknown";
  hasFamily: boolean;
  hasEgyptTies: boolean;
  incomeSignal: "high" | "medium" | "low" | "unknown";
  mentionsProperty: boolean;
};

function computeFitScore(criteria: FitCriteria): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    egyptian_nationality: 0,
    ksa_location: 0,
    target_sector: 0,
    seniority: 0,
    family_ties: 0,
    egypt_connection: 0,
    income_signal: 0,
    property_intent: 0,
  };

  if (criteria.isEgyptian) breakdown.egyptian_nationality = 1.2;
  if (criteria.inSaudiArabia) breakdown.ksa_location = 1.0;
  if (criteria.sector === "tech" || criteria.sector === "medical") breakdown.target_sector = 1.0;
  if (criteria.seniority === "senior") breakdown.seniority = 0.8;
  else if (criteria.seniority === "mid") breakdown.seniority = 0.4;
  if (criteria.hasFamily) breakdown.family_ties = 0.5;
  if (criteria.hasEgyptTies) breakdown.egypt_connection = 0.5;
  if (criteria.incomeSignal === "high") breakdown.income_signal = 0.6;
  else if (criteria.incomeSignal === "medium") breakdown.income_signal = 0.3;
  if (criteria.mentionsProperty) breakdown.property_intent = 0.7;

  const rawTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const maxPossible = 1.2 + 1.0 + 1.0 + 0.8 + 0.5 + 0.5 + 0.6 + 0.7;
  const score = Math.round((rawTotal / maxPossible) * 5 * 10) / 10;

  return { score: Math.min(score, 5.0), breakdown };
}

function inferCriteria(bio: string, sector?: string, location?: string, seniority?: string, familyStatus?: string, egyptTies?: string, incomeSignal?: string): FitCriteria {
  const lower = (bio || "").toLowerCase();
  return {
    isEgyptian: lower.includes("egypt") || lower.includes("مصر") || lower.includes("cairo") || lower.includes("alexandria") || sector === "tech" || false,
    inSaudiArabia: lower.includes("saudi") || lower.includes("riyadh") || lower.includes("jeddah") || lower.includes("ksa") || lower.includes("مكة") || (location || "").toLowerCase().includes("saudi") || (location || "").toLowerCase().includes("ksa"),
    sector: (sector === "tech" || sector === "medical") ? sector : (lower.includes("doctor") || lower.includes("physician") || lower.includes("medical") || lower.includes("طب") ? "medical" : lower.includes("software") || lower.includes("engineer") || lower.includes("developer") || lower.includes("tech") ? "tech" : "unknown"),
    seniority: seniority === "senior" ? "senior" : seniority === "mid" ? "mid" : seniority === "junior" ? "junior" : (lower.includes("senior") || lower.includes("manager") || lower.includes("director") || lower.includes("lead") || lower.includes("head of") ? "senior" : lower.includes("mid") ? "mid" : "unknown"),
    hasFamily: (familyStatus || "").includes("married") || (familyStatus || "").includes("family") || lower.includes("wife") || lower.includes("husband") || lower.includes("children") || lower.includes("family"),
    hasEgyptTies: (egyptTies || "") !== "" || lower.includes("egypt") || lower.includes("cairo") || lower.includes("مصر") || lower.includes("visits egypt") || lower.includes("family in egypt"),
    incomeSignal: incomeSignal === "high" ? "high" : incomeSignal === "medium" ? "medium" : "unknown",
    mentionsProperty: lower.includes("property") || lower.includes("invest") || lower.includes("home") || lower.includes("apartment") || lower.includes("real estate") || lower.includes("madinaty"),
  };
}

type PitchResult = {
  headline: string;
  body: string;
  hooks: string[];
  closingMove: string;
};

function generateMatinatyPitch(name: string, criteria: FitCriteria, score: number): PitchResult {
  const displayName = name && name !== "Unknown" ? name.split(" ")[0] : "my friend";
  const sectorLabel = criteria.sector === "tech" ? "technology professional" : criteria.sector === "medical" ? "medical professional" : "professional";
  const urgency = score >= 4.5 ? "elite" : score >= 3.5 ? "high" : "standard";

  const hooks = [
    `🏙 Madinaty is Cairo's fastest-appreciating address — compound growth of 22% over the last 3 years, with Phase 9 inventory moving in under 60 days.`,
    `🇸🇦→🇪🇬 As a ${sectorLabel} building your life in KSA, you're also building capital. The question is whether that capital is working for you back home.`,
    `👨‍👩‍👧 For Egyptians with family still in Cairo: Madinaty provides a premium base that your family can enjoy today while you build equity for tomorrow.`,
    `📈 Madinaty properties purchased off-plan in 2022 are now worth 45%+ more — with Phase 10 currently available, you're still early enough to capture that curve.`,
    `🔐 Every high-earning Egyptian expat I've spoken to in KSA has the same concern: "What's my exit strategy if the contract ends?" A paid-down Madinaty property is that strategy.`,
  ];

  const body = urgency === "elite"
    ? `${displayName}, I'll be direct with you because your profile warrants it. You're a ${sectorLabel} in Saudi Arabia — which means your earning power is in a different league than the Cairo market you're investing in. That's an asymmetric advantage that most people your level aren't fully exploiting. Madinaty's Phase 10 represents the last opportunity at current pricing before the infrastructure completion drives another appreciation cycle. I'm working with a limited number of high-fit buyers on a structured installment plan that aligns perfectly with an expat income profile. No lump-sum required. Monthly payments calibrated to KSA salary schedules. This is engineered specifically for people in your position.`
    : `${displayName}, as a ${sectorLabel} based in Saudi Arabia, you have something most Egyptian property investors don't: consistent hard-currency income. Madinaty is Egypt's most planned, most secured new urban development — and it's specifically designed to serve Egyptians who've built their professional lives abroad but want their family's roots anchored in a premium Cairo address. The ROI case is well-documented. The lifestyle case speaks for itself. What I'd like to do is walk you through exactly what your investment scenario looks like on your current income profile.`;

  const headline = urgency === "elite"
    ? `⚡ ${displayName}, your KSA income is a Madinaty property waiting to be unlocked.`
    : `${displayName}, you've built something real in KSA — here's how to anchor it back in Egypt.`;

  const closingMove = criteria.sector === "medical"
    ? `I work with a dedicated group of Egyptian medical professionals in the Gulf who've structured Madinaty investments around their contract cycles. I'd like to show you what that structure looks like and whether the numbers work for your situation. 20 minutes, no pressure. Can we connect this week?`
    : `I'm scheduling a series of brief sessions this week specifically for Egyptian tech professionals in KSA who want to understand the Madinaty opportunity. These fill fast. If this is the right time, let's lock in a slot — 20 minutes, pure information, zero obligation. Are you available?`;

  return { headline, body, hooks, closingMove };
}

router.get("/campaigns", async (_req, res) => {
  const campaigns = await db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt));
  return res.json(campaigns);
});

router.post("/campaigns", async (req, res) => {
  const { name, description, targetAudience, product, sourceUrl, icpJson } = req.body;
  const [campaign] = await db.insert(campaignsTable).values({ name, description, targetAudience, product, sourceUrl, icpJson }).returning();
  return res.status(201).json(campaign);
});

router.get("/campaigns/:id/leads", async (req, res) => {
  const id = Number(req.params.id);
  const leads = await db.select().from(campaignLeadsTable).where(eq(campaignLeadsTable.campaignId, id)).orderBy(desc(campaignLeadsTable.createdAt));
  return res.json(leads);
});

router.post("/campaigns/:id/leads", async (req, res) => {
  const campaignId = Number(req.params.id);
  const { name, phone, profileUrl, rawBio, sector, location, seniority, familyStatus, egyptTies, incomeSignal, notes } = req.body;

  const criteria = inferCriteria(rawBio || "", sector, location, seniority, familyStatus, egyptTies, incomeSignal);
  const { score, breakdown } = computeFitScore(criteria);
  const pitch = generateMatinatyPitch(name || "Unknown", criteria, score);

  const [lead] = await db.insert(campaignLeadsTable).values({
    campaignId,
    name: name || "Unknown",
    phone,
    profileUrl,
    rawBio,
    sector: criteria.sector,
    location,
    seniority: criteria.seniority,
    familyStatus,
    egyptTies,
    incomeSignal: criteria.incomeSignal,
    fitScore: score,
    fitBreakdown: breakdown,
    pitchHeadline: pitch.headline,
    pitchBody: pitch.body,
    pitchHooks: pitch.hooks,
    closingMove: pitch.closingMove,
    notes: notes || "",
  }).returning();

  return res.status(201).json({ lead, score, breakdown, pitch });
});

router.put("/campaigns/:campaignId/leads/:leadId", async (req, res) => {
  const id = Number(req.params.leadId);
  const { status, notes } = req.body;
  const [updated] = await db.update(campaignLeadsTable).set({ status, notes }).where(eq(campaignLeadsTable.id, id)).returning();
  return res.json(updated);
});

router.delete("/campaigns/:campaignId/leads/:leadId", async (req, res) => {
  const id = Number(req.params.leadId);
  await db.delete(campaignLeadsTable).where(eq(campaignLeadsTable.id, id));
  return res.status(204).send();
});

export default router;
