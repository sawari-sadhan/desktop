"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Globe, 
  Save, 
  DollarSign, 
  CheckCircle2, 
  Layers, 
  AlertCircle,
  Search,
  X,
  Tag,
  Check,
  Eye,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";
import { COUNTRIES, STATUS_OPTIONS } from "../countries";

export default function AddAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || "";
  const modelSlug = (params.modelSlug as string) || "";
  const variantSlug = (params.variantSlug as string) || "";

  const basePath = `/console/brand/${slug}/model/${modelSlug}/variant/${variantSlug}/availability`;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [selectedCountryCode, setSelectedCountryCode] = useState("np");
  const [countryFilter, setCountryFilter] = useState("");
  const [pricingMode, setPricingMode] = useState<"range" | "single">("range");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [singlePrice, setSinglePrice] = useState("");
  const [status, setStatus] = useState("available");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadVariant = async () => {
      if (!variantSlug) return;
      setIsLoading(true);
      try {
        const res = await graphClient.getNode({ id: "", slug: variantSlug });
        if (res.node) {
          setVariant(res.node as any);
        }
      } catch (err) {
        console.error("Failed to load variant:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVariant();
  }, [variantSlug]);

  const activePreset = useMemo(() => {
    return COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  }, [selectedCountryCode]);

  const currentCountryName = activePreset.name;
  const currentCountryCode = activePreset.code;
  const currentCurrency = activePreset.currency;
  const currentSymbol = activePreset.symbol;

  const filteredCountries = useMemo(() => {
    const q = countryFilter.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.region.toLowerCase().includes(q)
    );
  }, [countryFilter]);

  const minNum = parseFloat(pricingMode === "range" ? minPrice : singlePrice) || 0;
  const maxNum = parseFloat(pricingMode === "range" ? (maxPrice || minPrice) : singlePrice) || 0;
  const baseNum = parseFloat(pricingMode === "single" ? singlePrice : (minPrice || maxPrice)) || 0;

  // Readiness score
  const isPriceValid = minNum > 0 || maxNum > 0 || baseNum > 0;
  const completionPercent = Math.min(
    100,
    (selectedCountryCode ? 35 : 0) +
    (isPriceValid ? 35 : 0) +
    (status ? 20 : 0) +
    (notes.trim() ? 10 : 0)
  );

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!variant) {
      setErrorMessage("Variant information not loaded yet.");
      return;
    }

    if (!isPriceValid) {
      setErrorMessage("Please enter a valid price or price range greater than 0.");
      return;
    }

    if (pricingMode === "range" && maxNum < minNum && maxNum > 0) {
      setErrorMessage("Maximum price cannot be less than Minimum price.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      // 1. Find or create the country node
      let countryNodeId = "";
      try {
        const cRes = await graphClient.getNode({ id: "", slug: currentCountryCode });
        if (cRes.node?.id) {
          countryNodeId = cRes.node.id;
        }
      } catch {
        // Node not found yet, create below
      }

      if (!countryNodeId) {
        const newC = await graphClient.createNode({
          type: "country",
          slug: currentCountryCode,
          name: { en: currentCountryName },
          description: { en: `Geographic region configuration for ${currentCountryName}` },
          tags: [currentCountryCode],
          metadata: { context: "System Setup" },
          data: { 
            currency_code: currentCurrency, 
            currency_symbol: currentSymbol || currentCurrency 
          }
        });
        if (newC.node?.id) {
          countryNodeId = newC.node.id;
        }
      }

      if (!countryNodeId) {
        throw new Error("Unable to create or retrieve country node in registry.");
      }

      // 2. Add or update the available_in link
      await graphClient.addLink({
        sourceId: variant.id,
        targetId: countryNodeId,
        linkType: "available_in",
        metadata: {
          status: status,
          price: baseNum,
          min_price: minNum,
          max_price: maxNum,
          currency: currentCurrency,
          currency_symbol: currentSymbol || currentCurrency,
          notes: notes.trim()
        }
      });

      // Navigate back to availability list
      router.push(basePath);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to add availability:", err);
      setErrorMessage(err.message || "An error occurred while saving availability.");
      setIsSaving(false);
    }
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-3xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Availability"}</span>
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (8 cols) matching sample/form layout */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section 1: Country / Target Market matching sample/form */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Target Country & Geographic Market
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Select target sales country from automotive registry presets
                    </p>
                  </div>
                </div>

                {/* Active Country Overview Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-lg">{activePreset.flag}</span>
                  <span className="text-xs font-bold text-slate-800">{activePreset.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">({activePreset.currency})</span>
                </div>
              </div>

              {/* Quick Country Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter country list..."
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Country Pill Chips Grid */}
              <div className="flex items-center gap-2 flex-wrap max-h-56 overflow-y-auto pr-1">
                {filteredCountries.map((c) => {
                  const isSelected = selectedCountryCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountryCode(c.code)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-sm">{c.flag}</span>
                      <span>{c.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {c.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Pricing Structure & Model matching sample/form */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Pricing Structure & Model
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Configure ex-showroom or regional retail valuation in {activePreset.name} ({activePreset.currency})
                    </p>
                  </div>
                </div>

                {/* Segmented Toggle matching sample */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPricingMode("range")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pricingMode === "range"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Price Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("single")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pricingMode === "single"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Fixed Base Price
                  </button>
                </div>
              </div>

              {pricingMode === "range" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Minimum / Starting Price *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                        {currentSymbol || currentCurrency}
                      </div>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="e.g. 24000000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                    {minPrice && (
                      <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Preview: {currentCurrency} {Number(minPrice).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Maximum / Top-Trim Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                        {currentSymbol || currentCurrency}
                      </div>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 28500000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                    {maxPrice && (
                      <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Preview: {currentCurrency} {Number(maxPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Exact Base / Ex-Showroom Price *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                      {currentSymbol || currentCurrency}
                    </div>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 25000000"
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                  {singlePrice && (
                    <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Preview: {currentCurrency} {Number(singlePrice).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Commercial Availability Phase */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Availability Phase
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Select market launch readiness and showroom distribution state
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold">{opt.label}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <p className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {opt.value === "available" && "Live showroom stock"}
                        {opt.value === "booking_open" && "Pre-orders accepted"}
                        {opt.value === "upcoming" && "Pending release"}
                        {opt.value === "discontinued" && "Archived trim"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Regional Notes & Conditions */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Regional Notes & Commercial Remarks
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Optional disclosures regarding duties, taxes, delivery timelines, or warranty
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="e.g. Ex-showroom Kathmandu, Import customs paid, 10% advance deposit required for delivery allocation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Sticky Sidebar (4 cols) matching sample/form */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Live Inspector Preview Card */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview Inspector
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Preview Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Target Market
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {activePreset.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">{activePreset.region}</span>
                  </div>
                  <span className="text-3xl">{activePreset.flag}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pricing Status
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {pricingMode === "range"
                      ? `${activePreset.symbol || activePreset.currency} ${Number(minPrice || 0).toLocaleString()} - ${Number(maxPrice || 0).toLocaleString()}`
                      : `${activePreset.symbol || activePreset.currency} ${Number(singlePrice || 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Lifecycle Status</span>
                  <span className="capitalize text-slate-900 font-bold">
                    {status.replace("_", " ")}
                  </span>
                </div>

                {notes.trim() && (
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 font-normal">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Notes
                    </span>
                    <p className="line-clamp-2 leading-relaxed">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist & Readiness */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Readiness Score
                </span>
                <span className="text-xs font-bold text-slate-900">{completionPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full bg-slate-900 transition-all duration-300 ${
                    completionPercent >= 100 ? "w-full" :
                    completionPercent >= 80 ? "w-4/5" :
                    completionPercent >= 60 ? "w-3/5" :
                    completionPercent >= 40 ? "w-2/5" :
                    completionPercent >= 20 ? "w-1/5" : "w-0"
                  }`}
                />
              </div>

              <div className="space-y-2.5 pt-2 text-xs font-medium">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${selectedCountryCode ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Country identified: {activePreset.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${isPriceValid ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Pricing parameters asserted</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${status ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Commercial availability phase set</span>
                </div>
              </div>
            </div>

            {/* Primary Commitment Action Card */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-3">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving || isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Availability"}</span>
              </button>

              <Link
                href={basePath}
                className="w-full block text-center px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Cancel & Return
              </Link>
            </div>
          </div>
        </form>
      </PageContent>
    </PageLayout>
  );
}
