"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { graphClient } from "@/lib/core";

export interface BrandItem {
  id: string;
  slug: string;
  name: string;
  logo: string;
  totalModels?: number;
}

const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `http://localhost:5051/${url}`;
};

function unwrapStruct(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if ("stringValue" in obj) return obj.stringValue;
  if ("numberValue" in obj) return obj.numberValue;
  if ("boolValue" in obj) return obj.boolValue;
  if ("nullValue" in obj) return null;
  if ("listValue" in obj) return (obj.listValue?.values || []).map(unwrapStruct);
  if ("structValue" in obj) return unwrapStruct(obj.structValue);
  if ("fields" in obj && typeof obj.fields === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj.fields as Record<string, any>)) {
      result[k] = unwrapStruct(v);
    }
    return result;
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = unwrapStruct(v);
  }
  return result;
}

export function PremiumBrands() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBrands = async () => {
      try {
        // Query brand nodes from PostgreSQL auto.node via core AutoService
        const res = await graphClient.searchNodes({
          query: "",
          types: ["brand"],
          limit: 100,
          vector: [],
        });

        if (!isMounted) return;

        const brandNodes = res.nodes || [];
        const parsedBrands: BrandItem[] = [];

        for (const node of brandNodes) {
          const nameObj = unwrapStruct(node.name) || {};
          const brandName = typeof nameObj === "string"
            ? nameObj
            : nameObj.en || nameObj.default || node.slug;

          const metadata = unwrapStruct(node.metadata) || {};
          let logoUrl: string | null = null;

          // 1. Direct logo field in metadata
          if (metadata.logo && typeof metadata.logo === "string") {
            logoUrl = getImageUrl(metadata.logo);
          }

          // 2. Traversal through media array if metadata.logo is missing
          if (!logoUrl && node.media) {
            const mediaRaw = unwrapStruct(node.media);
            const mediaArr = Array.isArray(mediaRaw) ? mediaRaw : [];
            if (mediaArr.length > 0) {
              const cover = mediaArr.find((m: any) => m?.isCover === true || m?.type === "logo") || mediaArr[0];
              const extracted = typeof cover === "string" ? cover : cover?.url;
              if (extracted) {
                logoUrl = getImageUrl(extracted);
              }
            }
          }

          // Only keep brands that have a logo
          if (logoUrl) {
            parsedBrands.push({
              id: node.id,
              slug: node.slug,
              name: brandName,
              logo: logoUrl,
              totalModels: Number(metadata.total_models || 0),
            });
          }
        }

        // Sort by catalog model count descending, then by name
        parsedBrands.sort((a, b) => {
          if ((b.totalModels || 0) !== (a.totalModels || 0)) {
            return (b.totalModels || 0) - (a.totalModels || 0);
          }
          return a.name.localeCompare(b.name);
        });

        setBrands(parsedBrands.slice(0, 18));
      } catch (err) {
        console.error("Failed to load brands from core graph:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20]">
            Explore Our Premium Brands
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Discover authorized automobile manufacturers and their complete model lineups.
          </p>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#B40003] transition-colors shrink-0"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-100 rounded-2xl h-28 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : brands.length > 0 ? (
        /* Brand Logos Grid - Logo Only */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {brands.map((brand) => (
            <Link
              href={`/${brand.slug}/brand`}
              key={brand.id || brand.slug}
              title={brand.name}
              aria-label={brand.name}
              className="group block"
            >
              <div className="bg-white border border-gray-200 rounded-2xl h-28 p-5 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:border-[#B40003] hover:-translate-y-1 relative overflow-hidden">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  loading="lazy"
                  className="max-h-14 max-w-[85%] w-auto object-contain transition-transform duration-300 group-hover:scale-110 filter drop-shadow-sm"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default PremiumBrands;
