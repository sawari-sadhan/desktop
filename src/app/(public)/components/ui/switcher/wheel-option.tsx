"use client";

import React from "react";
import { motion } from "framer-motion";
import { Car, Bike } from "lucide-react";

interface WheelOptionSwitcherProps {
  value: "4w" | "2w";
  onChange: (value: "4w" | "2w") => void;
  size?: "sm" | "lg";
  disabled?: boolean;
}

export const WheelOptionSwitcher: React.FC<WheelOptionSwitcherProps> = ({ 
  value, 
  onChange, 
  size = "sm", 
  disabled = false 
}) => {
  const isLarge = size === "lg";
  
  return (
    <div className={`flex items-center relative w-full md:w-auto shrink-0 bg-slate-100/50 rounded-full p-1 ${isLarge ? "h-14" : "h-10"} ${disabled ? "opacity-75 cursor-not-allowed pointer-events-none" : ""}`}>
      {/* Animated Pill Background */}
      <div className="absolute inset-y-0 left-0 right-0 pointer-events-none p-1">
         <motion.div 
           className="w-1/2 h-full bg-white rounded-full shadow-sm"
           animate={{ x: value === "4w" ? 0 : "100%" }}
           transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
         />
      </div>

      <button 
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange("4w")}
        className={`relative z-10 h-full flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.15em] transition-colors ${
          isLarge ? "w-48 text-xs" : "w-32 text-[11px]"
        } ${value === "4w" ? "text-slate-900" : "text-slate-400"} ${disabled ? "cursor-not-allowed" : "hover:text-slate-600"}`}
      >
        <Car className={isLarge ? "w-4 h-4" : "w-3.5 h-3.5"} />
        4 Wheel
      </button>
      <button 
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange("2w")}
        className={`relative z-10 h-full flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.15em] transition-colors ${
          isLarge ? "w-48 text-xs" : "w-32 text-[11px]"
        } ${value === "2w" ? "text-slate-900" : "text-slate-400"} ${disabled ? "cursor-not-allowed" : "hover:text-slate-600"}`}
      >
        <Bike className={isLarge ? "w-4 h-4" : "w-3.5 h-3.5"} />
        2 Wheel
      </button>
    </div>
  );
};