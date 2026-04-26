"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "register" | "signin";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          return;
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid Credentials");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 flex items-center justify-center">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-white/82 shadow-[0_28px_90px_rgba(45,106,79,0.12)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#0f5238_0%,#186146_55%,#0c3d2a_100%)] p-12 text-white lg:flex">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-16 top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#fc8a40]/20 blur-3xl" />
          </div>
          <div className="absolute inset-y-10 right-8 w-px bg-white/10" />

          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                FreshPrep
              </p>
              <h1 className="mt-4 max-w-md text-5xl font-semibold tracking-tight leading-tight">
                Meal planning without the headaches.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/82">
                FreshPrep helps you build meal plans, auto-generate groceries,
                and keep dinner organized in one calm place. Less guesswork,
                fewer tabs, and a faster path from idea to table.
              </p>
            </div>

            <div className="grid max-w-md items-stretch gap-3 sm:grid-cols-3">
              <div className="flex h-full flex-col justify-between gap-3 rounded-[22px] border border-white/10 bg-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] leading-none text-white/55">
                  Step 1
                </p>
                <p className="text-sm font-medium leading-snug text-white">Create your account</p>
              </div>
              <div className="flex h-full flex-col justify-between gap-3 rounded-[22px] border border-white/10 bg-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] leading-none text-white/55">
                  Step 2
                </p>
                <p className="text-sm font-medium leading-snug text-white">Set people and days</p>
              </div>
              <div className="flex h-full flex-col justify-between gap-3 rounded-[22px] border border-white/10 bg-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] leading-none text-white/55">
                  Step 3
                </p>
                <p className="text-sm font-medium leading-snug text-white">Generate meals fast</p>
              </div>
            </div>
          </div>

          <div className="relative mt-5 z-10 rounded-[28px] border border-white/12 bg-white/10 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <p className="text-sm font-medium text-white/75">Designed to stay out of the way</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
              <span className="rounded-full bg-white/10 px-4 py-2">Soft spacing</span>
              <span className="rounded-full bg-white/10 px-4 py-2">Meal plans</span>
              <span className="rounded-full bg-white/10 px-4 py-2">Auto groceries</span>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-12 lg:p-14">
          <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#0f5238]/8 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f5238]">
                {mode === "register" ? "Create account" : "Welcome back"}
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-[#1b1c19] sm:text-4xl">
                {mode === "register" ? "Register" : "Log in"}
              </h2>
              <p className="max-w-md text-sm leading-7 text-[#404943]">
                FreshPrep turns meal planning into a quick setup: tell it who
                you&apos;re cooking for, how long you need, and let it handle the
                hard part.
              </p>
            </div>

            <label className="block space-y-3">
              <span className="text-sm font-medium text-[#404943]">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] px-4 text-sm text-[#1b1c19] outline-none transition placeholder:text-[#8b938e] focus:border-[#0f5238] focus:bg-white"
              />
            </label>

            <label className="block space-y-3">
              <span className="text-sm font-medium text-[#404943]">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] px-4 text-sm text-[#1b1c19] outline-none transition placeholder:text-[#8b938e] focus:border-[#0f5238] focus:bg-white"
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#0f5238] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,82,56,0.24)] transition hover:-translate-y-px hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : mode === "register" ? "Register" : "Log in"}
            </button>

            <p className="text-center text-sm text-[#404943]">
              {mode === "register" ? (
                <Link className="font-medium text-[#0f5238] hover:underline" href="/login">
                  Already have an account?
                </Link>
              ) : (
                <Link className="font-medium text-[#0f5238] hover:underline" href="/register">
                  Create account
                </Link>
              )}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
