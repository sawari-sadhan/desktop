"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { BrandView } from "./brand/page";
import { ModelView } from "./model/page";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

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

export default function SlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [node, setNode] = useState<EntityNode | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const loadNode = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await graphClient.getNode({ id: "", slug });
        if (!res.node) {
          setNotFoundState(true);
          return;
        }

        const rawData = (res.node.data as any) || {};
        const data: Record<string, any> = rawData?.fields ? unwrapStruct(rawData) : rawData;

        setNode({
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

        if (res.node.type === "model" || res.node.type === "vehicle") {
          try {
            const neighbors = await graphClient.getNeighbors({
              nodeId: res.node.id,
              linkTypes: ["has_model"]
            });
            const bNode = (neighbors.nodes || []).find((n: any) => n.type === "brand");
            if (bNode) {
              const bNameObj = unwrapStruct(bNode.name) || {};
              setBrandName(bNameObj.en || bNameObj.np || bNameObj.default || bNode.slug);
              setBrandSlug(bNode.slug);
            }
          } catch {
            // ignore
          }
        }

      } catch (err) {
        console.error("Failed to fetch node by slug:", err);
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadNode();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mb-8" />
        <div className="h-64 bg-slate-200 rounded-[2rem] mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl" />
          <div className="h-72 bg-slate-200 rounded-2xl" />
          <div className="h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFoundState || !node) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <div className="w-20 h-20 bg-red-50 text-[#C61B1E] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">Page Not Found</h1>
        <p className="text-slate-500 max-w-md mb-8 text-sm font-medium">
          We couldn't find any vehicle or brand matching <span className="font-bold text-slate-700">"{slug}"</span>.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#C61B1E] text-white font-bold text-sm rounded-xl hover:bg-[#a61518] transition-colors shadow-lg shadow-[#C61B1E]/20"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  if (node.type === "brand") {
    return <BrandView node={node} />;
  }

  return <ModelView node={node} brandName={brandName} brandSlug={brandSlug} />;
}
