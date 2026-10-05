"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Fuel, Settings, Calendar, Gauge } from "lucide-react";
import { focusClient, graphClient } from "@/lib/core";
import Link from "next/link";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema, StructSchema } from "@bufbuild/protobuf/wkt";
import { HeroSliderSpecification } from "./specification";
import { SmartImage } from "@components";

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `http://localhost:5051/${url}`;
};

const extractSpec = (data: any, keys: string[]): string => {
  if (!data || typeof data !== "object") return "";
  
  // Direct key check
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      return String(data[k]);
    }
  }

  // Specifications sub-object check
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

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await focusClient.listHighlights({ type: "hero_slider", status: "active" });
        if (res.highlights && res.highlights.length > 0) {
          
          const fetchedSlides = await Promise.all(res.highlights.map(async (hl) => {
            let price = "";
            let fuel = "";
            let trans = "";
            let year = "";
            let miles = "";
            let image = "";
            let imageFound = false;

            // 1. Check highlight media
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

                  // 2. Check node media if not found on highlight
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
                  
                  fuel = extractSpec(data, ["fuel_type", "fuelType", "fuel", "engine_type"]);
                  trans = extractSpec(data, ["transmission", "trans", "gearbox"]);
                  year = extractSpec(data, ["year", "model_year", "release_year"]);
                  miles = extractSpec(data, ["mileage", "miles", "driven", "range"]);
                }
              } catch (e) {
                console.error("Failed to fetch node details for highlight", hl.id, e);
              }
            }

            return {
              id: hl.id,
              name: name || "Featured Vehicle",
              subtitle: hl.subtitle || "",
              price,
              fuel,
              trans,
              year,
              miles,
              image,
              url: hl.targetUrl || "#",
            };
          }));

          setSlides(fetchedSlides.filter(Boolean));
        } else {
          setSlides([]);
        }
      } catch (err) {
        console.error("Failed to fetch hero highlights", err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-slate-900 animate-pulse"></div>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-slate-950">
      {/* Background Images */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((s, index) => (
          <div 
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            {s.image ? (
              <SmartImage src={s.image} alt={s.name} variant="large" fill className="w-full h-full object-cover" priority />
            ) : (
              <div className="w-full h-full bg-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10" />
          </div>
        ))}
      </div>

      {/* Floating Left and Right Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Content Overlay */}
      <div className="relative z-20 container mx-auto max-w-7xl px-8 md:px-16 h-full flex flex-col md:flex-row items-center justify-between pb-16 md:pb-0">
        {/* Left Side: Product Price & Name */}
        <div className="text-white mt-24 md:mt-0 transition-all duration-500 transform translate-y-0 opacity-100 max-w-2xl" key={`text-${currentSlide}`}>
          {slide.price && <p className="text-3xl md:text-4xl font-bold text-white mb-2">{slide.price}</p>}
          <h1 className="text-5xl md:text-7xl font-['Clash_Display'] font-bold mb-4">{slide.name}</h1>
          {slide.subtitle && <p className="text-gray-300 text-lg mb-6">{slide.subtitle}</p>}
        </div>

        {/* Right Side: Translucent Compact Specs Card */}
        <HeroSliderSpecification key={`card-${currentSlide}`} slide={slide} className="mt-8 md:mt-0" />
      </div>

      {/* Pagination Dots (Bottom Left) */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-8 md:left-16 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
