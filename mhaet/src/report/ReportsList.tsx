import { AlertTriangle, ArrowUpRight, FileText } from "lucide-react";
import type { CSSProperties } from "react";
import { BottomNav, HomeTopBar } from "../home/HomeDashboard";
import { REPORT_ARCHIVE } from "./reportCatalog";

export function ReportsList() {
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
            Appointment history
          </p>
          <h1 className="mt-2 text-[34px] font-light leading-none tracking-[-0.035em] text-[#3b3226]">
            ANC reports
          </h1>
          <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-[#6f6149]">
            Monthly check-in summaries prepared for each antenatal appointment.
          </p>
        </section>

        <section aria-label="All ANC reports" className="mt-6 grid gap-3 md:grid-cols-2">
          {REPORT_ARCHIVE.map((report, index) => {
            const hasDanger = Boolean(report.dangerSigns?.length);
            const dangerCount = report.dangerSigns?.length ?? 0;

            return (
              <button
                key={report.id}
                type="button"
                data-dashboard-card
                onClick={() => {
                  window.location.hash = `#report/${report.id}`;
                }}
                className={`report-list-card group relative overflow-hidden rounded-[26px] border p-5 text-left shadow-[0_14px_34px_-23px_rgba(112,78,28,0.48)] backdrop-blur-xl transition hover:-translate-y-0.5 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                  hasDanger
                    ? "border-[#c65a45]/60 bg-[linear-gradient(145deg,rgba(247,224,216,0.92),rgba(198,90,69,0.3))] hover:border-[#c65a45]/90 focus-visible:outline-[#9c3a29] md:col-span-2"
                    : index === 0
                      ? "border-white/80 bg-[linear-gradient(145deg,rgba(251,231,184,0.78),rgba(229,190,125,0.48))] hover:border-[#c9a35d]/65 focus-visible:outline-[#8d6a2a] md:col-span-2"
                      : "border-white/75 bg-white/70 hover:border-[#c9a35d]/65 focus-visible:outline-[#8d6a2a]"
                }`}
                style={{ "--report-item-delay": `${90 + index * 80}ms` } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-2xl ${
                    hasDanger ? "bg-[#e08a72]/50" : "bg-white/40"
                  }`}
                />
                <span className="relative flex items-start justify-between gap-5">
                  <span className="min-w-0">
                    {hasDanger ? (
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9c3a29]">
                        <AlertTriangle size={14} strokeWidth={2.2} aria-hidden="true" />
                        Danger signs — review
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8d6a2a]">
                        <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
                        {report.status === "ready" ? "Ready to review" : "Reviewed"}
                      </span>
                    )}
                    <span className="mt-4 block text-[22px] font-medium tracking-[-0.025em] text-[#3b3226]">
                      {report.appointment}
                    </span>
                    <span className="mt-1 block text-[13px] text-[#85735a]">{report.range}</span>
                  </span>
                  <span
                    className={`home-icon-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                      hasDanger ? "text-[#9c3a29]" : "text-[#4a3f30]"
                    }`}
                  >
                    <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>

                <span
                  className={`relative mt-5 grid gap-3 border-t pt-4 ${
                    hasDanger ? "grid-cols-3 border-[#9c3a29]/20" : "grid-cols-2 border-[#b98a3e]/18"
                  }`}
                >
                  <span>
                    <span className="block text-[26px] font-light tabular-nums text-[#3b3226]">
                      {report.checkinRate}%
                    </span>
                    <span className="mt-1 block text-[11.5px] text-[#6f6149]">check-ins completed</span>
                  </span>
                  <span>
                    <span className="block text-[26px] font-light tabular-nums text-[#3b3226]">
                      {report.daysMissed}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-[#6f6149]">days missed</span>
                  </span>
                  {hasDanger && (
                    <span>
                      <span className="block text-[26px] font-light tabular-nums text-[#9c3a29]">
                        {dangerCount}
                      </span>
                      <span className="mt-1 block text-[11.5px] text-[#9c3a29]">danger signs</span>
                    </span>
                  )}
                </span>

                <span className="relative mt-4 block text-[13px] leading-relaxed text-[#6f6149]">
                  {report.summary}
                </span>
              </button>
            );
          })}
        </section>
      </main>

      <BottomNav current="report" />
    </div>
  );
}