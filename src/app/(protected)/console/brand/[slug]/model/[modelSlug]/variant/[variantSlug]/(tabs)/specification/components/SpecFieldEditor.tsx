"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  Search, 
  Plus, 
  ChevronDown, 
  X, 
  Sparkles, 
  Loader2, 
  Database, 
  Hash, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { graphClient, NodeType, EntityNode } from "@lib/core";
import { parseSpecValue } from "../config";

interface SpecFieldEditorProps {
  specKey: string;
  value: any;
  attributeType?: NodeType;
  onChange: (newValue: any, immediate?: boolean) => void;
  cachedOptions?: Record<string, string[]>;
  onCacheOptions?: (attrCode: string, options: string[]) => void;
}

export const SpecFieldEditor: React.FC<SpecFieldEditorProps> = ({
  specKey,
  value,
  attributeType,
  onChange,
  cachedOptions,
  onCacheOptions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCustomMode(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const parsed = parseSpecValue(value);

  // Determine type
  const rawType = (attributeType?.dataTypes as any)?.type;
  const isTypeBoolean = rawType === "boolean" || (rawType === undefined && parsed.isBoolean);
  const isTypeNumber = rawType === "number" || (!isTypeBoolean && parsed.isObject && typeof parsed.rawValue?.value === "number");
  
  // Resolve unit cleanly (attributeType.dataTypes.units is an array of all possible units, never render raw array)
  const unitsArray: string[] = Array.isArray((attributeType?.dataTypes as any)?.units)
    ? (attributeType?.dataTypes as any)?.units
    : [];
  const singleUnit = typeof (attributeType?.dataTypes as any)?.unit === "string"
    ? (attributeType?.dataTypes as any)?.unit
    : (typeof (attributeType?.dataTypes as any)?.units === "string" 
      ? (attributeType?.dataTypes as any)?.units 
      : "");
  const attrUnit: string = (typeof parsed.unit === "string" && parsed.unit.trim())
    ? parsed.unit.trim()
    : (singleUnit || (unitsArray.length > 0 ? unitsArray[0] : ""));
    
  const attrCode = attributeType?.code;

  // Load options when opening popover for string/registry attributes
  const handleOpenDropdown = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setSearchTerm("");
    setIsCustomMode(false);

    if (!attrCode) return;

    if (cachedOptions && cachedOptions[attrCode]) {
      setOptions(cachedOptions[attrCode]);
      return;
    }

    setIsLoadingOptions(true);
    try {
      const res = await graphClient.searchNodes({
        query: "",
        types: [attrCode],
        limit: 100
      });
      const names = (res.nodes || [])
        .map(n => {
          const nameObj = n.name as any;
          return typeof nameObj === "object" ? nameObj?.en || nameObj?.default || n.slug : String(nameObj || n.slug);
        })
        .filter(Boolean);
      
      const uniqueOptions = Array.from(new Set(names));
      setOptions(uniqueOptions);
      if (onCacheOptions) {
        onCacheOptions(attrCode, uniqueOptions);
      }
    } catch (err) {
      console.error("Failed to load options for", attrCode, err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (parsed.isObject && parsed.unit) {
      onChange({ value: opt, unit: parsed.unit }, true);
    } else {
      onChange(opt, true);
    }
    setIsOpen(false);
  };

  const handleCreateOptionInRegistry = async () => {
    if (!searchTerm.trim()) return;
    const trimmed = searchTerm.trim();

    if (attrCode) {
      setIsCreatingNode(true);
      try {
        const slug = `${attrCode}-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
        
        await graphClient.createNode({
          type: attrCode,
          slug,
          name: { en: trimmed } as any,
          description: { en: `Instance of ${attributeType?.name || specKey}` } as any,
          tags: ["attribute", attrCode],
          metadata: { value: trimmed, display: trimmed } as any,
          data: {}
        });

        const updated = Array.from(new Set([...options, trimmed]));
        setOptions(updated);
        if (onCacheOptions) {
          onCacheOptions(attrCode, updated);
        }
      } catch (err) {
        console.error("Failed to create attribute node:", err);
      } finally {
        setIsCreatingNode(false);
      }
    }

    handleSelectOption(trimmed);
    setSearchTerm("");
  };

  const handleNumberChange = (newValStr: string, immediate = false) => {
    if (newValStr === "") {
      onChange(undefined, immediate);
      return;
    }
    const num = parseFloat(newValStr);
    const finalVal = isNaN(num) ? newValStr : num;
    if (attrUnit) {
      onChange({ value: finalVal, unit: attrUnit }, immediate);
    } else {
      onChange(finalVal, immediate);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCurrentValueSelected = (opt: string) => {
    return parsed.display.toLowerCase() === opt.toLowerCase();
  };

  const hasValue = parsed.display !== "" && parsed.display !== undefined;
  const isYes = parsed.display.toLowerCase() === "yes" || parsed.rawValue === true;
  const isNo = parsed.display.toLowerCase() === "no" || parsed.display.toLowerCase() === "not available" || parsed.rawValue === false;

  return (
    <div className={`group relative bg-white border rounded-2xl p-4 transition-all ${
      hasValue 
        ? "border-slate-200 shadow-2xs hover:border-slate-300" 
        : "border-slate-200/60 bg-slate-50/50 hover:border-slate-300 hover:bg-white"
    }`}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-xs font-bold text-slate-800 truncate" title={specKey}>
            {specKey}
          </label>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {attrUnit && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider">
              {attrUnit}
            </span>
          )}

          {isTypeBoolean ? (
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              isYes ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-slate-100 text-slate-600"
            }`}>
              Toggle
            </span>
          ) : attrCode ? (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-200/60">
              <Database className="w-2.5 h-2.5" />
              Options
            </span>
          ) : isTypeNumber ? (
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider">
              Number
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
              Text
            </span>
          )}

          {hasValue && (
            <button
              onClick={() => onChange(undefined, true)}
              title="Clear specification"
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Control Input by Type */}
      {isTypeBoolean ? (
        /* Boolean Toggle Switch */
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              if (isYes) {
                onChange("No", true);
              } else {
                onChange("Yes", true);
              }
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all cursor-pointer group/toggle select-none ${
              isYes
                ? "border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/60 hover:border-emerald-300"
                : "border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300"
            }`}
          >
            <span className={`text-xs font-bold transition-colors ${
              isYes ? "text-emerald-800" : isNo ? "text-slate-500" : "text-slate-400"
            }`}>
              {isYes ? "Yes" : isNo ? "No" : "Not configured"}
            </span>

            {/* Toggle Track */}
            <div
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                isYes
                  ? "bg-emerald-500 shadow-2xs"
                  : isNo
                    ? "bg-slate-300"
                    : "bg-slate-200"
              }`}
            >
              {/* Toggle Knob */}
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                  isYes ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>
      ) : isTypeNumber && !attrCode ? (
        /* Number Input with Unit */
        <div className="relative flex items-center pt-1">
          <input
            type="number"
            step="any"
            value={parsed.display}
            onChange={(e) => handleNumberChange(e.target.value, false)}
            onBlur={(e) => handleNumberChange(e.target.value, true)}
            placeholder="e.g. 150..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
          {attrUnit && (
            <span className="absolute right-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
              {attrUnit}
            </span>
          )}
        </div>
      ) : (
        /* Options Selector / Combobox */
        <div className="relative pt-1" ref={popoverRef}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDropdown}
              className={`flex-1 text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                isOpen 
                  ? "bg-white border-slate-900 shadow-xs ring-2 ring-slate-900/10"
                  : hasValue 
                    ? "bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-white" 
                    : "bg-slate-50/50 text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span className="truncate">
                {hasValue ? parsed.display : `Select or enter option...`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Options Dropdown Popover */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden p-2.5 space-y-2 min-w-[280px]"
              >
                {!isCustomMode ? (
                  <>
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (searchTerm.trim()) {
                              const match = filteredOptions.find(o => o.toLowerCase() === searchTerm.trim().toLowerCase());
                              if (match) {
                                handleSelectOption(match);
                              } else {
                                handleCreateOptionInRegistry();
                              }
                            }
                          }
                        }}
                        placeholder="Search existing options..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Options List */}
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {isLoadingOptions ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                          Loading options...
                        </div>
                      ) : (
                        <>
                          {/* Quick Create Button if Search doesn't match exactly */}
                          {searchTerm.trim() && !options.some(o => o.toLowerCase() === searchTerm.trim().toLowerCase()) && (
                            <button
                              type="button"
                              onClick={handleCreateOptionInRegistry}
                              disabled={isCreatingNode}
                              className="w-full text-left px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 transition-all flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Plus className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                <span className="truncate">Add "{searchTerm.trim()}" to Registry</span>
                              </div>
                              {isCreatingNode && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />}
                            </button>
                          )}

                          {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                              const isSelected = isCurrentValueSelected(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleSelectOption(opt)}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                    isSelected 
                                      ? "bg-slate-900 text-white font-bold shadow-xs"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                                >
                                  <span className="truncate">{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                </button>
                              );
                            })
                          ) : !searchTerm.trim() ? (
                            <div className="py-4 text-center text-slate-400 text-xs font-medium">
                              No predefined options found in registry.
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>

                    {/* Footer: Custom Freeform Entry Toggle */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomMode(true);
                          setCustomInputValue(parsed.display || "");
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        Type custom text
                      </button>

                      {hasValue && (
                        <button
                          type="button"
                          onClick={() => {
                            onChange(undefined, true);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Custom Freeform Input Mode */
                  <div className="space-y-2 p-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Enter Custom Value
                    </p>
                    <input
                      type="text"
                      autoFocus
                      value={customInputValue}
                      onChange={(e) => setCustomInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customInputValue.trim()) {
                            handleSelectOption(customInputValue.trim());
                          }
                        }
                      }}
                      placeholder="Type custom value..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCustomMode(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Back to Options
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectOption(customInputValue.trim());
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
