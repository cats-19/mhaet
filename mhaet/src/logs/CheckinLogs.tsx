import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Mic } from "lucide-react";
import type { CSSProperties } from "react";
import { BottomNav, HomeTopBar } from "../home/HomeDashboard";
import { CheckinReportSheet } from "../components/CheckinReportSheet";
import { CHECKIN_LOGS, answeredCount, type CheckinLog } from "./checkinLogs";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Worst severity recorded in a log, used for a subtle tint on the row. */
function worstSeverity(log: CheckinLog) {
  const values = log.entries
    .filter((entry) => !entry.skipped && entry.severity !== null)
    .map((entry) => entry.severity as number);
  return values.length ? Math.max(...values) : null;
}

export function CheckinLogs() {
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const openLog = CHECKIN_LOGS.find((log) => log.id === openLogId) ?? null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px]" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-28 blur-[105px]" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[960px] md:px-8">
        <HomeTopBar />

        <section className="mt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8d6a2a]">
            Daily history
          </p>
          <h1 className="mt-2 text-[34px] font-light leading-none tracking-[-0.035em] text-[#3b3226]">
            Check-in logs
          </h1>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-[#6f6149]">
            Every voice check-in you complete, day by day. Tap one to review what was recorded.
          </p>
        </section>

        <section aria-label="Daily check-in logs" className="mt-6 grid gap-3 md:grid-cols-2">
          {CHECKIN_LOGS.map((log, index) => {
            const answered = answeredCount(log);
            const worst = worstSeverity(log);
            const skipped = log.entries.length - answered;
            const dangerSigns = log.dangerSigns ?? [];

            return (
              <button
                key={log.id}
                type="button"
                data-dashboard-card
                onClick={() => setOpenLogId(log.id)}
                aria-label={`${formatDate(log.date)}, ${log.session} check-in${dangerSigns.length ? `, ${dangerSigns.length} danger sign${dangerSigns.length === 1 ? "" : "s"} recorded` : ""}`}
                className={`report-list-card group relative overflow-hidden rounded-[26px] border p-5 text-left shadow-[0_14px_34px_-23px_rgba(112,78,28,0.48)] backdrop-blur-xl transition hover:-translate-y-0.5 active:scale-[0.99] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  dangerSigns.length
                    ? "border-[#e8a18f] bg-[linear-gradient(145deg,rgba(250,232,224,0.94),rgba(246,224,216,0.78))] hover:border-[#c65a45] focus-visible:outline-[#8f3021]"
                    : "border-white/75 bg-white/70 hover:border-[#c9a35d]/65 focus-visible:outline-[#8d6a2a]"
                }`}
                style={{ "--report-item-delay": `${90 + index * 70}ms` } as CSSProperties}
              >
                <span aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${dangerSigns.length ? "bg-[#e08a72]/40" : "bg-white/40"}`} />
                <span className="relative flex items-start justify-between gap-5">
                  <span className="min-w-0">
                    <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${dangerSigns.length ? "text-[#8f3021]" : "text-[#8d6a2a]"}`}>
                      {dangerSigns.length ? (
                        <AlertTriangle size={15} strokeWidth={2.2} aria-hidden="true" />
                      ) : (
                        <Mic size={14} strokeWidth={1.8} aria-hidden="true" />
                      )}
                      {dangerSigns.length ? "Danger sign · Review" : `${log.session} check-in`}
                    </span>
                    <span className="mt-4 block text-[22px] font-medium tracking-[-0.025em] text-[#3b3226]">
                      {formatDate(log.date)}
                    </span>
                    <span className="mt-1 block text-[13px] text-[#85735a]">
                      {formatTime(log.date)} · {log.entries.length} questions
                    </span>
                  </span>
                  <span className="home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4a3f30] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>

                <span className={`relative mt-5 flex flex-wrap items-center gap-2.5 border-t pt-4 ${dangerSigns.length ? "border-[#c65a45]/25" : "border-[#b98a3e]/18"}`}>
                  <span className="rounded-full bg-[#fbe7b8] px-3 py-1 text-[12px] font-semibold text-[#6f5a35]">
                    {answered} answered
                  </span>
                  {skipped > 0 && (
                    <span className="rounded-full bg-[#f0e3c9] px-3 py-1 text-[12px] font-semibold text-[#85735a]">
                      {skipped} skipped
                    </span>
                  )}
                  {dangerSigns.length > 0 && (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#9c3a29] px-3 py-1 text-[12px] font-semibold text-[#fff4ee]">
                      <AlertTriangle size={13} strokeWidth={2.2} aria-hidden="true" />
                      {dangerSigns.length} critical sign{dangerSigns.length === 1 ? "" : "s"}
                    </span>
                  )}
                  {dangerSigns.length === 0 && worst !== null && worst > 66 && (
                    <span className="rounded-full bg-[#c65a45] px-3 py-1 text-[12px] font-semibold text-[#fff4ee]">High severity</span>
                  )}
                </span>
              </button>
            );
          })}
        </section>
      </main>

      <BottomNav current="checkin" />

      <CheckinReportSheet
        open={openLog !== null}
        onClose={() => setOpenLogId(null)}
        eyebrow={openLog ? `${formatDate(openLog.date)} · ${openLog.session}` : ""}
        title="Check-in report"
        entries={openLog?.entries ?? []}
        dangerSigns={openLog?.dangerSigns}
        emptyMessage="No questions were recorded for this check-in."
      />
    </div>
  );
}
