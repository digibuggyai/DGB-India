"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

/**
 * Short lead-capture form: organization, contact person, work email, phone,
 * and requirement details — nothing else. Posts to the same /api/contact
 * endpoint the full RequirementForm uses (backend Leads collection), so no
 * new backend wiring is needed. `source` is passed in and sent as a hidden
 * field so leads can be traced back to the page/CTA that generated them.
 */
export function SolutionRequestForm({ source }: { source?: string }) {
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
      workloadDescription: data.get("requirement"),
      sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      utmSource: source || undefined,
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
        <Field label="Organization Name" required>
          <input name="company" required className={inputClass} placeholder="Your company" />
        </Field>
        <Field label="Person Name" required>
          <input name="name" required className={inputClass} placeholder="Your name" />
        </Field>
        <Field label="Work Email" required>
          <input type="email" name="email" required className={inputClass} placeholder="you@company.com" />
        </Field>
        <Field label="Phone" required>
          <input name="phone" required className={inputClass} placeholder="Phone number" />
        </Field>
      </div>

      <Field label="Requirement Details" required>
        <textarea
          name="requirement"
          required
          rows={5}
          className={inputClass}
          placeholder="What are you building, and what does it need? Workload, scale, specs — whatever you know."
        />
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {status === "submitting" && <Spinner className="h-4 w-4" />}
        {status === "submitting" ? "Sending…" : "Submit Requirement"}
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
