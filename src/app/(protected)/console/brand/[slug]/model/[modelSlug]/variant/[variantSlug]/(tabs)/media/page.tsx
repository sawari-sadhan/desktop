"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";

export default function MediaPage() {
  const params = useParams();
  const variantSlug = params.variantSlug as string;

  return (
    <div className="p-12 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Variant Media</h2>
        <p className="text-slate-500 font-medium">Media uploading functionality for {variantSlug} will be implemented here.</p>
      </div>
    </div>
  );
}
