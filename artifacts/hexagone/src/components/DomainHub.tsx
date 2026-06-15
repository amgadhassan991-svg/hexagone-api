import { useState } from "react";

type BeastResult = {
  fit_score: number;
  pitch_headline: string;
  pitch_body: string;
  closing_move: string;
};

export function DomainHub() {
  const [lead, setLead] = useState({ name: "", phone: "", notes: "" });
  const [result, setResult] = useState<BeastResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeLead = async () => {
    if (!lead.name || !lead.notes) {
      alert("اكتب الاسم والملاحظات الأول!");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/beast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert("حصلت مشكلة: " + data.error);
      }
    } catch {
      alert("مشكلة في الربط مع السيرفر.");
    }
    setLoading(false);
  };

  const scorePercent = result ? Math.round(result.fit_score * 100) : 0;
  const isHot = result && result.fit_score >= 0.7;

  return (
    <div className="p-4" dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "#22d3ee" }}>
          🎯 Domain Hub
        </h2>
        <p className="text-sm" style={{ color: "#64748b" }}>
          وضع المخابرات — فلترة الحيتان وصناعة السكريبتات
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div
          className="rounded-xl p-5 border space-y-4"
          style={{ background: "#0f172a", borderColor: "#1e293b" }}
        >
          <h3 className="font-semibold text-white">بيانات العميل</h3>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
              الاسم
            </label>
            <input
              type="text"
              className="w-full rounded p-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors"
              style={{ background: "#030712", border: "1px solid #334155" }}
              placeholder="مثال: أحمد عبد الله"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
              التليفون
            </label>
            <input
              type="text"
              className="w-full rounded p-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors"
              style={{ background: "#030712", border: "1px solid #334155" }}
              placeholder="010..."
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
              الملاحظات (وظيفته، منطقته، الداتا المسحوبة)
            </label>
            <textarea
              rows={5}
              className="w-full rounded p-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors resize-none"
              style={{ background: "#030712", border: "1px solid #334155" }}
              placeholder="شغال مدير مبيعات، ساكن في التجمع، بيدور على تاون هاوس..."
              value={lead.notes}
              onChange={(e) => setLead({ ...lead, notes: e.target.value })}
            />
          </div>

          <button
            onClick={analyzeLead}
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
            style={{
              background: loading ? "#164e63" : "#0891b2",
              color: "#fff",
            }}
          >
            {loading ? "الوحش بيفصص الداتا... ⏳" : "شغّل الوحش وافرز العميل 🚀"}
          </button>
        </div>

        {/* Results */}
        <div
          className="rounded-xl p-5 border"
          style={{ background: "#0f172a", borderColor: "#1e293b" }}
        >
          <h3 className="font-semibold text-white mb-4">التحليل والسكريبت</h3>

          {!result && !loading && (
            <div
              className="flex items-center justify-center h-48 text-sm"
              style={{ color: "#334155" }}
            >
              النتيجة هتظهر هنا بعد الفرز...
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center space-y-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor: "#0891b2", borderTopColor: "transparent" }}
                />
                <p className="text-sm" style={{ color: "#64748b" }}>
                  الوحش بيحلل...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Fit Score */}
              <div
                className="rounded-lg p-4 border"
                style={{ background: "#030712", borderColor: "#1e293b" }}
              >
                <span className="text-xs block mb-2" style={{ color: "#64748b" }}>
                  التقييم (Fit Score)
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: isHot ? "#22d3ee" : "#f59e0b" }}
                  >
                    {scorePercent}%
                  </div>
                  <div className="text-sm" style={{ color: "#94a3b8" }}>
                    {isHot ? "🔥 حوت تقيل — دوس معاه" : "⚠️ بلح — ركّز في غيره"}
                  </div>
                </div>
                {/* Progress bar */}
                <div
                  className="mt-3 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#1e293b" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${scorePercent}%`,
                      background: isHot
                        ? "linear-gradient(90deg, #0891b2, #22d3ee)"
                        : "linear-gradient(90deg, #b45309, #f59e0b)",
                    }}
                  />
                </div>
              </div>

              {/* Headline */}
              <div
                className="rounded-lg p-4 border"
                style={{ background: "#030712", borderColor: "#1e293b" }}
              >
                <span
                  className="text-xs font-bold block mb-2"
                  style={{ color: "#22d3ee" }}
                >
                  الافتتاحية (The Hook)
                </span>
                <p className="text-white text-sm leading-relaxed">
                  {result.pitch_headline}
                </p>
              </div>

              {/* Body */}
              <div
                className="rounded-lg p-4 border"
                style={{ background: "#030712", borderColor: "#1e293b" }}
              >
                <span
                  className="text-xs font-bold block mb-2"
                  style={{ color: "#22d3ee" }}
                >
                  رسالة الواتساب / المكالمة
                </span>
                <p
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ color: "#cbd5e1" }}
                >
                  {result.pitch_body}
                </p>
              </div>

              {/* Closing */}
              <div
                className="rounded-lg p-4 border"
                style={{
                  background: "#030712",
                  borderColor: "rgba(239,68,68,0.3)",
                }}
              >
                <span
                  className="text-xs font-bold block mb-2"
                  style={{ color: "#f87171" }}
                >
                  القفلة (Closing Move)
                </span>
                <p className="text-white text-sm font-semibold leading-relaxed">
                  {result.closing_move}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
