"use client";

import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { loadDatasetFromLS, loadUsersFromLS, setAuth } from "../lib/data";
import { useRouter } from "next/navigation";

type Mode = "user" | "admin";

const demo = {
  admin: { username: "admin", password: "admin123" },
  users: [
    { name: "Ahmed Tariq", id: "EMP-001", pass: "pass123" },
    { name: "Sarah Mitchell", id: "EMP-002", pass: "pass123" },
    { name: "James Chen", id: "EMP-003", pass: "pass123" },
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
  const [dataset, setDataset] = useState<Array<Record<string, any>>>([]);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const router = useRouter();

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
      if (ok) {
        setAuth("admin");
        router.push("/admin");
      } else {
        setMessage("❌ Invalid admin credentials (demo)");
      }
    } else {
      // Always check demo.users for login (these are the hardcoded demo credentials)
      const found = demo.users.find((u) => (u.id === username || u.name === username) && u.pass === password);
      if (found) {
        setAuth(found.id);
        router.push("/employee");
      } else {
        setMessage("❌ Invalid user credentials (demo)");
      }
    }

    setLoading(false);
  }

  // Excel parsing (client-side)
  async function handleExcelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setDataset(json as Array<Record<string, any>>);
      setMessage("✅ Excel file parsed (preview below)");
    } catch (err) {
      setMessage("❌ Failed to parse Excel file");
    }
  }

  // HTML preview (client-side)
  async function handleHtmlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setHtmlPreview(text);
      setMessage("✅ HTML file loaded (preview below)");
    } catch (err) {
      setMessage("❌ Failed to load HTML file");
    }
  }

  useEffect(() => {
    try {
      const ds = loadDatasetFromLS();
      if (ds && ds.length > 0) setDataset(ds);
    } catch (e) {
      // ignore
    }
  }, []);

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

  function clearCache() {
    if (typeof window !== "undefined") {
      localStorage.clear();
      setMessage("✅ Cache cleared! Try logging in again.");
      setUsername("");
      setPassword("");
    }
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
                <div className="mb-2 text-xs text-white/60">Loaded dataset rows: {dataset.length}</div>
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
                      {u.name} ({u.id}):{" "}
                      <span className="text-white/90 font-semibold">{u.id}</span>{" "}
                      /{" "}
                      <span className="text-white/90 font-semibold">{u.pass}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillDemoUser(u.id, u.pass)}
                      className="rounded-lg px-2 py-1 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition whitespace-nowrap"
                    >
                      Use
                    </button>
                  </div>
                ))}

                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={clearCache}
                    className="w-full rounded-lg px-3 py-2 bg-red-500/10 ring-1 ring-red-500/30 hover:bg-red-500/20 transition text-red-300 font-medium text-xs"
                  >
                    🗑️ Clear Cache & Reset
                  </button>
                  <div className="text-xs text-white/40 mt-2 text-center">
                    Having login issues? Clear cache and try again.
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Import UI & Data (Excel + HTML preview) */}
            <div className="mt-6 rounded-xl bg-[#071623]/60 ring-1 ring-white/6 p-4">
              <div className="text-xs font-semibold text-white/80 tracking-wide">Import UI & Dataset</div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelChange}
                    className="text-sm"
                  />
                  <div className="text-white/60">Upload Excel dataset (PolicyGuard_Compliance_Report.xlsx)</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="text/html"
                    onChange={handleHtmlChange}
                    className="text-sm"
                  />
                  <div className="text-white/60">Upload HTML UI (policyguard-full-system.html)</div>
                </div>

                {dataset && dataset.length > 0 && (
                  <div className="mt-3 overflow-auto rounded-md bg-[#061425]/40 p-2">
                    <div className="text-xs text-white/70 mb-2">Dataset preview ({dataset.length} rows)</div>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr>
                          {Object.keys(dataset[0]).map((k) => (
                            <th key={k} className="pr-4 pb-2 text-white/60">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataset.slice(0, 10).map((row, i) => (
                          <tr key={i} className="align-top">
                            {Object.keys(dataset[0]).map((k) => (
                              <td key={k} className="pr-4 py-1 text-white/70">
                                {String((row as any)[k] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {htmlPreview && (
                  <div className="mt-3">
                    <div className="text-xs text-white/70 mb-2">HTML preview</div>
                    <div className="w-full h-64 border rounded-md overflow-hidden">
                      <iframe title="html-preview" srcDoc={htmlPreview} className="w-full h-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Bottom subtle border */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </main>
  );
}