import { useEffect, useState } from "react";
import { NextDotFillButton } from "./components/NextDotFillButton";
import { MethodSection } from "./sections/MethodSection";
import { Footer } from "./sections/Footer";
import { HomeDashboard } from "./home/HomeDashboard";
import { VoiceCheckin } from "./voice/VoiceCheckin";
import { AncReport } from "./report/AncReport";
import { ReportsList } from "./report/ReportsList";
import { CheckinLogs } from "./logs/CheckinLogs";
import { CalendarPage } from "./calendar/CalendarPage";
import { SettingsPage } from "./settings/SettingsPage";
import { NotificationsPage } from "./notifications/NotificationsPage";
import { AuthPage } from "./auth/AuthPage";
import { SplashPage } from "./auth/SplashPage";
import { OnboardingPage } from "./onboarding/OnboardingPage";

const navItems = ["Welcome", "Journey", "Care", "Aurelia®", "Contact"];

/** Tiny hash router for the landing page and app prototype screens. */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const route = useHashRoute();
  if (route === "#home") return <HomeDashboard />;
  if (route === "#voice") return <VoiceCheckin />;
  if (route === "#reports") return <ReportsList />;
  if (route === "#logs") return <CheckinLogs />;
  if (route === "#calendar") return <CalendarPage />;
  if (route === "#settings") return <SettingsPage />;
  if (route === "#notifications") return <NotificationsPage />;
  if (route === "#login") return <AuthPage initialMode="login" />;
  if (route === "#register") return <AuthPage initialMode="register" />;
  if (route === "#splash") return <SplashPage />;
  if (route === "#onboarding") return <OnboardingPage />;
  if (route === "#report") return <AncReport reportId="third-appointment" />;
  if (route.startsWith("#report/")) {
    return <AncReport reportId={decodeURIComponent(route.slice("#report/".length))} />;
  }
  return <Landing />;
}

