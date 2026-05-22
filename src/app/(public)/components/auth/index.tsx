"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";

// ==========================================
// 1. Error Banner Component
// ==========================================
interface ErrorBannerProps {
  error: string | null;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center gap-3 text-rose-400 text-xs font-bold tracking-wide bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="uppercase text-[10px] tracking-wider">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 2. Submit Button Component
// ==========================================
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  theme: "console" | "dashboard";
  text: string;
}

export function SubmitButton({ loading, theme, text, ...props }: SubmitButtonProps) {
  const baseClass =
    "w-full py-4.5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl";

  const themeClass =
    theme === "console"
      ? "bg-slate-100 text-slate-950 hover:bg-white"
      : "bg-teal-500 text-slate-950 hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]";

  return (
    <button type="submit" disabled={loading} className={`${baseClass} ${themeClass}`} {...props}>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {text}
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

// ==========================================
// 3. Input Field Component
// ==========================================
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<any>;
  theme: "console" | "dashboard";
  sizeVariant?: "sm" | "md" | "lg";
}

export function InputField({
  label,
  icon: Icon,
  theme,
  sizeVariant = "md",
  className = "",
  ...props
}: InputFieldProps) {
  // Sizing styles
  const paddingClass =
    sizeVariant === "sm"
      ? "py-3.5 pl-11 pr-4 text-sm font-medium rounded-2xl"
      : sizeVariant === "lg"
      ? "py-5 pl-16 pr-6 text-lg font-medium rounded-3xl"
      : "py-4.5 pl-16 pr-6 text-base font-medium rounded-3xl";

  const iconClass =
    sizeVariant === "sm"
      ? "left-4 w-4 h-4"
      : "left-6 w-5 h-5";

  // Theme styles
  const themeInputClass =
    theme === "console"
      ? "bg-white/[0.02] border-white/[0.05] text-slate-200 placeholder:text-slate-700 focus:border-white/10 focus:bg-white/[0.04]"
      : "bg-white/[0.01] border-white/[0.04] text-slate-200 placeholder:text-slate-700 focus:border-teal-500/30 focus:bg-teal-500/[0.01] shadow-inner";

  const themeIconClass =
    theme === "console"
      ? "group-focus-within:text-slate-200"
      : "group-focus-within:text-teal-400";

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon
            className={`absolute top-1/2 -translate-y-1/2 text-slate-600 transition-colors ${iconClass} ${themeIconClass}`}
          />
        )}
        <input
          className={`w-full border focus:outline-none transition-all ${paddingClass} ${themeInputClass} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

// ==========================================
// 4. PIN Input Component
// ==========================================
interface PinInputProps {
  theme: "console" | "dashboard";
  name?: string;
  required?: boolean;
}

export function PinInput({ theme, name = "password", required = true }: PinInputProps) {
  const [pin, setPin] = useState(["", "", "", ""]);

  const handlePinChange = (value: string, index: number) => {
    if (value !== "" && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      const nextInput = document.getElementById(`auth-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (pin[index] === "" && index > 0) {
        const prevInput = document.getElementById(`auth-pin-${index - 1}`);
        prevInput?.focus();
        const newPin = [...pin];
        newPin[index - 1] = "";
        setPin(newPin);
      } else {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 4 && /^\d+$/.test(pasteData)) {
      setPin(pasteData.split(""));
      document.getElementById("auth-pin-3")?.focus();
    }
  };

  const borderFocusClass =
    theme === "console"
      ? "focus:border-white/20 focus:bg-white/[0.04]"
      : "focus:border-teal-500/30 focus:bg-teal-500/[0.01]";

  const borderBaseClass =
    theme === "console"
      ? "bg-white/[0.02] border-white/[0.05]"
      : "bg-white/[0.01] border-white/[0.04]";

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        Access PIN {required && "*"} (4 Digits)
      </label>
      <div className="flex gap-4 items-center">
        {pin.map((digit, idx) => (
          <input
            key={idx}
            id={`auth-pin-${idx}`}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handlePinChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={idx === 0 ? handlePaste : undefined}
            required={required}
            className={`w-16 h-16 text-center text-2xl font-black rounded-2xl text-slate-200 focus:outline-none transition-all border ${borderBaseClass} ${borderFocusClass}`}
          />
        ))}
      </div>
      <input type="hidden" name={name} value={pin.join("")} />
    </div>
  );
}

// ==========================================
// 5. Auth Card Layout Component
// ==========================================
interface AuthCardLayoutProps {
  children: React.ReactNode;
  theme: "console" | "dashboard";
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon?: React.ReactNode;
  scrollable?: boolean;
  footerContent?: React.ReactNode;
}

export function AuthCardLayout({
  children,
  theme,
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon,
  scrollable = false,
  footerContent,
}: AuthCardLayoutProps) {
  // Page container styles
  const bgClass = theme === "console" ? "bg-[#0f1117]" : "bg-[#121218]";
  const heightClass = scrollable
    ? "min-h-screen overflow-y-auto py-12 md:py-20"
    : "h-screen overflow-hidden";

  // Glow element colors
  const glowTopClass =
    theme === "console" ? "bg-blue-500/[0.03]" : "bg-teal-500/[0.03]";
  const glowBottomClass =
    theme === "console" ? "bg-slate-400/[0.02]" : "bg-cyan-500/[0.03]";

  // Card classes
  const cardBgClass =
    theme === "console"
      ? "bg-slate-900/40 backdrop-blur-sm p-12 md:p-20"
      : "bg-slate-950/40 backdrop-blur-md p-8 md:p-16";

  const badgeTextClass = theme === "console" ? "text-slate-300" : "text-teal-300";

  return (
    <div className={`flex text-slate-400 font-sans relative ${heightClass} ${bgClass}`}>
      {/* 🌌 Atmospheric Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] md:blur-[140px] ${glowTopClass}`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] md:blur-[140px] ${glowBottomClass}`}
        />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <motion.div
          initial={
            theme === "console"
              ? { opacity: 0, scale: 0.98 }
              : { opacity: 0, y: 15 }
          }
          animate={
            theme === "console"
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`w-full max-w-2xl rounded-[2.5rem] border border-white/[0.03] shadow-2xl relative overflow-hidden ${cardBgClass}`}
        >
          {/* Decorative Top Accent line (dashboard only) */}
          {theme === "dashboard" && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2">
                {BadgeIcon && BadgeIcon}
                <h1 className="text-3xl font-black text-slate-100 tracking-tight">{title}</h1>
              </div>
              <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">
                {subtitle}
              </p>
            </div>
            <div
              className={`px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${badgeTextClass}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  theme === "console" ? "bg-slate-400" : "bg-teal-400"
                }`}
              />
              {badgeText}
            </div>
          </div>

          {/* Main Form/Content */}
          {children}

          {/* Footer Navigation */}
          {footerContent && (
            <div className="mt-12 pt-6 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
              {footerContent}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
