import { useEffect, useId, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";

/** Language control shared by the home and report headers. */
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Switch language, currently English"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="home-icon-solid flex h-12 w-12 items-center justify-center rounded-full text-[#4a3f30] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
      >
        <Globe size={19} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Language settings"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-[20px] border border-white/85 bg-[#fffaf0]/95 p-4 text-[#3b3226] shadow-[0_16px_40px_-14px_rgba(88,59,20,0.27)] backdrop-blur-xl"
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#8d6a2a]">
            Language
          </p>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f7ecd4] px-3 py-2.5 text-[14px] font-medium">
            English
            <Check size={17} strokeWidth={2} aria-hidden="true" />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[#6f6149]">
            More languages coming soon.
          </p>
        </div>
      )}
    </div>
  );
}