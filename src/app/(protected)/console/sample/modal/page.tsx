"use client";

import React, { useState } from "react";
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  ExternalLink,
  Plus,
  Eye,
  FileCode,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Info,
  Maximize2,
  Copy,
  Download,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { PageLayout, PageContent } from "../../components";
import { theme } from "../../theme";

interface ToastItem {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
}

export default function SampleModalPage() {
  // Overlays State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newBrand, setNewBrand] = useState("Aston Martin");

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showInspectorDrawer, setShowInspectorDrawer] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  // Stacked Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastItem["type"], title: string, message: string) => {
    const newToast: ToastItem = {
      id: Date.now().toString(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteInputText("");
      addToast("error", "Node Deleted", "The vehicle trim record has been severed and purged from the graph.");
    }, 800);
  };

  return (
    <PageLayout className={theme.layout.pageContainer}>
      <PageContent className={theme.layout.contentWrapper}>
        

        {/* Gallery Grid of Modal Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Pattern 1: Destructive Confirm Dialog */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                1. Destructive Confirmation Modal
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Critical prompt equipped with a type-to-confirm safety lock to prevent accidental deletion of graph nodes and relations.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Launch Delete Modal</span>
            </button>
          </div>

          {/* Pattern 2: Quick Entity Create Modal */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                2. Quick-Create Form Dialog
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Centered modal window for adding new trims, brands, or attributes without leaving the current dashboard view.
              </p>
            </div>
            <button
              onClick={() => setShowQuickCreateModal(true)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Create Dialog</span>
            </button>
          </div>

          {/* Pattern 3: Slide-Over Filter Drawer */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center font-bold mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                3. Right Slide-Over Filter Panel
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Full-height sidebar drawer containing multi-criteria filter options, sliders, and sticky footer apply controls.
              </p>
            </div>
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Open Filter Drawer</span>
            </button>
          </div>

          {/* Pattern 4: Node Inspector Drawer */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold mb-4">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                4. Entity Inspector & JSON Drawer
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Deep-dive inspection drawer revealing raw schema properties, node relations, and JSON metadata.
              </p>
            </div>
            <button
              onClick={() => setShowInspectorDrawer(true)}
              className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Node Properties</span>
            </button>
          </div>

          {/* Pattern 5: Media Lightbox Modal */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                5. High-Resolution Asset Lightbox
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Zoomed image modal previewing vehicle photography, resolution ratios, and direct download links.
              </p>
            </div>
            <button
              onClick={() => setShowImageLightbox(true)}
              className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Preview Asset Lightbox</span>
            </button>
          </div>

          {/* Pattern 6: Stacked Toast Triggers */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 flex flex-col justify-between space-y-5 hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                6. Notification Toast Stack
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Trigger asynchronous status banners that stack nicely in the lower-right corner and automatically timeout.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addToast("success", "Saved", "Node metadata updated.")}
                className="py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                Success Toast
              </button>
              <button
                onClick={() => addToast("warning", "Review Required", "Pending catalog sync.")}
                className="py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                Warning Toast
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* OVERLAY 1: DESTRUCTIVE DELETE CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg p-8 rounded-[2rem] border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sever & Delete Vehicle Trim?
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Target: <span className="font-semibold text-slate-800">Aston Martin DB12 • Volante</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs text-rose-800 leading-relaxed font-normal">
                <p className="font-semibold mb-1">Warning: Irreversible Graph Action</p>
                This will delete the trim specification node, unlink all associated market regional prices, and purge attached media references.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Type <span className="text-rose-600 font-mono font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono font-medium text-slate-900 outline-none focus:border-rose-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInputText("");
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteInputText !== "DELETE" || isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY 2: QUICK CREATE FORM DIALOG */}
        {/* ========================================================================= */}
        {showQuickCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg p-8 rounded-[2rem] border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Quick-Add Vehicle Trim</h3>
                    <p className="text-xs text-slate-500 font-normal">Instantly register a new variant node</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Parent Manufacturer / Brand *
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 outline-none"
                  >
                    <option value="Aston Martin">Aston Martin</option>
                    <option value="Audi">Audi</option>
                    <option value="Porsche">Porsche</option>
                    <option value="Land Rover">Land Rover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Trim / Model Specification Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vantage F1 Edition"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Starting Price (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="185000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Initial Status
                    </label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 outline-none">
                      <option value="booking_open">Booking Open</option>
                      <option value="available">Available</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickCreateModal(false);
                    addToast("success", "Record Created", `${newModelName || "New Trim"} added to catalog.`);
                    setNewModelName("");
                  }}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Save & Insert Node
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY 3: SLIDE-OVER FILTER DRAWER */}
        {/* ========================================================================= */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md h-full p-8 flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
              
              <div className="space-y-6 overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Advanced Catalog Filters</h3>
                    <p className="text-xs text-slate-500 font-normal">Refine dataset across technical attributes</p>
                  </div>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Powertrain Architecture
                    </label>
                    <div className="space-y-2">
                      {["Twin-Turbo Gasoline V8", "Naturally Aspirated V12", "Battery Electric (BEV)", "Plug-In Hybrid (PHEV)"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-slate-900" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Transmission & Drivetrain
                    </label>
                    <div className="space-y-2">
                      {["8-Speed Rear-Mounted Automatic", "Dual-Clutch AWD", "6-Speed Manual"].map((t) => (
                        <label key={t} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                          <input type="radio" name="trans" defaultChecked={t.includes("8-Speed")} className="text-slate-900" />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Target Market Region
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Nepal 🇳🇵", "India 🇮🇳", "UAE 🇦🇪", "United States 🇺🇸"].map((r) => (
                        <label key={r} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setShowFilterDrawer(false);
                    addToast("info", "Filters Applied", "Filtered view contains 6 matching trims.");
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white"
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY 4: ENTITY INSPECTOR & JSON DRAWER */}
        {/* ========================================================================= */}
        {showInspectorDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl h-full p-8 flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
              
              <div className="space-y-6 overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Graph Node Inspector</h3>
                      <p className="text-xs text-slate-500 font-normal">Node ID: node_ast_db12_volante</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInspectorDrawer(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Entity Properties
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">UUID:</span> <span className="font-mono font-medium text-slate-800">4f8a-99b2-c104</span></div>
                      <div><span className="text-slate-400">Label:</span> <span className="font-semibold text-slate-800">TrimVariant</span></div>
                      <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-emerald-600">Active</span></div>
                      <div><span className="text-slate-400">Revision:</span> <span className="font-mono font-medium text-slate-800">v1.4.2</span></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Raw Knowledge Graph JSON Payload
                    </p>
                    <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
{JSON.stringify({
  id: "node_ast_db12_volante",
  label: "TrimVariant",
  properties: {
    name: "Aston Martin DB12 • Volante",
    slug: "aston-martin-db12-volante",
    engine: "4.0L Twin-Turbo V8",
    power_ps: 680,
    top_speed_kmh: 325,
    markets: ["NP", "IN", "AE"],
    pricing: {
      NPR: { min: 42000000, max: 48500000 }
    }
  }
}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("node_ast_db12_volante");
                    addToast("success", "Copied", "Node UUID copied to clipboard.");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Node UUID</span>
                </button>
                <button
                  onClick={() => setShowInspectorDrawer(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Close Inspector
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY 5: HIGH-RES ASSET LIGHTBOX MODAL */}
        {/* ========================================================================= */}
        {showImageLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl rounded-[2rem] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Aston Martin DB12 • Hero Asset</h3>
                  <p className="text-xs text-slate-500 font-normal">3840 x 2160 • WebP Lossless • 4.2 MB</p>
                </div>
                <button
                  onClick={() => setShowImageLightbox(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Visual Area */}
              <div className="h-80 bg-slate-900 flex items-center justify-center relative p-8">
                <div className="w-full h-full rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <ImageIcon className="w-12 h-12 text-slate-500" />
                  <span className="text-xs font-mono font-medium text-slate-300">
                    High-Res Vehicle Studio Photography Render
                  </span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold uppercase tracking-wider">
                    Primary Showroom Asset
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowImageLightbox(false);
                      addToast("success", "Asset Downloaded", "Press photo saved to local disk.");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full-Res</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OVERLAY 6: STACKED TOAST MANAGER CONTAINER */}
        {/* ========================================================================= */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full">
            {toasts.map((toast) => {
              const isError = toast.type === "error";
              const isWarning = toast.type === "warning";
              const isSuccess = toast.type === "success";
              return (
                <div
                  key={toast.id}
                  className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-4 duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
                      {isError && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      {toast.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{toast.title}</p>
                      <p className="text-xs text-slate-300 font-normal mt-0.5">{toast.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </PageContent>
    </PageLayout>
  );
}
