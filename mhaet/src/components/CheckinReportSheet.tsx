import { AlertTriangle, X } from "lucide-react";

/** A single answered (or skipped) check-in question, as captured by voice. */
export type CheckinEntry = {
  question: string;
  answer: string | null;
  severity: number | null;
  skipped: boolean;
};

export type CheckinDangerSign = {
  name: string;
  detail: string;
  severity: "High" | "Critical";
};

export function severityLabel(value: number) {
  if (value <= 33) return "Mild";
  if (value <= 66) return "Moderate";
  return "Severe";
}

/**
 * Bottom sheet listing a check-in's Q&A.
 * Shared by the voice check-in "View report" action and the daily logs page,
 * so both show the same content in the same style.
 */
export function CheckinReportSheet({
  open,
  onClose,
  eyebrow,
  title,
  entries,
  emptyMessage = "No questions answered yet.",
  dangerSigns = [],
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  entries: CheckinEntry[];
  emptyMessage?: string;
  dangerSigns?: CheckinDangerSign[];
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b3226]/15 px-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-report-title"
      onClick={onClose}
    >
      <div
        className="report-sheet max-h-[82dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[30px] border border-white/80 bg-[#fbf6ec]/95 p-6 pb-8 shadow-[0_-18px_50px_-25px_rgba(85,55,18,0.5)] backdrop-blur-xl sm:rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8d6a2a]">
              {eyebrow}
            </p>
            <h2
              id="checkin-report-title"
              className="mt-1 text-[25px] font-bold tracking-[-0.02em] text-[#3b3226]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report"
            className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] active:scale-95"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {dangerSigns.length > 0 && (
            <section
              aria-label="Danger signs recorded"
              className="overflow-hidden rounded-[20px] border border-[#e8a18f] bg-[linear-gradient(155deg,rgba(250,232,224,0.96),rgba(246,224,216,0.82))] p-4"
            >
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#7d2b1c]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b74835] text-[#fff7f2]">
                  <AlertTriangle size={16} strokeWidth={2.2} aria-hidden="true" />
                </span>
                Danger sign recorded
              </div>
              <ul className="mt-3 space-y-2.5">
                {dangerSigns.map((sign) => (
                  <li key={sign.name} className="rounded-[15px] border border-white/65 bg-[#fffaf6]/80 px-3.5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#63281d]">{sign.name}</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-[#8d3d2b]">{sign.detail}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${
                        sign.severity === "Critical"
                          ? "bg-[#7d2b1c] text-[#fff7f2]"
                          : "bg-[#9c3a29]/15 text-[#7d2b1c]"
                      }`}>
                        {sign.severity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12.5px] leading-relaxed text-[#7d2b1c]">
                Please contact your midwife or care team promptly to review this sign. If it is
                ongoing or worsening, seek urgent care.
              </p>
            </section>
          )}

          {entries.length === 0 ? (
            <p className="rounded-[22px] border border-[#d9c9a8]/55 bg-white/70 p-4 text-[15px] italic text-[#9b8a6f]">
              {emptyMessage}
            </p>
          ) : (
            entries.map((entry, index) => (
              <article
                key={`${entry.question}-${index}`}
                className="rounded-[22px] border border-[#d9c9a8]/55 bg-white/70 p-4"
              >
                <p className="text-[13px] font-medium text-[#85735a]">{entry.question}</p>
                {entry.skipped ? (
                  <p className="mt-2 text-[15px] italic text-[#9b8a6f]">Skipped</p>
                ) : (
                  <>
                    <p className="mt-2 text-[16px] leading-relaxed text-[#3b3226]">
                      {entry.answer}
                    </p>
                    <p className="mt-3 inline-flex rounded-full bg-[#fbe7b8] px-3 py-1 text-[12px] font-semibold text-[#6f5a35]">
                      {severityLabel(entry.severity ?? 50)} severity
                    </p>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
