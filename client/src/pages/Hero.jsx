import { useState, useEffect } from "react";
import { ExternalLink, Sparkles, ChevronRight } from "lucide-react";
import { getHourlyQuote } from "../data/quotes_data";

// ─── Category → Google search URL ────────────────────────────────────────────
function getSearchUrl(quote) {
  const q = encodeURIComponent(`${quote.src} "${quote.text.slice(0, 60)}"`);
  return `https://www.google.com/search?q=${q}`;
}

// ─── Category badge colours ───────────────────────────────────────────────────
const CATEGORY_COLOURS = {
  EssayGold: { bg: "rgba(245,158,11,.22)", color: "var(--accent-gold)", border: "rgba(245,158,11,.4)" },
  Indian: { bg: "rgba(245,158,11,.18)", color: "var(--accent-gold)", border: "rgba(245,158,11,.35)" },
  Sufi: { bg: "rgba(168,85,247,.15)", color: "#c084fc", border: "rgba(168,85,247,.3)" },
  Philosophy: { bg: "rgba(59,130,246,.15)", color: "#93c5fd", border: "rgba(59,130,246,.3)" },
  Sociology: { bg: "rgba(16,185,129,.15)", color: "#6ee7b7", border: "rgba(16,185,129,.3)" },
  Poetry: { bg: "rgba(244,63,94,.15)", color: "#fb7185", border: "rgba(244,63,94,.3)" },
  Literature: { bg: "rgba(251,146,60,.15)", color: "#fdba74", border: "rgba(251,146,60,.3)" },
  EnglishLiterature: { bg: "rgba(251,146,60,.15)", color: "#fdba74", border: "rgba(251,146,60,.3)" },
  HindiLiterature: { bg: "rgba(234,88,12,.15)", color: "#fb923c", border: "rgba(234,88,12,.3)" },
  FillIn: { bg: "rgba(99,102,241,.2)", color: "#a5b4fc", border: "rgba(99,102,241,.4)" },
  Ethics: { bg: "rgba(99,102,241,.15)", color: "#a5b4fc", border: "rgba(99,102,241,.3)" },
  UPSC: { bg: "rgba(245,158,11,.22)", color: "var(--accent-gold)", border: "rgba(245,158,11,.4)" },
  Environment: { bg: "rgba(34,197,94,.15)", color: "#86efac", border: "rgba(34,197,94,.3)" },
  Women: { bg: "rgba(236,72,153,.15)", color: "#f9a8d4", border: "rgba(236,72,153,.3)" },
  Governance: { bg: "rgba(148,163,184,.15)", color: "#cbd5e1", border: "rgba(148,163,184,.3)" },
  Economy: { bg: "rgba(251,191,36,.15)", color: "#fde68a", border: "rgba(251,191,36,.3)" },
  Science: { bg: "rgba(6,182,212,.15)", color: "#67e8f9", border: "rgba(6,182,212,.3)" },
  Wisdom: { bg: "rgba(245,158,11,.12)", color: "#fcd34d", border: "rgba(245,158,11,.25)" },
  Politics: { bg: "rgba(239,68,68,.15)", color: "#fca5a5", border: "rgba(239,68,68,.3)" },
  Proverb: { bg: "rgba(20,184,166,.15)", color: "#5eead4", border: "rgba(20,184,166,.3)" },
};

// ─── QuotePanel - 365-quote logic, original compact card styling ─────────────
function QuotePanel({ customQuote, onQuoteClick }) {
  const [quote, setQuote] = useState(customQuote ?? getHourlyQuote());
  const [fade, setFade] = useState(true);

  // Refresh at the top of each new hour
  useEffect(() => {
    if (customQuote) return;
    const tick = () => {
      const fresh = getHourlyQuote();
      if (fresh.text !== quote.text) {
        setFade(false);
        setTimeout(() => { setQuote(fresh); setFade(true); }, 350);
      }
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [quote, customQuote]);

  const colours = CATEGORY_COLOURS[quote.category] || CATEGORY_COLOURS.Wisdom;

  return (
    <div
      className="mt-4 sm:mt-5 rounded-xl px-4 py-4 sm:py-5 cursor-pointer group"
      onClick={() => onQuoteClick && onQuoteClick(quote)}
    >
      {/* Top row: label + category badge + external link */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <p className="font-mono text-[8px] sm:text-[9px] tracking-[.15em] text-accent-gold uppercase">
          Today's Focus
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-[8px] px-1.5 py-0.5 rounded-full"
            style={{ background: colours.bg, color: colours.color, border: `1px solid ${colours.border}` }}
          >
            {quote.category}
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              window.open(getSearchUrl(quote), "_blank", "noopener,noreferrer");
            }}
            className="p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
            title="Search online"
          >
            <ExternalLink size={9} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Quote text */}
      <p
        className="text-[12px] sm:text-sm md:text-base italic text-white/95 leading-relaxed transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        "{quote.text}"
      </p>

      {/* Translation / meaning line - shown for Hindi quotes and English idioms */}
      {quote.meaning && (
        <p
          className="text-[10px] sm:text-[11px] text-white/55 leading-snug mt-1.5 transition-opacity duration-300"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {quote.meaning}
        </p>
      )}

      {/* Author + AI hint */}
      <div className="flex items-center justify-between mt-3 sm:mt-4">
        <p className="text-[10px] sm:text-[11px] font-mono text-white/45">— {quote.src}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles size={9} className="text-accent-gold" />
          <span className="text-[9px] font-mono text-accent-gold">Ask AI Mentor</span>
          <ChevronRight size={9} className="text-accent-gold" />
        </div>
      </div>
    </div>
  );
}

export default function HeroBanner({
  examDate = null,
  customQuote = null,
  onQuoteClick = null,
}) {
  // Days-to-exam counter
  const daysLeft = (() => {
    if (!examDate) return null;
    return Math.ceil((new Date(examDate) - new Date()) / 86400000);
  })();

  const daysLeftDisplay =
    daysLeft === null ? "—"
      : daysLeft > 0 ? `${daysLeft}d`
        : daysLeft === 0 ? "Today!"
          : "Over";

  return (
    <section className="relative overflow-hidden rounded-xl sm:rounded-2xl mx-3 sm:mx-6 mt-3 sm:mt-6 shadow-xl">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Motivation.png"
          alt="Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-2 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-6 sm:pb-7 md:pb-8">
        {/* Top row - label + date + exam countdown */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4 sm:mb-5 md:mb-6">
          <p className="font-mono text-[9px] sm:text-[10px] tracking-[.18em] uppercase text-accent-gold">UPSC Mentor</p>
          <div className="flex items-center gap-2 flex-wrap">
            {daysLeft !== null && (
              <span className="font-mono text-[9px] sm:text-[10px] md:text-[11px] text-white/90 bg-black/35 border border-accent-gold/30 rounded-full px-2 py-1 sm:px-2.5 backdrop-blur-sm whitespace-nowrap">
                {daysLeftDisplay} to exam
              </span>
            )}
            <span className="font-mono text-[9px] sm:text-[10px] md:text-[11px] text-white/70 bg-black/30 border border-white/15 rounded-full px-2 py-1 sm:px-2.5 backdrop-blur-sm whitespace-nowrap">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Hero title */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-normal text-white leading-[1.2] sm:leading-[1.1] max-w-lg drop-shadow-sm
          mb-3 sm:mb-4">
          Every day counts.
          <br />
          Every answer matters.
        </h1>

        {/* Quote - 365-quote engine, original compact panel look */}
        <QuotePanel customQuote={customQuote} onQuoteClick={onQuoteClick} />
      </div>
    </section>
  );
}
