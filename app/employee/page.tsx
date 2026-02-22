"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser, isAuthenticated, clearAuth, loadDatasetFromLS } from "../../lib/data";

const API_BASE = "http://127.0.0.1:8000/api";

// Loading skeleton component
const MetricSkeleton = () => (
  <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-6 shadow-lg animate-pulse">
    <div className="h-4 bg-[#0f2944]/50 rounded w-1/2 mb-4"></div>
    <div className="h-12 bg-[#0f2944]/50 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-[#0f2944]/50 rounded w-2/3"></div>
  </div>
);

export default function EmployeePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected">("disconnected");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Employee profile data
  const [employeeProfile, setEmployeeProfile] = useState({
    name: "Ahmed Tariq",
    id: "EMP-001",
    department: "Sales",
    avatar: "AT",
    avatarColor: "#FF8A65",
    riskLevel: "HIGH",
    violationRate: 60,
    orgAvgViolationRate: 86.9,
    cssAvg: 3.2,
    policyMinCss: 3.5,
    targetsHit: 4,
    totalTargets: 12,
    violations: 27,
    totalRecords: 45,
    monthlyData: [] as any[],
    violation_types: [] as string[],
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", color: "from-[#00ffd0] to-[#00a3ff]" },
    { id: "reports", label: "My Reports", icon: "📄", color: "from-emerald-400 to-cyan-400" },
    { id: "violations", label: "Violations", icon: "⚠️", color: "from-rose-400 to-red-500" },
    { id: "performance", label: "Performance", icon: "📈", color: "from-amber-400 to-orange-500" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆", color: "from-purple-400 to-pink-500" },
  ];

  // Real-time data fetching
  const fetchEmployeeData = async (empId: string) => {
    try {
      const response = await fetch(`${API_BASE}/employees/${empId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeProfile((prev) => ({ ...prev, ...data }));
        setApiStatus("connected");
        setLastUpdate(new Date().toLocaleTimeString());
        return true;
      }
    } catch (error) {
      setApiStatus("disconnected");
      return false;
    }
  };

  const fetchMonthlyData = async (empId: string) => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/monthly-violations?employee_id=${empId}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data);
        setEmployeeProfile((prev) => ({ ...prev, monthlyData: data }));
        setApiStatus("connected");
      }
    } catch (error) {
      setApiStatus("disconnected");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (!isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    const auth = getAuthUser();
    const empId = auth?.userId ?? "EMP-001";
    setUser(empId);

    const ds = loadDatasetFromLS();
    setRows(ds || []);

    // Initial fetch
    const initFetch = async () => {
      setIsLoading(true);
      await Promise.all([fetchEmployeeData(empId), fetchMonthlyData(empId)]);
      setIsLoading(false);
    };

    initFetch();

    // Real-time refresh - every 5 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchEmployeeData(empId);
      fetchMonthlyData(empId);
    }, 5000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [router]);

  function logout() {
    clearAuth();
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    router.push("/");
  }

  // Risk level color mapping
  const getRiskColor = (level: string) => {
    if (level === "HIGH") return "from-rose-500 to-red-600";
    if (level === "MEDIUM") return "from-amber-500 to-orange-600";
    return "from-emerald-500 to-teal-600";
  };

  // Risk level badge color
  const getRiskBadgeColor = (level: string) => {
    if (level === "HIGH") return "border-rose-500/50 bg-rose-500/20 text-rose-300";
    if (level === "MEDIUM") return "border-amber-500/50 bg-amber-500/20 text-amber-300";
    return "border-emerald-500/50 bg-emerald-500/20 text-emerald-300";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#07101d] via-[#0a1628] to-[#051220]">
      {/* Sidebar Navigation */}
      <aside className="w-24 bg-gradient-to-b from-[#051018] via-[#061425] to-[#051018] border-r border-[#0f2944] flex flex-col items-center py-8 space-y-6 shadow-2xl sticky top-0 h-screen">
        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center gap-4 mt-4">
          {navItems.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => setActiveNav(item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 relative overflow-hidden group ${
                  activeNav === item.id
                    ? `bg-gradient-to-br ${item.color} shadow-lg scale-110`
                    : "bg-[#0b1320] hover:bg-[#0f2944] text-white/70 hover:text-white"
                }`}
              >
                <span className="relative z-10">{item.icon}</span>
                {activeNav === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                )}
              </button>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#0b1320] text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg border border-[#0f2944]">
                {item.label}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-[#0f2944]">
          <button
            onClick={logout}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center text-xl hover:from-rose-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 min-h-screen">
          {/* Real-time Status Bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`w-3 h-3 rounded-full ${apiStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shadow-lg`}></div>
              <span className="text-xs text-white/70 font-semibold">
                {apiStatus === "connected" ? "🔄 Live Data" : "📴 Offline Mode"}
              </span>
              {lastUpdate && <span className="text-xs text-white/50">Last updated: {lastUpdate}</span>}
            </div>
          </div>

          {/* Dashboard View */}
          {activeNav === "dashboard" && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Profile Header */}
              <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-r from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-bold text-[#051018] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: employeeProfile.avatarColor }}
                  >
                    {employeeProfile.avatar}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-2">
                      {employeeProfile.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-sm font-semibold text-[#00ffd0] bg-[#00ffd0]/10 px-3 py-1 rounded-full">
                        {employeeProfile.id}
                      </span>
                      <span className="text-sm text-blue-400">•</span>
                      <span className="text-sm text-white/70">{employeeProfile.department}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3">
                      <div className={`px-4 py-2 rounded-lg border ${getRiskBadgeColor(employeeProfile.riskLevel)} text-xs font-bold flex items-center gap-2 shadow-lg`}>
                        🔴 {employeeProfile.riskLevel} Risk
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                        📊 {employeeProfile.violationRate}% Violation Rate
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                        ⭐ CSS Avg: {employeeProfile.cssAvg}
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                        ✓ {employeeProfile.targetsHit}/{employeeProfile.totalTargets} Targets
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  <>
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                  </>
                ) : (
                  <>
                    {/* Violations Card */}
                    <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-[#061425] to-[#051425] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-rose-500/60 group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Violations</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">🔴</div>
                      </div>
                      <div className="text-5xl font-bold text-rose-400 mb-2 animate-pulse">
                        {employeeProfile.violations}
                      </div>
                      <div className="text-xs text-white/60">out of {employeeProfile.totalRecords} records</div>
                      <div className="mt-4 h-1 w-full bg-rose-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500" 
                          style={{ width: `${(employeeProfile.violations / employeeProfile.totalRecords) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Violation Rate Card */}
                    <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-[#061425] to-[#051425] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-rose-500/60 group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Violation Rate</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
                      </div>
                      <div className="text-5xl font-bold text-rose-400 mb-2 animate-pulse">
                        {employeeProfile.violationRate}%
                      </div>
                      <div className="text-xs text-white/60">Org avg: {employeeProfile.orgAvgViolationRate}%</div>
                      <div className="mt-4 h-1 w-full bg-rose-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500" 
                          style={{ width: `${employeeProfile.violationRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* CSS Score Card */}
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#061425] to-[#051425] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-500/60 group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">CSS Score</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">⭐</div>
                      </div>
                      <div className="text-5xl font-bold text-amber-400 mb-2 animate-pulse">
                        {employeeProfile.cssAvg}
                      </div>
                      <div className="text-xs text-white/60">Policy min: {employeeProfile.policyMinCss}</div>
                      <div className="mt-4 h-1 w-full bg-amber-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" 
                          style={{ width: `${Math.min((employeeProfile.cssAvg / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Targets Met Card */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-[#061425] to-[#051425] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-cyan-500/60 group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Targets Met</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">🎯</div>
                      </div>
                      <div className="text-5xl font-bold text-cyan-400 mb-2 animate-pulse">
                        {employeeProfile.targetsHit}
                      </div>
                      <div className="text-xs text-white/60">out of {employeeProfile.totalTargets} months</div>
                      <div className="mt-4 h-1 w-full bg-cyan-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                          style={{ width: `${(employeeProfile.targetsHit / employeeProfile.totalTargets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Performance Chart */}
                <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg"></span>
                    Monthly Performance (12-Month Trend)
                  </h3>
                  {employeeProfile.monthlyData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-white/50">Loading chart data...</div>
                  ) : (
                    <div className="h-64 flex flex-col justify-end">
                      <div className="flex items-end justify-between gap-2 px-4 pb-6">
                        {employeeProfile.monthlyData.map((data, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-full text-xs text-white/40 group-hover:text-white/60 transition-colors mb-1">
                              {data.compliant + data.violation}
                            </div>
                            <div className="w-full h-24 flex flex-col justify-end">
                              <div className="flex h-4 bg-[#0b1320]/30 rounded-full overflow-hidden hover:h-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:ring-2 ring-cyan-500/30">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                                  style={{ width: `${(data.compliant / (data.compliant + data.violation)) * 100}%` }}
                                  title={`Compliant: ${data.compliant}`}
                                ></div>
                                <div
                                  className="bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-300"
                                  style={{ width: `${(data.violation / (data.compliant + data.violation)) * 100}%` }}
                                  title={`Violations: ${data.violation}`}
                                ></div>
                              </div>
                            </div>
                            <div className="text-xs text-white/40 font-semibold group-hover:text-white transition-colors">
                              {data.month.slice(0, 3)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-6 text-xs mt-8 pt-6 border-t border-[#0f2944]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-br from-cyan-500 to-cyan-400"></div>
                      <span className="text-white/70 font-medium">Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-br from-rose-500 to-red-400"></div>
                      <span className="text-white/70 font-medium">Violations</span>
                    </div>
                  </div>
                </div>

                {/* Risk Level Circular Chart */}
                <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold text-white mb-8 w-full flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRiskColor(employeeProfile.riskLevel)} shadow-lg`}></span>
                    Risk Assessment
                  </h3>
                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-lg" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#0b1320" strokeWidth="10" opacity="0.5" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#grad1)"
                        strokeWidth="10"
                        strokeDasharray={`${(employeeProfile.violationRate / 100) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={employeeProfile.riskLevel === "HIGH" ? "#FF6B6B" : employeeProfile.riskLevel === "MEDIUM" ? "#FFA726" : "#66BB6A"} />
                          <stop offset="100%" stopColor={employeeProfile.riskLevel === "HIGH" ? "#FF1744" : employeeProfile.riskLevel === "MEDIUM" ? "#FF6F00" : "#43A047"} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text animate-pulse">
                        {employeeProfile.violationRate}%
                      </div>
                      <div className="text-xs text-white/60 mt-2">Violation Rate</div>
                    </div>
                  </div>
                  <div className={`px-6 py-3 rounded-xl border ${getRiskBadgeColor(employeeProfile.riskLevel)} text-sm font-bold shadow-lg`}>
                    🔴 {employeeProfile.riskLevel} Risk Level
                  </div>
                </div>
              </div>

              {/* Violations by Type */}
              {employeeProfile.violation_types && employeeProfile.violation_types.length > 0 && (
                <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-red-500 shadow-lg"></span>
                    Common Violation Types ({employeeProfile.department})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeProfile.violation_types.map((type, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-[#0b1320]/40 border border-[#0f2944] hover:border-rose-500/50 transition-all duration-300 cursor-pointer group">
                        <div className="w-3 h-3 rounded-full bg-rose-500 group-hover:animate-pulse"></div>
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Record History */}
              <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg"></span>
                  Record History
                </h3>
                <div className="overflow-auto rounded-xl border border-[#0f2944] bg-[#0b1320]/40">
                  {rows.length === 0 ? (
                    <div className="text-white/60 p-8 text-center text-sm">
                      📊 No records available. Upload a dataset from the admin panel to view your compliance history.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-white/60 border-b border-[#0f2944] font-semibold bg-[#0b1320]/60">
                          {Object.keys(rows[0]).slice(0, 6).map((k) => (
                            <th key={k} className="px-4 py-4">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((r, i) => (
                          <tr
                            key={i}
                            className="border-b border-[#0f2944]/50 last:border-0 hover:bg-[#0f2944]/30 transition-colors duration-200 cursor-pointer"
                          >
                            {Object.keys(rows[0])
                              .slice(0, 6)
                              .map((k) => (
                                <td key={k} className="px-4 py-4 text-white/80">
                                  {String((r as any)[k] ?? "-")}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {rows.length > 10 && (
                  <div className="text-xs text-white/60 mt-4 text-center">
                    Showing 10 of {rows.length} records
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeNav === "reports" && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-8">My Reports</h1>
              <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl">
                <div className="text-sm text-white/70 mb-6 font-semibold">Compliance Reports ({rows.length} total records)</div>
                <div className="overflow-auto max-h-[70vh] rounded-xl border border-[#0f2944] bg-[#0b1320]/40 p-4">
                  {rows.length === 0 ? (
                    <div className="text-white/60 p-8 text-center">No reports available.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-white/60 border-b border-[#0f2944] font-semibold">
                          {Object.keys(rows[0]).map((k) => (
                            <th key={k} className="pr-4 py-3">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 50).map((r, i) => (
                          <tr key={i} className="border-b border-[#0f2944]/50 last:border-0 hover:bg-[#0f2944]/20 transition-colors duration-200">
                            {Object.keys(rows[0]).map((k) => (
                              <td key={k} className="pr-4 py-3 text-white/80">{String((r as any)[k] ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Violations View */}
          {activeNav === "violations" && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent mb-8">My Violations</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-[#061425] to-[#051425] p-8 shadow-xl">
                  <div className="text-lg font-semibold text-rose-300 mb-3 flex items-center gap-2">🔴 Total Violations</div>
                  <div className="text-5xl font-bold text-rose-400 mb-2">{employeeProfile.violations}</div>
                  <div className="text-sm text-white/60">Out of {employeeProfile.totalRecords} records</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#061425] to-[#051425] p-8 shadow-xl">
                  <div className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">⚠️ Violation Rate</div>
                  <div className="text-5xl font-bold text-amber-400 mb-2">{employeeProfile.violationRate}%</div>
                  <div className="text-sm text-white/60">Org average: {employeeProfile.orgAvgViolationRate}%</div>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-[#061425] to-[#051425] p-8 shadow-xl">
                  <div className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">ℹ️ Compliance Score</div>
                  <div className="text-5xl font-bold text-blue-400 mb-2">{employeeProfile.cssAvg}/10</div>
                  <div className="text-sm text-white/60">Min required: {employeeProfile.policyMinCss}</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance View */}
          {activeNav === "performance" && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent mb-8">Performance Metrics</h1>
              <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-[#0b1320]/40 border border-[#0f2944] hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
                    <div className="text-sm text-white/60 mb-2 font-semibold">Compliance Score</div>
                    <div className="text-4xl font-bold text-amber-400 mb-2">{employeeProfile.cssAvg}/10</div>
                    <div className="h-1 w-full bg-amber-500/20 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${(employeeProfile.cssAvg / 10) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl bg-[#0b1320]/40 border border-[#0f2944] hover:border-cyan-500/50 transition-all duration-300 cursor-pointer">
                    <div className="text-sm text-white/60 mb-2 font-semibold">Target Achievement</div>
                    <div className="text-4xl font-bold text-cyan-400 mb-2">{Math.round((employeeProfile.targetsHit / employeeProfile.totalTargets) * 100)}%</div>
                    <div className="h-1 w-full bg-cyan-500/20 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${(employeeProfile.targetsHit / employeeProfile.totalTargets) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl bg-[#0b1320]/40 border border-[#0f2944] hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                    <div className="text-sm text-white/60 mb-2 font-semibold">Overall Health</div>
                    <div className="text-4xl font-bold text-emerald-400 mb-2">{100 - employeeProfile.violationRate}%</div>
                    <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${100 - employeeProfile.violationRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard View */}
          {activeNav === "leaderboard" && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-8">Organization Leaderboard</h1>
              <div className="rounded-2xl border border-[#0f2944] bg-gradient-to-br from-[#061425] via-[#0a1628] to-[#051425] p-8 shadow-xl">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-white/60 border-b border-[#0f2944] font-semibold">
                      <th className="pr-4 py-3">Rank</th>
                      <th className="pr-4 py-3">Employee</th>
                      <th className="pr-4 py-3">Department</th>
                      <th className="pr-4 py-3">CSS Score</th>
                      <th className="pr-4 py-3">Violation Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank: "🥇", name: "Sarah Mitchell", dept: "Operations", score: 9.1, violation: 5 },
                      { rank: "🥈", name: "James Chen", dept: "IT", score: 6.8, violation: 47 },
                      { rank: "🥉", name: "Ahmed Tariq", dept: "Sales", score: 3.2, violation: 60 },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#0f2944]/50 last:border-0 hover:bg-[#0f2944]/20 transition-colors duration-200">
                        <td className="pr-4 py-4 text-xl">{row.rank}</td>
                        <td className="pr-4 py-4 text-white font-medium">{row.name}</td>
                        <td className="pr-4 py-4 text-white/70">{row.dept}</td>
                        <td className="pr-4 py-4 text-emerald-400 font-bold">{row.score}/10</td>
                        <td className="pr-4 py-4"><span className="text-rose-400 font-bold">{row.violation}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
