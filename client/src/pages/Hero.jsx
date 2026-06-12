
import { useState } from "react";

const DEFAULT_QUOTES = [
  { text: "Dreams are not those that come while sleeping, but dreams are those when you don't sleep before fulfilling them.", src: "Dr. A.P.J. Abdul Kalam" },
  { text: "All success in any line of work is the result of the power of concentration. Control of the mind should be taught first.", src: "Swami Vivekananda" },
  { text: "My final words of advice to you are: educate, agitate, and organize; have faith in yourselves and never lose hope.", src: "Dr. B.R. Ambedkar" },
  { text: "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, and knowledge makes you great.", src: "Dr. A.P.J. Abdul Kalam" },
  { text: "Arise! Awake! And stop not until the goal is reached.", src: "Swami Vivekananda" },
  { text: "The battle for me is a matter full of joy... It is a battle for freedom, for the reclamation of the human personality.", src: "Dr. B.R. Ambedkar" },
  { text: "Man needs difficulties because difficulties are necessary to enjoy success. Give wings to the divine fire within you.", src: "Dr. A.P.J. Abdul Kalam" }
];

function QuotePanel({ customQuote }) {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = customQuote ?? DEFAULT_QUOTES[dayOfYear % DEFAULT_QUOTES.length];

  return (
    <div className="mt-4 sm:mt-5 rounded-xl px-4 py-4 sm:py-5">
      <p className="font-mono text-[8px] sm:text-[9px] tracking-[.15em] text-accent-gold uppercase mb-2 sm:mb-3">Today's Focus</p>
      <p className="text-[12px] sm:text-sm md:text-base italic text-white/95 leading-relaxed">"{quote.text}"</p>
      <p className="text-[10px] sm:text-[11px] font-mono text-white/45 mt-3 sm:mt-4">— {quote.src}</p>
    </div>
  );
}

export default function HeroBanner({
  examDate = null,
  customQuote = null,
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
    <section className="relative overflow-hidden rounded-xl sm:rounded-3xl mx-1 sm:mx-2 mt-1 sm:mt-2 shadow-xl">
      {/* Background - Same size as before */}
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
        {/* Top row — label + date + exam countdown */}
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

        {/* Quote - Now with more space */}
        <QuotePanel customQuote={customQuote} />
      </div>
    </section>
  );
}
