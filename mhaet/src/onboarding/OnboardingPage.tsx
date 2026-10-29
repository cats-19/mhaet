import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Baby,
  CalendarDays,
  Check,
  ChevronLeft,
  Heart,
  Info,
  MapPin,
  Mic,
  Minus,
  Plus,
  Ruler,
  X,
} from "lucide-react";
import {
  COMPLICATION_OPTIONS,
  CONDITION_OPTIONS,
  daysInEthiopianMonth,
  daysInGregorianMonth,
  ETHIOPIAN_MONTHS,
  formatEthiopian,
  formatGregorian,
  GREGORIAN_MONTHS,
  SUPPLEMENT_CHOICE_OPTIONS,
  gestationFromKnown,
  gestationFromLmp,
  loadOnboarding,
  lmpToGregorian,
  saveOnboarding,
  type CalendarSystem,
  type DatingMode,
  type OnboardingData,
  type Residence,
} from "./onboardingStore";

type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Screen = "welcome" | Stage | "complete";

const RESIDENCE_PILL_OPTIONS: { value: Residence; label: string }[] = [
  { value: "Rural", label: "Rural" },
  { value: "Urban", label: "Urban" },
];

const TOTAL_STEPS: Stage = 7;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function NumberStepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="block text-[15px] font-medium text-[#3b3226]">
            {label}
          </label>
          {hint && <p className="mt-0.5 text-[12.5px] text-[#85735a]">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= min}
            aria-label={`Decrease ${label.toLowerCase()}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c6a4] bg-white/85 text-[#6f5a35] transition enabled:hover:bg-[#fbe7b8] disabled:opacity-40"
          >
            <Minus size={16} strokeWidth={2.2} />
          </button>
          <span className="min-w-[1.75rem] text-center text-[22px] font-medium tabular-nums text-[#3b3226]">
            {value}
          </span>
          <input id={id} type="hidden" value={value} />
          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            aria-label={`Increase ${label.toLowerCase()}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c6a4] bg-white/85 text-[#6f5a35] transition enabled:hover:bg-[#fbe7b8] disabled:opacity-40"
          >
            <Plus size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentedSwitch<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const activeIndex = options.findIndex((option) => option.value === value);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  return (
    <div
      role="group"
      aria-label={label}
      className="relative flex rounded-full border border-[#d8c6a4]/80 bg-[#e7dcc7]/60 p-1 backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#4a3f30] shadow-sm transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(safeIndex * 100) / options.length}% + 2px)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 min-h-11 flex-1 rounded-full px-3 text-[13.5px] font-medium transition-colors duration-200 ${
            value === option.value ? "text-[#fffaf0]" : "text-[#6f6149] hover:text-[#3b3226]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* Yes / No question rendered as two option buttons. */
function YesNoQuestion({
  id,
  question,
  value,
  onChange,
  error,
  hideLabel = false,
}: {
  id: string;
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  error?: string;
  hideLabel?: boolean;
}) {
  return (
    <div>
      <p id={id} className={hideLabel ? "sr-only" : "text-[15px] font-medium text-[#3b3226]"}>
        {question}
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5" role="group" aria-labelledby={id}>
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-[14.5px] font-medium transition-all duration-200 ${
                active
                  ? "border-[#4a3f30] bg-[#4a3f30] text-[#fffaf0] shadow-[0_8px_20px_-10px_rgba(60,45,25,0.6)]"
                  : "border-[#d8c6a4] bg-white/80 text-[#6f6149] hover:border-[#c9a35d] hover:bg-white"
              }`}
            >
              {active && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29]">
          {error}
        </p>
      )}
    </div>
  );
}

/* One selectable row in a multi-select choice list. */
function ChoiceRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-[#c9a35d] bg-[#fbe7b8]/70 shadow-[0_6px_16px_-10px_rgba(160,120,50,0.5)]"
          : "border-[#d8c6a4] bg-white/70 hover:border-[#c9a35d]/70 hover:bg-white"
      }`}
    >
      <span className="text-[14px] font-medium text-[#3b3226]">{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          selected ? "border-[#4a3f30] bg-[#4a3f30] text-[#fbe7b8]" : "border-[#c9b489]"
        }`}
      >
        {selected && <Check size={13} strokeWidth={3} />}
      </span>
    </button>
  );
}

/* Text input with an inline Add button (custom conditions, medications). */
function AddField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onAdd,
  addLabel = "Add",
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  addLabel?: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onAdd();
      }}
    >
      <label htmlFor={id} className="block text-[13px] font-medium text-[#4a3f30]">
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={60}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[#d8c6a4] bg-white/85 px-4 py-3 text-[14.5px] text-[#3b3226] outline-none transition-colors placeholder:text-[#a99b84] focus:border-[#a87a3d] focus:bg-white"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-full bg-[#4a3f30] px-5 text-[14px] font-medium text-[#fffaf0] transition enabled:hover:bg-[#655039] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
          {addLabel}
        </button>
      </div>
    </form>
  );
}

function DateSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[12px] font-medium text-[#6f6149]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`mt-1.5 min-h-12 w-full appearance-none rounded-2xl border bg-white/90 px-3 py-2.5 text-[14px] text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] ${
          error ? "border-[#9c3a29]/70" : "border-[#d8c6a4]"
        } ${value ? "" : "text-[#a99b84]"}`}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mic permission stage                                                 */
/* ------------------------------------------------------------------ */

/** Concentric gold ripples expanding from a mic badge. */
function MicRings() {
  return (
    <div className="relative flex h-[260px] w-[260px] items-center justify-center">
      {[0, 1, 2].map((ring) => (
        <span
          key={ring}
          aria-hidden="true"
          className="absolute rounded-full border border-[#c9a35d]/45"
          style={{
            inset: `${ring * 34}px`,
            animation: `mic-ring ${3 + ring}s cubic-bezier(0.25, 0.9, 0.3, 1) ${ring * 0.7}s infinite`,
          }}
        />
      ))}
      <span
        aria-hidden="true"
        className="absolute inset-[46px] rounded-full bg-[#fbe7b8] blur-3xl opacity-70"
      />
      <span className="relative flex h-[128px] w-[128px] items-center justify-center rounded-full bg-gradient-to-br from-[#3b3226] to-[#4a3f30] text-[#fbe7b8] shadow-[0_22px_50px_-18px_rgba(60,45,25,0.75)]">
        <Mic size={44} strokeWidth={1.8} aria-hidden="true" />
      </span>
    </div>
  );
}

/** Live gold waveform that runs while the permission is being granted. */
function MicWaveform() {
  const heights = [28, 52, 80, 42, 66, 34, 90, 48, 24];
  return (
    <div className="flex h-16 items-center justify-center gap-1.5" aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={index}
          className="w-1.5 rounded-full bg-gradient-to-b from-[#e9bd78] to-[#b98a3e] mic-wave-bar"
          style={{
            height,
            animationDelay: `${index * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Calm completion state, shown once onboarding finishes. */
function OnboardingComplete({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="rise flex flex-col items-center justify-center text-center" role="status">
      <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#3b3226] to-[#4a3f30] text-[#fbe7b8] shadow-[0_24px_55px_-18px_rgba(60,45,25,0.75)]">
        <Check size={46} strokeWidth={2.2} aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[#d9ab5e]/30"
        />
      </span>
      <h2 className="mt-7 text-[28px] font-light leading-[1.2] tracking-[-0.03em] text-[#3b3226]">
        Your care is set up
      </h2>
      <p className="mt-3 max-w-[30ch] text-[14.5px] leading-relaxed text-[#6f6149]">
        Aurelia is ready to follow your journey, day by day.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding());
  const [screen, setScreen] = useState<Screen>(() => (loadOnboarding().completed ? 1 : "welcome"));
  const [stage, setStage] = useState<Stage>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [leaving, setLeaving] = useState(false);
  const [otherConditionDraft, setOtherConditionDraft] = useState("");
  const [showOtherField, setShowOtherField] = useState(false);
  const [medDraft, setMedDraft] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveOnboarding(data);
  }, [data]);

  const update = (patch: Partial<OnboardingData>) => {
    setData((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const scrollTop = () => {
    const scroller = contentRef.current?.closest<HTMLElement>("[data-onboarding-scroll]");
    scroller?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goStage = (next: Stage) => {
    setLeaving(true);
    window.setTimeout(() => {
      setStage(next);
      setLeaving(false);
      scrollTop();
    }, 220);
  };

  /* ----------------------------- Dating maths ----------------------------- */

  const months = data.calendar === "ethiopian" ? ETHIOPIAN_MONTHS : GREGORIAN_MONTHS;
  const yearFrom = data.calendar === "ethiopian" ? 2008 : 2020;
  const yearTo = data.calendar === "ethiopian" ? 2028 : 2035;
  const years = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearTo - i);

  const monthOptions = months.map((month, index) => ({
    value: String(index + 1),
    label: `${month}`,
  }));

  const lmpMaxDay = useMemo(() => {
    const year = Number(data.lmpYear);
    const month = Number(data.lmpMonth);
    if (!year || !month) return 31;
    return data.calendar === "ethiopian"
      ? daysInEthiopianMonth(year, month)
      : daysInGregorianMonth(year, month);
  }, [data.calendar, data.lmpYear, data.lmpMonth]);

  const dayOptions = Array.from({ length: lmpMaxDay }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const lmpDate = useMemo(() => {
    const day = Number(data.lmpDay);
    const month = Number(data.lmpMonth);
    const year = Number(data.lmpYear);
    if (!day || !month || !year) return null;
    if (day > (data.calendar === "ethiopian" ? daysInEthiopianMonth(year, month) : daysInGregorianMonth(year, month))) return null;
    return lmpToGregorian(data.calendar, day, month, year);
  }, [data.calendar, data.lmpDay, data.lmpMonth, data.lmpYear]);

  const knownWeeks = Number(data.knownWeeks || 0);
  const knownDays = Number(data.knownDays || 0);

  const dating = useMemo(() => {
    if (data.dating === "known") return gestationFromKnown(knownWeeks, knownDays);
    if (!lmpDate) return null;
    return gestationFromLmp(lmpDate);
  }, [data.dating, lmpDate, knownWeeks, knownDays]);

  /* ----------------------------- Validation ----------------------------- */

  const validateStage1 = () => {
    const next: Record<string, string> = {};
    const age = Number(data.age);
    if (!data.age) next.age = "Please add your age.";
    else if (!Number.isFinite(age) || age < 12 || age > 65) next.age = "Enter an age between 12 and 65.";
    if (!data.residence) next.residence = "Choose where you live.";
    if (data.liveBirths > data.totalPregnancies) {
      next.births = "Live births can't be more than total pregnancies.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage2 = () => {
    const next: Record<string, string> = {};
    if (data.dating === "lmp") {
      if (!data.lmpDay) next.lmp = "Add the day.";
      else if (!data.lmpMonth) next.lmp = "Add the month.";
      else if (!data.lmpYear) next.lmp = "Add the year.";
      else if (!lmpDate) next.lmp = "That date doesn't exist — please check it.";
      else if (!dating) next.lmp = "Please check the date.";
      else if (dating.days < 0) next.lmp = "The first day of your last period can't be in the future.";
      else if (dating.days > 320) next.lmp = "That date is more than 45 weeks ago. Check it, or use “I know the date”.";
    } else {
      if (data.knownWeeks === "") next.known = "Add how many weeks you've been pregnant.";
      else if (knownWeeks > 42) next.known = "Weeks should be between 0 and 42.";
      else if (knownDays > 6) next.known = "Days should be between 0 and 6.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage3 = () => {
    const next: Record<string, string> = {};
    if (data.hadCesarean === null) next.cesarean = "Please answer yes or no.";
    if (data.hadStillbirth === null) next.stillbirth = "Please answer yes or no.";
    if (data.malariaArea === null) next.malaria = "Please answer yes or no.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStage4 = () => {
    // Conditions are optional — many people have none.
    setErrors({});
    return true;
  };

  const validateStage5 = () => {
    const next: Record<string, string> = {};
    if (data.takesMedications === null) next.meds = "Please answer yes or no.";
    else if (data.takesMedications && data.medications.length === 0)
      next.meds = "Add at least one medication, or choose No.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // The permission stage has no required fields — either action finishes.
  const validateStage7 = () => {
    setErrors({});
    return true;
  };

  const validateStage6 = () => {
    const next: Record<string, string> = {};
    if (data.takesSupplements === null) next.supp = "Please answer yes or no.";
    else if (data.takesSupplements && data.supplementChoices.length === 0)
      next.supp = "Select at least one supplement, or choose No.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toggleListItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];

  /** Try the voice check-in: request the mic, then run the prototype flow. */
  const tryVoiceCheckin = () => {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((track) => track.stop()))
        .catch(() => {
          // The prototype continues either way; a real build would show guidance.
        });
    }
    finishOnboarding();
  };

  /** Grant or decline, onboarding is complete either way. */
  const finishOnboarding = () => {
    const finished = { ...data, completed: true };
    setData(finished);
    saveOnboarding(finished);
    setScreen("complete");
  };

  const handleContinue = () => {
    const validators = [
      validateStage1,
      validateStage2,
      validateStage3,
      validateStage4,
      validateStage5,
      validateStage6,
      validateStage7,
    ];
    if (!validators[stage - 1]()) return;
    if (stage === TOTAL_STEPS) {
      // The final stage is the mic permission, which has its own actions.
      return;
    }
    goStage((stage + 1) as Stage);
  };

  const goBack = () => {
    if (stage > 1) {
      goStage((stage - 1) as Stage);
      return;
    }
    setScreen("welcome");
  };

  const startOnboarding = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setScreen(1);
      setStage(1);
      setLeaving(false);
      scrollTop();
    }, 260);
  };

  const dueText = dating ? formatGregorian(dating.dueDate) : null;
  const dueEthiopian = dating ? formatEthiopian(dating.dueDate) : null;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f3ecdf] text-[#4a3f30]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-95 blur-[90px]" />
        <div className="absolute -right-24 top-[26%] h-[340px] w-[340px] rounded-full bg-[#f3d9a4] opacity-45 blur-[110px]" />
        <div className="absolute -left-20 bottom-[-10%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-55 blur-[100px]" />
      </div>

      <div
        data-onboarding-scroll
        className="relative mx-auto flex w-full max-w-[440px] min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6"
      >
        <header className="flex items-center justify-between gap-3 pt-[max(16px,env(safe-area-inset-top))]">
          {screen === "welcome" ? (
            <a
              href="#login"
              aria-label="Back to sign in"
              className="home-icon-solid flex h-11 w-11 items-center justify-center rounded-full text-[#4a3f30] transition hover:border-[#c9a35d]/70 active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </a>
          ) : (
            <button
              type="button"
              onClick={goBack}
              aria-label="Back a step"
              className="home-icon-solid flex h-11 w-11 items-center justify-center rounded-full text-[#4a3f30] transition hover:border-[#c9a35d]/70 active:scale-95"
            >
              <ChevronLeft size={19} strokeWidth={1.9} />
            </button>
          )}

          {/* Center logo or step pills */}
          {screen === "welcome" ? (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b3226] text-[#fbe7b8]">
                <Heart size={14} fill="currentColor" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-[16px] font-medium tracking-tight text-[#4a3f30]">aurelia</span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2"
              aria-label={`Step ${stage} of ${TOTAL_STEPS}`}
              role="status"
            >
              {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((stepNumber) => {
                const isActive = stage === stepNumber;
                const isPassed = stage > stepNumber;
                return (
                  <span
                    key={stepNumber}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? "w-8 bg-[#3b3226]"
                        : isPassed
                          ? "w-5 bg-[#c9a35d]"
                          : "w-1.5 bg-[#d9c9a8]"
                    }`}
                  />
                );
              })}
            </div>
          )}

          <span aria-hidden="true" className="h-11 w-11 shrink-0" />
        </header>

        <div ref={contentRef} className="flex-1 pt-6">
          {/* ------------------------------ Welcome ------------------------------ */}
          {screen === "welcome" && (
            <div className={`transition-all duration-300 ${leaving ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}>
              <h1 className="text-[34px] font-light leading-[1.12] tracking-[-0.035em] text-[#3b3226]">
                Let&apos;s set up
                <br />
                your care.
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6149]">
                A short, gentle set-up so Aurelia can follow your pregnancy accurately and prepare
                the right care at the right time.
              </p>

              {/* Items directly on the background without cards or circle badge wrappers */}
              <ol className="mt-8 space-y-5">
                {[
                  { icon: <Heart size={20} strokeWidth={1.8} />, title: "A little about you", body: "Your age, where you live and your pregnancy history." },
                  { icon: <CalendarDays size={20} strokeWidth={1.8} />, title: "Your dates", body: "Work out how far along you are, in either calendar." },
                  { icon: <Baby size={20} strokeWidth={1.8} />, title: "Your care plan", body: "Reminders, check-ins and reports shaped around you." },
                ].map((item, index) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 text-[#8d6a2a]" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15.5px] font-medium text-[#3b3226]">
                        {index + 1}. {item.title}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[#6f6149]">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-7 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#7b6642]">
                <Info size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#8d6a2a]" aria-hidden="true" />
                About 3 minutes. You can change any answer later in settings, and your details stay
                private to your care team.
              </p>
            </div>
          )}

          {/* ------------------------------ Stages ------------------------------ */}
          {screen !== "welcome" && (
            <div className={`transition-all duration-300 ${leaving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}>
              {stage === 1 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    A few basics first
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    These shape the guidance and appointment schedule you&apos;ll see.
                  </p>

                  <div className="mt-7 space-y-5">
                    {/* Age — plain on background */}
                    <div>
                      <label htmlFor="age" className="block text-[14.5px] font-medium text-[#3b3226]">
                        Age
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="age"
                          type="number"
                          inputMode="numeric"
                          min={12}
                          max={65}
                          value={data.age}
                          onChange={(event) => update({ age: event.target.value })}
                          placeholder="e.g. 28"
                          aria-invalid={Boolean(errors.age)}
                          className={`min-h-12 w-full rounded-2xl border bg-white/85 px-4 py-3 text-[15px] text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white ${
                            errors.age ? "border-[#9c3a29]/70" : "border-[#d8c6a4]"
                          }`}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#9b8a6f]">
                          years
                        </span>
                      </div>
                      {errors.age && <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29]">{errors.age}</p>}
                    </div>

                    {/* Residence area — sliding pill */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1.5 text-[14.5px] font-medium text-[#3b3226]">
                          <MapPin size={15} strokeWidth={1.9} className="text-[#8d6a2a]" aria-hidden="true" />
                          Residence area
                        </label>
                        {data.residence && (
                          <span className="text-[12px] text-[#8d6a2a]">
                            {data.residence}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <SegmentedSwitch<Residence>
                          label="Residence area"
                          value={(data.residence as Residence) || "Urban"}
                          onChange={(value) => update({ residence: value })}
                          options={RESIDENCE_PILL_OPTIONS}
                        />
                      </div>
                      {errors.residence && <p role="alert" className="mt-1.5 text-[12px] text-[#9c3a29]">{errors.residence}</p>}
                    </div>

                    {/* Total pregnancies & Live births — no card, no number circles */}
                    <div className="divide-y divide-[#d8c6a4]/50 pt-1">
                      <NumberStepper
                        id="total-pregnancies"
                        label="Total pregnancies"
                        hint="Including this one"
                        value={data.totalPregnancies}
                        min={0}
                        max={20}
                        onChange={(value) => update({ totalPregnancies: value })}
                      />

                      <NumberStepper
                        id="live-births"
                        label="Live births"
                        hint="How many children you've had"
                        value={data.liveBirths}
                        min={0}
                        max={20}
                        onChange={(value) => update({ liveBirths: value })}
                      />
                    </div>
                    {errors.births && <p role="alert" className="text-[12px] text-[#9c3a29]">{errors.births}</p>}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 2 ------------------------------ */}
              {stage === 2 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    How far along are you?
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    We use this to date your pregnancy and plan your appointments.
                  </p>

                  <div className="mt-6">
                    <SegmentedSwitch<DatingMode>
                      label="Pregnancy dating method"
                      value={data.dating}
                      onChange={(value) => update({ dating: value })}
                      options={[
                        { value: "lmp", label: "LMP" },
                        { value: "known", label: "I know the date" },
                      ]}
                    />
                  </div>

                  {data.dating === "lmp" && (
                    <div className="mt-6 space-y-5">
                      {/* Calendar system switch */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[13.5px] font-medium text-[#4a3f30]">
                          <Ruler size={15} strokeWidth={1.9} className="text-[#8d6a2a]" aria-hidden="true" />
                          Calendar system
                        </div>
                        <div className="flex rounded-full border border-[#d8c6a4] bg-white/85 p-0.5">
                          {(["gregorian", "ethiopian"] as CalendarSystem[]).map((calendar) => (
                            <button
                              key={calendar}
                              type="button"
                              aria-pressed={data.calendar === calendar}
                              onClick={() => {
                                if (calendar === data.calendar) return;
                                update({ calendar, lmpDay: "", lmpMonth: "", lmpYear: "" });
                              }}
                              className={`min-h-9 rounded-full px-3 text-[12px] font-medium capitalize transition-colors ${
                                data.calendar === calendar ? "bg-[#4a3f30] text-[#fffaf0]" : "text-[#6f6149]"
                              }`}
                            >
                              {calendar === "gregorian" ? "Gregorian" : "Ethiopian"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date selects — directly on background */}
                      <div>
                        <p className="flex items-center gap-1.5 text-[14px] font-medium text-[#3b3226]">
                          <CalendarDays size={15} strokeWidth={1.9} className="text-[#8d6a2a]" aria-hidden="true" />
                          First day of your last period
                        </p>
                        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                          <DateSelect
                            id="lmp-day"
                            label="Day"
                            value={data.lmpDay}
                            onChange={(value) => update({ lmpDay: value })}
                            options={dayOptions}
                          />
                          <DateSelect
                            id="lmp-month"
                            label="Month"
                            value={data.lmpMonth}
                            onChange={(value) => update({ lmpMonth: value })}
                            options={monthOptions}
                          />
                          <DateSelect
                            id="lmp-year"
                            label="Year"
                            value={data.lmpYear}
                            onChange={(value) => update({ lmpYear: value })}
                            options={years.map((year) => ({ value: String(year), label: String(year) }))}
                          />
                        </div>
                        {errors.lmp && <p role="alert" className="mt-2 text-[12px] text-[#9c3a29]">{errors.lmp}</p>}
                      </div>

                      {dating && dating.days >= 0 && (
                        <div
                          aria-live="polite"
                          className="home-glass-gold rounded-[22px] p-4.5"
                        >
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6f5a35]">
                            Based on your dates
                          </p>
                          <p className="mt-1.5 text-[21px] font-medium leading-snug text-[#3b3226]">
                            {dating.weeks} weeks, {dating.remainingDays} {dating.remainingDays === 1 ? "day" : "days"} along
                          </p>
                          <p className="mt-1 text-[13px] text-[#6f5a35]">
                            {dating.trimester === 0 ? "Due today" : `Trimester ${dating.trimester}`}
                            {dating.trimester > 0 ? " · " : ""}
                            {Math.max(0, 280 - dating.days)} days to go
                          </p>
                          <div className="mt-3 border-t border-[#b98a3e]/25 pt-2.5">
                            <p className="text-[12px] text-[#7b6642]">
                              Estimated due date
                            </p>
                            <p className="text-[14px] font-medium text-[#3b3226]">{dueText}</p>
                            <p className="mt-0.5 text-[12px] text-[#85735a]">{dueEthiopian} (Ethiopian)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {data.dating === "known" && (
                    <div className="mt-6 space-y-5">
                      {/* Known weeks & days — directly on background */}
                      <div>
                        <p className="text-[14px] font-medium text-[#3b3226]">
                          How many weeks and days have you been pregnant?
                        </p>
                        <div className="mt-2.5 grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="known-weeks" className="block text-[12px] font-medium text-[#6f6149]">Weeks</label>
                            <input
                              id="known-weeks"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={42}
                              value={data.knownWeeks}
                              onChange={(event) => update({ knownWeeks: event.target.value })}
                              placeholder="0–42"
                              aria-invalid={Boolean(errors.known)}
                              className={`mt-1.5 min-h-12 w-full rounded-2xl border bg-white/85 px-4 py-3 text-[15px] tabular-nums text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white ${
                                errors.known ? "border-[#9c3a29]/70" : "border-[#d8c6a4]"
                              }`}
                            />
                          </div>
                          <div>
                            <label htmlFor="known-days" className="block text-[12px] font-medium text-[#6f6149]">Days</label>
                            <input
                              id="known-days"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={6}
                              value={data.knownDays}
                              onChange={(event) => update({ knownDays: event.target.value })}
                              placeholder="0–6"
                              className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#d8c6a4] bg-white/85 px-4 py-3 text-[15px] tabular-nums text-[#3b3226] outline-none transition-colors focus:border-[#a87a3d] focus:bg-white"
                            />
                          </div>
                        </div>
                        {errors.known && <p role="alert" className="mt-2 text-[12px] text-[#9c3a29]">{errors.known}</p>}
                      </div>

                      {data.knownWeeks !== "" && Number(data.knownWeeks) <= 42 && Number(data.knownDays) <= 6 && (
                        <div aria-live="polite" className="home-glass-gold rounded-[22px] p-4.5">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6f5a35]">
                            Based on what you know
                          </p>
                          <p className="mt-1.5 text-[21px] font-medium leading-snug text-[#3b3226]">
                            {knownWeeks} weeks, {knownDays} {knownDays === 1 ? "day" : "days"} along
                          </p>
                          <p className="mt-1 text-[13px] text-[#6f5a35]">
                            Trimester {dating?.trimester} · {Math.max(0, 280 - (knownWeeks * 7 + knownDays))} days to go
                          </p>
                          <div className="mt-3 border-t border-[#b98a3e]/25 pt-2.5">
                            <p className="text-[12px] text-[#7b6642]">Estimated due date</p>
                            <p className="text-[14px] font-medium text-[#3b3226]">{dueText}</p>
                            <p className="mt-0.5 text-[12px] text-[#85735a]">{dueEthiopian} (Ethiopian)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#7b6642]">
                    <Info size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[#8d6a2a]" aria-hidden="true" />
                    {data.dating === "lmp"
                      ? "Not sure of the exact day? A close estimate is fine — your midwife will confirm at your first scan."
                      : "You can change this later if your scan gives a different date."}
                  </p>
                </>
              )}

              {/* ------------------------------ Stage 3 ------------------------------ */}
              {stage === 3 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    Your pregnancy history
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    This helps us spot anything that needs closer care this time.
                  </p>

                  <div className="mt-7 space-y-6">
                    <YesNoQuestion
                      id="had-cesarean"
                      question="Have you ever had a Cesarean delivery?"
                      value={data.hadCesarean}
                      onChange={(value) => update({ hadCesarean: value })}
                      error={errors.cesarean}
                    />
                    <YesNoQuestion
                      id="had-stillbirth"
                      question="Any history of stillbirth or neonatal loss?"
                      value={data.hadStillbirth}
                      onChange={(value) => update({ hadStillbirth: value })}
                      error={errors.stillbirth}
                    />
                    <YesNoQuestion
                      id="malaria-area"
                      question="Do you live in or frequently visit a malaria-endemic area?"
                      value={data.malariaArea}
                      onChange={(value) => update({ malariaArea: value })}
                      error={errors.malaria}
                    />

                    <div className="border-t border-[#d8c6a4]/60 pt-5">
                      <p className="text-[15px] font-medium text-[#3b3226]">
                        Past Pregnancy Complications
                      </p>
                      <p className="mt-1 text-[12.5px] text-[#85735a]">
                        Select any you&apos;ve experienced — or leave blank if none.
                      </p>
                      <div className="mt-3 space-y-2">
                        {COMPLICATION_OPTIONS.map((option) => (
                          <ChoiceRow
                            key={option}
                            label={option}
                            selected={data.complications.includes(option)}
                            onToggle={() =>
                              update({ complications: toggleListItem(data.complications, option) })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 4 ------------------------------ */}
              {stage === 4 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    Known Medical Conditions
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    Select any that apply. Add anything else so your care team knows.
                  </p>

                  <div className="mt-6 space-y-2">
                    {CONDITION_OPTIONS.map((option) => (
                      <ChoiceRow
                        key={option}
                        label={option}
                        selected={data.conditions.includes(option)}
                        onToggle={() =>
                          update({ conditions: toggleListItem(data.conditions, option) })
                        }
                      />
                    ))}

                    {data.customConditions.map((condition) => (
                      <div
                        key={condition}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#c9a35d] bg-[#fbe7b8]/70 px-4 py-3"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4a3f30] bg-[#4a3f30] text-[#fbe7b8]"
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                          <span className="truncate text-[14px] font-medium text-[#3b3226]">
                            {condition}
                          </span>
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${condition}`}
                          onClick={() => {
                            update({
                              customConditions: data.customConditions.filter(
                                (entry) => entry !== condition,
                              ),
                              conditions: data.conditions.filter((entry) => entry !== condition),
                            });
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#85735a] transition-colors hover:bg-white/70 hover:text-[#9c3a29]"
                        >
                          <X size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                    ))}

                    <ChoiceRow
                      label="Other"
                      selected={showOtherField}
                      onToggle={() => setShowOtherField((current) => !current)}
                    />
                  </div>

                  {showOtherField && (
                    <div className="mt-4">
                      <AddField
                        id="other-condition"
                        label="Specify Other Medical Condition"
                        placeholder="e.g. Thyroid condition"
                        value={otherConditionDraft}
                        onChange={setOtherConditionDraft}
                        onAdd={() => {
                          const name = otherConditionDraft.trim();
                          if (!name) return;
                          if (
                            !data.customConditions.some(
                              (entry) => entry.toLowerCase() === name.toLowerCase(),
                            )
                          ) {
                            update({
                              customConditions: [...data.customConditions, name],
                              conditions: data.conditions.includes(name)
                                ? data.conditions
                                : [...data.conditions, name],
                            });
                          }
                          setOtherConditionDraft("");
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------ Stage 5 ------------------------------ */}
              {stage === 5 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    Do you take any medications?
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    Include anything prescribed, over-the-counter, or traditional.
                  </p>

                  <div className="mt-6 space-y-5">
                    <YesNoQuestion
                      id="takes-medications"
                      question="Do you take any medications?"
                      value={data.takesMedications}
                      onChange={(value) => update({ takesMedications: value })}
                      error={errors.meds}
                    />

                    {data.takesMedications === true && (
                      <div>
                        <AddField
                          id="medication-name"
                          label="Specify the medications you take"
                          placeholder="e.g. Folic acid 5mg"
                          value={medDraft}
                          onChange={setMedDraft}
                          onAdd={() => {
                            const name = medDraft.trim();
                            if (!name) return;
                            if (
                              !data.medications.some(
                                (entry) => entry.toLowerCase() === name.toLowerCase(),
                              )
                            ) {
                              update({ medications: [...data.medications, name] });
                            }
                            setMedDraft("");
                          }}
                        />

                        {data.medications.length > 0 && (
                          <ul aria-label="Added medications" className="mt-3 flex flex-wrap gap-2">
                            {data.medications.map((medication) => (
                              <li
                                key={medication}
                                className="flex items-center gap-1.5 rounded-full border border-[#c9a35d] bg-[#fbe7b8]/70 py-1.5 pl-3.5 pr-2"
                              >
                                <span className="max-w-[180px] truncate text-[13px] font-medium text-[#3b3226]">
                                  {medication}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Remove ${medication}`}
                                  onClick={() =>
                                    update({
                                      medications: data.medications.filter(
                                        (entry) => entry !== medication,
                                      ),
                                    })
                                  }
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#85735a] transition-colors hover:bg-white/70 hover:text-[#9c3a29]"
                                >
                                  <X size={13} strokeWidth={2.4} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 6 ------------------------------ */}
              {stage === 6 && (
                <>
                  <h2 className="text-[28px] font-light leading-[1.15] tracking-tight text-[#3b3226]">
                    Are you taking any supplements?
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">
                    These support you and your baby&apos;s growth.
                  </p>

                  <div className="mt-6 space-y-5">
                    <YesNoQuestion
                      id="takes-supplements"
                      question="Are you taking any supplements?"
                      value={data.takesSupplements}
                      onChange={(value) => update({ takesSupplements: value })}
                      error={errors.supp}
                      hideLabel
                    />

                    {data.takesSupplements === true && (
                      <div>
                        <p className="text-[14px] font-medium text-[#3b3226]">
                          Select your supplements
                        </p>
                        <div className="mt-2.5 space-y-2">
                          {SUPPLEMENT_CHOICE_OPTIONS.map((option) => (
                            <ChoiceRow
                              key={option}
                              label={option}
                              selected={data.supplementChoices.includes(option)}
                              onToggle={() =>
                                update({
                                  supplementChoices: toggleListItem(data.supplementChoices, option),
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ------------------------------ Stage 7 ------------------------------ */}
              {stage === 7 && screen !== "complete" && (
                <div className="flex flex-col items-center text-center">
                  <MicRings />

                  <h2 className="mt-8 text-[30px] font-light leading-[1.12] tracking-[-0.03em] text-[#3b3226]">
                    Talk in Amharic,
                    <br />
                    we listen.
                  </h2>

                  <p className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-[#6f6149]">
                    Your daily check-ins are spoken. The microphone lets Aurelia hear your
                    answers, understand them, and shape your care around them.
                  </p>

                  <div className="mt-8 w-full">
                    <MicWaveform />
                  </div>
                </div>
              )}

              {/* ---------------------------- Completed ----------------------------- */}
              {screen === "complete" && <OnboardingComplete onDone={() => { window.location.hash = "#home"; }} />}
            </div>
          )}
        </div>
      </div>

      {/* Action button without a rectangular card wrapper */}
      <div className="relative z-20 w-full shrink-0 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto w-full max-w-[440px]">
          {screen === "complete" ? null : screen === "welcome" ? (
            <button
              type="button"
              onClick={startOnboarding}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a]"
            >
              Start
              <ArrowRight size={17} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          ) : stage === TOTAL_STEPS ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={tryVoiceCheckin}
                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a]"
              >
                Try voice check-in
              </button>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="rounded-full px-4 py-2 text-[13.5px] font-medium text-[#6f6149] underline decoration-[#c9a35d]/60 underline-offset-4 transition-colors hover:text-[#3b3226]"
                >
                  Skip for now
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b3226] px-6 py-3.5 text-[15px] font-medium text-[#fbe7b8] shadow-[0_14px_30px_-16px_rgba(60,45,25,0.7)] transition-colors hover:bg-[#4a3f30] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d6a2a]"
            >
              {stage === TOTAL_STEPS ? "Finish set-up" : "Continue"}
              <ArrowRight size={17} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
