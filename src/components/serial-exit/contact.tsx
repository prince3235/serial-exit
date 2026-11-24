"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { contact } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Button } from "./button";
import { BrassSeal } from "./brass-seal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type TabKey = (typeof contact.tabs)[number]["key"];
type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  // honeypot — must stay empty
  website: string;
};
type Errors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  role: "",
  message: "",
  website: "",
};

/**
 * Contact — two-tab enquiry form.
 * Tab 1: I'm a Partner (Advisor / Investor / Acquirer)
 * Tab 2: I'm a Business Owner
 *
 * Client-side validation, honeypot field, polished success state.
 * Frontend-only — structured so an API route / email service can be plugged in.
 */
export function Contact() {
  const [tab, setTab] = useState<TabKey>("partner");
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeTab = contact.tabs.find((t) => t.key === tab)!;

  const update = (k: keyof FormState, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.company.trim()) e.company = "Please enter your company.";
    if (!form.email.trim()) e.email = "Please enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.role) e.role = "Please select a role / type.";
    if (!form.message.trim()) e.message = "Please share a brief message.";
    else if (form.message.trim().length < 12)
      e.message = "Please add a little more detail (at least 12 characters).";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    // Honeypot — silently succeed if filled (bot trap)
    if (form.website) {
      setSuccess(true);
      return;
    }
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab, ...form }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data?.errors) {
          setErrors(data.errors as Errors);
        } else {
          setErrors({ message: data?.error || "Something went wrong. Please try again." });
        }
      }
    } catch {
      setErrors({ message: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(initial);
    setErrors({});
    setSuccess(false);
  };

  return (
    <SectionShell id="contact" className="border-t border-white/[0.06] bg-[#0B0B0C]">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: heading + confidentiality */}
        <div className="lg:col-span-5">
          <SectionHeading
            index={contact.index}
            eyebrow={contact.eyebrow}
            title={contact.title}
            intro={contact.intro}
          />

          <Reveal delay={0.2} className="mt-10">
            <div className="flex items-start gap-3 border border-white/[0.08] bg-white/[0.015] p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.5} />
              <p className="text-[0.8125rem] leading-relaxed text-foreground/70">
                {contact.confidentiality}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <div className="relative border border-white/[0.08] bg-white/[0.015] p-5 sm:p-8 lg:p-10">
              {/* Tabs */}
              <div role="tablist" aria-label="Enquiry type" className="grid grid-cols-2 gap-2 border border-white/[0.08] p-1">
                {contact.tabs.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => {
                      setTab(t.key);
                      setForm((p) => ({ ...p, role: "" }));
                      setErrors({});
                    }}
                    className={cn(
                      "relative flex flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors duration-300",
                      tab === t.key ? "text-amber-200" : "text-foreground/65 hover:text-foreground"
                    )}
                  >
                    {tab === t.key && (
                      <motion.span
                        layoutId="contact-tab-bg"
                        className="absolute inset-0 border border-amber-500/50 bg-amber-500/[0.06]"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    <span className="relative z-10 font-sans text-sm font-medium sm:text-[0.9375rem]">
                      {t.label}
                    </span>
                    <span className="relative z-10 font-mono-display text-[0.5625rem] tracking-[0.25em] opacity-85">
                      {t.sub}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    role="status"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="mt-8 flex flex-col items-start gap-4 py-10"
                  >
                    {/* wax-seal stamp: lands the moment the enquiry is accepted (decorative; the title below is the real message) */}
                    <div className="se-stamp w-24 sm:w-28">
                      <BrassSeal ringText="RECEIVED · IN CONFIDENCE · RECEIVED · IN CONFIDENCE ·" />
                    </div>
                    <h3 className="font-sans text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-3xl">
                      {contact.success.title}
                    </h3>
                    <p className="max-w-md text-[0.9375rem] leading-relaxed text-foreground/70">
                      {contact.success.body}
                    </p>
                    <button
                      onClick={reset}
                      className="mt-2 inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 transition-colors duration-300"
                    >
                      {contact.success.reset}
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key={`form-${tab}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    onSubmit={onSubmit}
                    noValidate
                    className="mt-8 flex flex-col gap-5"
                  >
                    {/* Honeypot — visually hidden, must stay empty */}
                    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Website
                        <input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={form.website}
                          onChange={(e) => update("website", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label={contact.fields.name}
                        value={form.name}
                        onChange={(v) => update("name", v)}
                        error={errors.name}
                        autoComplete="name"
                        required
                      />
                      <Field
                        label={contact.fields.company}
                        value={form.company}
                        onChange={(v) => update("company", v)}
                        error={errors.company}
                        autoComplete="organization"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label={contact.fields.email}
                        type="email"
                        value={form.email}
                        onChange={(v) => update("email", v)}
                        error={errors.email}
                        autoComplete="email"
                        required
                      />
                      <Field
                        label={contact.fields.phone}
                        type="tel"
                        value={form.phone}
                        onChange={(v) => update("phone", v)}
                        error={errors.phone}
                        autoComplete="tel"
                      />
                    </div>

                    {/* Role / type — dropdown */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="role" className="font-mono-display text-[0.625rem] tracking-[0.25em] text-foreground/65">
                        {contact.fields.role}
                      </label>
                      <div className="relative">
                        <select
                          id="role"
                          value={form.role}
                          onChange={(e) => update("role", e.target.value)}
                          className={cn(
                            "w-full appearance-none border border-white/[0.1] bg-[#050505] px-4 py-3.5 text-[0.9375rem] text-foreground transition-colors duration-300 focus:border-amber-500/60 focus:outline-none",
                            !form.role && "text-foreground/65"
                          )}
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {activeTab.roleOptions.map((o) => (
                            <option key={o} value={o} className="bg-[#050505] text-foreground">
                              {o}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-amber-500">
                          ▾
                        </span>
                      </div>
                      {errors.role && <p className="text-[0.75rem] text-amber-400">{errors.role}</p>}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="font-mono-display text-[0.625rem] tracking-[0.25em] text-foreground/65">
                        {contact.fields.message}
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder={
                          tab === "partner"
                            ? contact.fields.messagePartnerPlaceholder
                            : contact.fields.messageOwnerPlaceholder
                        }
                        className={cn(
                          "w-full resize-none border border-white/[0.1] bg-[#050505] px-4 py-3.5 text-[0.9375rem] text-foreground placeholder:text-foreground/65 transition-colors duration-300 focus:border-amber-500/60 focus:outline-none"
                        )}
                      />
                      {errors.message && <p className="text-[0.75rem] text-amber-400">{errors.message}</p>}
                    </div>

                    <div className="mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <Button type="submit" size="lg" withArrow magnetic={false}>
                        {submitting ? "Sending…" : contact.submit}
                      </Button>
                      <p className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/65">
                        Encrypted in transit · Confidential
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={label} className="font-mono-display text-[0.625rem] tracking-[0.25em] text-foreground/65">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-err` : undefined}
        className={cn(
          "w-full border bg-[#050505] px-4 py-3.5 text-[0.9375rem] text-foreground transition-colors duration-300 focus:outline-none",
          error ? "border-amber-500/70" : "border-white/[0.1] focus:border-amber-500/60"
        )}
      />
      {error && (
        <p id={`${label}-err`} className="text-[0.75rem] text-amber-400">
          {error}
        </p>
      )}
    </div>
  );
}
