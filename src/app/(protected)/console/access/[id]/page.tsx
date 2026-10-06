"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, CalendarDays, ShieldCheck, AlertTriangle, UserCircle2, KeyRound, Loader2, CheckCircle } from "lucide-react";
import { getConsoleAccountAction, adminChangePasswordAction, type AccountDetail } from "@lib/auth";

function initials(first: string, last: string) {
  const f = first?.[0]?.toUpperCase() || "";
  const l = last?.[0]?.toUpperCase() || "";
  return f + l || "?";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function ConsoleAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.append("memberId", id);

    if (formData.get("password") !== formData.get("confirm")) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    const res = await adminChangePasswordAction(formData);
    if (res.success) {
      setPasswordSuccess(res.message || "Password updated successfully.");
      (e.target as HTMLFormElement).reset();
    } else {
      setPasswordError(res.error);
    }
    setPasswordLoading(false);
  }

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      const res = await getConsoleAccountAction(id);
      if (res.success) {
        setAccount(res.account);
      } else {
        setError(res.error);
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full max-w-4xl mx-auto space-y-8">


        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </motion.div>
          ) : account ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden"
            >
              {/* Profile Header Card */}
              <div className="relative h-32 bg-slate-900">
                <div className="absolute -bottom-12 left-10 w-24 h-24 bg-white rounded-2xl p-1 shadow-sm">
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-800 text-3xl font-black">
                    {initials(account.firstName, account.lastName)}
                  </div>
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold text-white uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {account.memberType}
                </div>
              </div>

              {/* Main Details */}
              <div className="pt-16 pb-10 px-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {[account.firstName, account.middleName, account.lastName].filter(Boolean).join(" ")}
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-1">ID: {account.memberId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                          <p className="text-sm font-medium text-slate-900">{account.email || "Not Provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number</p>
                          <p className="text-sm font-medium text-slate-900">{account.mobile || "Not Provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">
                      Account Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Member Since</p>
                          <p className="text-sm font-medium text-slate-900">{formatDate(account.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <UserCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Last Updated</p>
                          <p className="text-sm font-medium text-slate-900">{formatDate(account.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {account && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-10"
            >
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Administrative Password Reset</h3>
                  <p className="text-xs text-slate-500">Force a password change for this account.</p>
                </div>
              </div>

              {passwordSuccess ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="p-3 bg-emerald-50 rounded-full border border-emerald-200 mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Password Changed</h4>
                  <p className="text-xs text-slate-500">{passwordSuccess}</p>
                  <button
                    onClick={() => setPasswordSuccess(null)}
                    className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Reset Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        New Password <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Confirm Password <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        name="confirm"
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 disabled:opacity-60 transition-all"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      {passwordLoading ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
