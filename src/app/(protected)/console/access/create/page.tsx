"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, KeyRound, CheckCircle, AlertTriangle, Loader2, UserPlus } from "lucide-react";
import { consoleRegisterAction } from "@lib/auth";

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  minLength?: number;
};

function Field({ id, name, label, type = "text", placeholder, required, icon: Icon, hint, minLength }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CreateConsoleAccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (formData.get("password") !== formData.get("confirm")) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await consoleRegisterAction(formData);
    if (result.success) {
      setSuccess(result.message || "Console access granted.");
      setTimeout(() => router.push("/console/access"), 1800);
    } else {
      setError(result.error || "Failed to create console account.");
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full max-w-3xl space-y-8">


        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12 text-center"
              >
                <div className="p-4 bg-emerald-50 rounded-full border border-emerald-200 mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Access Granted</h2>
                <p className="text-sm text-slate-500">{success}</p>
                <p className="text-xs text-slate-400 mt-4 animate-pulse">Returning to access list...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                id="access-create-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Field id="access-name" name="name" label="Full Name" placeholder="John Bahadur Doe" required icon={User} hint="First and last name are required." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field id="access-email" name="email" type="email" label="Email Address" placeholder="admin@domain.com" required icon={Mail} />
                  <Field id="access-mobile" name="mobile" type="tel" label="Mobile" placeholder="98XXXXXXXX" icon={Phone} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field id="access-password" name="password" type="password" label="Password" required minLength={6} icon={KeyRound} />
                  <Field id="access-confirm" name="confirm" type="password" label="Confirm Password" required minLength={6} icon={KeyRound} />
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/console/access"
                    className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Link>
                  <button
                    id="access-submit"
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 disabled:opacity-60 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
