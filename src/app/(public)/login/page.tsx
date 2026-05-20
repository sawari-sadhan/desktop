"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { memberLoginAction as loginAction } from "@lib/auth";

/**
 * @SS-Auth-Audit
 * Module: [Dashboard Login Page]
 * Purpose: [Secure portal for dashboard-type member access]
 */
export default function MemberLoginPage() {
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
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#121218] text-slate-400 font-sans overflow-hidden relative">
      {/* 🌌 Atmospheric Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-teal-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-cyan-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-4 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl bg-slate-950/40 rounded-[2.5rem] border border-white/[0.03] shadow-2xl backdrop-blur-md p-8 md:p-16 relative overflow-hidden"
        >
          {/* Decorative Top Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h1 className="text-3xl font-black text-slate-100 tracking-tight">Sawari Sadhan</h1>
              </div>
              <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">Vehicle Intelligence Dashboard Login</p>
            </div>
            <div className="px-3.5 py-1.5 bg-white/5 text-teal-300 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Member Access
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md relative z-10">
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full bg-white/[0.01] border border-white/[0.04] rounded-3xl py-4.5 pl-16 pr-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-teal-500/30 focus:bg-teal-500/[0.01] transition-all text-base font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.01] border border-white/[0.04] rounded-3xl py-4.5 pl-16 pr-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-teal-500/30 focus:bg-teal-500/[0.01] transition-all text-base font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Error Message Section */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 text-rose-400 text-xs font-bold tracking-wide bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 rounded-3xl bg-teal-500 text-slate-950 font-black text-sm uppercase tracking-widest hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Navigation / Footer Links */}
          <div className="mt-12 pt-6 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-teal-400 transition-colors uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
              Register New Account
            </Link>

            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-500/20" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
