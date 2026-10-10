"use client";

import React from "react";
import Link from "next/link";
import { Car, Bike, ArrowRight } from "lucide-react";
import { PageLayout, PageContent } from "../components";
import { theme } from "../theme";

export default function IngestPage() {
  const ingestionCategories = [
    {
      title: "4-Wheel Vehicles (4W)",
      href: "/console/ingest/4w",
      icon: Car,
      desc: "Provision passenger cars, SUVs, crossovers, sedans, hatchbacks, and commercial vans into the knowledge graph.",
      badge: "Automobiles",
      cta: "Launch 4W Ingestion"
    },
    {
      title: "2-Wheel Vehicles (2W)",
      href: "/console/ingest/2w",
      icon: Bike,
      desc: "Register motorcycles, scooters, commuters, dirt bikes, and electric two-wheelers into the ontology registry.",
      badge: "Motorcycles",
      cta: "Launch 2W Ingestion"
    },
  ];

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <div className="w-8 h-[2px] bg-slate-400" />
              Vehicle Classification Ingestion
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ingestionCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center text-slate-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold uppercase tracking-wider">
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-5 border-t border-slate-100 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    <span>{cat.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
}