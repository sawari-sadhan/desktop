"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { 
  ChevronRight, 
  Search, 
  Car, 
  Fuel, 
  Settings, 
  ArrowRight, 
  Sparkles,
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";
import { toJson } from "@bufbuild/protobuf";
import { SmartImage } from "@/app/components";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

/** Helper to extract image URL safely */
const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `http://localhost:5051/${url}`;
};

/** Recursively unwrap structpb object into plain JS */
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

/** Extract spec value case-insensitively */
const extractSpec = (data: any, keys: string[]): string => {
  if (!data || typeof data !== "object") return "";
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      const val = data[k];
      if (typeof val === "object" && val.value !== undefined) {
        return `${val.value} ${val.unit || ""}`.trim();
      }
      return String(val);
    }
  }

  const specs = data.specifications || data.specs || data.spec;
  if (specs && typeof specs === "object") {
    for (const k of keys) {
      if (specs[k] !== undefined && specs[k] !== null && specs[k] !== "") {
        const val = specs[k];
        if (typeof val === "object" && val.value !== undefined) {
          return `${val.value} ${val.unit || ""}`.trim();
        }
        return String(specs[k]);
      }
    }
    const lowerKeys = keys.map((k) => k.toLowerCase());
    for (const key of Object.keys(specs)) {
      if (lowerKeys.includes(key.toLowerCase()) && specs[key] !== undefined && specs[key] !== null && specs[key] !== "") {
        const val = specs[key];
        if (typeof val === "object" && val.value !== undefined) {
          return `${val.value} ${val.unit || ""}`.trim();
        }
        return String(specs[key]);
      }
    }
  }

  return "";
};

export interface ModelCardItem {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: string | null;
  rawPrice: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  tags: string[];
}

