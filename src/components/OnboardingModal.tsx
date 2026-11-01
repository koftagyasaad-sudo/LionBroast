"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Landmark, Loader2, MapPin, PartyPopper, Phone, QrCode, ShieldCheck, User, X } from "lucide-react";
import { useApp, type CustomerProfile } from "@/store/app-store";
import { useDict, useIsAr } from "@/lib/hooks";
import { isEgyptMobile, normalizeEgyptPhone } from "@/lib/utils";
import { saveCustomerAction } from "@/app/actions";
import { OUT_OF_RANGE } from "@/lib/constants";
import type { ZoneDTO } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";

type Step = "form" | "done";

export default function OnboardingModal({ zones }: { zones: ZoneDTO[] }) {
  const open = useApp((s) => s.onboardingOpen);
  const reason = useApp((s) => s.onboardingReason);
  const customer = useApp((s) => s.customer);
  const close = useApp((s) => s.closeOnboarding);
  const complete = useApp((s) => s.completeOnboarding);
  const skipOnboarding = useApp((s) => s.skipOnboarding);
  const setPassOpen = useApp((s) => s.setPassOpen);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const pushToast = useApp((s) => s.pushToast);
  const t = useDict();
  const isAr = useIsAr();

  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneCode, setDoneCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    primaryPhone: "",
    secondaryPhone: "",
    street: "",
    building: "",
    flat: "",
    landmark: "",
    zoneId: "",
  });

  // Prefill when editing
  useEffect(() => {
    if (open) {
      setStep("form");
      setErrors({});
      if (customer && (reason === "edit" || reason === "cart")) {
        setForm({
          name: customer.name,
          primaryPhone: customer.primaryPhone,
          secondaryPhone: customer.secondaryPhone ?? "",
          street: customer.street,
          building: customer.building ?? "",
          flat: customer.flat ?? "",
          landmark: customer.landmark ?? "",
          zoneId: customer.zoneId || OUT_OF_RANGE,
        });
      }
    }
  }, [open, customer, reason]);

  const zoneName = useMemo(() => {
    if (form.zoneId === OUT_OF_RANGE) return t.cart.outRangeNote;
    return zones.find((z) => z.id === form.zoneId)
      ? isAr
        ? zones.find((z) => z.id === form.zoneId)!.nameAr
        : zones.find((z) => z.id === form.zoneId)!.nameEn
      : undefined;
  }, [form.zoneId, zones, isAr, t]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t.onboarding.errName;
    if (!isEgyptMobile(form.primaryPhone)) e.primaryPhone = t.onboarding.errPhone;
    if (form.secondaryPhone && !isEgyptMobile(form.secondaryPhone)) e.secondaryPhone = t.onboarding.errPhone;
    if (form.street.trim().length < 3) e.street = t.onboarding.errStreet;
    if (!form.zoneId) e.zoneId = t.onboarding.errZone;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || busy) return;
    setBusy(true);
    try {
      const res = await saveCustomerAction({
        name: form.name.trim(),
        primaryPhone: normalizeEgyptPhone(form.primaryPhone),
        secondaryPhone: form.secondaryPhone ? normalizeEgyptPhone(form.secondaryPhone) : undefined,
        street: form.street.trim(),
        building: form.building.trim() || undefined,
        flat: form.flat.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        zoneId: form.zoneId,
      });
      if (!res.ok) throw new Error("save failed");
      const profile: CustomerProfile = {
        name: form.name.trim(),
        primaryPhone: normalizeEgyptPhone(form.primaryPhone),
        secondaryPhone: form.secondaryPhone ? normalizeEgyptPhone(form.secondaryPhone) : undefined,
        street: form.street.trim(),
        building: form.building.trim() || undefined,
        flat: form.flat.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        zoneId: form.zoneId,
        zoneName,
      };
      complete(profile, res.code);
      setDoneCode(res.code);
      setStep("done");
    } catch {
      pushToast({
        title: isAr ? "حصلت مشكلة في التسجيل" : "Registration hiccup",
        desc: isAr ? "جرّب تاني بعد ثانية" : "Please try again in a second",
        tone: "warn",
      });
    } finally {
      setBusy(false);
    }
  };

  const dismissTop = () => {
    // Non-blocking X: only mark as "onboarded" when it is the auto first-visit prompt.
    if (reason === "auto") skipOnboarding();
    else close();
  };

  const finishDone = () => {
    close();
    if (reason === "cart") setCartOpen(true);
    else setPassOpen(true);
  };

  const field =
    "w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:bg-surface placeholder:text-ink-2/60";
  const errCls = "mt-1 text-[11px] font-bold text-red-500";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[88] grid place-items-end sm:place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="close" onClick={dismissTop} className="absolute inset-0 bg-carbon-950/75 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 70 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-[32px] border border-line bg-surface p-6 shadow-2xl sm:rounded-[32px]"
          >
            <button
              onClick={dismissTop}
              className="absolute end-5 top-5 z-10 grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2 transition hover:scale-110 hover:text-ink"
              aria-label={t.misc.close}
            >
              <X className="size-4.5" />
            </button>

            {step === "form" ? (
              <>
                <div className="mb-5 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/mascot-lion.png" alt="Assad mascot" className="size-16 rounded-2xl object-cover ring-2 ring-brand-500/50" />
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">{t.onboarding.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{t.onboarding.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                      <User className="size-3.5 text-brand-500" /> {t.onboarding.name}
                    </label>
                    <input className={field} value={form.name} onChange={set("name")} placeholder={t.onboarding.namePh} />
                    {errors.name && <p className={errCls}>{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                        <Phone className="size-3.5 text-brand-500" /> {t.onboarding.phone1}
                      </label>
                      <input dir="ltr" className={`${field} text-left`} value={form.primaryPhone} onChange={set("primaryPhone")} placeholder={t.onboarding.phone1Ph} inputMode="tel" />
                      {errors.primaryPhone && <p className={errCls}>{errors.primaryPhone}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                        <Phone className="size-3.5 text-ink-2" /> {t.onboarding.phone2}
                      </label>
                      <input dir="ltr" className={`${field} text-left`} value={form.secondaryPhone} onChange={set("secondaryPhone")} placeholder={t.onboarding.phone2Ph} inputMode="tel" />
                      {errors.secondaryPhone && <p className={errCls}>{errors.secondaryPhone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                      <MapPin className="size-3.5 text-brand-500" /> {t.onboarding.zone}
                    </label>
                    <select className={field} value={form.zoneId} onChange={set("zoneId")}>
                      <option value="">{t.onboarding.zonePh}</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {isAr ? z.nameAr : z.nameEn} — {z.price} {t.misc.currency}
                        </option>
                      ))}
                      <option value={OUT_OF_RANGE}>{t.onboarding.outRange}</option>
                    </select>
                    {errors.zoneId && <p className={errCls}>{errors.zoneId}</p>}
                    {form.zoneId === OUT_OF_RANGE && (
                      <p className="mt-1.5 rounded-xl border border-cheese-400/40 bg-cheese-400/10 px-3 py-2 text-[11px] font-semibold text-cheese-400">
                        {t.cart.outRangeNote}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                      <Landmark className="size-3.5 text-brand-500" /> {t.onboarding.street}
                    </label>
                    <input className={field} value={form.street} onChange={set("street")} placeholder={t.onboarding.streetPh} />
                    {errors.street && <p className={errCls}>{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <input className={field} value={form.building} onChange={set("building")} placeholder={t.onboarding.buildingPh} />
                    <input className={field} value={form.flat} onChange={set("flat")} placeholder={t.onboarding.flatPh} />
                    <input className={`${field} col-span-1`} value={form.landmark} onChange={set("landmark")} placeholder={t.onboarding.landmarkPh} />
                  </div>

                  <button
                    onClick={submit}
                    disabled={busy}
                    className="glow-brand flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-base font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="size-5 animate-spin" /> : <QrCode className="size-5" />}
                    {busy ? t.onboarding.saving : t.onboarding.save}
                  </button>

                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-ink-2">
                      <ShieldCheck className="size-3.5 text-emerald-500" /> {t.onboarding.terms}
                    </p>
                    {reason === "auto" && (
                      <button onClick={() => skipOnboarding()} className="flex shrink-0 items-center gap-1 text-xs font-bold text-ink-2 underline-offset-4 transition hover:text-brand-500 hover:underline">
                        {t.onboarding.skip} <ArrowRight className={`size-3.5 ${isAr ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/mascot-lion.png" alt="Assad mascot" className="mx-auto size-24 rounded-3xl object-cover ring-4 ring-cheese-400/60" />
                </motion.div>
                <div className="mt-4 flex items-center justify-center gap-2 text-cheese-400">
                  <PartyPopper className="size-5" />
                  <h2 className="text-2xl font-extrabold">
                    {t.onboarding.welcome} {form.name.split(" ")[0]}!
                  </h2>
                </div>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-2">{t.onboarding.passReady}</p>

                <div className="golden-card mx-auto mt-5 grid w-fit place-items-center rounded-3xl border border-cheese-400/30 p-5">
                  <div className="rounded-2xl bg-white p-3">
                    <QRCodeSVG
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/pass/${doneCode}`}
                      size={140}
                      fgColor="#0F1115"
                      level="M"
                    />
                  </div>
                  <p className="mt-3 font-mono text-lg font-extrabold tracking-[0.2em] text-cheese-300" dir="ltr">
                    {doneCode}
                  </p>
                </div>

                <button
                  onClick={finishDone}
                  className="glow-brand mt-6 w-full rounded-2xl bg-brand-500 py-4 text-base font-extrabold text-white transition hover:scale-[1.01]"
                >
                  {reason === "cart" ? t.cart.title : t.pass.myPass}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
