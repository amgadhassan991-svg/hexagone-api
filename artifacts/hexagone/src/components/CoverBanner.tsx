export function CoverBanner() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 220, background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1a1008 70%, #0f172a 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: "overlay" }}
      >
        <defs>
          <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse">
            <path
              d="M30 0 L60 17.3 L60 34.6 L30 52 L0 34.6 L0 17.3 Z"
              fill="none"
              stroke="#d4af37"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div
          className="text-3xl font-black tracking-widest uppercase"
          style={{ color: "#d4af37", fontFamily: "'Cinzel', serif", letterSpacing: "0.3em", textShadow: "0 0 30px rgba(212,175,55,0.4)" }}
        >
          L'HEXAGONE
        </div>
        <div className="text-xs tracking-[0.4em] uppercase" style={{ color: "#a8882a" }}>
          Lead Intelligence Command Center
        </div>
        <div
          className="mt-2 px-4 py-1 rounded-full text-xs font-bold tracking-widest"
          style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37" }}
        >
          STRATEGIC BEAST v13.0
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: 60, background: "linear-gradient(to top, #020617, transparent)" }}
      />
    </div>
  );
}
