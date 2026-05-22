"use client";

import { useState } from "react";
import { Phone, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { consoleLoginAction as loginAction } from "@lib/auth";
import {
  AuthCardLayout,
  InputField,
  PinInput,
  SubmitButton,
  ErrorBanner,
} from "../components/auth";

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

  const footer = (
    <>
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
    </>
  );

  return (
    <AuthCardLayout
      theme="console"
      title="Authentication Gateway"
      subtitle="Secure Administrative Access"
      badgeText="Security: High"
      footerContent={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-w-md relative z-10">
        <InputField
          name="mobile"
          type="tel"
          required
          placeholder="98XXXXXXXX"
          label="Mobile Identifier"
          icon={Phone}
          theme="console"
          sizeVariant="lg"
        />

        <PinInput theme="console" />

        <ErrorBanner error={error} />

        <SubmitButton loading={loading} theme="console" text="Authorize Entry" />
      </form>
    </AuthCardLayout>
  );
}

