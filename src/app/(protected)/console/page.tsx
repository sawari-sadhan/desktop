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

const ConsoleDashboard = () => {
  const stats = [
    { name: "Total Entities", value: "2,481", icon: Database, change: "+12%" },
    { name: "Graph Edges", value: "14,902", icon: Share2, change: "+5%" },
    { name: "API Uptime", value: "99.9%", icon: Activity, change: "Stable" },
    { name: "Ingestion Rate", value: "124/hr", icon: Zap, change: "+18%" },
  ];

  return (
    <div className="flex-1 p-12 space-y-16">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em] font-bold">Real-time Registry Intelligence</p>
        </div>
        <div className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
          Network Status: Operational
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-slate-100 group-hover:text-slate-950 transition-all duration-500">
                <stat.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-950 transition-colors" />
              </div>
              <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 border border-white/5">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
            <p className="text-3xl font-black text-slate-100 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-slate-100 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-8 h-[1px] bg-white/10" />
              Live Ingestion Stream
            </h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.02] flex items-center gap-6 hover:bg-white/[0.03] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 font-bold text-slate-400 text-xs">
                  {i}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300 font-semibold">New node <span className="text-slate-100 font-bold">HYUNDAI-IONIQ-6</span> synchronized</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5">14:0{i} • Automated Gateway</p>
                </div>
                <div className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[9px] font-mono border border-white/5">
                  SHA-256
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-8">
          <h2 className="text-[10px] font-bold text-slate-100 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-8 h-[1px] bg-white/10" />
            Core Analytics
          </h2>
          <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.03] shadow-sm space-y-10">
            {['Inference Latency', 'Database Cluster', 'Memory Pool'].map((label) => (
              <div key={label} className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-300">Optimal</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 40}%` }}
                    className="h-full bg-slate-300/30 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleDashboard;
