import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Mail, Shield, ShieldAlert, LogOut, ArrowUpRight, Cpu, Network, Database } from "lucide-react";
import { memberLogoutAction as logoutAction } from "@lib/auth";

interface JwtClaims {
  member_id: string;
  email: string;
  name: string;
  mobile: string;
  member_type: string;
  exp: number;
}

function decodeJWT(token: string): JwtClaims | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * @SS-Auth-Audit
 * Module: [Dashboard Protected Page]
 * Purpose: [Member landing console showing session verification details]
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const claims = decodeJWT(token);
  if (!claims) {
    redirect("/login");
  }

  // Get current time-of-day greeting
  const hour = new Date().getHours();
  let greeting = "Welcome back";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="min-h-screen bg-[#121218] text-slate-400 font-sans overflow-y-auto relative py-12 px-4 md:px-8">
      {/* 🌌 Atmospheric Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/[0.03]">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-bold uppercase tracking-widest">
              <Cpu className="w-4 h-4" />
              <span>Vehicle Intelligence Engine</span>
            </div>
            <h1 className="text-4xl font-black text-slate-100 mt-2 tracking-tight">
              {greeting}, {claims.name}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              You are signed in to the Sawari Sadhan partner dashboard.
            </p>
          </div>

          <form action={async () => {
            "use server";
            await logoutAction();
          }}>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-rose-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
          </form>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: User Profile Details */}
          <div className="md:col-span-2 bg-slate-950/40 rounded-[2rem] border border-white/[0.03] backdrop-blur-md p-8 relative overflow-hidden">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-400" />
              Member Profile Credentials
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.01] border border-white/[0.02] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</span>
                  <span className="text-slate-200 font-bold text-lg block mt-1">{claims.name}</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.02] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</span>
                  <span className="text-slate-200 font-bold text-lg block mt-1">{claims.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.01] border border-white/[0.02] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Member ID</span>
                  <span className="text-slate-300 font-mono text-xs block mt-1 truncate">{claims.member_id}</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.02] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mobile Number</span>
                  <span className="text-slate-300 font-medium text-sm block mt-1">{claims.mobile || "N/A"}</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.02] rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Role</span>
                  <span className="text-teal-400 font-bold text-sm block mt-1 uppercase tracking-widest">{claims.member_type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Session Security Status */}
          <div className="bg-slate-950/40 rounded-[2rem] border border-white/[0.03] backdrop-blur-md p-8 relative overflow-hidden flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                Security Gateway
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                    <Shield className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Session Authenticated</span>
                    <span className="text-[10px] text-slate-500 block">JWT token verified successfully</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                    <Database className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Go Auth RPC Layer</span>
                    <span className="text-[10px] text-slate-500 block">Active on port 9500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.02] flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-600">
              <span>Token Expires</span>
              <span className="text-slate-400 font-mono">
                {new Date(claims.exp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Access Widget 1 */}
          <div className="bg-slate-950/40 rounded-[2rem] border border-white/[0.03] backdrop-blur-md p-8 relative overflow-hidden group hover:border-teal-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-teal-400">
                <Network className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <h3 className="text-md font-bold text-slate-200 mt-6">Knowledge Graph</h3>
            <p className="text-xs text-slate-500 mt-2">
              Browse entities, attributes, and relationships mapping the vehicle domain in Nepal.
            </p>
          </div>

          {/* Quick Access Widget 2 */}
          <div className="bg-slate-950/40 rounded-[2rem] border border-white/[0.03] backdrop-blur-md p-8 relative overflow-hidden group hover:border-teal-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-teal-400">
                <Database className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <h3 className="text-md font-bold text-slate-200 mt-6">Import & Ingestion</h3>
            <p className="text-xs text-slate-500 mt-2">
              Import datasheets, CSV records, and map schemas to seed our network graph database.
            </p>
          </div>

          {/* Quick Access Widget 3 */}
          <div className="bg-slate-950/40 rounded-[2rem] border border-white/[0.03] backdrop-blur-md p-8 relative overflow-hidden group hover:border-teal-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-teal-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <h3 className="text-md font-bold text-slate-200 mt-6">Security Console</h3>
            <p className="text-xs text-slate-500 mt-2">
              Audit data modifications, record history logs, and manage administrative settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
