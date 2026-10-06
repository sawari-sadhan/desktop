"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Database, 
  Share2, 
  Zap, 
  BarChart3, 
  Clock 
} from "lucide-react";
import { PageLayout, PageContent } from "./components";

const ConsoleDashboard = () => {
  const stats = [
    { name: "Total Entities", value: "2,481", icon: Database, change: "+12%" },
    { name: "Graph Edges", value: "14,902", icon: Share2, change: "+5%" },
    { name: "API Uptime", value: "99.9%", icon: Activity, change: "Stable" },
    { name: "Ingestion Rate", value: "124/hr", icon: Zap, change: "+18%" },
  ];

  return (
    <PageLayout className="bg-slate-50/50">

      <PageContent className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <stat.icon className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-white text-slate-600 border border-slate-200 shadow-sm">
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {/* Activity Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-8 h-[1px] bg-slate-300" />
                Live Ingestion Stream
              </h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-6 hover:bg-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm font-bold text-slate-500 text-xs">
                    {i}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 font-semibold">New node <span className="text-slate-900 font-bold">HYUNDAI-IONIQ-6</span> synchronized</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5">14:0{i} • Automated Gateway</p>
                  </div>
                  <div className="px-3 py-1.5 bg-white text-slate-500 rounded-lg text-[9px] font-mono border border-slate-200 shadow-sm">
                    SHA-256
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default ConsoleDashboard;
