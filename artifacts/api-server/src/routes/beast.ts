import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/beast", async (req, res) => {
  const { name, phone, notes } = req.body as {
    name?: string;
    phone?: string;
    notes?: string;
  };

  if (!name || !notes) {
    return res.status(400).json({ success: false, error: "name and notes are required" });
  }

  const prompt = `أنت خبير مبيعات عقاري مصري محترف. حلل بيانات العميل التالي وقيّمه.

اسم العميل: ${name}
التليفون: ${phone || "غير متاح"}
البيانات والملاحظات: ${notes}

ارجع JSON فقط بدون أي نص إضافي أو markdown بالشكل التالي:
{
  "fit_score": رقم بين 0 و 1 يمثل احتمالية الإغلاق,
  "pitch_headline": "جملة افتتاحية قوية وموجهة للعميل",
  "pitch_body": "رسالة واتساب أو مكالمة كاملة بالعامية المصرية، من 3 إلى 5 جمل",
  "closing_move": "جملة القفلة التي تدفعه لاتخاذ قرار"
}

معايير التقييم:
- fit_score عالي (0.7+): لو عنده قدرة مالية واضحة، واهتمام حقيقي، وتفاصيل تدل على جدية
- fit_score متوسط (0.4-0.7): اهتمام ولكن مش واضح جدية أو قدرة مالية
- fit_score منخفض (أقل من 0.4): بيانات ضعيفة أو مش مناسب للمنتج`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    const raw = response.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, error: "Invalid AI response format" });
    }

    const data = JSON.parse(jsonMatch[0]);
    return res.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: msg });
  }
});

export default router;
