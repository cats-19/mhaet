import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  LogOut,
  Pencil,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { BottomNav } from "../home/HomeDashboard";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useProfile, type Supplement } from "./profileStore";

function formatDate(value: string) {
  if (!value) return "Not set";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "No reminder";
  const [h, m] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="home-glass rounded-[26px] p-5 sm:p-6" data-dashboard-card>
      <h2 className="text-[18px] font-medium tracking-tight text-[#3b3226]">{title}</h2>
      {description && <p className="mt-1 text-[13px] leading-relaxed text-[#6f6149]">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Name editor dialog                                                  */
/* ------------------------------------------------------------------ */

function NameEditor({
  initialName,
  onClose,
  onSave,
}: {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [draft, setDraft] = useState(initialName);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const trimmed = draft.trim();
  const changed = trimmed !== initialName && trimmed.length > 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmed) return setError("Enter your name.");
    if (!changed) {
      onClose();
      return;
    }
    onSave(trimmed);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-editor-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b3226]/20 px-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="report-sheet w-full max-w-[440px] overflow-y-auto rounded-t-[30px] border border-white/80 bg-[#fbf6ec]/95 p-6 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-25px_rgba(85,55,18,0.5)] backdrop-blur-xl sm:rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8d6a2a]">Profile</p>
            <h2 id="name-editor-title" className="mt-1 text-[24px] font-medium tracking-tight text-[#3b3226]">
              Edit name
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="home-icon-solid flex h-10 w-10 items-center justify-center rounded-full text-[#4a3f30]">
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label htmlFor="profile-name" className="block text-[13px] font-medium text-[#4a3f30]">
              Your name
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              required
              maxLength={60}
              autoFocus
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setError(""); }}
              placeholder="e.g. Amara Bennett"
              className="mt-2 w-full rounded-2xl border border-[#d8c6a4] bg-white px-4 py-3 text-[15px] text-[#3b3226] outline-none placeholder:text-[#a99b84] focus:border-[#a87a3d]"
            />
            <p className="mt-2 text-[12px] leading-relaxed text-[#85735a]">
              This is how Aurelia greets you across the app.
            </p>
          </div>

          {error && <p role="alert" className="text-[13px] text-[#9c3a29]">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-3 text-[14px] font-medium text-[#6f6149] transition hover:bg-white/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!changed}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-5 py-3 text-[14px] font-medium text-[#fffaf0] transition enabled:hover:bg-[#655039] enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              Save name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Supplement editor dialog                                            */
/* ------------------------------------------------------------------ */

function SupplementEditor({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  initial: Supplement | null;
  onClose: () => void;
  onSave: (supplement: Supplement) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [remind, setRemind] = useState(Boolean(initial ? initial.reminderTime : true));
  const [time, setTime] = useState(initial?.reminderTime || "08:00");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return setError("Give the supplement a name.");
    if (remind && !time) return setError("Choose a reminder time.");
    onSave({
      id: initial?.id || crypto.randomUUID(),
      name: name.trim(),
      reminderTime: remind ? time : "",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplement-editor-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b3226]/20 px-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="report-sheet w-full max-w-[440px] overflow-y-auto rounded-t-[30px] border border-white/80 bg-[#fbf6ec]/95 p-6 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-25px_rgba(85,55,18,0.5)] backdrop-blur-xl sm:rounded-[30px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8d6a2a]">Supplement</p>
            <h2 id="supplement-editor-title" className="mt-1 text-[24px] font-medium tracking-tight text-[#3b3226]">
              {initial ? "Edit supplement" : "Add a supplement"}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="home-icon-solid flex h-10 w-10 items-center justify-center rounded-full text-[#4a3f30]">
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label htmlFor="supp-name" className="block text-[13px] font-medium text-[#4a3f30]">Name</label>
            <input
              id="supp-name"
              type="text"
              required
              maxLength={60}
              autoFocus
              value={name}
              onChange={(event) => { setName(event.target.value); setError(""); }}
              placeholder="e.g. Vitamin D"
              className="mt-2 w-full rounded-2xl border border-[#d8c6a4] bg-white px-4 py-3 text-[15px] text-[#3b3226] outline-none placeholder:text-[#a99b84] focus:border-[#a87a3d]"
            />
          </div>

          <div className="rounded-[20px] border border-[#e8d9bd] bg-white/65 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-[#4a3f30]">
              <input
                type="checkbox"
                checked={remind}
                onChange={(event) => { setRemind(event.target.checked); setError(""); }}
                className="h-4 w-4 accent-[#b98a3e]"
              />
              <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
              Daily reminder
            </label>
            {remind && (
              <div className="mt-3">
                <label htmlFor="supp-time" className="block text-[12px] text-[#6f6149]">Reminder time</label>
                <input
                  id="supp-time"
                  type="time"
                  required
                  value={time}
                  onChange={(event) => { setTime(event.target.value); setError(""); }}
                  className="mt-2 w-full min-w-0 rounded-xl border border-[#d8c6a4] bg-white px-3 py-3 text-[14px] text-[#3b3226] outline-none focus:border-[#a87a3d]"
                />
                <p className="mt-2 text-[12px] leading-relaxed text-[#85735a]">
                  We'll remind you to take it at this time each day while Aurelia is open.
                </p>
              </div>
            )}
          </div>

          {error && <p role="alert" className="text-[13px] text-[#9c3a29]">{error}</p>}

          <div className="flex gap-3 pt-1">
            {initial && (
              <button
                type="button"
                onClick={() => (confirmDelete ? onDelete(initial.id) : setConfirmDelete(true))}
                className="flex items-center justify-center gap-1 rounded-full border border-[#e8a18f] px-4 py-3 text-[13px] font-medium text-[#9c3a29] transition hover:bg-[#f6e0d8]"
              >
                <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                {confirmDelete ? "Confirm delete" : "Delete"}
              </button>
            )}
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#4a3f30] px-5 py-3 text-[14px] font-medium text-[#fffaf0] transition hover:bg-[#655039] active:scale-[0.98]">
              <Check size={17} strokeWidth={2} aria-hidden="true" />
              {initial ? "Save changes" : "Add supplement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation dialog for destructive actions                         */
/* ------------------------------------------------------------------ */

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  tone = "danger",
  onCancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "danger" | "neutral";
  onCancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3b3226]/25 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="report-sheet w-full max-w-[380px] rounded-[26px] border border-white/80 bg-[#fbf6ec]/97 p-6 shadow-[0_18px_50px_-22px_rgba(85,55,18,0.55)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tone === "danger" ? "bg-[#9c3a29]/12 text-[#9c3a29]" : "bg-[#fbe7b8] text-[#6f5a35]"}`}>
          <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
        </div>
        <h2 id="confirm-title" className="mt-4 text-[20px] font-medium tracking-tight text-[#3b3226]">{title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6f6149]">{body}</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-full border border-[#d8c6a4] px-4 py-3 text-[14px] font-medium text-[#6f6149] transition hover:bg-white/60">
            {onCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-full px-4 py-3 text-[14px] font-medium text-[#fffaf0] transition active:scale-[0.98] ${tone === "danger" ? "bg-[#9c3a29] hover:bg-[#853123]" : "bg-[#4a3f30] hover:bg-[#655039]"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings page                                                       */
/* ------------------------------------------------------------------ */

export function SettingsPage() {
  const { profile, update, resetAll } = useProfile();
  const [editingName, setEditingName] = useState(false);
  const nameEditButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingName = useRef(false);
  const [editingAnc, setEditingAnc] = useState(false);
  const [ancDraft, setAncDraft] = useState(profile.nextAncDate);
  const [supplementEditor, setSupplementEditor] = useState<{ key: string; item: Supplement | null } | null>(null);
  const [confirm, setConfirm] = useState<null | "logout" | "delete">(null);
  const [message, setMessage] = useState("");

  useEffect(() => setAncDraft(profile.nextAncDate), [profile.nextAncDate]);
  useEffect(() => {
    if (!editingName && wasEditingName.current) {
      nameEditButtonRef.current?.focus();
    }
    wasEditingName.current = editingName;
  }, [editingName]);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3800);
    return () => window.clearTimeout(timer);
  }, [message]);

  const goBack = () => {
    window.location.hash = "#home";
  };

  const saveName = (name: string) => {
    update({ name });
    setEditingName(false);
    setMessage("Name updated");
  };

  const saveSupplement = (supplement: Supplement) => {
    const exists = profile.supplements.some((s) => s.id === supplement.id);
    update({
      supplements: exists
        ? profile.supplements.map((s) => (s.id === supplement.id ? supplement : s))
        : [...profile.supplements, supplement],
    });
    setSupplementEditor(null);
    setMessage(exists ? "Supplement updated" : "Supplement added");
  };

  const deleteSupplement = (id: string) => {
    update({ supplements: profile.supplements.filter((s) => s.id !== id) });
    setSupplementEditor(null);
    setMessage("Supplement removed");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f3ecdf] text-[#4a3f30]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[320px] w-[320px] rounded-full bg-[#fff6e3] opacity-90 blur-[90px]" />
        <div className="absolute -right-24 top-[24%] h-[340px] w-[340px] rounded-full bg-[#e9bd78] opacity-30 blur-[105px]" />
        <div className="absolute -left-24 bottom-[5%] h-[300px] w-[300px] rounded-full bg-[#f7dfb3] opacity-50 blur-[100px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 pb-36 pt-6 sm:pt-10 md:max-w-[720px] md:px-8">
        <header className="mt-3 flex items-center gap-3 sm:mt-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back to home"
            className="home-icon-solid flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4a3f30] transition hover:border-[#c9a35d]/70 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
          >
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[30px] font-light leading-none tracking-[-0.035em] text-[#3b3226]">Settings</h1>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8d6a2a]">Your account</p>
          </div>
          <LanguageSwitcher />
        </header>

        <section aria-label="Profile details" className="mt-7 flex items-start gap-4">
          <img src="/images/avatar.jpg" alt="" className="mt-1 h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="min-w-0 text-[20px] font-medium leading-snug tracking-tight text-[#3b3226] [overflow-wrap:anywhere]">
                {profile.name}
              </p>
              <button
                ref={nameEditButtonRef}
                type="button"
                onClick={() => setEditingName(true)}
                aria-label="Edit name"
                aria-haspopup="dialog"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#8d6a2a] transition-colors hover:bg-[#fbe7b8]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
              >
                <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-[14px] leading-snug text-[#6f6149] [overflow-wrap:anywhere]">
              {profile.email}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#85735a]">Second trimester · Week 24</p>
          </div>
        </section>

        <div className="mt-6 space-y-4">
          {/* Next ANC contact */}
          <Card title="Next ANC contact" description="Your upcoming antenatal appointment.">
            {editingAnc ? (
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  update({ nextAncDate: ancDraft });
                  setEditingAnc(false);
                  setMessage("Appointment date updated");
                }}
              >
                <label htmlFor="anc-date" className="sr-only">Next ANC date</label>
                <input
                  id="anc-date"
                  type="date"
                  required
                  value={ancDraft}
                  onChange={(event) => setAncDraft(event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-[#d8c6a4] bg-white px-4 py-3 text-[15px] text-[#3b3226] outline-none focus:border-[#a87a3d]"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-full bg-[#4a3f30] px-5 py-3 text-[14px] font-medium text-[#fffaf0] transition hover:bg-[#655039]">Save</button>
                  <button type="button" onClick={() => { setAncDraft(profile.nextAncDate); setEditingAnc(false); }} className="rounded-full px-3 py-3 text-[14px] text-[#6f6149]">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full bg-[#d9ab5e]/15 text-[#7b5b2b]">
                    <Stethoscope size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-medium text-[#3b3226]">
                    {formatDate(profile.nextAncDate)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => { setAncDraft(profile.nextAncDate); setEditingAnc(true); }}
                  className="flex items-center gap-1.5 rounded-full border border-[#d8c6a4] px-4 py-2 text-[13px] font-medium text-[#6f5a35] transition hover:bg-white/60"
                >
                  <Pencil size={14} strokeWidth={1.8} aria-hidden="true" /> Edit
                </button>
              </div>
            )}
          </Card>

          {/* Supplements */}
          <Card title="Supplements" description="Add what you take and set a daily reminder for each.">
            {profile.supplements.length > 0 ? (
              <ul className="divide-y divide-[#b98a3e]/15">
                {profile.supplements.map((supplement) => (
                  <li key={supplement.id}>
                    <button
                      type="button"
                      onClick={() => setSupplementEditor({ key: supplement.id, item: supplement })}
                      aria-label={`Edit ${supplement.name}`}
                      aria-haspopup="dialog"
                      className="group flex min-h-[64px] w-full items-center gap-3 rounded-xl px-1.5 py-3 text-left transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9ab5e]/15 text-[#7b5b2b]">
                        <Pill size={18} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-[#3b3226]">{supplement.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#6f6149]">
                          {supplement.reminderTime ? (
                            <><Bell size={12} aria-hidden="true" /> Daily at {formatTime(supplement.reminderTime)}</>
                          ) : (
                            <>No reminder set</>
                          )}
                        </span>
                      </span>
                      <Pencil size={15} className="shrink-0 text-[#85735a] transition-colors group-hover:text-[#6f5a35]" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-[14px] leading-relaxed text-[#6f6149]">No supplements yet. Add the ones you take.</p>
            )}

            <button
              type="button"
              onClick={() => setSupplementEditor({ key: `new-${Date.now()}`, item: null })}
              aria-haspopup="dialog"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#c9a35d]/45 bg-[#fbe7b8]/55 px-4 py-3 text-[14px] font-medium text-[#6f5a35] transition hover:bg-[#fbe7b8]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
            >
              <Plus size={18} strokeWidth={1.9} aria-hidden="true" /> Add supplement
            </button>
          </Card>

          {/* Account actions */}
          <Card title="Account">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirm("logout")}
                className="flex items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d6a2a]"
              >
                <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full bg-[#f0e3c9] text-[#6f5a35]"><LogOut size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span>
                  <span className="block text-[15px] font-medium text-[#3b3226]">Log out</span>
                  <span className="block text-[12.5px] text-[#85735a]">Sign out of your account on this device.</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfirm("delete")}
                className="flex items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-[#f6e0d8]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c3a29]"
              >
                <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full bg-[#9c3a29]/12 text-[#9c3a29]"><Trash2 size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span>
                  <span className="block text-[15px] font-medium text-[#9c3a29]">Delete account</span>
                  <span className="block text-[12.5px] text-[#a76a56]">Permanently remove your data. This cannot be undone.</span>
                </span>
              </button>
            </div>
          </Card>
        </div>
      </main>

      <BottomNav current="home" />

      {supplementEditor && (
        <SupplementEditor
          key={supplementEditor.key}
          initial={supplementEditor.item}
          onClose={() => setSupplementEditor(null)}
          onSave={saveSupplement}
          onDelete={deleteSupplement}
        />
      )}

      {editingName && (
        <NameEditor
          key={profile.name}
          initialName={profile.name}
          onClose={() => setEditingName(false)}
          onSave={saveName}
        />
      )}

      {confirm === "logout" && (
        <ConfirmDialog
          title="Log out?"
          body="You'll need to sign in again to see your check-ins and reports."
          confirmLabel="Log out"
          tone="neutral"
          onCancel={() => setConfirm(null)}
          onConfirm={() => { setConfirm(null); window.location.hash = ""; }}
        />
      )}

      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete your account?"
          body="This permanently removes your profile, supplements, and saved settings. This cannot be undone."
          confirmLabel="Delete account"
          tone="danger"
          onCancel={() => setConfirm(null)}
          onConfirm={() => { resetAll(); setConfirm(null); window.location.hash = ""; }}
        />
      )}

      {message && (
        <div role="status" className="fixed bottom-28 left-1/2 z-40 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full bg-[#3b3226] px-5 py-3 text-center text-[13px] font-medium text-[#fffaf0] shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
