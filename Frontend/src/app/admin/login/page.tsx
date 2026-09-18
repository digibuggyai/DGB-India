"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Toast, type ToastKind } from "@/components/ui/Toast";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<{ kind: ToastKind; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ kind: "error", message: data.error || "Login failed." });
        setLoading(false);
        return;
      }
      // Confirm it worked before the page changes under them.
      setNotice({ kind: "success", message: "Signed in. Opening the admin panel…" });
      window.setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 700);
    } catch {
      setNotice({ kind: "error", message: "Couldn’t reach the server. Please try again." });
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center">
          <Logo priority className="h-11 w-auto" />
        </div>

        <div className="rounded-lg border border-border bg-background p-8">
          <Eyebrow>Admin</Eyebrow>
          <h1 className="font-display mt-4 text-2xl font-bold tracking-tight">Sign In</h1>
          <p className="mt-2 text-sm text-muted">
            Staff access to submitted queries and site content.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground/80">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@dgbindia.com"
              />
            </label>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-foreground/80">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {notice ? (
        <Toast
          kind={notice.kind}
          message={notice.message}
          onClose={() => setNotice(null)}
          duration={notice.kind === "error" ? 8000 : undefined}
        />
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 7 10 7a15.9 15.9 0 0 1-3 3.8M6.2 7.4A15.9 15.9 0 0 0 2 13s3.5 7 10 7a9.8 9.8 0 0 0 4.3-1" />
      <path d="M9.9 10.1a3 3 0 0 0 4.2 4.2" />
      <path d="m3 3 18 18" />
    </svg>
  );
}
