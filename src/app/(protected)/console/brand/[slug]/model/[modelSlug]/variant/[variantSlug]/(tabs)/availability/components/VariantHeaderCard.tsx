"use client";

import React from "react";
import Link from "next/link";
import { Car, Globe, MapPin, Tag, Layers, ChevronRight } from "lucide-react";
import { EntityNode } from "@lib/core";

interface VariantHeaderCardProps {
  variant: EntityNode | null;
  brandSlug: string;
  modelSlug: string;
  variantSlug: string;
  actionBadge?: string;
  subtitle?: string;
  marketCount?: number;
  activeCurrency?: string;
}

export function VariantHeaderCard({
  variant,
  brandSlug,
  modelSlug,
  variantSlug,
  actionBadge,
  subtitle,
  marketCount,
  activeCurrency
}: VariantHeaderCardProps) {
  const getVariantName = (v: EntityNode | null, fallback: string): string => {
    if (!v) return fallback.replace(/-/g, " ");
    const n = v.name as any;
    if (n && typeof n === "object") {
      return String(n.en || n.default || v.slug || fallback.replace(/-/g, " "));
    }
    return String(v.name || v.slug || fallback.replace(/-/g, " "));
  };

  const displayName = getVariantName(variant, variantSlug);
  const modelName = modelSlug.replace(/-/g, " ");
  const brandName = brandSlug.replace(/-/g, " ");
  const bodyType = (variant?.data as any)?.body_type || (variant?.metadata as any)?.vehicleType || "Variant";
  const fuelType = (variant?.data as any)?.fuel_type || (variant?.metadata as any)?.fuelType;

  return (
    <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-6">
          {/* Avatar Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            <Car className="w-8 h-8 text-white" />
          </div>

          <div>
            {/* Meta Tags & Breadcrumb Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {actionBadge || "Market Availability"}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                {brandName} • {modelName}
              </span>

              {fuelType && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium capitalize">
                  {fuelType}
                </span>
              )}

              <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-mono font-semibold">
                {variantSlug}
              </span>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2 capitalize">
              {displayName}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
              {subtitle || "Master Knowledge Graph Trim Node • Global Automotive Territory & Regional Pricing"}
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        {(typeof marketCount === "number" || activeCurrency) && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            {typeof marketCount === "number" && (
              <div className="text-center px-4 py-1.5 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Markets
                </span>
                <span className="text-sm font-black text-slate-900">
                  {marketCount} Countries
                </span>
              </div>
            )}
            {activeCurrency && (
              <div className="text-center px-4 py-1.5 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Base Currency
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {activeCurrency}
                </span>
              </div>
            )}
            <div className="text-center px-4 py-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {bodyType}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