function Landing() {
  const [active, setActive] = useState("Welcome");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#e9e3d8]">
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#ece7de] lg:flex-row">
        {/* Ambient golden blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-a absolute -left-24 top-[30%] h-[520px] w-[520px] rounded-full bg-[#f3d9a4] opacity-70 blur-[120px]" />
          <div className="blob-b absolute left-[25%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#fff6e3] opacity-90 blur-[100px]" />
          <div className="blob-a absolute bottom-[-120px] left-[45%] h-[380px] w-[380px] rounded-full bg-[#e8c27d] opacity-50 blur-[120px]" />
          <div className="absolute -left-10 -top-10 h-[300px] w-[300px] rounded-full bg-white opacity-80 blur-[90px]" />
        </div>

        {/* LEFT — glass panel */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-7 sm:px-10 sm:py-10 lg:px-14 lg:py-12 backdrop-blur-xl bg-white/10">
          {/* Header */}
          <header className="flex items-start justify-between">
            <nav className="hidden sm:block">
              <ul className="space-y-0.5 text-[15px] leading-snug">
                {navItems.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setActive(item)}
                      className={`transition-colors duration-300 ${
                        active === item ? "text-[#4a3f30] font-medium" : "text-[#a99d89] hover:text-[#7a6a50]"
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              className="sm:hidden text-sm text-[#4a3f30]"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>

            <a href="#" className="text-[17px] font-medium tracking-tight text-[#4a3f30]">
              aurelia<sup className="text-[9px] ml-0.5">®</sup>
            </a>

            <a
              href="#home"
              className="rounded-full bg-white/90 px-5 py-2.5 text-[13px] font-medium text-[#3d3326] shadow-[0_8px_30px_-10px_rgba(180,140,70,0.45)] backdrop-blur transition hover:bg-white hover:shadow-[0_12px_40px_-10px_rgba(180,140,70,0.6)]"
            >
              Join the waitlist
            </a>
          </header>

          {menuOpen && (
            <ul className="sm:hidden mt-4 space-y-1 rounded-2xl bg-white/50 p-4 backdrop-blur-lg">
              {navItems.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => { setActive(item); setMenuOpen(false); }}
                    className={active === item ? "text-[#4a3f30] font-medium" : "text-[#a99d89]"}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Headline */}
          <div className="my-14 lg:my-0">
            <h1 className="font-medium tracking-[-0.04em] leading-[0.82] text-[18vw] sm:text-[13vw] lg:text-[8.2vw] 2xl:text-[132px]">
              <span className="rise block text-[#4a3f30]" style={{ animationDelay: "0.1s" }}>
                We’re
              </span>
              <span className="rise block text-[#c9b489]" style={{ animationDelay: "0.25s" }}>
                growing
              </span>
              <span className="rise relative inline-block" style={{ animationDelay: "0.4s" }}>
                <span className="gold-shimmer drop-shadow-[0_2px_20px_rgba(201,160,90,0.35)]">
                  toge<sup className="text-[0.35em] align-[1.4em]">®</sup>ther
                </span>
                <span className="absolute -bottom-2 left-0 h-[5px] w-[62%] rounded-full bg-white/95" />
              </span>
            </h1>
          </div>

          {/* Footer row */}
          <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between">
            {/* "Begin your journey" button */}
            <div className="flex items-center">
              <NextDotFillButton
                label="Begin your journey"
                onClick={() => {
                  window.location.hash = "#login";
                }}
              />
            </div>

            <p className="max-w-[440px] text-[13.5px] leading-relaxed text-[#ad9f86] sm:text-right">
              Aurelia is a{" "}
              <a href="#" className="text-[#4a3f30] underline underline-offset-2 decoration-[#c9a35d]">
                gentle maternal health companion
              </a>{" "}
              guiding you through pregnancy, birth and early motherhood with{" "}
              <span className="text-[#4a3f30]">care that grows with you.</span>
            </p>
          </div>
        </div>

        {/* RIGHT — image card */}
        <div className="relative z-10 h-[70vh] shrink-0 overflow-hidden rounded-l-[2rem] lg:h-auto lg:w-[36%]">
          <img
            src="/images/hero-gold.jpg"
            alt="Soft golden light flowing through silk"
            className="slow-zoom absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#b98a3e]/30 via-transparent to-white/10" />

          {/* Vertical brand word */}
          <div className="pointer-events-none absolute right-[-0.08em] top-0 flex h-full items-center">
            <span
              className="select-none whitespace-nowrap font-medium leading-none tracking-[-0.04em] text-white/90 text-[22vh] lg:text-[23vh]"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              aurelia<sup className="text-[0.3em]">®</sup>
            </span>
          </div>

          <p className="absolute bottom-8 left-8 text-3xl font-medium text-white drop-shadow">/ 2026</p>
        </div>
      </section>

      {/* SECTION 02 — The Aurelia Method (orbs on the left, words on the right) */}
      <MethodSection />

      {/* FOOTER */}
      <Footer />

      {/* Gentle Journey Modal (triggered on click) */}
      {showJourneyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20 animate-fade-in"
          onClick={() => setShowJourneyModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-[#f8f5ee]/95 p-7 sm:p-9 shadow-[0_20px_60px_rgba(140,105,45,0.3)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowJourneyModal(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#4a3f30] hover:bg-black/10 transition"
              aria-label="Close"
            >
              ✕
            </button>

            <span className="inline-block rounded-full bg-[#faedd2] px-3 py-1 text-[11px] font-medium tracking-widest uppercase text-[#966b24]">
              Aurelia Maternal Care
            </span>

            <h3 className="mt-3 text-2xl sm:text-3xl font-medium tracking-tight text-[#3b3226]">
              Your journey begins with soft, continuous care.
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-[#7e715d]">
              From fertility & early first-trimester reassurance to birth preparation and the tender fourth trimester, Aurelia connects you with holistic midwife advice, daily milestone affirmations, and body awareness tools.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2.5">
              {[
                { phase: "Trimester 1", detail: "Nourish & adapt" },
                { phase: "Trimester 2", detail: "Movement & joy" },
                { phase: "Trimester 3", detail: "Birth & calm" },
              ].map((t) => (
                <div
                  key={t.phase}
                  className="rounded-2xl border border-[#ebd8b7] bg-white/70 p-3 text-left"
                >
                  <p className="text-xs font-semibold text-[#8b6528]">{t.phase}</p>
                  <p className="mt-0.5 text-[11px] text-[#716453]">{t.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border border-[#ddcaa7] bg-white px-4 py-2.5 text-sm text-[#4a3f30] placeholder-[#b2a28d] outline-none focus:border-[#a88241]"
              />
              <button
                type="button"
                onClick={() => setShowJourneyModal(false)}
                className="rounded-full bg-[#4a3f30] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#342b20] transition shadow-md"
              >
                Get early access
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
