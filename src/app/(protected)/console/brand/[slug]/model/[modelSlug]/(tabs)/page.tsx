"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphClient, EntityNode } from '@lib/core';
import { Car, Settings } from 'lucide-react';

export default function ModelPage() {
  const params = useParams();
  const [model, setModel] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await graphClient.getNode({ id: "", slug: params.modelSlug as string });
        if (!res.node) return;
        setModel(res.node as any);

        const neighbors = await graphClient.getNeighbors({
          nodeId: res.node.id,
          linkTypes: ["has_variant"]
        });
        
        const variantNodes = (neighbors.nodes || []).filter(n => n.type === 'variant');
        setVariants(variantNodes as any);
      } catch (err) {
        console.error("Failed to load variants", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [params.modelSlug]);

  return (
    <div className="p-12 max-w-7xl mx-auto">
      {isLoading ? (
        <div className="h-48 bg-white rounded-[2rem] border border-slate-200 animate-pulse shadow-sm" />
      ) : variants.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[2rem] p-16 text-center text-slate-400">
          <Car className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-lg text-slate-600">No variants found</p>
          <p className="text-sm mt-2 max-w-sm mx-auto">This model does not have any variants associated with it in the database yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {variants.map(v => (
            <Link 
              href={`/console/brand/${params.slug}/model/${params.modelSlug}/variant/${v.slug}`}
              key={v.id}
              className="group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-lg shadow-sm transition-all block"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                      {(v.name as any)?.en || v.slug}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">Variant</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
