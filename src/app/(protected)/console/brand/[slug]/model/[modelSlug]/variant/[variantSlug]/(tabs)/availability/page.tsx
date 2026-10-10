"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Plus, 
  Car, 
  ChevronRight,
  TrendingUp,
  Tag,
  Search,
  X,
  Layers,
  DollarSign,
  CheckCircle2,
  Clock
} from "lucide-react";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageContent, TopbarActions } from "@app/(protected)/console/components";
import { theme } from "@app/(protected)/console/theme";
import { COUNTRIES } from "./countries";

interface AvailabilityItem {
  country: EntityNode;
  status: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  currencySymbol: string;
  notes: string;
}

export default function AvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || "";
  const modelSlug = (params.modelSlug as string) || "";
  const variantSlug = (params.variantSlug as string) || "";

  const basePath = `/console/brand/${slug}/model/${modelSlug}/variant/${variantSlug}/availability`;

  const [variant, setVariant] = useState<EntityNode | null>(null);
  const [availableItems, setAvailableItems] = useState<AvailabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loadData = async () => {
    if (!variantSlug) return;
    setIsLoading(true);
    setIsNotFound(false);
    try {
      const res = await graphClient.getNode({ id: "", slug: variantSlug });
      if (!res.node || !res.node.id) {
        setIsNotFound(true);
        return;
      }

      const v: EntityNode = {
        id: res.node.id,
        type: res.node.type,
        slug: res.node.slug,
        name: res.node.name || {},
        description: res.node.description || {},
        tags: res.node.tags || [],
        metadata: res.node.metadata || {},
        data: res.node.data || {},
        updated_at: res.node.updatedAt
      };
      setVariant(v);

      const neighbors = await graphClient.getNeighbors({
        nodeId: v.id,
        linkTypes: ["available_in"]
      });

      const links = (neighbors as any).links || [];
      const linkedCountries = (neighbors.nodes || []).filter(n => n.type === "country");

      const mapped: AvailabilityItem[] = linkedCountries.map(c => {
        const link = links.find((l: any) => l.targetId === c.id || l.sourceId === c.id);
        const meta = link?.metadata || {};
        const preset = COUNTRIES.find(p => p.code.toLowerCase() === c.slug.toLowerCase());

        return {
          country: c as any,
          status: meta.status || "available",
          price: Number(meta.price) || 0,
          minPrice: Number(meta.min_price) || Number(meta.minPrice) || Number(meta.price) || 0,
          maxPrice: Number(meta.max_price) || Number(meta.maxPrice) || Number(meta.price) || 0,
          currency: meta.currency || (c.data as any)?.currency_code || preset?.currency || "USD",
          currencySymbol: meta.currency_symbol || (c.data as any)?.currency_symbol || preset?.symbol || "",
          notes: meta.notes || ""
        };
      });

      setAvailableItems(mapped);
    } catch (err) {
      console.error("Failed to load availability:", err);
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantSlug]);

  const getStatusBadge = (statusKey: string) => {
    switch (statusKey) {
      case "available":
        return <span className={theme.badges.success}>Available</span>;
      case "booking_open":
        return <span className={theme.badges.info}>Booking Open</span>;
      case "upcoming":
        return <span className={theme.badges.warning}>Upcoming</span>;
      case "discontinued":
        return <span className={theme.badges.neutral}>Discontinued</span>;
      default:
        return <span className={theme.badges.neutral}>{statusKey.replace(/_/g, " ")}</span>;
    }
  };

  const formatPriceRange = (item: AvailabilityItem) => {
    const symbol = item.currencySymbol || item.currency;
    const min = item.minPrice;
    const max = item.maxPrice;

    if (min > 0 && max > 0) {
      if (min === max) {
        return (
          <span className="font-bold text-slate-900 text-sm md:text-base">
            {symbol} {min.toLocaleString()}
          </span>
        );
      }
      return (
        <span className="font-bold text-slate-900 text-sm md:text-base">
          {symbol} {min.toLocaleString()} <span className="text-slate-400 font-normal mx-1">–</span> {symbol} {max.toLocaleString()}
        </span>
      );
    }

    if (item.price > 0) {
      return (
        <span className="font-bold text-slate-900 text-sm md:text-base">
          {symbol} {item.price.toLocaleString()}
        </span>
      );
    }

    return <span className="text-slate-400 italic font-medium text-xs">Price on Request</span>;
  };

  const filteredItems = useMemo(() => {
    return availableItems.filter(item => {
      const countryName = ((item.country.name as any)?.en || item.country.slug || "").toLowerCase();
      const countrySlug = (item.country.slug || "").toLowerCase();
      const notes = (item.notes || "").toLowerCase();
      const currency = (item.currency || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || countryName.includes(q) || countrySlug.includes(q) || notes.includes(q) || currency.includes(q);
      if (!matchesSearch) return false;

      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [availableItems, searchQuery, selectedStatus]);

  const countAvailable = useMemo(() => availableItems.filter(i => i.status === "available").length, [availableItems]);
  const countBooking = useMemo(() => availableItems.filter(i => i.status === "booking_open").length, [availableItems]);
  const countUpcoming = useMemo(() => availableItems.filter(i => i.status === "upcoming").length, [availableItems]);

  const statusFilters = useMemo(() => {
    const list = [
      { id: "all", label: "All Markets", count: availableItems.length, icon: Layers }
    ];
    if (countAvailable > 0) {
      list.push({ id: "available", label: "Available", count: countAvailable, icon: CheckCircle2 });
    }
    if (countBooking > 0) {
      list.push({ id: "booking_open", label: "Booking Open", count: countBooking, icon: DollarSign });
    }
    if (countUpcoming > 0) {
      list.push({ id: "upcoming", label: "Upcoming", count: countUpcoming, icon: Clock });
    }
    return list;
  }, [availableItems, countAvailable, countBooking, countUpcoming]);

  if (isNotFound) {
    return (
      <PageLayout className={theme.layout.pageContainer}>
        <PageContent className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-lg space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Variant Not Found</h1>
            <p className="text-slate-500 text-xs leading-relaxed">
              The variant <strong className="text-slate-700">"{variantSlug}"</strong> does not exist in the graph registry.
            </p>
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center gap-3">
          {/* Expandable Search Button */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Filter markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-900 outline-none w-44 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  searchQuery
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                title="Search Markets"
              >
                <Search className="w-4 h-4" />
                {searchQuery && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Archetype Metrics Bar matching sample/dashboard */}
        {!isLoading && availableItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Markets</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{availableItems.length}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Configured regional territories</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Currency</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {availableItems[0]?.currency || "USD"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Symbol: {availableItems[0]?.currencySymbol || "$"} · Base Market
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commercial Status</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {countAvailable} <span className="text-sm font-semibold text-slate-400">/ {availableItems.length} Active</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {countBooking > 0 ? `${countBooking} bookings open` : "Live market deployments"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Section Header Divider matching sample/list */}
        <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <div className="w-8 h-[2px] bg-slate-400" />
              Configured Markets ({filteredItems.length})
            </h2>

            {/* Status Filter Pills */}
            {statusFilters.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0">
                {statusFilters.map((f) => {
                  const Icon = f.icon;
                  const isActive = selectedStatus === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedStatus(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 group relative shrink-0 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white font-bold shadow-xs"
                          : "text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                      <span>{f.label}</span>
                      <span
                        className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-slate-800 text-white"
                            : "bg-white text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700"
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Country Action Button replacing 'Ex-Showroom & Retail Pricing' */}
          <Link
            href={`${basePath}/add`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl text-[11px] font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Country</span>
          </Link>
        </div>

        {/* Market Records Presentation */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : availableItems.length === 0 ? (
          /* Empty State matching sample/settings & sample/list */
          <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No country availability configured yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Add countries where this variant is sold to establish regional price ranges, market status, and notes.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`${basePath}/add`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Country</span>
              </Link>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-bold text-sm">No markets match your filter</p>
              <p className="text-slate-500 text-xs">Try searching with another keyword or reset active filters.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-16">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const preset = COUNTRIES.find(p => p.code.toLowerCase() === item.country.slug.toLowerCase());
                const flag = preset?.flag || "🌐";
                const targetUrl = `${basePath}/${item.country.slug || item.country.id}`;

                return (
                  <motion.div
                    key={item.country.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      router.push(targetUrl);
                    }}
                    className="cursor-pointer group p-5 md:p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left: Country details & Flag */}
                    <div className="flex items-center gap-4 min-w-[280px]">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                        <span>{flag}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={targetUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors"
                          >
                            {(item.country.name as any)?.en || item.country.slug.toUpperCase()}
                          </Link>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-[10px] font-bold uppercase border border-slate-200/60">
                            {item.country.slug}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {getStatusBadge(item.status)}
                          <span className="text-[11px] font-medium text-slate-400">
                            {preset?.region || "Global Territory"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Price Range */}
                    <div className="text-left md:text-right px-2 md:px-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Market Pricing ({item.currency})
                      </p>
                      <div>
                        {formatPriceRange(item)}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-1 max-w-md ml-auto">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: Navigate Chevron */}
                    <div className="flex items-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:border-slate-900 flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
}
