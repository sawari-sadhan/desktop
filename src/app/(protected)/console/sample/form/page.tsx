"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  DollarSign, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info,
  Image as ImageIcon,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Check,
  RotateCcw,
  Clock,
  ChevronDown
} from "lucide-react";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

interface CustomAttr {
  id: string;
  key: string;
  value: string;
  unit: string;
}

export default function SampleFormPage() {
  // Form State
  const [title, setTitle] = useState("Aston Martin DB12 • Volante");
  const [slug, setSlug] = useState("aston-martin-db12-volante");
  const [isSlugLocked, setIsSlugLocked] = useState(true);
  const [category, setCategory] = useState("Grand Tourer");
  const [description, setDescription] = useState(
    "Super Tourer combining hand-built British craftsmanship with twin-turbo V8 performance and bespoke regional personalization."
  );

  const [selectedCountry, setSelectedCountry] = useState("np");
  const [countrySearch, setCountrySearch] = useState("");
  const [coverageMode, setCoverageMode] = useState<"nationwide" | "metros">("nationwide");

  const [pricingMode, setPricingMode] = useState<"range" | "single">("range");
  const [minPrice, setMinPrice] = useState("42000000");
  const [maxPrice, setMaxPrice] = useState("48500000");
  const [singlePrice, setSinglePrice] = useState("45000000");
  const [isVatIncluded, setIsVatIncluded] = useState(true);
  const [bookingDeposit, setBookingDeposit] = useState("5000000");

  const [status, setStatus] = useState<"available" | "booking_open" | "upcoming" | "discontinued">("booking_open");
  const [deliveryTimeline, setDeliveryTimeline] = useState("90 - 120 Days from Allocation");
  const [isPublic, setIsPublic] = useState(true);

  // Dynamic Key-Value Spec Repeater
  const [attributes, setAttributes] = useState<CustomAttr[]>([
    { id: "1", key: "Engine Displacement", value: "4.0", unit: "L Twin-Turbo V8" },
    { id: "2", key: "Maximum Power", value: "680", unit: "PS / 671 bhp" },
    { id: "3", key: "0 - 100 km/h", value: "3.6", unit: "Seconds" },
    { id: "4", key: "Top Speed", value: "325", unit: "km/h" },
  ]);

  // Media Mock State
  const [uploadedImages, setUploadedImages] = useState([
    { id: "img1", name: "db12_hero_front.jpg", size: "2.4 MB", isPrimary: true },
    { id: "img2", name: "db12_cockpit_view.jpg", size: "3.1 MB", isPrimary: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const countries = [
    { code: "np", name: "Nepal", flag: "🇳🇵", currency: "NPR", symbol: "Rs." },
    { code: "in", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹" },
    { code: "ae", name: "United Arab Emirates", flag: "🇦🇪", currency: "AED", symbol: "AED" },
    { code: "us", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
    { code: "gb", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
    { code: "de", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€" },
    { code: "jp", name: "Japan", flag: "🇯🇵", currency: "JPY", symbol: "¥" },
  ];

  const filteredCountries = countries.filter(
    (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const activeCountry = countries.find((c) => c.code === selectedCountry) || countries[0];

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isSlugLocked) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { id: Date.now().toString(), key: "", value: "", unit: "" },
    ]);
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  const updateAttribute = (id: string, field: keyof CustomAttr, val: string) => {
    setAttributes(
      attributes.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 700);
  };

  // Completion percentage
  const completionPercent = Math.min(
    100,
    (title ? 20 : 0) +
    (selectedCountry ? 20 : 0) +
    ((pricingMode === "range" && minPrice && maxPrice) || (pricingMode === "single" && singlePrice) ? 25 : 0) +
    (attributes.length >= 2 ? 15 : 0) +
    (uploadedImages.length > 0 ? 20 : 0)
  );

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>

        {/* Success Alert Banner */}
        {showToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-medium animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Form simulated successfully: Knowledge graph node attributes & regional pricing committed!</span>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Responsive Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: General Identifiers */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      General Information
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Primary vehicle nomenclature and database URL slug
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                  Required
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Entity / Trim Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Aston Martin DB12 • Volante"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700">
                        URL Identifier / Slug *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSlugLocked(!isSlugLocked)}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        {isSlugLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-amber-500" />}
                        <span>{isSlugLocked ? "Auto-synced" : "Custom"}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        disabled={isSlugLocked}
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-mono font-medium text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-75"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Vehicle Segment / Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="Grand Tourer">Grand Tourer</option>
                        <option value="Supercar">Supercar / Coupe</option>
                        <option value="Executive Sedan">Executive Sedan</option>
                        <option value="Luxury SUV">Luxury SUV</option>
                        <option value="Electric Hypercar">Electric Hypercar</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Commercial Overview Description
                    </label>
                    <span className="text-xs text-slate-400 font-normal">
                      {description.length} / 300 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    maxLength={300}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Regional Country Target */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Target Market & Territory
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Link regional country node to enforce localized currencies & tariffs
                    </p>
                  </div>
                </div>
                <Globe className="w-5 h-5 text-slate-400" />
              </div>

              {/* Country Selection Chips */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {countries.map((c) => {
                    const isSelected = selectedCountry === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setSelectedCountry(c.code)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="text-xl leading-none">{c.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{c.name}</p>
                          <p className={`text-[11px] font-medium ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            {c.currency} ({c.symbol})
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Territory Coverage Toggle */}
                <div className="pt-3 flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">
                    Distribution Scope:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverageMode("nationwide")}
                      className={`px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                        coverageMode === "nationwide"
                          ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                          : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                      }`}
                    >
                      Nationwide Full Registry
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverageMode("metros")}
                      className={`px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                        coverageMode === "metros"
                          ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                          : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                      }`}
                    >
                      Tier-1 Metro Flagships Only
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Numerical Bounds */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Pricing & Commercial Structure
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Ex-showroom price bounds in {activeCountry.name} ({activeCountry.currency})
                    </p>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPricingMode("range")}
                    className={`px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                      pricingMode === "range"
                        ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                        : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Price Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("single")}
                    className={`px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                      pricingMode === "single"
                        ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                        : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Base Price Only
                  </button>
                </div>
              </div>

              {pricingMode === "range" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Minimum / Starting Ex-Showroom *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                        {activeCountry.symbol}
                      </div>
                      <input
                        type="number"
                        required
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                      />
                    </div>
                    {minPrice && (
                      <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Formatted: {activeCountry.currency} {Number(minPrice).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Maximum / Top-Trim Cap
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                        {activeCountry.symbol}
                      </div>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                      />
                    </div>
                    {maxPrice && (
                      <p className="text-[11px] font-semibold text-slate-500 mt-2">
                        Formatted: {activeCountry.currency} {Number(maxPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Exact Standard Base Price *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                      {activeCountry.symbol}
                    </div>
                    <input
                      type="number"
                      required
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* VAT & Booking row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Booking Reservation Deposit
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                      {activeCountry.symbol}
                    </div>
                    <input
                      type="number"
                      value={bookingDeposit}
                      onChange={(e) => setBookingDeposit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-auto">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Customs Duty & VAT Included</p>
                    <p className="text-[11px] text-slate-400 font-normal">Flag for public ex-showroom pricing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isVatIncluded}
                    onChange={(e) => setIsVatIncluded(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Dynamic Technical Attributes Repeater */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Custom Specification Attributes
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Repeater rows for knowledge graph key-value node assertions
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attribute</span>
                </button>
              </div>

              <div className="space-y-3">
                {attributes.map((attr) => (
                  <div 
                    key={attr.id}
                    className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 items-center"
                  >
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Key (e.g. Battery)"
                        value={attr.key}
                        onChange={(e) => updateAttribute(attr.id, "key", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Value (e.g. 93.4)"
                        value={attr.value}
                        onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Unit (e.g. kWh / hp)"
                        value={attr.unit}
                        onChange={(e) => updateAttribute(attr.id, "unit", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAttribute(attr.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove attribute"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Media & Asset Upload Zone */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Media & Vehicle Assets
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Upload high-resolution photography and press kit imagery
                    </p>
                  </div>
                </div>
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Click to browse or drop assets here
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    Supports WebP, PNG, JPEG up to 25MB each
                  </p>
                </div>
              </div>

              {/* File item chips */}
              <div className="space-y-2">
                {uploadedImages.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{img.name}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{img.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {img.isPrimary && (
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider">
                          Primary Hero
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setUploadedImages(uploadedImages.filter((i) => i.id !== img.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Market Status & Governance */}
            <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Commercial Lifecycle Status
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Determine consumer booking readiness and public catalog indexability
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Radio Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "available", label: "Available Now", desc: "Showrooms have floor units" },
                  { value: "booking_open", label: "Booking Open", desc: "Taking client allocations" },
                  { value: "upcoming", label: "Upcoming Preview", desc: "Announced for model year" },
                  { value: "discontinued", label: "Archived / End of Run", desc: "Historical records only" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      status === opt.value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{opt.label}</span>
                      {status === opt.value && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className={`text-[11px] ${status === opt.value ? "text-slate-300" : "text-slate-400"}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Delivery Timeline / Lead Time Guarantee
                </label>
                <input
                  type="text"
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>
            </div>

          </div>

          {/* Right Sticky Sidebar (4 cols) */}
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
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">
                      {category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {title || "Untitled Vehicle"}
                    </h3>
                  </div>
                  <span className="text-2xl">{activeCountry.flag}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pricing Status</span>
                  <span className="text-xs font-bold text-slate-900">
                    {pricingMode === "range"
                      ? `${activeCountry.symbol} ${Number(minPrice || 0).toLocaleString()} - ${Number(maxPrice || 0).toLocaleString()}`
                      : `${activeCountry.symbol} ${Number(singlePrice || 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Lifecycle Status</span>
                  <span className="capitalize text-slate-900 font-bold">{status.replace("_", " ")}</span>
                </div>

                {attributes.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                      Key Capabilities:
                    </span>
                    {attributes.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs font-normal text-slate-600">
                        <span>{a.key || "Custom"}</span>
                        <span className="font-semibold text-slate-900">{a.value} {a.unit}</span>
                      </div>
                    ))}
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
              <div className={theme.ui.progressBarTrack}>
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
                  <Check className={`w-3.5 h-3.5 ${title ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Nomenclature & Slug verified</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${selectedCountry ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Target market localized</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${minPrice ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Pricing bounds asserted</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Check className={`w-3.5 h-3.5 ${uploadedImages.length > 0 ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>Press photography attached</span>
                </div>
              </div>
            </div>

            {/* Visibility & Commitment Action Bar */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Public Showroom</p>
                  <p className="text-[11px] text-slate-400 font-normal">Allow consumer traffic</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Committing..." : "Publish & Commit Node"}</span>
                </button>
                <Link
                  href="/console/sample/list"
                  className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center"
                >
                  Return to Records
                </Link>
              </div>
            </div>

          </div>

        </form>

      </PageContent>
    </PageLayout>
  );
}
