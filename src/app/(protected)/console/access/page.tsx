"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, UserPlus, Mail, Phone, CalendarDays, ShieldCheck, AlertTriangle } from "lucide-react";
import { listConsoleAccountsAction, type ConsoleAccount } from "@lib/auth";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ConsoleAccessPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConsoleAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError(null);
    const res = await listConsoleAccountsAction();
    if (res.success) setAccounts(res.accounts);
    else setError(res.error);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.mobile.includes(q)
    );
  }, [accounts, searchTerm]);

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-8">
        {/* Actions */}
        <div className="flex justify-end mb-4">
            <Link
              id="access-create"
              href="/console/access/create"
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Grant Access
            </Link>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-4 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <div className="col-span-4">Administrator</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Mobile</div>
            <div className="col-span-2">Granted</div>
            <div className="col-span-1 text-right">Role</div>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[72px] border-b border-slate-100 last:border-0 animate-pulse bg-slate-50/50" />
              ))
            ) : filtered.length > 0 ? (
              filtered.map((a, idx) => (
                <motion.div
                  key={a.memberId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => router.push(`/console/access/${a.memberId}`)}
                  className="grid grid-cols-12 items-center px-8 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-white flex items-center justify-center text-xs font-black">
                      {initials(a.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{a.name || "Unnamed"}</p>
                      <p className="text-[10px] font-mono text-slate-400">{a.memberId.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-xs text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{a.email || "—"}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {a.mobile || "—"}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-slate-600">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(a.createdAt)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-700">
                      <ShieldCheck className="w-3 h-3" />
                      Console
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No console accounts found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
