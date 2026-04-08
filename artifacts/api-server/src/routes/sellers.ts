import { Router } from "express";
import { db } from "@workspace/db";
import { sellerPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const PHONE_REGEX = /(?:\+?2?0?1[0125]\d{8}|\+?966\s?\d{2}\s?\d{3}\s?\d{4}|\+?1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const TRIGGER_KEYWORDS: Record<string, { keywords: string[]; label: string; score: number }> = {
  urgent_sale: {
    keywords: ["urgent sale", "urgent", "must sell", "selling urgently", "need to sell fast", "quick sale", "sell immediately", "sell quickly", "سريع", "عاجل", "بيع عاجل"],
    label: "⚡ Urgent Sale",
    score: 40,
  },
  traveling: {
    keywords: ["traveling", "travelling", "travel", "leaving", "relocating", "moving abroad", "going abroad", "moving out", "emigrating", "سافر", "هجرة", "سفر"],
    label: "✈️ Owner Traveling",
    score: 35,
  },
  below_market: {
    keywords: ["below market", "below market price", "below asking", "discounted", "price drop", "reduced price", "price cut", "negotiable", "lowest price", "best price", "اقل من السوق", "سعر منخفض", "تنازل"],
    label: "💰 Below Market Price",
    score: 38,
  },
  motivated_seller: {
    keywords: ["motivated seller", "need cash", "financial", "divorce", "estate sale", "inheritance", "probate", "family situation", "ضرورة", "ظروف", "بيع للضرورة"],
    label: "🔥 Motivated Seller",
    score: 42,
  },
  madinaty_location: {
    keywords: ["madinaty", "مدينتي", "new cairo", "القاهرة الجديدة", "fifth settlement", "التجمع الخامس", "rehab", "shorouk", "badr"],
    label: "📍 Madinaty/New Cairo",
    score: 15,
  },
  direct_owner: {
    keywords: ["owner", "direct owner", "no commission", "no broker", "without broker", "مالك", "بدون سمسار", "بدون عمولة", "مباشرة من المالك"],
    label: "👤 Direct Owner",
    score: 20,
  },
};

function extractPhones(text: string): string[] {
  return [...new Set((text.match(PHONE_REGEX) || []).map(p => p.replace(/\s/g, "").trim()))];
}

function extractEmail(text: string): string | undefined {
  return (text.match(EMAIL_REGEX) || [])[0];
}

function extractName(text: string): string {
  const patterns = [
    /(?:contact|call|seller|owner)\s*[:\-–]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/,
    /(?:name|اسم)\s*[:\-–]\s*([A-Za-z][^\d\n،,]{2,40})/i,
    /(?:اتصل\s+ب|تواصل\s+مع|صاحب)\s*([^\n\d،,]{3,30})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1] && !/(urgent|traveling|below|market|broker|owner|selling|direct|must|price|sale)/i.test(m[1])) {
      return m[1].trim().replace(/\s*[–\-\d].*$/, "").trim();
    }
  }
  return "";
}

function extractPropertyDetails(text: string): string {
  const lines = text.split("\n").filter(l => {
    const lower = l.toLowerCase();
    return lower.includes("bed") || lower.includes("bath") || lower.includes("sqm") || lower.includes("m2") ||
      lower.includes("meter") || lower.includes("غرفة") || lower.includes("متر") || lower.includes("دور") ||
      lower.includes("شقة") || lower.includes("فيلا") || lower.includes("apartment") || lower.includes("villa") ||
      /\d+\s*(bed|bath|sqm|m²|متر|غرفة)/.test(lower) || /\d+\s*million|\d+\s*k\s*egp|\d+\s*egp/.test(lower) ||
      lower.includes("price") || lower.includes("سعر");
  });
  return lines.slice(0, 3).join(" | ").slice(0, 300) || "";
}

