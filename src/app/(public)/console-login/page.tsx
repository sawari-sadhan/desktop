"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";

/**
 * @SS-Auth-Audit
 * Module: [Login Page]
 * Purpose: [Administrative access portal mirrored with console dashboard UI]
 */

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      setTimeout(() => {
        router.push("/console");
        router.refresh();
      }, 500);
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#0f1117] text-slate-400 font-sans overflow-hidden relative">
      {/* 🌌 Subtle celestial depth - Mirrored from Console Layout */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-4 md:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-slate-900/40 rounded-[2.5rem] border border-white/[0.03] shadow-2xl backdrop-blur-sm p-12 md:p-20 relative overflow-hidden"
        >
          {/* Header Section - Matches Console Style */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-3xl font-black text-slate-100 tracking-tight">Authentication Gateway</h1>
              <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">Secure Administrative Access</p>
            </div>
            <div className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              Security: High
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-md relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Identifier</label>
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-slate-200 transition-colors" />
                <input
                  name="mobile"
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl py-5 pl-16 pr-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Credential</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-slate-200 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl py-5 pl-16 pr-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all text-lg font-medium"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 text-rose-400 text-[10px] uppercase font-bold tracking-wider bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-3xl bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Authorize Entry
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-20 pt-8 border-t border-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol SSLv3</p>
                <p className="text-[9px] text-slate-600 mt-0.5">End-to-End Encryption Active</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
