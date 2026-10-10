"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Fuel, Settings, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { CONFIG } from "../../../../../lib";

export interface VehicleResult {
  id?: string;
  slug: string;
  name: string;
  brand?: string;
  model?: string;
  price?: string;
  fuel?: string;
  trans?: string;
  bodyType?: string;
  image?: string;
  url?: string;
}

interface SearchPanelProps {
  query: string;
  isFocused: boolean;
  isSubmitted: boolean;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop";

export function SearchPanel({ query, isFocused, isSubmitted }: SearchPanelProps) {
  const [vehicles, setVehicles] = useState<VehicleResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = (query || "").trim();
    if (!trimmed) {
      setVehicles([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    // Abort previous in-flight request if user is typing continuously
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Debounce keyboard typing by 200ms (or immediate if submitted)
    const delay = isSubmitted ? 0 : 200;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${CONFIG.AGENT.API_URL}/AgentService/SearchVehicles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, limit: 12 }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || []);
        } else {
          // Fallback GET request if POST protocol differs
          const getRes = await fetch(
            `${CONFIG.AGENT.API_URL}/api/vehicles/search?q=${encodeURIComponent(trimmed)}&limit=12`,
            { signal: controller.signal }
          );
          if (getRes.ok) {
            const data = await getRes.json();
            setVehicles(data.vehicles || []);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search query failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
          setHasSearched(true);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isSubmitted]);

  // Only display panel when query is present
  if (!query || query.trim() === "") return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-8 pb-4">
      {/* Search Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-['Clash_Display'] font-bold text-[#050B20]">
            Search Results for &ldquo;{query}&rdquo;
          </h2>
          {isSearching && (
            <Loader2 className="w-4 h-4 text-[#B40003] animate-spin shrink-0" />
          )}
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          {isSearching ? "Searching..." : `${vehicles.length} Vehicle${vehicles.length !== 1 ? "s" : ""} Found`}
        </span>
      </div>

      {/* Loading Skeleton during initial search */}
      {isSearching && vehicles.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-72 border border-slate-200"></div>
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        /* Results Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((car, idx) => {
            const targetSlug = car.slug || "";
            const targetUrl = targetSlug ? `/${targetSlug}` : (car.url || "#");
            const carImg = car.image || FALLBACK_IMAGE;

            return (
              <Link href={targetUrl} key={car.id || targetSlug || idx} className="block group">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all h-full flex flex-col hover:shadow-lg hover:border-gray-300">
                  <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                    <img
                      src={carImg}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {car.brand && (
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-white tracking-wider uppercase">
                        {car.brand}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-['Clash_Display'] font-bold text-lg text-[#050B20] mb-2 line-clamp-1 group-hover:text-[#B40003] transition-colors">
                        {car.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-gray-400" /> {car.fuel || "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Settings className="w-3 h-3 text-gray-400" /> {car.trans || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="font-bold text-[#B40003] text-base">{car.price || "Unlisted in Nepal"}</div>
                      <div className="text-slate-900 bg-slate-100 group-hover:bg-[#B40003] group-hover:text-white p-2 rounded-full transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : hasSearched && !isSearching ? (
        /* Zero Results Empty State */
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center my-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-[#050B20] mb-1">
            No vehicles found matching &ldquo;{query}&rdquo;
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try searching with brand names like <span className="font-semibold text-slate-700">&ldquo;Citroen&rdquo;</span>, <span className="font-semibold text-slate-700">&ldquo;Mahindra Thar&rdquo;</span>, or types like <span className="font-semibold text-slate-700">&ldquo;Electric SUV&rdquo;</span>, <span className="font-semibold text-slate-700">&ldquo;Diesel Automatic&rdquo;</span>.
          </p>
        </div>
      ) : null}
    </section>
  );
}
