"use client";

import React from "react";
import { Fuel, Settings, Calendar, Gauge } from "lucide-react";
import Link from "next/link";

export interface HeroSliderSpecificationProps {
  slide: {
    fuel?: string;
    miles?: string;
    trans?: string;
    year?: string;
    url?: string;
  };
  className?: string;
}

export function HeroSliderSpecification({ slide, className = "" }: HeroSliderSpecificationProps) {
  if (!slide) return null;

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-2xl text-white w-full max-w-xs shadow-2xl ${className}`}>
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
        <div className="flex flex-col gap-1">
          <Fuel className="w-5 h-5 text-gray-300" />
          <span className="text-sm text-gray-300">Fuel</span>
          <span className="font-bold">{slide.fuel || "N/A"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Gauge className="w-5 h-5 text-gray-300" />
          <span className="text-sm text-gray-300">Mileage</span>
          <span className="font-bold">{slide.miles ? (slide.miles.toLowerCase().includes("mile") ? slide.miles : `${slide.miles} Miles`) : "N/A"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Settings className="w-5 h-5 text-gray-300" />
          <span className="text-sm text-gray-300">Transmission</span>
          <span className="font-bold">{slide.trans || "N/A"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Calendar className="w-5 h-5 text-gray-300" />
          <span className="text-sm text-gray-300">Year</span>
          <span className="font-bold">{slide.year || "N/A"}</span>
        </div>
      </div>
      <Link href={slide.url || "#"}>
        <button className="w-full py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-white/90 transition-colors shadow-lg">
          Learn More
        </button>
      </Link>
    </div>
  );
}

export default HeroSliderSpecification;
