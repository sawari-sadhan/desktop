"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Info,
  ShieldAlert,
  CircleDot,
} from "lucide-react";
import { obdClient } from "@lib/core";
import type { ObdCode } from "@lib/gen/graph_obd_pb";
import { theme } from "../theme";
import { PageLayout, PageHeader, PageTitle, PageActions, PageContent } from "../components";

const PAGE_SIZE = 20;

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  critical: { label: "Critical", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: ShieldAlert },
  high:     { label: "High",     color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: AlertTriangle },
  medium:   { label: "Medium",   color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Zap },
  low:      { label: "Low",      color: "text-slate-500 bg-slate-100 border-slate-200", icon: Info },
};

const getSeverityConfig = (severity: string) =>
  SEVERITY_CONFIG[severity?.toLowerCase()] ?? SEVERITY_CONFIG.low;

const OBDPage = () => {
  const [codes, setCodes]           = useState<ObdCode[]>([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]             = useState(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await obdClient.searchObdCodes({
        query: debouncedSearch,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setCodes(res.codes as ObdCode[]);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load OBD codes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageLayout>


      <PageContent>
        {/* Full-width OBD list layout */}
        <div className={theme.layout.listWrapper}>
          
          {/* Table Header */}
          <div className={theme.layout.tableHeader}>
            <div className="col-span-2">Code</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Severity</div>
            <div className="col-span-2 text-right">Details</div>
          </div>

          {/* List Content */}
          <div className={theme.layout.listContent}>
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 items-center p-5 rounded-2xl border border-slate-200 bg-slate-50 h-20 animate-pulse">
                    <div className="col-span-2 h-8 bg-slate-200 rounded-xl w-24" />
                    <div className="col-span-6 h-5 bg-slate-200 rounded-lg w-3/4" />
                    <div className="col-span-2 h-8 bg-slate-200 rounded-xl w-24 mx-auto" />
                    <div className="col-span-2 h-8 bg-slate-200 rounded-xl w-20 ml-auto" />
                  </div>
                ))
              ) : codes.length > 0 ? (
                codes.map((code, idx) => {
                  const sev = getSeverityConfig(code.severity);
                  const SevIcon = sev.icon;

                  return (
                    <Link
                      key={code.id}
                      href={`/console/obd/${code.code}`}
                      className="block focus:outline-none focus:ring-1 focus:ring-white/15 rounded-2xl"
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ delay: idx * 0.025 }}
                        className={theme.components.listItem}
                      >
                        {/* Code badge */}
                        <div className="col-span-2 flex items-center">
                          <span className="font-mono font-black text-slate-900 text-sm tracking-wider bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl group-hover:bg-white group-hover:border-blue-200 transition-colors">
                            {code.code}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="col-span-6 min-w-0 flex items-center">
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors truncate block">
                            {code.title || "—"}
                          </span>
                        </div>

                        {/* Severity badge */}
                        <div className="col-span-2 flex justify-center items-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${sev.color}`}>
                            <SevIcon className="w-3 h-3" />
                            {sev.label}
                          </div>
                        </div>

                        {/* Sections Count */}
                        <div className="col-span-2 flex justify-end items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                            {code.details?.length ?? 0} section{code.details?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-20 text-center space-y-4">
                  <CircleDot className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                    No OBD codes found
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className={theme.components.paginationWrapper}>
                <p className={theme.typography.subtitle}>
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default OBDPage;
