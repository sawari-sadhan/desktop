"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Globe, 
  Edit3, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  GitBranch,
  Image as ImageIcon,
  Cpu,
  Car,
  Fuel,
  Gauge,
  Activity,
  FileCode,
  Tag
} from "lucide-react";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

function DetailContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams?.get("tab") as "overview" | "specs" | "markets" | "graph" | "history") || "overview";
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyNodeId = () => {
    navigator.clipboard.writeText("node_audi_a6_2026_tfsi_quattro");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const marketList = [
    { 
      code: "NP", 
      name: "Nepal", 
      flag: "🇳🇵", 
      currency: "NPR", 
      minPrice: 28500000, 
      maxPrice: 32000000, 
      vatIncluded: true,
      deposit: "Rs. 2,500,000",
      status: "Available",
      statusColor: "emerald",
      timeline: "In-Stock Flagship Showrooms"
    },
    { 
      code: "IN", 
      name: "India", 
      flag: "🇮🇳", 
      currency: "INR", 
      minPrice: 7450000, 
      maxPrice: 8200000, 
      vatIncluded: true,
      deposit: "₹ 500,000",
      status: "Booking Open",
      statusColor: "blue",
      timeline: "30 - 45 Days Delivery"
    },
    { 
      code: "AE", 
      name: "United Arab Emirates", 
      flag: "🇦🇪", 
      currency: "AED", 
      minPrice: 265000, 
      maxPrice: 310000, 
      vatIncluded: true,
      deposit: "AED 25,000",
      status: "Available",
      statusColor: "emerald",
      timeline: "Immediate Showroom Delivery"
    },
    { 
      code: "DE", 
      name: "Germany (EU Spec)", 
      flag: "🇩🇪", 
      currency: "EUR", 
      minPrice: 62500, 
      maxPrice: 74800, 
      vatIncluded: true,
      deposit: "€ 5,000",
      status: "Available",
      statusColor: "emerald",
      timeline: "Standard Factory Allocation"
    },
    { 
      code: "US", 
      name: "United States", 
      flag: "🇺🇸", 
      currency: "USD", 
      minPrice: 58900, 
      maxPrice: 69400, 
      vatIncluded: false,
      deposit: "$ 2,000",
      status: "Upcoming",
      statusColor: "amber",
      timeline: "Q1 2027 Model Year Rollout"
    },
  ];

  const graphEdges = [
    { type: "PARENT_BRAND", label: "Manufacturer Node", target: "Audi AG (Ingolstadt, Germany)", id: "brand_audi" },
    { type: "PARENT_MODEL", label: "Model Family", target: "Audi A6 Lineup (Generation C8)", id: "model_a6" },
    { type: "PLATFORM_BASE", label: "Chassis Platform", target: "Volkswagen Group MLB Evo Architecture", id: "plat_mlb_evo" },
    { type: "DIAGNOSTIC_OBD", label: "Diagnostic Protocol", target: "ISO 15765-4 (CAN 500kbps / 11-bit)", id: "obd_iso15765" },
    { type: "REGIONAL_NODES", label: "Market Regions", target: "5 Connected Country Market Nodes", id: "markets_rel" },
  ];

  const specCategories = [
    {
      title: "Engine & Propulsion",
      icon: Cpu,
      rows: [
        { label: "Engine Type", value: "2.0-Liter Inline-4 Turbocharged DOHC" },
        { label: "Maximum Power", value: "261 HP (195 kW) @ 5,000 - 6,500 RPM" },
        { label: "Peak Torque", value: "370 Nm (273 lb-ft) @ 1,600 - 4,500 RPM" },
        { label: "Valvetrain", value: "Audi Valvelift System (AVS), 16 Valves" },
        { label: "Fuel System", value: "Direct Fuel Injection (TFSI)" },
        { label: "Hybrid System", value: "12V Mild-Hybrid Electric Vehicle (MHEV)" },
      ],
    },
    {
      title: "Transmission & Drivetrain",
      icon: Gauge,
      rows: [
        { label: "Transmission Type", value: "7-Speed S tronic Dual-Clutch Automatic" },
        { label: "Drive Configuration", value: "quattro Permanent All-Wheel Drive with Ultra Tech" },
        { label: "Differential", value: "Electro-hydraulic multi-plate clutch" },
        { label: "Gear Selection", value: "Shift-by-wire Electronic Gear Selector with Paddles" },
      ],
    },
    {
      title: "Performance & Dynamics",
      icon: Activity,
      rows: [
        { label: "Acceleration (0 - 100 km/h)", value: "5.8 Seconds" },
        { label: "Top Track Speed", value: "250 km/h (155 mph, Electronically Governed)" },
        { label: "Braking System", value: "Front & Rear Ventilated Disc Brakes" },
        { label: "Suspension (Front/Rear)", value: "Five-link Lightweight Aluminum Suspension" },
      ],
    },
    {
      title: "Dimensions, Capacities & Weight",
      icon: Car,
      rows: [
        { label: "Overall Length", value: "4,939 mm (194.4 in)" },
        { label: "Width (with mirrors)", value: "2,110 mm (83.1 in)" },
        { label: "Overall Height", value: "1,457 mm (57.4 in)" },
        { label: "Wheelbase", value: "2,924 mm (115.1 in)" },
        { label: "Curb Weight", value: "1,825 kg (4,023 lbs)" },
        { label: "Luggage / Boot Capacity", value: "530 Liters (Seats Up) / 1,370 L (Folded)" },
        { label: "Fuel Tank Capacity", value: "73 Liters" },
      ],
    },
  ];

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        
        {/* Entity Profile Header Card */}
        <div className="bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                A6
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Production Active
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                    Executive Sedan • C-Segment
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-mono font-semibold">
                    Gen 8 (C8 Facelift)
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                  Audi A6 2026 • 45 TFSI Quattro S-Line
                </h1>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Master Knowledge Graph Trim Node • Global Automotive Registry
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-center px-4 py-2 border-r border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Regional Base
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    NPR 2.85 Cr
                  </span>
                </div>
                <div className="text-center px-4 py-2 border-r border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Markets
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    5 Countries
                  </span>
                </div>
                <div className="text-center px-4 py-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Graph Edges
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    18 Links
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono font-semibold">
                  <span>node_audi_a6_2026</span>
                  <button
                    onClick={copyNodeId}
                    className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy Node UUID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <button
                  onClick={copyPageLink}
                  className={theme.buttons.secondary}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Share"}</span>
                </button>
                <Link
                  href="/console/sample/form"
                  className={theme.buttons.primary}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Navigation Tabs Bar */}
          <div className="border-t border-slate-100 pt-3 flex items-center gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Media", icon: Car },
              { id: "specs", label: "Technical Specs Matrix", icon: Gauge },
              { id: "markets", label: "Regional Pricing (5)", icon: Tag },
              { id: "graph", label: "Graph Relations", icon: Activity },
              { id: "history", label: "Change Audit Log", icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/console/sample/detail?tab=${tab.id}`}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 group relative whitespace-nowrap ${
                    isActive
                      ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                      : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & MEDIA */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Horsepower", value: "261 HP", sub: "5000-6500 RPM", icon: Cpu },
                { label: "0-100 km/h", value: "5.8 sec", sub: "Quattro Traction", icon: Gauge },
                { label: "Drivetrain", value: "AWD", sub: "Ultra Permanent", icon: Car },
                { label: "Fuel System", value: "TFSI + MHEV", sub: "12V Mild-Hybrid", icon: Fuel },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        {item.label}
                      </span>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{item.value}</p>
                      <p className="text-xs text-slate-400 font-normal">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Media Photography Showcase & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Media Gallery (8 cols) */}
              <div className="lg:col-span-8 bg-white p-7 md:p-8 rounded-[2rem] border border-slate-200 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Vehicle Asset Media Gallery (3 Files)
                  </h3>
                  <span className="text-xs text-slate-400 font-normal">WebP Lossless Attached</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Hero Exterior Profile", res: "3840 x 2160", tag: "Primary" },
                    { title: "Cockpit MMI Virtual Dash", res: "2560 x 1440", tag: "Interior" },
                    { title: "S-Line Dynamic Rear Trim", res: "2560 x 1440", tag: "Detail" },
                  ].map((m, idx) => (
                    <div 
                      key={idx}
                      className="group p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between h-44 hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-900">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          {m.tag}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{m.title}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">{m.res}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entity Metadata Inspector (4 cols) */}
              <div className="lg:col-span-4 bg-white p-7 rounded-[2rem] border border-slate-200 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Catalog Node Metadata
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500 font-normal">Ingestion Pipeline</span>
                    <span className="font-semibold text-slate-900">Core Graph v2.4</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500 font-normal">Classification</span>
                    <span className="font-semibold text-slate-900">TrimVariant</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500 font-normal">Created By</span>
                    <span className="font-semibold text-slate-900">Catalog Admin</span>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500 font-normal">Verification</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>OEM Verified</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Last Sync</span>
                    <span className="font-semibold text-slate-900">Today, 14:02 UTC</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/console/sample/form"
                    className="w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Configure Node Attributes</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TECHNICAL SPECIFICATIONS MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "specs" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={cat.title} 
                    className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-5"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {cat.title}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {cat.rows.map((row) => (
                        <div 
                          key={row.label} 
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none"
                        >
                          <span className="text-slate-500 font-normal">{row.label}</span>
                          <span className="font-semibold text-slate-900 text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REGIONAL PRICING & AVAILABILITY */}
        {/* ========================================================================= */}
        {activeTab === "markets" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Linked Regional Territories</h3>
                <p className="text-xs text-slate-500 font-normal">Localized ex-showroom brackets and delivery commitments</p>
              </div>

              <Link
                href="/console/sample/form"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Country Region</span>
              </Link>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {marketList.map((m) => (
                <div key={m.code} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors">
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-3xl leading-none">{m.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {m.currency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {m.timeline} • Deposit: <span className="font-semibold text-slate-700">{m.deposit}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {m.currency} {m.minPrice.toLocaleString()} - {m.maxPrice.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        {m.vatIncluded ? "VAT & Customs Inclusive" : "Excluding Taxes"}
                      </p>
                    </div>

                    {m.statusColor === "emerald" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {m.status}
                      </span>
                    )}
                    {m.statusColor === "blue" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {m.status}
                      </span>
                    )}
                    {m.statusColor === "amber" && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {m.status}
                      </span>
                    )}

                    <Link
                      href="/console/sample/form"
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white text-xs font-semibold transition-all"
                    >
                      Configure
                    </Link>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GRAPH RELATIONS */}
        {/* ========================================================================= */}
        {activeTab === "graph" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Automotive Knowledge Graph Topology
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Incoming and outgoing edges connected to this vehicle specification node
                </p>
              </div>

              <div className="space-y-3">
                {graphEdges.map((edge) => (
                  <div
                    key={edge.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-mono text-xs font-semibold">
                        <GitBranch className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
                          Edge: {edge.type}
                        </span>
                        <p className="text-xs font-semibold text-slate-900">{edge.target}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        ID: {edge.id}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                        {edge.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUDIT LOG */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Revision & Synchronization Log
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Audit trail of catalog transformations and price updates
              </p>
            </div>

            <div className="space-y-4">
              {[
                { time: "Today, 14:02 UTC", author: "Automated Gateway", text: "Verified regional distributor pricing sync with Audi Nepal flagship showroom.", type: "system" },
                { time: "Today, 11:20 UTC", author: "Catalog Admin (Rajesh K.)", text: "Modified minimum price bounds for NPR market from 2.80 Cr to 2.85 Cr.", type: "user" },
                { time: "Yesterday, 18:40 UTC", author: "Media Ingestion Job", text: "Added high-resolution lossless WebP press kit photography.", type: "media" },
                { time: "Sep 28, 2026", author: "Catalog Admin", text: "Linked United States (USD) market preview node for MY2027.", type: "user" },
                { time: "Sep 22, 2026", author: "Core Ingestion API", text: "Initial node creation from Audi master global catalog feed.", type: "create" },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-semibold text-slate-600 text-[11px] shrink-0">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{log.author}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-normal">{log.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </PageContent>
    </PageLayout>
  );
}

export default function SampleDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading details...</div>}>
      <DetailContent />
    </Suspense>
  );
}
