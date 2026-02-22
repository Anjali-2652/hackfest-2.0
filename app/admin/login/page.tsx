"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadUsersFromLS, setAuth, isAuthenticated } from "../../../lib/data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = loadUsersFromLS();
    setUsers(u && u.length > 0 ? u : []);
    if (isAuthenticated()) router.push("/admin");
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Check users list first
    const found = users.find((u) => (u.id === username || u.name === username) && u.pass === password);
    if (found) {
      setAuth(found.id || found.name);
      router.push("/admin");
      return;
    }
    // Fallback: allow admin/admin123
    if (username === "admin" && password === "admin123") {
      setAuth("admin");
      router.push("/admin");
      return;
    }
    setMessage("Invalid credentials");
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md bg-[#07101d]/60 rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Login</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username or ID" className="w-full rounded px-3 py-2 bg-transparent" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded px-3 py-2 bg-transparent" />
          <div className="flex items-center justify-between">
            <button type="submit" className="rounded bg-[#00a3ff] px-3 py-1">Sign In</button>
            <button type="button" onClick={() => router.push("/")} className="text-sm text-white/60">Back</button>
          </div>
        </form>
        {message && <div className="mt-3 text-sm text-red-400">{message}</div>}
      </div>
    </main>
  );
}
