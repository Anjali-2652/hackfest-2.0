"use client";

import { useMemo, useState } from "react";

type Mode = "user" | "admin";

const demo = {
  admin: { username: "admin", password: "admin123" },
  users: [
    { name: "Ahmed Tariq", id: "EMP-001", pass: "pass123" },
    { name: "Sara Khan", id: "EMP-013", pass: "pass123" },
    { name: "Fatima Khan", id: "EMP-003", pass: "pass123" },
  ],
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    return mode === "user" ? "e.g. EMP-001 or admin" : "e.g. admin";
  }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Fake auth (UI-only). Replace with your API later.
    await new Promise((r) => setTimeout(r, 650));

    if (mode === "admin") {
      const ok = username === demo.admin.username && password === demo.admin.password;
      setMessage(ok ? "✅ Admin login success (demo)" : "❌ Invalid admin credentials (demo)");
    } else {
      const ok = demo.users.some((u) => u.id === username && u.pass === password);
      setMessage(ok ? "✅ User login success (demo)" : "❌ Invalid user credentials (demo)");
    }

    setLoading(false);
  }

  function fillDemoAdmin() {
    setMode("admin");
    setUsername(demo.admin.username);
    setPassword(demo.admin.password);
    setMessage(null);
  }

  function fillDemoUser(id: string, pass: string) {
    setMode("user");
    setUsername(id);
    setPassword(pass);
    setMessage(null);
  }

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">
        {/* Card */}
        <div className="rounded-2xl bg-[#0b1320]/75 backdrop-blur-xl shadow-glow ring-1 ring-white/10 overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#00ffd0] to-[#00a3ff] grid place-items-center ring-1 ring-white/15">
                <div className="h-5 w-5 rounded-md bg-white/15 ring-1 ring-white/25" />
              </div>
              <div className="leading-tight">
                <div className="text-xl font-semibold tracking-tight">
                  PolicyGuard <span className="text-[#00ffd0]">AI</span>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Compliance Intelligence Platform
                </div>
              </div>
            </div>

            {/* Toggle */}
            <div className="mt-7 rounded-xl bg-[#091120]/70 ring-1 ring-white/10 p-1 flex gap-1">
              <button
                type="button"
                onClick={() => setMode("user")}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                  mode === "user"
                    ? "bg-[#0f1f35] text-[#00ffd0] ring-1 ring-white/10"
                    : "text-white/55 hover:text-white"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00ffd0]" />
                  User Login
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("admin")}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                  mode === "admin"
                    ? "bg-[#0f1f35] text-[#00ffd0] ring-1 ring-white/10"
                    : "text-white/55 hover:text-white"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ffaa00]" />
                  Admin Login
                </span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-white/45">
                  Employee ID / Username
                </label>
                <div className="mt-2">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl bg-[#07101d]/70 ring-1 ring-white/10 px-4 py-3 text-sm outline-none
                               placeholder:text-white/25 focus:ring-[#00ffd0]/40 focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-white/45">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl bg-[#07101d]/70 ring-1 ring-white/10 px-4 py-3 text-sm outline-none
                               placeholder:text-white/25 focus:ring-[#00ffd0]/40 focus:ring-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-[#04111a]
                           bg-gradient-to-r from-[#00ffd0] to-[#00a3ff]
                           shadow-[0_14px_50px_rgba(0,255,208,0.15)]
                           hover:brightness-110 active:brightness-95 transition
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>

              {message && (
                <div className="text-sm">
                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 ring-1",
                      message.includes("✅")
                        ? "bg-emerald-500/10 ring-emerald-400/20 text-emerald-200"
                        : "bg-red-500/10 ring-red-400/20 text-red-200"
                    )}
                  >
                    {message}
                  </div>
                </div>
              )}
            </form>

            {/* Demo Credentials */}
            <div className="mt-7 rounded-xl bg-[#061425]/70 ring-1 ring-[#00ffd0]/15 p-4">
              <div className="text-xs font-semibold text-[#00ffd0] tracking-wide">
                Demo Credentials
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white/70">
                    Admin:{" "}
                    <span className="text-white/90 font-semibold">{demo.admin.username}</span>{" "}
                    /{" "}
                    <span className="text-white/90 font-semibold">{demo.admin.password}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="rounded-lg px-2 py-1 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                  >
                    Use
                  </button>
                </div>

                {demo.users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3">
                    <div className="text-white/55">
                      User ({u.name}):{" "}
                      <span className="text-white/90 font-semibold">{u.id}</span>{" "}
                      /{" "}
                      <span className="text-white/90 font-semibold">{u.pass}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillDemoUser(u.id, u.pass)}
                      className="rounded-lg px-2 py-1 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom subtle border */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </main>
  );
}