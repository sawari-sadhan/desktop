"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Fuel, Settings } from "lucide-react";
import Link from "next/link";
import { agentClient, CONFIG } from "../../../../../lib";

export interface VehicleReference {
  id?: string;
  slug: string;
  name: string;
  brand?: string;
  price?: string;
  fuel?: string;
  trans?: string;
  image?: string;
  url?: string;
}

interface AskPanelProps {
  query: string;
  isFocused: boolean;
  isSubmitted: boolean;
  isLoading?: boolean;
}

export function AskPanel({ query, isFocused, isSubmitted, isLoading: parentIsLoading }: AskPanelProps) {
  const [aiResponse, setAiResponse] = useState("");
  const [references, setReferences] = useState<VehicleReference[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isSubmitted && query) {
      const fetchResponse = async () => {
        setIsFetching(true);
        try {
          // Direct POST to FastAPI Agent endpoint to retrieve reply and referenced vehicle nodes with slugs
          const response = await fetch(`${CONFIG.AGENT.API_URL}/AgentService/Ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          if (response.ok) {
            const data = await response.json();
            setAiResponse(data.reply || "");
            setReferences(data.vehicles || []);
          } else {
            const fallbackRes = await agentClient.ask({ query });
            setAiResponse(fallbackRes.reply);
            setReferences((fallbackRes as any).vehicles || []);
          }
        } catch (error) {
          try {
            const fallbackRes = await agentClient.ask({ query });
            setAiResponse(fallbackRes.reply);
            setReferences((fallbackRes as any).vehicles || []);
          } catch {
            setAiResponse("I'm sorry, I couldn't connect to the AI Agent. Make sure the backend is running.");
            setReferences([]);
          }
        } finally {
          setIsFetching(false);
        }
      };
      fetchResponse();
    }
  }, [isSubmitted, query]);

  if (!isSubmitted || !query) return null;

  const isLoading = parentIsLoading || isFetching;

  return (
    <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-8 pb-4">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="h-6 bg-emerald-50 rounded w-48"></div>
          </div>
          <div className="space-y-3 mb-12">
            <div className="h-4 bg-emerald-50/50 rounded w-full"></div>
            <div className="h-4 bg-emerald-50/50 rounded w-11/12"></div>
            <div className="h-4 bg-emerald-50/50 rounded w-4/5"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="pt-1.5">
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>

          {references.length > 0 && (
            <div className="border-t border-slate-100 pt-8 mt-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-['Clash_Display'] font-bold text-[#050B20]">Related References</h3>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  {references.length} Vehicle{references.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {references.map((car, idx) => {
                  const targetSlug = car.slug || "";
                  const targetUrl = targetSlug ? `/${targetSlug}` : (car.url || "#");
                  const fallbackImg = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop";

                  return (
                    <Link href={targetUrl} key={car.id || targetSlug || idx} className="block group">
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all h-full flex flex-col hover:shadow-lg hover:border-gray-300">
                        <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                          <img
                            src={car.image || fallbackImg}
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
                            <div className="font-bold text-[#B40003] text-base">{car.price || "Unlisted"}</div>
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
            </div>
          )}

          {/* AI Disclaimer Footer */}
          <div className="mt-10 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 font-medium">Responses are generated by AI and may be inaccurate. Please verify critical specifications.</p>
          </div>
        </>
      )}
    </section>
  );
}
