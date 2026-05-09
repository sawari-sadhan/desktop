"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface InlineDeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}

export const InlineDeleteConfirmation = ({ 
  onConfirm, 
  onCancel, 
  itemName 
}: InlineDeleteConfirmationProps) => {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DELETE";

  const handleConfirm = () => {
    if (confirmText === expectedText) {
      onConfirm();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden w-full"
    >
      <div className="mt-4 p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Destructive Action</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to remove <span className="text-white font-bold">"{itemName}"</span>? This cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative w-full">
            <label className="text-[9px] font-black text-rose-500/50 uppercase tracking-[0.2em] mb-2 block ml-1">
              Confirm by typing <span className="text-rose-500">{expectedText}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder={expectedText}
              className="w-full bg-black/40 border border-rose-500/20 rounded-xl py-3 px-4 text-xs text-white font-black tracking-[0.3em] focus:ring-1 focus:ring-rose-500/50 outline-none transition-all placeholder:text-rose-500/10"
              autoFocus
            />
          </div>
          
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmText !== expectedText}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Entry
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
