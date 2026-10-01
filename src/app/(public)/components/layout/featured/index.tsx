"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Fuel, Settings } from "lucide-react";
import { focusClient, graphClient } from "@/lib/core";
import Link from "next/link";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema, StructSchema } from "@bufbuild/protobuf/wkt";

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `http://localhost:5051/${url}`;
};

const extractSpec = (data: any, keys: string[]): string => {
  if (!data || typeof data !== "object") return "";
  
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      return String(data[k]);
    }
  }

  const specs = data.specifications || data.specs || data.spec;
  if (specs && typeof specs === "object") {
    for (const k of keys) {
      if (specs[k] !== undefined && specs[k] !== null && specs[k] !== "") {
        return String(specs[k]);
      }
    }
    const lowerKeys = keys.map((k) => k.toLowerCase());
    for (const key of Object.keys(specs)) {
      if (lowerKeys.includes(key.toLowerCase()) && specs[key] !== undefined && specs[key] !== null && specs[key] !== "") {
        return String(specs[key]);
      }
    }
  }

  return "";
};

export function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await focusClient.listHighlights({ type: "featured_vehicle", status: "active" });
        if (res.highlights && res.highlights.length > 0) {
          const fetchedVehicles = await Promise.all(
            res.highlights.map(async (hl) => {
              let price = "N/A";
              let fuel = "N/A";
              let trans = "N/A";
              let image = "";
              let imageFound = false;

              // 1. Highlight Media
              if (hl.media) {
                const mediaArr = (toJson(ListValueSchema, hl.media) as any[]) || [];
                if (mediaArr.length > 0) {
                  const cover = mediaArr.find((m: any) => m.isCover === true) || mediaArr[0];
                  const resolvedUrl = getImageUrl(cover?.url);
                  if (resolvedUrl) {
                    image = resolvedUrl;
                    imageFound = true;
                  }
                }
              }

              let name = hl.title || "";

              const nodeId = hl.metadata?.node_id as string;
              if (nodeId) {
                try {
                  const nodeRes = await graphClient.getNode({ id: nodeId });
                  if (nodeRes.node) {
                    let data: any = {};
                    if (nodeRes.node.data) {
                      try {
                        data = toJson(StructSchema, nodeRes.node.data) || {};
                      } catch {
                        data = (nodeRes.node.data as any) || {};
                      }
                    }

                    if (!name && nodeRes.node.name) {
                      const nodeName = nodeRes.node.name as any;
                      name = typeof nodeName === "string" ? nodeName : nodeName.en || nodeName.np || "";
                    }

                    // 2. Node Media if not found on highlight
                    if (!imageFound && nodeRes.node.media) {
                      const nodeMediaArr = (toJson(ListValueSchema, nodeRes.node.media) as any[]) || [];
                      if (nodeMediaArr.length > 0) {
                        const cover = nodeMediaArr.find((m: any) => m.isCover === true) || nodeMediaArr[0];
                        const resolvedUrl = getImageUrl(cover?.url);
                        if (resolvedUrl) {
                          image = resolvedUrl;
                          imageFound = true;
                        }
                      }
                    }

                    const pricing = data.pricing || {};
                    if (pricing.basePrice) {
                      price = `Rs.${Number(pricing.basePrice).toLocaleString()}`;
                    } else if (pricing.price) {
                      price = `Rs.${Number(pricing.price).toLocaleString()}`;
                    } else if (data.basePrice) {
                      price = `Rs.${Number(data.basePrice).toLocaleString()}`;
                    }

                    const extractedFuel = extractSpec(data, ["fuel_type", "fuelType", "fuel", "engine_type"]);
                    if (extractedFuel) fuel = extractedFuel;

                    const extractedTrans = extractSpec(data, ["transmission", "trans", "gearbox"]);
                    if (extractedTrans) trans = extractedTrans;
                  }
                } catch (e) {
                  console.error("Failed to fetch node for featured vehicle", hl.id, e);
                }
              }

              return {
                id: hl.id,
                name: name || "Featured Vehicle",
                price,
                fuel,
                trans,
                image,
                url: hl.targetUrl || "#",
              };
            })
          );

          setVehicles(fetchedVehicles.filter(Boolean));
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error("Failed to fetch featured vehicles highlights", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-20 pb-16 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-20 pb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20]">Popular Deals</h2>
        <Link href="/inventory" className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#B40003] transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((car) => (
          <Link href={car.url || "#"} key={car.id} className="block group">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {car.image ? (
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">No Image</div>
                )}
              </div>
              <div className="p-5 flex flex-col justify-between h-44">
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

export default FeaturedVehicles;
