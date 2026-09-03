"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

type Option = { id: string; name: string };

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export function RequirementForm({
  industries,
  infrastructure,
}: {
  industries: Option[];
  infrastructure: Option[];
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      company: data.get("company"),
      email: data.get("email"),
      phone: data.get("phone"),
      industry: data.get("industry") || undefined,
      interestedInfrastructure: data.get("interestedInfrastructure")
        ? [data.get("interestedInfrastructure")]
        : undefined,
      companySize: data.get("companySize") || undefined,
      workloadDescription: data.get("workloadDescription"),
      applicationsUsed: data.get("applicationsUsed"),
      message: data.get("message"),
      sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-accent-2/40 bg-surface p-8 text-center">
        <div className="text-lg font-medium text-foreground">Thanks — we&rsquo;ve got it.</div>
        <p className="mt-2 text-sm text-muted">
          Someone from our team will review your requirement and get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input name="name" required className={inputClass} placeholder="Enter your name" />
        </Field>
        <Field label="Company" required>
          <input name="company" required className={inputClass} placeholder="Company Name" />
        </Field>
        <Field label="Work Email" required>
          <input type="email" name="email" required className={inputClass} placeholder="Enter your email" />
        </Field>
        <Field label="Phone" required>
          <input name="phone" className={inputClass} placeholder="Enter your phone no." />
        </Field>
        <Field label="Industry">
          <select name="industry" className={inputClass} defaultValue="">
            <option value="">Select industry</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Interested Infrastructure">
          <select name="interestedInfrastructure" className={inputClass} defaultValue="">
            <option value="">Select infrastructure</option>
            {infrastructure.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Company Size">
        <select name="companySize" className={inputClass} defaultValue="">
          <option value="">Select size</option>
          {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => (
            <option key={s} value={s}>
              {s} employees
            </option>
          ))}
        </select>
      </Field>

      <Field label="What workload are you running?">
        <textarea
          name="workloadDescription"
          rows={3}
          className={inputClass}
          placeholder=""
        />
      </Field>

      <Field label="Applications / Software">
        <input name="applicationsUsed" className={inputClass} placeholder="" />
      </Field>

      <Field label="Additional details">
        <textarea name="message" rows={4} className={inputClass} placeholder="Anything else we should know?" />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {status === "submitting" && <Spinner className="h-4 w-4" />}
        {status === "submitting" ? "Sending…" : "Tell Us About Your Requirement"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/80">
        {label}
        {required && <span className="text-accent-2"> *</span>}
      </span>
      {children}
    </label>
  );
}
