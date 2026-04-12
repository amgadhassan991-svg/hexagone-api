import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

// ÙÙ Ø¹ÙØ¯Ù supabase client Ø¬Ø§ÙØ² ÙÙ ÙØ´Ø±ÙØ¹ÙØ Ø§ÙØ³Ø­ Ø§ÙØ³Ø·Ø±ÙÙ Ø¯ÙÙ ÙØ§Ø³ØªÙØ±Ø¯ ÙÙ Ø¹ÙØ¯Ù
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export default function IngestionTab({ onSuccess }: { onSuccess?: () => void }) {
  const [rawData, setRawData] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const extractEgyptPhones = (text: string): string[] => {
    const regex = /(?:\+20|0020|0)?1[0125]\d{8}/g
    const matches = text.match(regex) || []
    return matches
      .map(p => p.replace(/^0020/, "+20").replace(/^0/, "+20"))
      .map(p => p.startsWith("+") ? p : `+20${p.slice(-10)}`)
      .filter(p => {
        const digits = p.replace(/\D/g, "")
        if (digits.includes("12345678")) return false
        if (digits.includes("00000000")) return false
        if (digits.length !== 12) return false
        return true
      })
      .filter((v, i, a) => a.indexOf(v) === i)
  }

  const handleRaid = async () => {
    const cleanText = (rawData || "").trim()
    if (!cleanText) {
      setMessage("Ø­Ø· ÙØµ Ø§ÙØ§ÙÙ")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const phones = extractEgyptPhones(cleanText)
      if (phones.length === 0) {
        setMessage("ÙÙÙØ´ Ø±ÙÙ ÙØµØ±Ù ØµØ­ÙØ­ ÙÙ Ø§ÙÙØµ")
        setLoading(false)
        return
      }
      for (const phone of phones) {
        const { error } = await supabase.from("seller_posts").insert({
          raw_text: cleanText,
          phone: phone,
          source: "manual_raid",
          created_at: new Date().toISOString(),
          status: "new"
        })
        if (error) throw error
      }
      setMessage(`â ØªÙ Ø­ÙØ¸ ${phones.length} Ø±ÙÙ`)
      setRawData("")
      onSuccess?.()
    } catch (err: any) {
      setMessage(`Ø®Ø·Ø£: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-[#0f172a] rounded-2xl border border-slate-800">
      <h3 className="text-white font-bold mb-4">RAID DATABASE</h3>
      <textarea
        value={rawData}
        onChange={(e) => setRawData(e.target.value)}
        placeholder="Ø§ÙØµÙ Ø¨ÙØ³Øª ÙÙ ÙÙØ³Ø¨ÙÙ ÙÙØ§..."
        className="w-full h-48 bg-black border border-slate-700 rounded-xl p-4 text-slate-200 text-sm font-mono resize-none focus:border-[#d4af37] outline-none"
        dir="auto"
      />
      <button
        onClick={handleRaid}
        disabled={loading}
        className="w-full mt-4 py-3 bg-[#d4af37] text-black font-black rounded-xl uppercase tracking-widest text-xs hover:bg-[#f1d592] disabled:opacity-50"
      >
        {loading ? "Ø¬Ø§Ø±Ù Ø§ÙØ­ÙØ¸..." : "EXECUTE RAID"}
      </button>
      {message && <p className="mt-3 text-center text-sm text-[#d4af37]">{message}</p>}
      <p className="mt-4 text-[10px] text-slate-600 text-center">Ø¨ÙÙØ¨Ù Ø§Ø±ÙØ§Ù ÙØµØ± Ø¨Ø³ 010 011 012 015</p>
    </div>
  )
}