function extractLocation(text: string): string {
  const lower = text.toLowerCase();
  const locations = ["madinaty", "مدينتي", "new cairo", "fifth settlement", "التجمع", "rehab city", "shorouk", "بادر", "مستقبل سيتي", "district"];
  for (const loc of locations) {
    if (lower.includes(loc)) return loc.charAt(0).toUpperCase() + loc.slice(1);
  }
  const lineMatch = text.match(/(?:located|location|address|في|بـ)\s*[:\-]?\s*([^\n]{5,60})/i);
  return lineMatch?.[1]?.trim().slice(0, 80) || "";
}

function scanPost(rawText: string): {
  phones: string[];
  email?: string;
  name: string;
  propertyDetails: string;
  location: string;
  keywordsMatched: string[];
  triggerCategory: string;
  motivationScore: number;
} {
  const phones = extractPhones(rawText);
  const email = extractEmail(rawText);
  const name = extractName(rawText);
  const propertyDetails = extractPropertyDetails(rawText);
  const location = extractLocation(rawText);

  const lower = rawText.toLowerCase();
  const matched: string[] = [];
  let motivationScore = 0;
  let primaryCategory = "general";
  let maxScore = 0;

  for (const [catKey, catData] of Object.entries(TRIGGER_KEYWORDS)) {
    for (const kw of catData.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        if (!matched.includes(kw)) matched.push(kw);
        if (catData.score > maxScore) {
          maxScore = catData.score;
          primaryCategory = catKey;
        }
        motivationScore += catData.score;
        break;
      }
    }
  }

  if (phones.length > 0) motivationScore += 10;
  if (phones.length > 1) motivationScore += 5;
  if (email) motivationScore += 5;

  motivationScore = Math.min(Math.round(motivationScore), 100);

  return {
    phones,
    email,
    name,
    propertyDetails,
    location,
    keywordsMatched: matched,
    triggerCategory: primaryCategory,
    motivationScore,
  };
}

router.post("/intel/scan-post", async (req, res) => {
  const { rawText, sourceGroupUrl, sourceGroupName, postUrl, withinLast24h } = req.body as {
    rawText: string;
    sourceGroupUrl?: string;
    sourceGroupName?: string;
    postUrl?: string;
    withinLast24h?: boolean;
  };
  if (!rawText?.trim()) return res.status(400).json({ error: "rawText is required" });

  const analysis = scanPost(rawText);

  const [post] = await db.insert(sellerPostsTable).values({
    rawText,
    sourceGroupUrl: sourceGroupUrl || "https://www.facebook.com/groups/2791019307842181",
    sourceGroupName: sourceGroupName || "Madinaty / New Cairo Group",
    postUrl,
    contactName: analysis.name || null,
    contactPhone: analysis.phones[0] || null,
    contactPhones: analysis.phones,
    contactEmail: analysis.email || null,
    propertyDetails: analysis.propertyDetails || null,
    location: analysis.location || null,
    keywordsMatched: analysis.keywordsMatched,
    triggerCategory: analysis.triggerCategory,
    motivationScore: analysis.motivationScore,
    withinLast24h: withinLast24h !== false,
  }).returning();

  return res.status(201).json({ post, analysis });
});

router.get("/intel/seller-posts", async (req, res) => {
  const { category, minScore } = req.query as { category?: string; minScore?: string };
  let posts = await db.select().from(sellerPostsTable).orderBy(desc(sellerPostsTable.createdAt));
  if (category && category !== "all") posts = posts.filter(p => p.triggerCategory === category);
  if (minScore) posts = posts.filter(p => p.motivationScore >= Number(minScore));
  return res.json(posts);
});

router.put("/intel/seller-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const { status, notes } = req.body;
  const [updated] = await db.update(sellerPostsTable).set({ status, notes }).where(eq(sellerPostsTable.id, id)).returning();
  return res.json(updated);
});

router.delete("/intel/seller-posts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(sellerPostsTable).where(eq(sellerPostsTable.id, id));
  return res.status(204).send();
});

export default router;
