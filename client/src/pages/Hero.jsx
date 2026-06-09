
import { useState } from "react";
import { Check, X } from "lucide-react";

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
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3">
      <p className="font-mono text-[9px] tracking-[.15em] text-accent-gold uppercase mb-2">Today's Focus</p>
      <p className="text-xs sm:text-sm italic text-white/95 leading-relaxed">"{quote.text}"</p>
      <p className="text-[11px] font-mono text-white/45 mt-2">— {quote.src}</p>
    </div>
  );
}

function AchievementChip({ label, done, onClick, onRemove }) {
  return (
    <div
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono cursor-pointer select-none transition-all
        ${done
          ? "bg-accent-gold/15 border border-accent-gold/50 text-accent-gold"
          : "bg-white/10 border border-white/25 text-white/85"
        }`}
      onClick={onClick}
    >
      {done
        ? <Check size={10} className="shrink-0" />
        : <span className="w-2 h-2 rounded-full border border-current inline-block shrink-0" />
      }
      <span>{label}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-50 hover:!opacity-100 ml-0.5 text-current"
      >
        <X size={9} />
      </button>
    </div>
  );
}

export default function HeroBanner({
  examDate = null,
  customQuote = null,
  achievements = [
    { label: "JEE Advanced", done: true },
    { label: "NDA Written", done: true },
    { label: "IAS → In Progress", done: false },
  ],
  onAchievementsChange,
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

  const toggleAchievement = (i) => {
    if (!onAchievementsChange) return;
    onAchievementsChange(achievements.map((a, idx) => idx === i ? { ...a, done: !a.done } : a));
  };

  const removeAchievement = (i) => {
    if (!onAchievementsChange) return;
    onAchievementsChange(achievements.filter((_, idx) => idx !== i));
  };

  const [newChip, setNewChip] = useState("");
  const [addingChip, setAddingChip] = useState(false);

  const addAchievement = () => {
    if (!newChip.trim() || !onAchievementsChange) return;
    onAchievementsChange([...achievements, { label: newChip.trim(), done: false }]);
    setNewChip("");
    setAddingChip(false);
  };

  return (
    <section className="relative overflow-hidden min-h-full rounded-xl sm:rounded-3xl mx-3 sm:mx-6 mt-3 sm:mt-6 shadow-2xl">
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
      <div className="relative z-10 px-4 sm:px-8 pt-5 sm:pt-7 pb-5 sm:pb-7">
        {/* Top row — label + date + exam countdown */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-accent-gold">UPSC Mentor</p>
          <div className="flex items-center gap-2">
            {daysLeft !== null && (
              <span className="font-mono text-[10px] sm:text-[11px] text-white/90 bg-black/35 border border-accent-gold/30 rounded-full px-2.5 py-1 backdrop-blur-sm">
                {daysLeftDisplay} to exam
              </span>
            )}
            <span className="font-mono text-[10px] sm:text-[11px] text-white/70 bg-black/30 border border-white/15 rounded-full px-2.5 py-1 backdrop-blur-sm">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Hero title */}
        <h1 className="font-display text-[28px] sm:text-[38px] md:text-[42px] font-normal text-white leading-[1.1] max-w-lg drop-shadow-lg">
          Every day counts.
          <br />
          Every answer matters.
        </h1>

        {/* Quote */}
        <QuotePanel customQuote={customQuote} />
      </div>
    </section>
  );
}