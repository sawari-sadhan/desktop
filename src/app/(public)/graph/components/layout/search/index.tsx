import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchHUDProps {
  onSearch: (query: string) => void;
}

const SearchHUD: React.FC<SearchHUDProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="absolute top-10 w-[32rem] z-40 -translate-x-1/2" style={{ left: 'calc((100% - 26rem - 40px) / 2)' }}>
      <div className="relative group">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative flex items-center px-6 py-4">
          <Search className="w-5 h-5 text-teal-400/60 group-hover:text-teal-400 transition-colors" />
          <input 
            type="text"
            placeholder="SEARCH_REGISTRY_INDEX // INITIALIZING..."
            value={query}
            onChange={handleChange}
            className="bg-transparent border-none outline-none flex-1 ml-4 text-[13px] font-mono tracking-[0.2em] text-zinc-100 placeholder:text-zinc-600 uppercase"
          />
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-xs">
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest">CMD+K</span>
          </div>
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal-500/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-teal-500/20" />
      </div>
    </div>
  );
};

export default SearchHUD;
