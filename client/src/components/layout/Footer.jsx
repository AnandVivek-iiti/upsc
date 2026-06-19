import { ArrowUpRight, ShieldCheck, Heart } from "lucide-react";
import {
  LAST_VERIFIED_DATE,
  OFFICIAL_UPSC_LINKS,
  GOV_LINKS,
  REPORT_LINKS,
  LEARNING_LINKS,
  NEWS_LINKS,
  OFFICIAL_UPSC_REFERENCE_LINKS,
} from "../../data/upscLinks";

const TAG_COLOR = {
  gold: "bg-accent-gold/10  text-accent-gold  border-accent-gold/20",
  green: "bg-emerald-500/10  text-emerald-400  border-emerald-500/20",
  blue: "bg-blue-500/10     text-blue-400     border-blue-500/20",
  purple: "bg-purple-500/10   text-purple-400   border-purple-500/20",
  rose: "bg-rose-500/10     text-rose-400     border-rose-500/20",
};

function LinkItem({ href, label, tag, tagColor = "gold" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-text-secondary transition hover:bg-bg-muted hover:text-text-primary cursor-pointer"
    >
      <span className="flex-1 leading-snug pointer-events-none">{label}</span>

      {tag && (
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-mono pointer-events-none ${TAG_COLOR[tagColor]}`}
        >
          {tag}
        </span>
      )}

      <ArrowUpRight
        size={12}
        className="shrink-0 opacity-30 transition group-hover:opacity-70 pointer-events-none"
      />
    </a>
  );
}

function SectionHeading({ children }) {
  return (
    <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-muted">
      {children}
    </p>
  );
}

const COLUMNS = [
  { heading: "Official UPSC", links: OFFICIAL_UPSC_LINKS, tag: "Official", color: "gold" },
  { heading: "Govt & Policy", links: GOV_LINKS, tag: "Gov", color: "blue" },
  { heading: "Reports & Data", links: REPORT_LINKS, tag: "Data", color: "purple" },
  { heading: "Free Learning", links: LEARNING_LINKS, tag: "Free", color: "green" },
  { heading: "Current Affairs", links: NEWS_LINKS, tag: "News", color: "rose" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-bg-border bg-bg-surface/90 backdrop-blur pb-bottom-nav lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">

        {/* bg image — pointer-events-none so it never blocks clicks */}
        <div className="absolute inset-0 -z-5 opacity-10 pointer-events-none">
          <img
            src="/assets/mt1.png"
            alt="Footer Background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* ── Brand row ── */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-bold text-[25px] uppercase tracking-[0.15em] text-accent-gold">
              UPSC Mentor
            </p>
            <p className="mt-1.5 max-w-md text-md leading-relaxed text-text-secondary">
              Independent CSE prep workspace — official paper handoffs, clean
              progress tracking, and answer-writing support.
            </p>
          </div>
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map(({ heading, links, tag, color }) => (
            <div key={heading}>
              <SectionHeading>{heading}</SectionHeading>
              <div className="flex flex-col">
                {links.map((link) => (
                  <LinkItem
                    key={link.url}
                    href={link.url}
                    label={link.label}
                    tag={tag}
                    tagColor={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-bg-border pt-5">
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_UPSC_REFERENCE_LINKS.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-full border border-bg-border bg-bg-muted px-3 py-1.5 text-sm font-semibold text-text-secondary transition hover:border-accent-gold/30 hover:text-text-primary"
              >
                <span className="pointer-events-none">{item.label}</span>
                <ArrowUpRight
                  size={11}
                  className="opacity-30 transition group-hover:opacity-70 pointer-events-none"
                />
              </a>
            ))}
          </div>
        </div>

        {/* ── Copyright bar ── */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-bg-border pt-4">
          <p className="text-sm font-mono text-text-muted">
            © {new Date().getFullYear()} UPSC Mentor. All rights reserved.
          </p>
          <p className="text-sm font-mono text-text-muted flex items-center gap-1.5">
            Developed with{" "}
            <Heart className="w-4 h-4 inline text-red-500" />
            {" "}by{" "}
            <span className="text-accent-gold font-bold text-sm tracking-wide">Anand Vivek</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
