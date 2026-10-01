"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for search logic goes here
    console.log("Searching for:", query);
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-30 w-[90%] max-w-4xl bg-white rounded-full p-2 flex items-center border border-gray-200">
      <form onSubmit={handleSearch} className="flex-1 flex items-center w-full">
        <div className="flex-1 flex items-center px-6 gap-3 text-gray-500 relative">
          <SearchIcon className="w-5 h-5 text-[#B40003]" />
          
          <div className="relative flex-1 flex items-center">
            {/* Custom Blinking Cursor Placeholder */}
            {(isFocused && !query) && (
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="inline-block w-[1px] h-[1.1em] bg-[#B40003] rounded-full"
                />
              </div>
            )}
            
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full bg-transparent outline-none text-slate-900 py-4 relative z-10 ${(!query && isFocused) ? 'caret-transparent' : 'caret-[#B40003]'}`} 
            />
          </div>
        </div>
        <button 
          type="submit"
          className="px-10 py-4 bg-[#B40003] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#8A0002] transition-colors ml-2"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
