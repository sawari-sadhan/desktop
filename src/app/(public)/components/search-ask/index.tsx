"use client";

import React, { useState } from "react";
import { Search as SearchIcon, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { SearchPanel } from "./search";
import { AskPanel } from "./ask";

export default function SearchBar() {
  const [mode, setMode] = useState<"search" | "ask">("search");
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleManualSetMode = (newMode: "search" | "ask") => {
    setMode(newMode);
    setIsManualOverride(true);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsSubmitted(false);
    setIsLoading(false);
    
    // Reset state if input is cleared
    if (val.trim() === "") {
      setIsManualOverride(false);
      setMode("search");
      return;
    }

    // Auto-detect mode if user hasn't explicitly overridden it
    if (!isManualOverride) {
      const isConversational = 
        val.trim().split(/\s+/).length >= 4 || 
        /^(what|how|why|where|best|list|under|above|show|tell|which|top|cheapest|most)\b/i.test(val.trim()) ||
        val.includes("?");
      
      setMode(isConversational ? "ask" : "search");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") return;

    if (mode === "search") {
      setIsSubmitted(true);
    } else {
      // Simulate AI processing delay
      setIsLoading(true);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="w-full flex flex-col relative z-30">
      <div className="w-[95%] max-w-5xl mx-auto bg-white rounded-full p-2 flex flex-col md:flex-row items-center border border-slate-200 gap-2">
        
        {/* Mode Switcher */}
        <div className="flex items-center relative w-full md:w-auto shrink-0 h-12">
          {/* Animated Pill Background */}
          <div className="absolute inset-y-0 left-0 right-0 pointer-events-none p-1">
             <motion.div 
               className="w-1/2 h-full bg-slate-100 rounded-full"
               animate={{ x: mode === "search" ? 0 : "100%" }}
               transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
             />
          </div>

          <button 
            type="button"
            onClick={() => handleManualSetMode("search")}
            className={`relative z-10 w-32 h-full flex items-center justify-center gap-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${mode === "search" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <SearchIcon className="w-3.5 h-3.5" />
            Search
          </button>
          <button 
            type="button"
            onClick={() => handleManualSetMode("ask")}
            className={`relative z-10 w-32 h-full flex items-center justify-center gap-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${mode === "ask" ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden md:block" />

        {/* Input Form */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center w-full relative group h-12">
          <div className="flex-1 flex items-center px-4 gap-4 text-slate-500 relative h-full">

            <div className="relative flex-1 flex items-center h-full">
              {/* Custom Blinking Cursor Placeholder */}
              {(isFocused && !query) && (
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className={`inline-block w-[2px] h-[1.2em] rounded-full ${mode === 'ask' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  />
                </div>
              )}
              
              {/* Placeholder Text */}
              {(!isFocused && !query) && (
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm font-medium">
                    {mode === "search" ? "Search for brands, models, or variants..." : "Ask anything (e.g. 'Show me electric SUVs under 40 lakhs')..."}
                  </span>
                </div>
              )}
              
              <input 
                type="text" 
                value={query}
                onChange={handleQueryChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full h-full bg-transparent outline-none text-slate-900 relative z-10 text-sm font-medium ${(!query && isFocused) ? 'caret-transparent' : (mode === 'ask' ? 'caret-emerald-500' : 'caret-slate-400')}`} 
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`h-full px-8 text-white rounded-full flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all ml-2 ${mode === 'ask' ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400' : 'bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700'}`}
          >
            {isLoading ? (
              <>
                Thinking
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </>
            ) : (
              <>
                {mode === "search" ? "Search" : "Ask"}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Panels in normal document flow */}
      {mode === "search" ? (
        <SearchPanel query={query} isFocused={isFocused} isSubmitted={isSubmitted} />
      ) : (
        <AskPanel query={query} isFocused={isFocused} isSubmitted={isSubmitted} isLoading={isLoading} />
      )}
    </div>
  );
}
