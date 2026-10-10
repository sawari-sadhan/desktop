    "use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Palette, 
  LayoutDashboard, 
  ListFilter, 
  FileText, 
  Layers, 
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Sliders,
  DollarSign,
  GitPullRequest,
  Settings,
  ChevronDown,
  UploadCloud,
  FolderOpen,
  RefreshCw,
  Clock,
  ArrowLeft
} from "lucide-react";
import { PageLayout, PageContent } from "../components";
import { theme } from "../theme";

export default function SampleShowroomPage() {
  const [copiedText, setCopiedText] = useState("");
  const [segmentedValue, setSegmentedValue] = useState("daily");
  const [activeChip, setActiveChip] = useState("all");
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [activeStep, setActiveStep] = useState(2);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [priceRange, setPriceRange] = useState(65000);

  const sampleTemplates = [
    {
      title: "Dashboard & Metrics",
      href: "/console/sample/dashboard",
      icon: LayoutDashboard,
      desc: "High-level summary cards, sparklines, recent ingestion feeds, and operational health widgets.",
      badge: "Analytics"
    },
    {
      title: "List & Data Records",
      href: "/console/sample/list",
      icon: ListFilter,
      desc: "Interactive records table, search input, multi-state filters, bulk actions, and pagination.",
      badge: "CRUD Table"
    },
    {
      title: "Form & Configuration",
      href: "/console/sample/form",
      icon: FileText,
      desc: "Grouped numbered sections, currency inputs, segmented toggles, country chips, and validation.",
      badge: "Add / Edit"
    },
    {
      title: "Entity & Detail View",
      href: "/console/sample/detail",
      icon: Layers,
      desc: "Header banner, status pills, key specifications grid, tabs switcher, and action menu.",
      badge: "Single Record"
    },
    {
      title: "Modals & Dialogs",
      href: "/console/sample/modal",
      icon: Maximize2,
      desc: "Confirmation dialogs, destructive action prompts, slide-over panels, and toast alerts.",
      badge: "Overlays"
    },
    {
      title: "Pipeline & Board",
      href: "/console/sample/pipeline",
      icon: GitPullRequest,
      desc: "Multi-column ingestion Kanban board, card priority chips, stage advances, and queue filters.",
      badge: "Workflow"
    },
    {
      title: "Workspace Settings",
      href: "/console/sample/settings",
      icon: Settings,
      desc: "Config tabs, API token generation with masking, webhook endpoints, and danger zone.",
      badge: "Settings"
    },
  ];

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>

        {/* Layout Archetypes Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <div className="w-8 h-[2px] bg-slate-400" />
              1. Full Page Archetypes (Click to View)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleTemplates.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold uppercase tracking-wider">
                        {t.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-5 border-t border-slate-100 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    <span>Open Archetype</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Interactive Primitives & Tokens Reference */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <div className="w-8 h-[2px] bg-slate-400" />
              2. UI Component Primitives & Styling Tokens
            </h2>
          </div>

          {/* Buttons & Actions */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Buttons & Action Triggers
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-1">
                Standardized buttons across the console. Use primary for main CTAs, secondary for regular controls.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Primary */}
              <button className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Primary Action</span>
              </button>

              {/* Secondary White */}
              <button className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center gap-2">
                <span>Secondary Button</span>
              </button>

              {/* Ghost / Text */}
              <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                Cancel / Ghost
              </button>

              {/* Destructive */}
              <button className="px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-sm font-semibold transition-all flex items-center gap-2">
                <span>Destructive Action</span>
              </button>

              {/* Icon Only */}
              <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all">
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Badges, Status Indicators, & Chips */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Status Pills & Tag Chips
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-1">
                Clean indicators for state, environment, and category classifications.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available / Active
              </span>

              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Booking Open
              </span>

              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Upcoming / Pending
              </span>

              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Discontinued / Inactive
              </span>

              <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-mono font-semibold">
                v2.4.1
              </span>

              <span className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-sm font-mono font-semibold border border-slate-200">
                ID: node_92812
              </span>
            </div>

            {/* Selectable Filter Chips */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Selectable Filter Chips Pattern:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: "all", label: "All Records (124)" },
                  { id: "active", label: "Active (98)" },
                  { id: "draft", label: "Drafts (18)" },
                  { id: "archived", label: "Archived (8)" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActiveChip(chip.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-3xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      activeChip === chip.id
                        ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                        : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Inputs & Segmented Switches */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Inputs & Segmented Controls
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-1">
                Consistent form control tokens with focus states and prefix slots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standard text input */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Standard Input Field
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audi A6 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Input with prefix icon */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Prefix Currency Input
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    placeholder="25,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Segmented Switch */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Segmented Mode Switch
                </label>
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  {["daily", "monthly", "yearly"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSegmentedValue(val)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                        segmentedValue === val
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback & Alert Banners */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Alert Banners & Notifications
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-1">
                Non-intrusive feedback states for inline validation and operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3.5 text-emerald-800 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>Changes saved successfully to graph node!</span>
              </div>

              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3.5 text-rose-700 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>Validation error: Maximum price cannot be less than minimum price.</span>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3.5 text-amber-800 text-sm font-semibold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <span>Caution: Unlinking this market will remove price history.</span>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3.5 text-blue-800 text-sm font-semibold">
                <Info className="w-5 h-5 shrink-0 text-blue-600" />
                <span>Synchronized with 3 regional distributor pricing catalogs.</span>
              </div>
            </div>
          </div>

          {/* Multi-Step Stepper / Wizard Pattern */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Multi-Step Stepper / Workflow Wizard
                </h3>
                <p className="text-sm text-slate-500 font-normal mt-0.5">
                  Standard step indicator for multi-stage processes such as ingestion and verification.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStep <= 1}
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  disabled={activeStep >= 4}
                  onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next Step
                </button>
              </div>
            </div>

            {/* Step Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "1. Node Identity", desc: "VIN & Basic Metadata" },
                { step: 2, title: "2. Taxonomies", desc: "Powertrain & Attributes" },
                { step: 3, title: "3. Compliance", desc: "EPA & Safety Review" },
                { step: 4, title: "4. Graph Publish", desc: "Live Distribution" },
              ].map((s) => {
                const isDone = activeStep > s.step;
                const isCurrent = activeStep === s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-900 text-white border-slate-900"
                        : isDone
                        ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? "text-slate-300" : isDone ? "text-emerald-700" : "text-slate-400"
                      }`}>
                        Stage {s.step}
                      </span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <div className={`text-sm font-bold ${isCurrent ? "text-white" : "text-slate-900"}`}>
                      {s.title}
                    </div>
                    <div className={`text-xs mt-0.5 ${isCurrent ? "text-slate-300" : "text-slate-500"}`}>
                      {s.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skeletons & Shimmer Loading States */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Skeleton & Shimmer Loading Patterns
                </h3>
                <p className="text-sm text-slate-500 font-normal mt-0.5">
                  Content-aware placeholder states to prevent layout shift while data streams.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLoadingState(!isLoadingState)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  isLoadingState 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingState ? "animate-spin" : ""}`} />
                <span>{isLoadingState ? "Active Shimmer State" : "Simulate Loading"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingState ? (
                // Skeletons
                <>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-200" />
                      <div className="w-16 h-4 rounded-md bg-slate-200" />
                    </div>
                    <div className="w-24 h-6 rounded-lg bg-slate-200" />
                    <div className="w-full h-3 rounded bg-slate-200" />
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-200" />
                      <div className="w-16 h-4 rounded-md bg-slate-200" />
                    </div>
                    <div className="w-24 h-6 rounded-lg bg-slate-200" />
                    <div className="w-full h-3 rounded bg-slate-200" />
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-200" />
                      <div className="w-16 h-4 rounded-md bg-slate-200" />
                    </div>
                    <div className="w-24 h-6 rounded-lg bg-slate-200" />
                    <div className="w-full h-3 rounded bg-slate-200" />
                  </div>
                </>
              ) : (
                // Loaded Card States
                <>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        SYS
                      </div>
                      <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +14.2%
                      </span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-slate-900">4,289 Nodes</div>
                      <div className="text-sm text-slate-500 font-normal">Active graph entities</div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        API
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        99.98%
                      </span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-slate-900">28.4ms Latency</div>
                      <div className="text-sm text-slate-500 font-normal">P99 query response</div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                        SYNC
                      </div>
                      <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Running
                      </span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-slate-900">12 Pending</div>
                      <div className="text-sm text-slate-500 font-normal">Queued for verification</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Accordion / Collapsible Disclosures */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Accordions & Collapsible Disclosures
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                Dense information organization for technical specifications and nested configurations.
              </p>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-200 overflow-hidden">
              {[
                {
                  id: 0,
                  title: "How does the Automotive Knowledge Graph handle multi-variant inheritance?",
                  content: "Variants inherit powertrain taxonomy, standard factory dimensions, and warranty terms directly from their parent model node, while overriding trim-specific OBD codes, wheel dimension attributes, and MSRP tiers."
                },
                {
                  id: 1,
                  title: "What are the automated verification rules for new ingestion entries?",
                  content: "All ingested nodes pass through semantic validation checks: unique VIN/code constraints, ISO country code validations, manufacturer authorized distributor verification, and currency unit normalization."
                },
                {
                  id: 2,
                  title: "How do webhook events ensure delivery during microservice interruptions?",
                  content: "Events are buffered in a persistent queue with exponential backoff retries (1m, 5m, 15m, 1h). Unacknowledged payloads move into dead-letter storage after 5 attempts."
                }
              ].map((item) => {
                const isOpen = openAccordion === item.id;
                return (
                  <div key={item.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-sm text-slate-600 leading-relaxed bg-slate-50/50">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sliders & Range Controls */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Range Sliders & Granular Thresholds
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                Smooth continuous and stepped slider components with live boundary feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">MSRP Ceiling Threshold</span>
                  <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    ${priceRange.toLocaleString()} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="150000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-normal">
                  <span>Min: $20,000</span>
                  <span>Target: $80,000</span>
                  <span>Max: $150,000</span>
                </div>
              </div>

              {/* Progress bars & gauges */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Storage & Quota Allocation</span>
                  <span className="text-sm font-bold text-slate-900">74% Utilized</span>
                </div>
                <div className={theme.ui.progressBarTrack}>
                  <div className={`${theme.ui.progressBarFill} w-[74%]`} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>3.7 GB of 5.0 GB used</span>
                  <span className="text-emerald-600 font-semibold">Healthy Range</span>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State / Zero State Pattern */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Empty State / Zero State Pattern
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                Engaging empty state with clear next-action button and non-intrusive illustration icon.
              </p>
            </div>

            <div className="p-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/30 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">No Vehicle Nodes Found</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  We couldn&apos;t find any records matching your active filters. Try broadening your query or create a new node.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all"
                >
                  Create New Record
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-sm font-semibold transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop File Upload Pattern */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                File Dropzone & Upload Preview
              </h3>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                Clean upload area with drag target, accepted format constraints, and file queue preview.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drop Target */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/30">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Click to upload or drag and drop
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  JSON, CSV, or XML (Max file size 25MB)
                </div>
              </div>

              {/* Uploaded File Queue item */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      CSV
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">audi_catalog_2026.csv</div>
                      <div className="text-xs text-slate-500 font-normal">4.2 MB &bull; Uploading...</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">82%</span>
                </div>
                <div className="space-y-1.5">
                  <div className={theme.ui.progressBarTrack}>
                    <div className="h-full bg-emerald-500 rounded-full transition-all w-[82%]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>1,420 of 1,800 rows parsed</span>
                    <span className="text-emerald-600 font-semibold">Valid Schema</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </PageContent>
    </PageLayout>
  );
}

