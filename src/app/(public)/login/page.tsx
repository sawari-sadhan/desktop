"use client";

import { useState } from "react";
import { Phone, Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { memberLoginAction as loginAction } from "@lib/auth";
import {
  AuthCardLayout,
  InputField,
  PinInput,
  SubmitButton,
  ErrorBanner,
} from "../components/auth";

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

  const footer = (
    <>
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
    </>
  );

  return (
    <AuthCardLayout
      theme="dashboard"
      title="Sawari Sadhan"
      subtitle="Vehicle Intelligence Dashboard Login"
      badgeText="Member Access"
      badgeIcon={<Sparkles className="w-5 h-5 text-teal-400" />}
      footerContent={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md relative z-10">
        <InputField
          name="mobile"
          type="tel"
          required
          placeholder="98XXXXXXXX"
          label="Mobile Identifier"
          icon={Phone}
          theme="dashboard"
        />

        <PinInput theme="dashboard" />

        <ErrorBanner error={error} />

        <SubmitButton loading={loading} theme="dashboard" text="Authenticate" />
      </form>
    </AuthCardLayout>
  );
}