export function BrandView({ node }: { node: EntityNode }) {
  const rawData = (node.data as any) || {};
  const data: Record<string, any> = rawData?.fields ? unwrapStruct(rawData) : rawData;

  const nameObj = unwrapStruct(node.name) || {};
  const brandName = typeof nameObj === "string" 
    ? nameObj 
    : nameObj.en || nameObj.np || nameObj.default || node.slug;

  let logoUrl: string | null = null;
  if (node.media) {
    try {
      const extractUrl = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj === "string") return obj;
        if (obj.url) return obj.url;
        if (obj.kind?.value?.fields?.url?.kind?.value) return obj.kind.value.fields.url.kind.value;
        if (obj.structValue?.fields?.url?.stringValue) return obj.structValue.fields.url.stringValue;
        if (obj.fields?.url?.stringValue) return obj.fields.url.stringValue;
        return null;
      };

      let items: any[] = [];
      if (Array.isArray(node.media)) {
        items = node.media;
      } else if ((node.media as any).values && Array.isArray((node.media as any).values)) {
        items = (node.media as any).values;
      } else {
        try {
          items = (toJson(ListValueSchema, node.media as any) as any[]) || [];
        } catch {
          items = (node.media as any).listValue?.values || [];
        }
      }

      if (items.length > 0) {
        // Find cover or fallback to first
        let cover = items.find((m: any) => {
          if (m?.isCover) return true;
          if (m?.kind?.value?.fields?.isCover?.kind?.value === true) return true;
          if (m?.structValue?.fields?.isCover?.boolValue === true) return true;
          if (m?.fields?.isCover?.boolValue === true) return true;
          return false;
        });
        if (!cover) cover = items[0];

        logoUrl = getImageUrl(extractUrl(cover));
      }
    } catch (e) {
      console.error("Failed to parse node.media:", e);
    }
  }

  const [models, setModels] = useState<ModelCardItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuel, setSelectedFuel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");

  useEffect(() => {
    const fetchBrandModels = async () => {
      setIsLoadingModels(true);
      try {
        const neighborsRes = await graphClient.getNeighbors({
          nodeId: node.id,
          linkTypes: ["has_model"]
        });

        const modelNodes = (neighborsRes.nodes || []).filter(
          (n: any) => n.type === "model" || n.type === "vehicle"
        );

        const parsed: ModelCardItem[] = modelNodes.map((m: any) => {
          const mNameObj = unwrapStruct(m.name) || {};
          const mName = typeof mNameObj === "string" 
            ? mNameObj 
            : mNameObj.en || mNameObj.np || mNameObj.default || m.slug;

          const mRawData = (m.data as any) || {};
          const mData = mRawData?.fields ? unwrapStruct(mRawData) : mRawData;

          const pricing = mData.pricing || {};
          const rawPrice = Number(pricing.price || pricing.basePrice || pricing.mrp || 0);
          let priceStr: string | null = null;
          if (rawPrice > 0) {
            priceStr = `Rs. ${rawPrice.toLocaleString()}`;
          }

          const fuel = extractSpec(mData, ["fuel_type", "fuelType", "fuel", "engine_type"]) || "N/A";
          const transmission = extractSpec(mData, ["transmission", "trans", "gearbox", "transmission_type"]) || "N/A";
          const bodyType = extractSpec(mData, ["body_type", "bodyType", "segment"]) || "N/A";

          let imgUrl: string | null = null;
          if (m.media) {
            try {
              const mediaArr = (toJson(ListValueSchema, m.media) as any[]) || [];
              if (mediaArr.length > 0) {
                const cover = mediaArr.find((img: any) => img.isCover === true) || mediaArr[0];
                imgUrl = getImageUrl(cover?.url);
              }
            } catch {
              // ignore
            }
          }

          return {
            id: m.id,
            slug: m.slug,
            name: mName,
            image: imgUrl,
            price: priceStr,
            rawPrice,
            fuel,
            transmission,
            bodyType,
            tags: m.tags || [],
          };
        });

        setModels(parsed);
      } catch (e) {
        console.error("Failed to fetch brand models", e);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchBrandModels();
  }, [node.id]);

  const availableFuels = ["All", ...Array.from(new Set(models.map(m => m.fuel).filter(f => f && f !== "N/A")))];

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = selectedFuel === "All" || m.fuel.toLowerCase() === selectedFuel.toLowerCase();
    return matchesSearch && matchesFuel;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    if (sortBy === "price-asc") return a.rawPrice - b.rawPrice;
    if (sortBy === "price-desc") return b.rawPrice - a.rawPrice;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-widest gap-2 mb-8">
          <Link href="/" className="hover:text-[#C61B1E] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">Brands</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#C61B1E]">{brandName}</span>
        </div>

        {/* Brand Banner */}
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C61B1E]/20 rounded-full blur-3xl translate-x-32 -translate-y-32 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              {logoUrl ? (
                <div className="w-24 h-24 rounded-2xl bg-white p-3 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                  <SmartImage src={logoUrl} alt={brandName} variant="thumbnail" fill className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black text-white shrink-0 uppercase tracking-wider">
                  {brandName.slice(0, 2)}
                </div>
              )}

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  <Car className="w-3.5 h-3.5 text-[#C61B1E]" /> Official Brand Models
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                  {brandName}
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-2">
                  Explore all available {brandName} models, specs, and pricing in Nepal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:px-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Models</p>
                <p className="text-2xl font-black text-white">{models.length}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog</p>
                <p className="text-sm font-bold text-[#C61B1E] flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Live Sync
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${brandName} models...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C61B1E] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
              {availableFuels.slice(0, 4).map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedFuel === fuel 
                      ? "bg-[#C61B1E] text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#C61B1E] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A - Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoadingModels ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-100 h-80 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : sortedModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedModels.map((model) => (
              <Link
                key={model.id}
                href={`/${model.slug}`}
                className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-[#C61B1E]/40 transition-all duration-300 hover:shadow-xl flex flex-col"
              >
                <div className="h-56 bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
                  {model.image ? (
                    <SmartImage
                      src={model.image}
                      alt={model.name}
                      variant="medium"
                      fill
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-300 text-sm font-semibold flex flex-col items-center gap-2">
                      <Car className="w-8 h-8 opacity-40" />
                      No preview image
                    </div>
                  )}

                  {model.fuel !== "N/A" && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-[#C61B1E]" /> {model.fuel}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#C61B1E] transition-colors line-clamp-1 uppercase tracking-tight mb-2">
                      {model.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
                      {model.transmission !== "N/A" && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                          <Settings className="w-3 h-3 text-slate-400" /> {model.transmission}
                        </span>
                      )}
                      {model.bodyType !== "N/A" && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                          <Car className="w-3 h-3 text-slate-400" /> {model.bodyType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starting Price</p>
                      <p className="text-lg font-black text-[#C61B1E]">
                        {model.price || "Price on Request"}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 group-hover:bg-[#C61B1E] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 uppercase mb-1">No Models Found</h3>
            <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-6">
              No vehicle models matched your current search or filter criteria.
            </p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedFuel("All"); }}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BrandPage() {
  const params = useParams();
  const brandSlug = params.brand as string;
  const [brandNode, setBrandNode] = useState<EntityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!brandSlug) return;
      setIsLoading(true);
      try {
        const res = await graphClient.getNode({ id: "", slug: brandSlug });
        if (!res.node) {
          setNotFoundState(true);
          return;
        }

        const rawData = (res.node.data as any) || {};
        const data: Record<string, any> = rawData?.fields ? unwrapStruct(rawData) : rawData;

        setBrandNode({
          id: res.node.id,
          type: res.node.type,
          slug: res.node.slug,
          name: res.node.name || {},
          description: res.node.description || {},
          tags: res.node.tags || [],
          metadata: res.node.metadata || {},
          data: data,
          media: (res.node.media as any) || null,
          created_at: "",
          updated_at: res.node.updatedAt
        });
      } catch {
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [brandSlug]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse"><div className="h-64 bg-slate-200 rounded-[2rem]" /></div>;
  }

  if (notFoundState || !brandNode) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-[#C61B1E] mb-4" />
        <h1 className="text-2xl font-black text-slate-900 uppercase">Brand Not Found</h1>
        <p className="text-slate-500 text-sm mt-2 mb-6">Could not locate brand "{brandSlug}".</p>
        <Link href="/" className="px-5 py-2.5 bg-[#C61B1E] text-white font-bold text-xs rounded-xl">Back to Home</Link>
      </div>
    );
  }

  return <BrandView node={brandNode} />;
}
