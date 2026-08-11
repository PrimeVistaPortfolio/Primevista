"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const initialState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  budgetRange: "",
  serviceInterest: "",
  message: "",
  website: "", // honeypot — real users never see or fill this
};

// Underlined inputs rather than filled boxes — quieter and more editorial.
const fieldClass =
  "w-full border-b border-rule bg-transparent py-3 text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent";

export default function InquiryForm({ serviceOptions = [], budgetOptions = [] }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors) setErrors(data.details.fieldErrors);
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border-t border-rule py-16"
      >
        <p className="label text-accent">Message received</p>
        <p className="display mt-6 text-4xl text-ink">Thanks — we&apos;ll be in touch.</p>
        <button
          onClick={() => setStatus("idle")}
          className="link-underline mt-8 text-sm text-ink-muted hover:text-ink"
          data-cursor="hover"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 sm:grid-cols-2">
      {/* Honeypot: off-screen for humans, irresistible to bots that autofill. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        className="absolute left-[-9999px]"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label className="label mb-2 block" htmlFor="name">
          Name *
        </label>
        <input id="name" required className={fieldClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        {errors.name && <p className="mt-2 text-xs text-red-400">{errors.name[0]}</p>}
      </div>

      <div>
        <label className="label mb-2 block" htmlFor="email">
          Email *
        </label>
        <input
          id="email"
          required
          type="email"
          className={fieldClass}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email[0]}</p>}
      </div>

      <div>
        <label className="label mb-2 block" htmlFor="phone">
          Phone
        </label>
        <input id="phone" className={fieldClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>

      <div>
        <label className="label mb-2 block" htmlFor="company">
          Company
        </label>
        <input id="company" className={fieldClass} value={form.company} onChange={(e) => set("company", e.target.value)} />
      </div>

      {budgetOptions.length > 0 && (
        <div>
          <label className="label mb-2 block" htmlFor="budget">
            Budget range
          </label>
          <select
            id="budget"
            className={`${fieldClass} [&>option]:bg-background`}
            value={form.budgetRange}
            onChange={(e) => set("budgetRange", e.target.value)}
          >
            <option value="">Select a range</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      {serviceOptions.length > 0 && (
        <div>
          <label className="label mb-2 block" htmlFor="service">
            Service
          </label>
          <select
            id="service"
            className={`${fieldClass} [&>option]:bg-background`}
            value={form.serviceInterest}
            onChange={(e) => set("serviceInterest", e.target.value)}
          >
            <option value="">Select a service</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sm:col-span-2">
        <label className="label mb-2 block" htmlFor="message">
          Tell us about the project *
        </label>
        <textarea
          id="message"
          required
          rows={4}
          className={`${fieldClass} resize-none`}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
        {errors.message && <p className="mt-2 text-xs text-red-400">{errors.message[0]}</p>}
      </div>

      <div className="sm:col-span-2">
        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 text-sm text-red-400"
            >
              Something went wrong. Please check the form and try again.
            </motion.p>
          )}
        </AnimatePresence>

        <MagneticButton
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full bg-ink px-10 py-4 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </MagneticButton>
      </div>
    </form>
  );
}
