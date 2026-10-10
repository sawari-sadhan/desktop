"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  ArrowRight,
  MoreVertical,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

interface PipelineCard {
  id: string;
  name: string;
  brand: string;
  source: string;
  submittedBy: string;
  status: "incoming" | "validating" | "review" | "published";
  priority: "high" | "normal" | "low";
  timestamp: string;
  market: string;
}

export default function SamplePipelinePage() {
  const [cards, setCards] = useState<PipelineCard[]>([
    {
      id: "pipe_1",
      name: "Aston Martin Vanquish 2026",
      brand: "Aston Martin",
      source: "Official Press Kit PDF",
      submittedBy: "Automated Ingestion",
      status: "incoming",
      priority: "high",
      timestamp: "12 mins ago",
      market: "Global"
    },
    {
      id: "pipe_2",
      name: "Lucid Gravity • Dream Edition",
      brand: "Lucid",
      source: "EPA Registry Scraper",
      submittedBy: "Scraper Worker #3",
      status: "incoming",
      priority: "normal",
      timestamp: "45 mins ago",
      market: "US / UAE"
    },
    {
      id: "pipe_3",
      name: "Ferrari 12Cilindri • Spider",
      brand: "Ferrari",
      source: "Dealer Specification API",
      submittedBy: "Distributor Gateway",
      status: "validating",
      priority: "high",
      timestamp: "2 hours ago",
      market: "Nepal / India"
    },
    {
      id: "pipe_4",
      name: "BMW M5 Touring (G99)",
      brand: "BMW",
      source: "Homologation Sheet",
      submittedBy: "Admin Manual",
      status: "validating",
      priority: "normal",
      timestamp: "3 hours ago",
      market: "Germany (EU)"
    },
    {
      id: "pipe_5",
      name: "Porsche Macan EV • Turbo",
      brand: "Porsche",
      source: "MSRP Price Revision",
      submittedBy: "Catalog Team",
      status: "review",
      priority: "high",
      timestamp: "Yesterday",
      market: "Nepal (Rs. 2.95 Cr)"
    },
    {
      id: "pipe_6",
      name: "Audi Q6 e-tron • Quattro",
      brand: "Audi",
      source: "WLTP Range Verification",
      submittedBy: "Lead Data Analyst",
      status: "review",
      priority: "normal",
      timestamp: "2 days ago",
      market: "Global"
    },
    {
      id: "pipe_7",
      name: "Mercedes-AMG GT 63 S E",
      brand: "Mercedes-Benz",
      source: "Full Tech Matrix Check",
      submittedBy: "Senior Reviewer",
      status: "published",
      priority: "normal",
      timestamp: "3 days ago",
      market: "Nepal & UAE"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const columns: { id: PipelineCard["status"]; title: string; countColor: string; desc: string }[] = [
    { id: "incoming", title: "1. Raw Ingestion", countColor: "bg-slate-200 text-slate-700", desc: "Parsed PDFs, scraped specs & unvalidated payload" },
    { id: "validating", title: "2. Schema Check", countColor: "bg-blue-100 text-blue-700", desc: "Automated engine, torque, and unit sanity tests" },
    { id: "review", title: "3. Specialist Review", countColor: "bg-amber-100 text-amber-700", desc: "Human confirmation of regional prices & media" },
    { id: "published", title: "4. Live In Graph", countColor: "bg-emerald-100 text-emerald-700", desc: "Active in public API and knowledge graph" }
  ];

  const moveCard = (id: string, nextStatus: PipelineCard["status"]) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, status: nextStatus } : card))
    );
    setToastMessage(`Card advanced to ${nextStatus.toUpperCase()} stage.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCards = cards.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trim in pipeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none w-full sm:w-64 focus:border-slate-400"
            />
          </div>

          <button
            onClick={() => {
              const newCard: PipelineCard = {
                id: `pipe_${Date.now()}`,
                name: "Aston Martin DBX707 • AMR",
                brand: "Aston Martin",
                source: "Fast Track Import",
                submittedBy: "Quick Creator",
                status: "incoming",
                priority: "high",
                timestamp: "Just now",
                market: "Nepal / Global"
              };
              setCards([newCard, ...cards]);
              setToastMessage("New model queued into ingestion stage.");
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-sm font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Queue Model</span>
          </button>
        </div>

        {/* Action Toast */}
        {toastMessage && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-sm font-semibold border border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Multi-Column Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            const columnCards = filteredCards.filter((c) => c.status === col.id);
            return (
              <div 
                key={col.id} 
                className="bg-slate-100/70 p-5 rounded-3xl border border-slate-200 space-y-4 flex flex-col min-h-[550px]"
              >
                {/* Column Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.countColor}`}>
                      {columnCards.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal mt-1 leading-tight">
                    {col.desc}
                  </p>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnCards.map((card) => {
                    const nextStage: Record<PipelineCard["status"], PipelineCard["status"] | null> = {
                      incoming: "validating",
                      validating: "review",
                      review: "published",
                      published: null
                    };
                    const next = nextStage[card.status];

                    return (
                      <div 
                        key={card.id}
                        className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              {card.brand}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                              {card.name}
                            </h4>
                          </div>
                          {card.priority === "high" && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold uppercase tracking-wider shrink-0">
                              Priority
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs font-normal">
                          <div className="flex justify-between text-slate-500">
                            <span>Source:</span>
                            <span className="font-semibold text-slate-700">{card.source}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Target:</span>
                            <span className="font-semibold text-slate-900">{card.market}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-normal">
                            {card.timestamp}
                          </span>

                          {next && (
                            <button
                              onClick={() => moveCard(card.id, next)}
                              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 group"
                              title={`Advance to ${next}`}
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                          {!next && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Live</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {columnCards.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm font-normal border-2 border-dashed border-slate-200 rounded-2xl">
                      No records in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </PageContent>
    </PageLayout>
  );
}