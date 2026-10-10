"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  X, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Download,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  Copy,
  MoreVertical,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Edit2,
  Layers,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { PageLayout, PageContent, TopbarActions } from "../../components";
import { theme } from "../../theme";

interface RecordItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  region: string;
  country: string;
  currency: string;
  minPrice: number;
  maxPrice: number;
  status: "available" | "booking_open" | "upcoming" | "discontinued";
  flag: string;
  specs: string[];
  updatedAt: string;
}

export default function SampleListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "price_desc" | "price_asc" | "alpha">("updated");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkActionToast, setShowBulkActionToast] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const mockRecords: RecordItem[] = [
    {
      id: "rec_1",
      name: "DB12 • Volante Super Tourer",
      brand: "Aston Martin",
      category: "Grand Tourer",
      region: "South Asia",
      country: "Nepal",
      currency: "NPR",
      minPrice: 42000000,
      maxPrice: 48500000,
      status: "available",
      flag: "🇳🇵",
      specs: ["4.0L V8", "680 PS", "325 km/h"],
      updatedAt: "Today, 14:20",
    },
    {
      id: "rec_2",
      name: "A6 2026 • 45 TFSI Quattro",
      brand: "Audi",
      category: "Executive Sedan",
      region: "South Asia",
      country: "India",
      currency: "INR",
      minPrice: 7500000,
      maxPrice: 8400000,
      status: "booking_open",
      flag: "🇮🇳",
      specs: ["2.0L Turbo", "261 hp", "AWD"],
      updatedAt: "Yesterday",
    },
    {
      id: "rec_3",
      name: "Taycan 4S • Performance Battery Plus",
      brand: "Porsche",
      category: "Electric Sedan",
      region: "Middle East",
      country: "UAE",
      currency: "AED",
      minPrice: 420000,
      maxPrice: 495000,
      status: "available",
      flag: "🇦🇪",
      specs: ["Dual Motor", "530 hp", "93.4 kWh"],
      updatedAt: "Oct 06, 2026",
    },
    {
      id: "rec_4",
      name: "Defender 110 • P400 X-Dynamic",
      brand: "Land Rover",
      category: "Luxury SUV",
      region: "North America",
      country: "United States",
      currency: "USD",
      minPrice: 78500,
      maxPrice: 94000,
      status: "available",
      flag: "🇺🇸",
      specs: ["3.0L i6 MHEV", "395 hp", "Air Susp."],
      updatedAt: "Sep 28, 2026",
    },
    {
      id: "rec_5",
      name: "911 GT3 RS • Weissach Package",
      brand: "Porsche",
      category: "Track Supercar",
      region: "Europe",
      country: "Germany",
      currency: "EUR",
      minPrice: 248000,
      maxPrice: 295000,
      status: "upcoming",
      flag: "🇩🇪",
      specs: ["4.0L Flat-6", "525 hp", "DRS Aero"],
      updatedAt: "Sep 15, 2026",
    },
    {
      id: "rec_6",
      name: "Century • V12 Hybrid Limousine",
      brand: "Toyota",
      category: "Ultra-Luxury",
      region: "East Asia",
      country: "Japan",
      currency: "JPY",
      minPrice: 25000000,
      maxPrice: 28500000,
      status: "discontinued",
      flag: "🇯🇵",
      specs: ["5.0L V8 Hybrid", "425 hp", "Handcrafted"],
      updatedAt: "Aug 10, 2026",
    },
    {
      id: "rec_7",
      name: "Ioniq 5 N • Track Ready AWD",
      brand: "Hyundai",
      country: "Nepal",
      category: "Electric Crossover",
      region: "South Asia",
      currency: "NPR",
      minPrice: 18500000,
      maxPrice: 21000000,
      status: "booking_open",
      flag: "🇳🇵",
      specs: ["Dual Motor", "650 PS", "N e-Shift"],
      updatedAt: "Today, 10:15",
    },
    {
      id: "rec_8",
      name: "Ghost Extended • Black Badge",
      brand: "Rolls-Royce",
      country: "UAE",
      category: "Ultra-Luxury",
      region: "Middle East",
      currency: "AED",
      minPrice: 1650000,
      maxPrice: 1980000,
      status: "available",
      flag: "🇦🇪",
      specs: ["6.75L V12", "600 PS", "Planar Susp."],
      updatedAt: "Oct 01, 2026",
    },
  ];

  // Filtering & Sorting
  const filteredRecords = useMemo(() => {
    return mockRecords
      .filter((rec) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          rec.name.toLowerCase().includes(query) ||
          rec.brand.toLowerCase().includes(query) ||
          rec.country.toLowerCase().includes(query) ||
          rec.currency.toLowerCase().includes(query);
        const matchesStatus = selectedFilter === "all" || rec.status === selectedFilter;
        const matchesRegion = selectedRegion === "all" || rec.region === selectedRegion;
        return matchesSearch && matchesStatus && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === "price_desc") return b.maxPrice - a.maxPrice;
        if (sortBy === "price_asc") return a.minPrice - b.minPrice;
        if (sortBy === "alpha") return a.name.localeCompare(b.name);
        return 0; // Default order
      });
  }, [searchQuery, selectedFilter, selectedRegion, sortBy]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (actionName: string) => {
    setShowBulkActionToast(`${actionName} applied to ${selectedIds.length} records.`);
    setSelectedIds([]);
    setTimeout(() => setShowBulkActionToast(""), 3500);
  };

  const getStatusBadge = (status: RecordItem["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white text-emerald-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        );
      case "booking_open":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white text-blue-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Booking Open
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white text-amber-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Upcoming
          </span>
        );
      case "discontinued":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Discontinued
          </span>
        );
    }
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-3">
          {/* Expandable Search Icon Button */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-900 outline-none w-44 placeholder:text-slate-400"
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 ${
                  searchQuery
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="Search Records"
              >
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5" />
                )}
              </button>
            )}
          </div>

          {/* Status Filter Tabs in Topbar (matching settings page topbar tab UI) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0">
            {[
              { id: "all", label: "All Records", count: mockRecords.length, icon: Layers },
              { id: "available", label: "Available", count: mockRecords.filter((r) => r.status === "available").length, icon: CheckCircle2 },
              { id: "booking_open", label: "Booking Open", count: mockRecords.filter((r) => r.status === "booking_open").length, icon: Clock },
              { id: "upcoming", label: "Upcoming", count: mockRecords.filter((r) => r.status === "upcoming").length, icon: Sparkles },
              { id: "discontinued", label: "Discontinued", count: mockRecords.filter((r) => r.status === "discontinued").length, icon: AlertCircle },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 group relative shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                      : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{f.label}</span>
                  <span
                    className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-slate-200 text-slate-900"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        
        {/* Action Toast */}
        {showBulkActionToast && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-medium border border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{showBulkActionToast}</span>
            </div>
            <button onClick={() => setShowBulkActionToast("")} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Showing <span className="text-slate-900 font-bold">{filteredRecords.length}</span> of {mockRecords.length} Records
          </div>

          {/* Controls (Region dropdown, Sort by, View Mode, Actions) */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            {/* Region Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 appearance-none pr-8 cursor-pointer"
              >
                <option value="all">All Regions</option>
                <option value="South Asia">South Asia</option>
                <option value="Middle East">Middle East</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="East Asia">East Asia</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 appearance-none pr-8 cursor-pointer"
              >
                <option value="updated">Recently Updated</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="alpha">Alphabetical (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("Exported CSV")}
                className={theme.buttons.secondary}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <Link
                href="/console/sample/form"
                className={theme.buttons.primary}
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="sticky top-4 z-20 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-200 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold">Records selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("Status updated")}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                Change Status
              </button>
              <button
                onClick={() => handleBulkAction("Exported selection")}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction("Deleted selection")}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-1.5 text-slate-400 hover:text-white transition-colors ml-2"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content: Table or Grid */}
        {filteredRecords.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No matching records found</h3>
              <p className="text-xs text-slate-500 font-normal max-w-sm mx-auto mt-1">
                We could not find any vehicle catalog entries matching &quot;{searchQuery}&quot;. Try adjusting filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
                setSelectedRegion("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* Dense Table View */
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-5 w-12 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700">
                        {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-slate-900" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4">Vehicle Model & Trim</th>
                    <th className="py-4 px-4">Regional Market</th>
                    <th className="py-4 px-4">Ex-Showroom Range</th>
                    <th className="py-4 px-4">Key Specs</th>
                    <th className="py-4 px-4">Commercial Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-slate-50" : ""}`}
                      >
                        <td className="p-5 text-center">
                          <button onClick={() => toggleSelectRow(item.id)} className="text-slate-400 hover:text-slate-700">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-slate-900" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                              {item.flag}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate hover:text-blue-600 cursor-pointer">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                                {item.brand} • <span className="font-medium text-slate-700">{item.category}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-800">{item.country}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{item.region}</p>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.currency} {item.minPrice.toLocaleString()} - {item.maxPrice.toLocaleString()}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                              Ex-Showroom Bracket
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.specs.map((s) => (
                              <span 
                                key={s} 
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/console/sample/detail"
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href="/console/sample/form"
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Pagination */}
            <div className="p-5 bg-slate-50/75 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Showing {filteredRecords.length} of {mockRecords.length} records
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
                  1
                </button>
                <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  2
                </button>
                <button
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Card Grid View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredRecords.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group relative bg-white border p-7 rounded-[2rem] transition-all flex flex-col justify-between ${
                        isSelected ? "border-slate-900 ring-2 ring-slate-900" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-5">
                        
                        {/* Top bar on card */}
                        <div className="flex items-start justify-between">
                          <button
                            type="button"
                            onClick={() => toggleSelectRow(item.id)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-slate-900" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Title & Brand */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl leading-none">{item.flag}</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {item.brand} • {item.country}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {item.name}
                          </h3>
                        </div>

                        {/* Price box */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Regional Ex-Showroom
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.currency} {item.minPrice.toLocaleString()} - {item.maxPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Key Specs tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.specs.map((s) => (
                            <span 
                              key={s} 
                              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Card Footer */}
                      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                          {item.updatedAt}
                        </span>
                        <Link
                          href="/console/sample/detail"
                          className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5"
                        >
                          <span>Configure</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

      </PageContent>
    </PageLayout>
  );
}
