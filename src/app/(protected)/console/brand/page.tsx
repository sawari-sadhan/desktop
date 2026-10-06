"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Globe, MapPin, Search, RefreshCw, Layers, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { PageLayout, PageHeader, PageTitle, PageActions, PageContent } from "../components";
import { theme } from "../theme";

const BrandRegistryPage = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const response = await graphClient.searchNodes({
        query: "",
        types: ["brand"],
        limit: 100,
        vector: []
      });
      
      const mappedBrands: EntityNode[] = (response.nodes || []).map(n => ({
        id: n.id,
        type: n.type,
        slug: n.slug,
        name: n.name || {},
        description: n.description || {},
        tags: n.tags || [],
        metadata: n.metadata || {},
        data: n.data || {},
        created_at: "",
        updated_at: n.updatedAt
      }));
      
      setBrands(mappedBrands);
    } catch (err) {
      console.error("Failed to load brands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = brands.filter(brand => {
    const nameStr = (brand.name?.en || brand.name?.default || "").toString().toLowerCase();
    
    return nameStr.includes(searchTerm.toLowerCase()) || brand.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <PageLayout>


      <PageContent>
        {/* Brand Grid */}
        <div className={theme.layout.grid}>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-[2rem] h-56 animate-pulse" />
              ))
            ) : filteredBrands.length > 0 ? (
              filteredBrands.map((brand, idx) => (
                <motion.div
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => router.push(`/console/brand/${brand.slug}`)}
                  className={theme.components.card}
                >
                  {/* Decorative Background Element */}
                  <div className={theme.components.cardDecorativeBg} />
                  
                  <div className="space-y-8 relative">
                    <div className="flex items-start justify-between">
                      <div className={theme.components.cardIconContainer}>
                        {typeof brand.name === 'object' ? (brand.name?.en || "?")[0] : (brand.name || "?")[0]}
                      </div>
                      <div className={theme.components.cardBadge}>
                        {brand.slug}
                      </div>
                    </div>

                    <div>
                      <h3 className={theme.typography.cardTitle}>
                        {typeof brand.name === 'object' ? (brand.name?.en || "Unnamed Brand") : (brand.name || "Unnamed Brand")}
                      </h3>
                      <p className={theme.typography.cardSubtitle}>
                        {typeof brand.description === 'object' ? (brand.description?.en || "No description provided.") : (brand.description || "No description provided.")}
                      </p>
                    </div>

                    <div className={theme.components.cardFooter}>
                      <div className={theme.components.cardFooterItem}>
                        <MapPin className="w-3 h-3" />
                        <span className={theme.components.cardFooterText}>
                          {brand.data?.headquarters || "Unknown HQ"}
                        </span>
                      </div>
                      <div className={theme.components.cardFooterItem}>
                        <Layers className="w-3 h-3" />
                        <span className={theme.components.cardFooterText}>
                          ID: {brand.id.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">No matching brands discovered in registry</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </PageContent>
    </PageLayout>
  );
};

// Simple icon fallback if CheckCircle2 is missing or for design variety
const CheckCircleIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default BrandRegistryPage;
