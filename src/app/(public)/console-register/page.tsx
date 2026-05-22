"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { consoleRegisterAction as registerAction } from "@lib/auth";
import {
  AuthCardLayout,
  InputField,
  PinInput,
  SubmitButton,
  ErrorBanner,
} from "../components/auth";

/**
 * @SS-Auth-Audit
 * Module: [Console Register Page]
 * Purpose: [Administrative account registration portal mirrored with console UI theme]
 */

export default function ConsoleRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      setSuccess(result.message || "Registration request completed successfully.");
      setTimeout(() => {
        router.push("/console-login");
      }, 2500);
    } else {
      setError(result.error || "Registration failed.");
      setLoading(false);
    }
  }

  const footer = (
    <>
      <Link
        href="/console-login"
        className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 transition-colors" />
        Already registered? Sign In
      </Link>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
        ))}
      </div>
    </>
  );

  return (
    <AuthCardLayout
      theme="console"
      title="Registration Gateway"
      subtitle="Create Administrative Account"
      badgeText="Level: Console"
      scrollable={true}
      footerContent={footer}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-100 mb-2">Registration Complete!</h2>
            <p className="text-slate-400 max-w-sm text-sm mb-6">{success}</p>
            <p className="text-xs text-emerald-400 animate-pulse">Redirecting to login portal...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
            <InputField
              name="name"
              type="text"
              required
              placeholder="John Bahadur Doe"
              label="Full Name *"
              icon={User}
              theme="console"
            />

            <InputField
              name="email"
              type="email"
              required
              placeholder="admin@domain.com"
              label="Email Address *"
              icon={Mail}
              theme="console"
            />

            <InputField
              name="mobile"
              type="tel"
              placeholder="98XXXXXXXX"
              label="Mobile Identifier"
              icon={Phone}
              theme="console"
            />

            <PinInput theme="console" />

            <ErrorBanner error={error} />

            <SubmitButton loading={loading} theme="console" text="Register Account" />
          </form>
        )}
      </AnimatePresence>
    </AuthCardLayout>
  );
}



