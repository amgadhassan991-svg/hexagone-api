import { Router } from "express";
import { db } from "@workspace/db";
import { fbProfilesTable, strategicPitchesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

type OgMeta = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  url?: string;
};

async function scrapeOgTags(url: string): Promise<{ meta: OgMeta; status: string; html?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timer);

    const html = await res.text();

    const ogRegex = /<meta\s+(?:property|name)=["']og:([^"']+)["']\s+content=["']([^"']*?)["']\s*\/?>/gi;
    const meta: OgMeta = {};
    let match: RegExpExecArray | null;

    while ((match = ogRegex.exec(html)) !== null) {
      const key = match[1].toLowerCase() as keyof OgMeta;
      if (!meta[key]) (meta as Record<string, string>)[key] = match[2];
    }

    if (!meta.title) {
      const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
      if (titleMatch) meta.title = titleMatch[1].trim();
    }

    const hasContent = !!(meta.title || meta.description);
    const isBlocked =
      html.includes("log in") ||
      html.includes("Log In") ||
      html.includes("login") ||
      html.includes("checkpoint") ||
      !hasContent;

    return {
      meta,
      status: isBlocked ? (hasContent ? "partial" : "blocked") : "success",
      html: html.slice(0, 2000),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { meta: {}, status: "error", html: msg };
  }
}

type VelocityCategory =
  | "Ambitious Professional"
  | "Business Owner"
  | "Creative Visionary"
  | "Investor Mindset"
  | "Growth Seeker"
  | "Authority Figure"
  | "Unknown Profile";

function detectVelocityCategory(text: string): VelocityCategory {
  const lower = text.toLowerCase();
  if (lower.match(/ceo|founder|director|president|executive|owner/)) return "Business Owner";
  if (lower.match(/invest|portfolio|fund|capital|finance|wealth/)) return "Investor Mindset";
  if (lower.match(/artist|creator|designer|musician|writer|filmmaker/)) return "Creative Visionary";
  if (lower.match(/coach|mentor|speaker|author|consultant/)) return "Authority Figure";
  if (lower.match(/manager|engineer|professional|specialist|analyst/)) return "Ambitious Professional";
  if (lower.match(/grow|scale|learn|build|achieve|success/)) return "Growth Seeker";
  return "Unknown Profile";
}

function computeVelocityScore(text: string): number {
  let score = 30;
  const lower = text.toLowerCase();
  const highValue = ["founder", "ceo", "investor", "capital", "million", "scale", "empire", "wealth", "build", "grow"];
  const urgency = ["ready", "now", "asap", "serious", "committed", "action"];
  highValue.forEach((kw) => { if (lower.includes(kw)) score += 12; });
  urgency.forEach((kw) => { if (lower.includes(kw)) score += 8; });
  score = Math.min(score, 100);
  return score;
}

type PitchResult = {
  headline: string;
  body: string;
  hooks: string[];
  closingMove: string;
};

