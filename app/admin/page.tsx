"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { loadDatasetFromLS, saveDatasetToLS, loadUsersFromLS, saveUsersToLS, downloadJson, isAuthenticated, clearAuth } from "../../lib/data";
import { useRouter } from "next/navigation";

type Row = Record<string, any>;

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => (typeof window !== "undefined" ? loadDatasetFromLS() : []));
  const [users, setUsers] = useState<any[]>(() => (typeof window !== "undefined" ? loadUsersFromLS() : []));
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) router.push("/admin/login");
  }, [router]);

  useEffect(() => { saveDatasetToLS(rows); }, [rows]);
  useEffect(() => { saveUsersToLS(users); }, [users]);

  function handleExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.arrayBuffer().then((data) => {
      const wb = XLSX.read(data);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Row>(sheet);
      setRows(json);
      setMessage(`Loaded ${json.length} rows`);
    }).catch(() => setMessage("Failed to parse Excel file"));
  }

  function exportCsv() {
    if (!rows || rows.length === 0) return setMessage("No rows to export");
    const keys = Object.keys(rows[0]);
    const esc = (v: any) => String(v ?? "").replace(/"/g, '""');
    const header = keys.map((k) => `"${k}"`).join(",");
    const body = rows.map((r) => keys.map((k) => `"${esc(r[k])}"`).join(",")).join("\n");
    const csv = header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "policyguard_dataset.csv"; a.click(); URL.revokeObjectURL(url);
  }

  function exportJson() {
    downloadJson("policyguard_export.json", { rows, users });
  }

  function logout() {
    clearAuth();
    router.push("/admin/login");
  }

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, query]);

  // Simple metrics
  const metrics = useMemo(() => {
    const total = rows.length;
    const violations = rows.filter((r) => {
      const v = (r.violation ?? r.is_violation ?? r.status ?? r.compliant) as any;
      if (typeof v === "boolean") return v === true && r.compliant !== true;
      if (typeof v === "string") return /violation|non|fail|no|false/i.test(v);
      return false;
    }).length;
    const compliant = rows.filter((r) => {
      const v = (r.compliant ?? r.is_compliant ?? r.status) as any;
      if (typeof v === "boolean") return v === true;
      if (typeof v === "string") return /compliant|ok|yes|true/i.test(v);
      return false;
    }).length;
    return { total, violations, compliant };
  }, [rows]);

  return (
    <div className="min-h-screen flex">
      <aside className="w-20 bg-[#051018] border-r border-[#0b1320] flex flex-col items-center py-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffd0] to-[#00a3ff] grid place-items-center">PG</div>
        <nav className="flex-1 flex flex-col items-center gap-3 mt-2">
          <a href="/admin" className="w-10 h-10 rounded-lg grid place-items-center hover:bg-[#061425]/40">🏠</a>
          <a href="#" className="w-10 h-10 rounded-lg grid place-items-center hover:bg-[#061425]/40">👥</a>
          <a href="#" className="w-10 h-10 rounded-lg grid place-items-center hover:bg-[#061425]/40">📄</a>
          <a href="#" className="w-10 h-10 rounded-lg grid place-items-center hover:bg-[#061425]/40">⚠️</a>
        </nav>
        <div className="mt-auto mb-2 w-10 h-10 rounded-full bg-[#00ffd0] grid place-items-center text-sm font-semibold text-[#04111a]">AD</div>
      </aside>

      <main className="flex-1 p-8 bg-[#07101d]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <button onClick={exportJson} className="rounded bg-[#0b2] px-3 py-1 text-sm">Export JSON</button>
              <button onClick={logout} className="rounded bg-red-500 px-3 py-1 text-sm">Sign out</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 rounded-md p-4 bg-[#061425]/30">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-4 bg-[#061425]/40">
                  <div className="text-xs text-white/60">Total Violations</div>
                  <div className="text-2xl font-semibold text-rose-400">{metrics.violations}</div>
                  <div className="text-xs text-white/50">{metrics.total} records</div>
                </div>
                <div className="rounded-xl p-4 bg-[#061425]/40">
                  <div className="text-xs text-white/60">Compliant Records</div>
                  <div className="text-2xl font-semibold text-emerald-300">{metrics.compliant}</div>
                  <div className="text-xs text-white/50">{metrics.total > 0 ? `${Math.round((metrics.compliant / metrics.total) * 100)}% compliance` : "0%"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <input type="file" accept=".xlsx,.xls" onChange={handleExcel} />
                <button onClick={exportCsv} className="ml-auto rounded bg-[#00a3ff] px-3 py-1 text-sm">Export CSV</button>
              </div>

              <div className="mb-3">
                <input
                  placeholder="Search dataset..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded px-3 py-2 bg-[#061425]/40"
                />
              </div>

              <div className="overflow-auto max-h-[60vh] rounded border bg-[#061425]/30 p-2">
                {filtered.length === 0 ? (
                  <div className="text-sm text-white/60 p-4">No rows loaded or matching query.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-white/60 border-b">
                        {Object.keys(filtered[0]).map((k) => (
                          <th key={k} className="pr-4 py-2">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => (
                        <tr key={i} className="align-top border-b last:border-0">
                          {Object.keys(filtered[0]).map((k) => (
                            <td key={k} className="pr-4 py-2 align-top">{String((r as any)[k] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="rounded-md p-4 bg-[#07101d]/60">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Users</div>
                <div className="text-xs text-white/60">In-memory demo users</div>
              </div>
              <div className="space-y-2">
                {users && users.length > 0 ? users.map((u, idx) => (
                  <div key={u.id ?? idx} className="flex items-center gap-2 bg-[#061425]/30 p-2 rounded">
                    <input value={u.name} onChange={(e) => { const v = e.target.value; setUsers((prev)=> { const c=[...prev]; c[idx]={...c[idx], name:v}; return c; }); }} className="flex-1 rounded px-2 py-1 bg-transparent" />
                    <input value={u.id} onChange={(e) => { const v=e.target.value; setUsers((prev)=>{ const c=[...prev]; c[idx]={...c[idx], id:v}; return c; }); }} className="w-28 rounded px-2 py-1 bg-transparent" />
                    <input value={u.pass} onChange={(e) => { const v=e.target.value; setUsers((prev)=>{ const c=[...prev]; c[idx]={...c[idx], pass:v}; return c; }); }} className="w-28 rounded px-2 py-1 bg-transparent" />
                    <button onClick={() => setUsers((prev) => prev.filter((_, i) => i !== idx))} className="text-sm text-red-400">Delete</button>
                  </div>
                )) : (
                  <div className="text-sm text-white/60">No users defined.</div>
                )}
              </div>
            </div>
          </div>

          {message && <div className="text-sm text-white/80">{message}</div>}
        </div>
      </main>
    </div>
  );
}
