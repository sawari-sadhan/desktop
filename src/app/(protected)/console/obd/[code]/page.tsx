"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Zap,
  Info,
  ShieldAlert,
  Loader2,
  FileQuestion,
  Layers,
} from "lucide-react";
import { obdClient } from "@lib/core";
import type { ObdCode } from "@lib/gen/graph_obd_pb";

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  critical: { label: "Critical", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: ShieldAlert },
  high:     { label: "High",     color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: AlertTriangle },
  medium:   { label: "Medium",   color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Zap },
  low:      { label: "Low",      color: "text-slate-500 bg-slate-100 border-slate-200", icon: Info },
};

const getSeverityConfig = (severity: string) =>
  SEVERITY_CONFIG[severity?.toLowerCase()] ?? SEVERITY_CONFIG.low;

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function OBDCodeDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [codeParam, setCodeParam] = useState<string | null>(null);
  const [codeData, setCodeData] = useState<ObdCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unpack the async params using a promise-resolution hook/effect (Next.js 15+ compatible)
  useEffect(() => {
    params
      .then((p) => {
        setCodeParam(p.code);
      })
      .catch((err) => {
        console.error("Failed to resolve route params:", err);
        setError("Failed to load route parameters.");
        setIsLoading(false);
      });
  }, [params]);

  useEffect(() => {
    if (!codeParam) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await obdClient.getObdCode({ code: codeParam });
        if (res && res.obdCode) {
          setCodeData(res.obdCode as ObdCode);
        } else {
          setError(`OBD-II trouble code "${codeParam}" not found in our registry.`);
        }
      } catch (err: any) {
        console.error("Error fetching OBD code:", err);
        setError(err.message || "Failed to load OBD-II code details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [codeParam]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Fetching OBD-II Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !codeData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 min-h-screen">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 text-center shadow-sm backdrop-blur-sm">
          <FileQuestion className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">No Details Found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || `We couldn't find any information for this trouble code.`}
            </p>
          </div>
          <button
            onClick={() => router.push("/console/obd")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  const sev = getSeverityConfig(codeData.severity);
  const SevIcon = sev.icon;

  return (
    <div className="flex-1 p-12 min-h-screen">
      <div className="w-full space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-6">
          <button
            onClick={() => router.push("/console/obd")}
            className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-slate-900 text-3xl tracking-wider bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
                  {codeData.code}
                </span>
                <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${sev.color}`}>
                  <SevIcon className="w-3.5 h-3.5" />
                  {sev.label} Severity
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-relaxed mt-2">
                {codeData.title || "Unknown Trouble Code"}
              </h1>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Diagnostic Information</h2>
          </div>

          {codeData.details && codeData.details.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[...codeData.details]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((detail, idx) => (
                  <motion.div
                    key={detail.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-200 hover:border-blue-200 hover:bg-slate-50 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1.5 block w-fit">
                      {detail.sectionType.replace(/_/g, " ")}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {detail.content}
                    </p>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
              <p className="text-sm text-slate-500 italic">No breakdown details are available for this trouble code yet.</p>
            </div>
          )}
        </div>

        {/* Database ID Footer */}
        <div className="pt-8 border-t border-slate-200 text-center sm:text-left">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            Database Record ID: <span className="break-all">{codeData.id}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
