"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { Eyebrow } from "@/components/ui/Eyebrow";

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <Logo className="h-7 w-7 text-accent" />
          <span className="font-display text-lg font-semibold tracking-tight">
            DGB India Enterprise
          </span>
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

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground/80">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </label>

            {error && <p className="text-sm text-accent">{error}</p>}

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
    </div>
  );
}
