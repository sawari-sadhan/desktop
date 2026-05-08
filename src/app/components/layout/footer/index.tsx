"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between h-24 gap-4">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            © 2026 SAWARI SADHAN • Vehicle Intelligence
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Registry API</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Legal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
