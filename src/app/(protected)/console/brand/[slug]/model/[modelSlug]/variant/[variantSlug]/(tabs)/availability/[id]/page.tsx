"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Globe, 
  Save, 
  DollarSign, 
  CheckCircle2, 
  Layers, 
  Trash2, 
  AlertCircle,
  Check,
  Tag,
  Eye,
  MapPin,
  ArrowRight
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";
import { COUNTRIES, STATUS_OPTIONS } from "../countries";

export default function EditAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || "";
  const modelSlug = (params.modelSlug as string) || "";
  const variantSlug = (params.variantSlug as string) || "";
  const countryId = (params.id as string) || "";

  const basePath = `/console/brand/${slug}/model/${modelSlug}/variant/${variantSlug}/availability`;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [country, setCountry] = useState<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [pricingMode, setPricingMode] = useState<"range" | "single">("range");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [singlePrice, setSinglePrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState("available");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!variantSlug || !countryId) return;
      setIsLoading(true);
      setIsNotFound(false);
      try {
        // 1. Load variant node
        const vRes = await graphClient.getNode({ id: "", slug: variantSlug });
        if (!vRes.node || !vRes.node.id) {
          setIsNotFound(true);
          return;
        }
        const vNode: EntityNode = vRes.node as any;
        setVariant(vNode);

        // 2. Load neighbors to find country and existing available_in link
        const neighbors = await graphClient.getNeighbors({
          nodeId: vNode.id,
          linkTypes: ["available_in"]
        });

        const linkedCountries = (neighbors.nodes || []).filter(n => n.type === "country");
        let matchedCountry = linkedCountries.find(
          c => c.id === countryId || c.slug.toLowerCase() === countryId.toLowerCase()
        );

        // If not directly found in neighbors, try fetching node by ID or slug
        if (!matchedCountry) {
          try {
            const cRes = await graphClient.getNode(
              countryId.includes("-") && countryId.length > 20
                ? { id: countryId, slug: "" }
                : { id: "", slug: countryId }
            );
            if (cRes.node?.id) {
              matchedCountry = cRes.node as any;
            }
          } catch {
            // Not found
          }
        }

        if (!matchedCountry) {
          setIsNotFound(true);
          return;
        }
        setCountry(matchedCountry as any);

        // 3. Find the link metadata
        const links = (neighbors as any).links || [];
        const link = links.find((l: any) => l.targetId === matchedCountry?.id || l.sourceId === matchedCountry?.id);
        const meta = link?.metadata || {};

        // Find preset defaults for fallback
        const preset = COUNTRIES.find(p => p.code.toLowerCase() === matchedCountry?.slug.toLowerCase());

        const pCurrency = meta.currency || (matchedCountry.data as any)?.currency_code || preset?.currency || "USD";
        const pSymbol = meta.currency_symbol || (matchedCountry.data as any)?.currency_symbol || preset?.symbol || "$";
        const pStatus = meta.status || "available";
        const pNotes = meta.notes || "";
        const pMin = meta.min_price || meta.minPrice || "";
        const pMax = meta.max_price || meta.maxPrice || "";
        const pBase = meta.price || "";

        setCurrency(pCurrency);
        setSymbol(pSymbol);
        setStatus(pStatus);
        setNotes(pNotes);

        if (pMin && pMax && Number(pMin) !== Number(pMax)) {
          setPricingMode("range");
          setMinPrice(String(pMin));
          setMaxPrice(String(pMax));
        } else if (pMin && !pMax) {
          setPricingMode("single");
          setSinglePrice(String(pMin));
        } else if (pBase) {
          setPricingMode("single");
          setSinglePrice(String(pBase));
        }
      } catch (err) {
        console.error("Failed to load country availability details:", err);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [variantSlug, countryId]);

  const minNum = parseFloat(pricingMode === "range" ? minPrice : singlePrice) || 0;
  const maxNum = parseFloat(pricingMode === "range" ? (maxPrice || minPrice) : singlePrice) || 0;
  const baseNum = parseFloat(pricingMode === "single" ? singlePrice : (minPrice || maxPrice)) || 0;
  const isPriceValid = minNum > 0 || maxNum > 0 || baseNum > 0;

  const completionPercent = Math.min(
    100,
    (country ? 35 : 0) +
    (isPriceValid ? 35 : 0) +
    (status ? 20 : 0) +
    (notes.trim() ? 10 : 0)
  );

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!variant || !country) return;

    if (!isPriceValid) {
      setErrorMessage("Please enter a valid price greater than 0.");
      return;
    }

    if (pricingMode === "range" && maxNum < minNum && maxNum > 0) {
      setErrorMessage("Maximum price cannot be less than Minimum price.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await graphClient.addLink({
        sourceId: variant.id,
        targetId: country.id,
        linkType: "available_in",
        metadata: {
          status: status,
          price: baseNum,
          min_price: minNum,
          max_price: maxNum,
          currency: currency.toUpperCase().trim(),
          currency_symbol: symbol.trim(),
          notes: notes.trim()
        }
      });

      setSuccessMessage("Country availability and pricing updated successfully.");
      setTimeout(() => {
        router.push(basePath);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to update availability:", err);
      setErrorMessage(err.message || "An error occurred while saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!variant || !country) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await graphClient.removeLink({
        sourceId: variant.id,
        targetId: country.id,
        linkType: "available_in"
      });
      router.push(basePath);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to remove availability link:", err);
      setErrorMessage(err.message || "Failed to remove country availability.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const preset = country ? COUNTRIES.find(p => p.code.toLowerCase() === country.slug.toLowerCase()) : null;
  const flag = preset?.flag || "🌐";
  const countryDisplayName = (country?.name as any)?.en || country?.slug?.toUpperCase() || "Country";

  if (isNotFound) {
    return (
      <PageLayout className={theme.layout.pageContainer}>
        <PageContent className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-lg space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <Globe className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Availability Not Found</h1>
            <p className="text-slate-500 text-xs leading-relaxed">
              The country configuration for <strong className="text-slate-700">"{countryId}"</strong> does not exist or is not linked to this variant.
            </p>
            <div className="pt-2">
              <Link
                href={basePath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold"
              >
                <span>Back to Availability</span>
              </Link>
            </div>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>{null}</TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (8 cols) matching sample/form layout */}
          <div className="lg:col-span-8 space-y-8">
            {/* Country Identity Section */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-2xs shrink-0">
                  <span>{flag}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900">{countryDisplayName}</h2>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold uppercase rounded-lg border border-slate-200/60">
                      {country?.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {preset?.region || "International Region"} · Default Currency: {currency} ({symbol || currency})
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Section matching sample/form */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Pricing & Price Range
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Update ex-showroom or retail price range for this market in {currency}
                    </p>
                  </div>
                </div>

                {/* Segmented Toggle */}
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

              {/* Currency & Symbol Customization Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Currency ISO Code
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Currency Symbol Prefix
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {pricingMode === "range" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Minimum / Starting Price *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none font-mono">
                        {symbol || currency}
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
                        Preview: {currency} {Number(minPrice).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Maximum / Top-Trim Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none font-mono">
                        {symbol || currency}
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
                        Preview: {currency} {Number(maxPrice).toLocaleString()}
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none font-mono">
                      {symbol || currency}
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
                      Preview: {currency} {Number(singlePrice).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Commercial Availability Status Section */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Availability Phase
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Update showroom allocation status and ordering availability
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

            {/* Regional Notes & Conditions Section */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Regional Notes & Commercial Remarks
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Update disclosures regarding duties, taxes, delivery timelines, or warranty
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
                      {countryDisplayName}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {preset?.region || "Regional Territory"}
                    </span>
                  </div>
                  <span className="text-3xl">{flag}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pricing Status
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {pricingMode === "range"
                      ? `${symbol || currency} ${Number(minPrice || 0).toLocaleString()} - ${Number(maxPrice || 0).toLocaleString()}`
                      : `${symbol || currency} ${Number(singlePrice || 0).toLocaleString()}`}
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
                  Configuration Score
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
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Market linked: {countryDisplayName}</span>
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
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>

              <Link
                href={basePath}
                className="w-full block text-center px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Cancel & Return
              </Link>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove this Market</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal matching sample/modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Remove {countryDisplayName} Availability?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  This will remove regional pricing and market availability for this variant. The geographic country node in the graph registry will remain intact.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Keep Market
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  {isDeleting ? "Removing..." : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
}
