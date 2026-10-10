"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Database, 
  Globe2, 
  Zap, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Layers,
  ArrowRight
} from "lucide-react";
import { PageLayout, PageContent, TopbarActions } from "../../components";
import { theme } from "../../theme";

export default function SampleDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const metrics = [
    {
      title: "Active Vehicle Nodes",
      value: "4,820",
      change: "+14.2%",
      caption: "vs previous period",
      icon: Layers,
    },
    {
      title: "Regional Markets",
      value: "38",
      change: "+4 countries",
      caption: "Nepal, India, UAE primary",
      icon: Globe2,
    },
    {
      title: "Price Queries / min",
      value: "1,248",
      change: "+28.5%",
      caption: "Graph neighbor traversals",
      icon: Zap,
    },
    {
      title: "Sync Latency",
      value: "18ms",
      change: "-4ms",
      caption: "PostgreSQL & Redis cache",
      icon: Clock,
    },
  ];

  const recentEvents = [
    {
      id: "ev_1",
      action: "New Trim Available",
      target: "Aston Martin DB12 • Volante V8",
      market: "Nepal (Rs. 4.2 Cr)",
      time: "14:04 • Automated Gateway",
      status: "Verified",
    },
    {
      id: "ev_2",
      action: "Price Range Revised",
      target: "Audi A6 2026 • 45 TFSI Quattro",
      market: "India (₹ 74.5L - ₹ 82.0L)",
      time: "14:03 • Regional Distributor",
      status: "Active",
    },
    {
      id: "ev_3",
      action: "Market Node Linked",
      target: "Porsche Taycan 4S",
      market: "UAE (AED 420,000)",
      time: "14:02 • Catalog Admin",
      status: "Booking Open",
    },
    {
      id: "ev_4",
      action: "Specification Sync",
      target: "Hyundai Ioniq 6 • AWD Long Range",
      market: "Global Master Catalog",
      time: "14:01 • System Job",
      status: "Synchronized",
    },
  ];

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <TopbarActions>
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            {["24h", "7d", "30d", "YTD"].map((r) => {
              const isActive = timeRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-4 py-2.5 rounded-3xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 group relative ${
                    isActive
                      ? "bg-slate-50 text-slate-900 border border-slate-200 font-bold"
                      : "text-slate-500 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0 ml-1"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </TopbarActions>

      <PageContent className={theme.layout.contentWrapper}>
        {/* Stats Grid - Exactly like /console */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group cursor-default"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                    <Icon className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white text-slate-600 border border-slate-200 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight mt-1">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Live Activity Stream - Exactly like /console */}
        <div className="w-full space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <div className="w-8 h-[2px] bg-slate-400" />
              Live Ingestion & Availability Stream
            </h2>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Automated Stream Active
            </span>
          </div>

          <div className="space-y-4">
            {recentEvents.map((ev, i) => (
              <div 
                key={ev.id} 
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-6 hover:bg-slate-100 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 font-bold text-slate-600 text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-normal truncate">
                    {ev.action} <span className="text-slate-900 font-semibold">{ev.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {ev.time} • <span className="font-semibold text-slate-600">{ev.market}</span>
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border border-slate-200">
                  {ev.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </PageContent>
    </PageLayout>
  );
}