function generateVelocityPitch(name: string, bio: string, category: VelocityCategory, score: number): PitchResult {
  const displayName = name && name !== "Unknown" ? name.split(" ")[0] : "there";
  const intensity = score >= 70 ? "elite" : score >= 50 ? "high" : "standard";

  const pitchTemplates: Record<VelocityCategory, PitchResult> = {
    "Business Owner": {
      headline: `${displayName}, your operation is ready for its next 10x chapter.`,
      body: `Based on what I see in your positioning, you've built something real. Most operators at your stage are leaving significant value on the table — not because they lack capability, but because they're too close to the work to see the leverage point. That's exactly where L'Hexagone operates. We identify the one move that changes everything, and we execute it with you.`,
      hooks: [
        "What's the bottleneck between where your business is now and where it needs to be in 18 months?",
        "Every high-performing operation has one constraint that, if removed, unlocks exponential output. We find it.",
        "The market doesn't wait for you to get comfortable with growth. Your competitors aren't waiting either.",
      ],
      closingMove: `I'm extending you a strategic intelligence session — 45 minutes, zero filler, pure signal. This is for operators who are serious about the next level. Are you in?`,
    },
    "Investor Mindset": {
      headline: `${displayName}, smart capital deserves smarter intelligence.`,
      body: `You understand returns. You understand positioning. What separates a 20% return from a 200% one isn't effort — it's information asymmetry. L'Hexagone provides the intelligence layer that serious capital allocators rely on when conventional research isn't enough. We see what the market hasn't priced in yet.`,
      hooks: [
        "The best investment opportunities exist in the gap between public narrative and private reality.",
        "Information edge is the only sustainable edge in competitive markets.",
        "The investors who compound fastest are the ones who invest in their intelligence infrastructure first.",
      ],
      closingMove: `Let's have a conversation about what you're positioning in right now. I have some intelligence on adjacent opportunities that I think you'll find worth 30 minutes of your time.`,
    },
    "Creative Visionary": {
      headline: `${displayName}, your vision is worth more than your current audience knows.`,
      body: `Visionaries create the future. But creation without strategic amplification is a tree falling in an empty forest. You have the originality — what you need is the architecture to make it undeniable. L'Hexagone specializes in taking singular creative visions and engineering the market conditions for them to be impossible to ignore.`,
      hooks: [
        "The gap between cult following and cultural moment is always strategic, never accidental.",
        "Every great creative breakthrough has an unfair advantage behind it. Let's build yours.",
        "Monetization isn't selling out — it's ensuring your vision has the resources to keep existing.",
      ],
      closingMove: `I want to show you specifically what a velocity strategy looks like for your creative lane. This isn't a pitch — it's a preview. Can we get 30 minutes on the calendar?`,
    },
    "Authority Figure": {
      headline: `${displayName}, your expertise is an untapped asset class.`,
      body: `You've done the work. You've earned the authority. The question isn't whether your knowledge is valuable — it's whether the right people are accessing it at the scale your expertise deserves. The coaching and consulting market rewards positioning above everything. Let's make yours impossible to overlook.`,
      hooks: [
        "Authority without distribution is a library with no visitors.",
        "The highest-leverage move for any expert is turning their knowledge into a systematized intelligence product.",
        "Your next breakthrough client is already looking for someone exactly like you. Let's make sure they find you.",
      ],
      closingMove: `I specialize in helping thought leaders convert their expertise into elite-tier positioning. I'd like to show you what that looks like for your specific profile. 20 minutes — does that work?`,
    },
    "Ambitious Professional": {
      headline: `${displayName}, you're building toward something — let's accelerate the timeline.`,
      body: `Professionals who reach the top don't just outwork everyone else — they outposition them. You're already moving in the right direction. What L'Hexagone provides is the strategic intelligence layer that compresses years of trial into months of precision. Every decision you make is higher-leverage when it's backed by the right intelligence.`,
      hooks: [
        "The professionals who break through their ceiling aren't the hardest workers — they're the most strategically positioned.",
        "Your career trajectory is a strategy problem. Most people treat it as a time problem.",
        "One strategic move at the right moment is worth five years of grinding without direction.",
      ],
      closingMove: `I'd like to run a quick positioning audit on your current trajectory and show you the gaps that, if addressed, would significantly accelerate your timeline. Interested?`,
    },
    "Growth Seeker": {
      headline: `${displayName}, the difference between where you are and where you want to be is one strategic decision.`,
      body: `Growth isn't a mystery — it's a series of compounding decisions made with the right information at the right moment. You're already oriented toward the right direction. What you need is the intelligence and the framework to stop leaving trajectory-changing opportunities on the table. That's exactly what we build for people like you.`,
      hooks: [
        "Every successful transformation begins with a decision made before the conditions are perfect.",
        "The people you admire aren't more talented — they simply had better strategic information at the key decision points.",
        "Momentum compounds when decisions are made with intelligence rather than hope.",
      ],
      closingMove: `Let's map out what your next 90-day strategic sprint looks like. I do this for free with the people I think have what it takes. From what I can see, you qualify. Want to talk?`,
    },
    "Unknown Profile": {
      headline: `${displayName}, strategic positioning changes everything.`,
      body: `I came across your profile and I see something worth a conversation. The people who make the biggest moves aren't always the ones with the most resources — they're the ones who are positioned correctly at the right moment. L'Hexagone helps people who are serious about results get positioned for exactly that.`,
      hooks: [
        "The right conversation at the right moment has changed more trajectories than years of effort.",
        "Strategic intelligence isn't a luxury — it's the operating system behind every significant outcome.",
        "The question isn't whether opportunity exists. It's whether you're positioned to capture it when it appears.",
      ],
      closingMove: `I'd like to have a quick conversation to understand what you're working toward. If I can help, I'll tell you exactly how. If I can't, I'll tell you that too. Either way, it's worth 20 minutes. What do you think?`,
    },
  };

  const pitch = pitchTemplates[category] || pitchTemplates["Unknown Profile"];

  if (intensity === "elite") {
    pitch.headline = "⚡ " + pitch.headline;
  }

  return pitch;
}

router.post("/intel/scrape", async (req, res) => {
  const { url, manualBio } = req.body as { url: string; manualBio?: string };
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { meta, status } = await scrapeOgTags(url);

    const resolvedBio = manualBio || meta.description || "";
    const resolvedName = meta.title || "Unknown";

    const [profile] = await db
      .insert(fbProfilesTable)
      .values({
        url,
        profileName: resolvedName,
        bio: meta.description || null,
        avatarUrl: meta.image || null,
        scrapeStatus: status,
        rawMeta: meta as Record<string, unknown>,
        manualBio: manualBio || null,
      })
      .returning();

    const bioText = resolvedBio;
    const category = detectVelocityCategory(bioText + " " + resolvedName);
    const score = computeVelocityScore(bioText + " " + resolvedName);
    const pitch = generateVelocityPitch(resolvedName, bioText, category, score);

    const [savedPitch] = await db
      .insert(strategicPitchesTable)
      .values({
        profileId: profile.id,
        profileUrl: url,
        profileName: resolvedName,
        bio: bioText,
        velocityCategory: category,
        velocityScore: score,
        pitchHeadline: pitch.headline,
        pitchBody: pitch.body,
        hooks: pitch.hooks,
        closingMove: pitch.closingMove,
      })
      .returning();

    return res.json({
      profile,
      pitch: savedPitch,
      scrapeStatus: status,
      meta,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

router.get("/intel/pitches", async (_req, res) => {
  const pitches = await db
    .select()
    .from(strategicPitchesTable)
    .orderBy(desc(strategicPitchesTable.createdAt));
  return res.json(pitches);
});

router.delete("/intel/pitches/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  await db.delete(strategicPitchesTable).where(eq(strategicPitchesTable.id, id));
  return res.status(204).send();
});

router.get("/intel/profiles", async (_req, res) => {
  const profiles = await db
    .select()
    .from(fbProfilesTable)
    .orderBy(desc(fbProfilesTable.processedAt));
  return res.json(profiles);
});

export default router;
