"use client";

import React from "react";
import { ArrowRight, Fuel, Settings } from "lucide-react";
import Link from "next/link";
import { DUMMY_RESULTS } from "./dummy";

interface SearchPanelProps {
  query: string;
  isFocused: boolean;
  isSubmitted: boolean;
}

export function SearchPanel({ query, isFocused, isSubmitted }: SearchPanelProps) {
  if (!isSubmitted || !query) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-8 pb-4">
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-2xl font-['Clash_Display'] font-bold text-[#050B20]">Search Results for "{query}"</h2>
         <span className="text-sm font-bold text-gray-500">{DUMMY_RESULTS.length} Results Found</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {DUMMY_RESULTS.map((car) => (
          <Link href={car.url} key={car.id} className="block group">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all h-full flex flex-col">
              <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-['Clash_Display'] font-bold text-lg text-[#050B20] mb-2 line-clamp-1 group-hover:text-[#B40003] transition-colors">{car.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1"><Fuel className="w-3 h-3 text-gray-400"/> {car.fuel}</div>
                    <div className="flex items-center gap-1"><Settings className="w-3 h-3 text-gray-400"/> {car.trans}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-bold text-[#B40003] text-xl">{car.price}</div>
                  <div className="text-slate-900 bg-slate-100 group-hover:bg-[#B40003] group-hover:text-white p-2 rounded-full transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
