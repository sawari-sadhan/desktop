export const theme = {
  // Main page layout and background
  pageBg: "bg-slate-50 text-slate-900 selection:bg-teal-100",
  layoutBg: "bg-slate-50",
  
  // Hero Section
  heroBg: "bg-gradient-to-b from-slate-100/70 to-slate-50/20 border-b border-slate-200/50 relative",
  heroBadge: "bg-slate-200/50 border border-slate-300/30 text-slate-600",
  heroTitle: "text-slate-900",
  heroSubtitle: "text-slate-500",

  // Search & Filters
  input: "w-full sm:w-72 bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-6 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-sm hover:border-slate-300 placeholder:text-slate-400",
  refreshBtn: "p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm cursor-pointer",

  // Brand Cards grid
  card: "group cursor-pointer relative bg-white border border-slate-200/60 p-7 rounded-[2rem] transition-all hover:border-teal-500/30 hover:shadow-lg shadow-sm hover:shadow-teal-500/5 overflow-hidden",
  cardDecorativeBlob: "absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-teal-500/[0.02] rounded-full blur-3xl group-hover:bg-teal-500/[0.04] transition-all",
  cardIcon: "w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl border border-slate-200/60 group-hover:bg-teal-500/5 group-hover:text-teal-600 group-hover:border-teal-500/20 transition-all",
  cardBadge: "px-3 py-1 bg-slate-100 border border-slate-200/40 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400",
  cardTitle: "text-2xl font-black text-slate-800 group-hover:text-teal-600 transition-colors",
  cardDesc: "text-xs text-slate-500 mt-2 font-medium line-clamp-2 leading-relaxed",
  cardFooter: "pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-slate-600 transition-colors",
  cardMapPin: "w-3.5 h-3.5 text-slate-400",
  cardHqLabel: "text-[9px] font-black uppercase tracking-widest text-slate-500",

  // Drawer / Side-over Explorer
  drawer: "relative w-full max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10",
  drawerHeader: "p-8 border-b border-slate-100 flex items-start justify-between gap-6 bg-slate-50/50",
  drawerBadge: "inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-600 rounded-full border border-teal-500/20",
  drawerTitle: "text-3xl font-black text-slate-900 uppercase tracking-tight",
  drawerDesc: "text-xs text-slate-500 font-medium leading-relaxed",
  drawerCloseBtn: "p-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 rounded-2xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer",

  // Models List & Accordions
  modelContainer: "border rounded-3xl p-6 transition-all duration-300",
  modelContainerActive: "bg-slate-50/80 border-slate-300/80 shadow-inner",
  modelContainerInactive: "bg-white border-slate-200/50 hover:border-slate-300",
  modelTitle: "text-lg font-black text-slate-800 uppercase tracking-tight",
  modelDesc: "text-xs text-slate-500 line-clamp-2 leading-relaxed",
  modelExpandBtnActive: "bg-slate-100 text-slate-700 border border-slate-200/60",
  modelExpandBtnInactive: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border border-teal-500/20",

  // Specification items
  specLabel: "text-[8px] font-black uppercase tracking-widest text-slate-500",
  specCard: "bg-slate-50/80 border border-slate-200/40 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm",
  specCardLabel: "text-[10px] font-bold text-slate-500 uppercase tracking-wider",
  specValue: "text-[11px] font-black text-slate-800",

  // Variant badges
  variantsLabel: "text-[8px] font-black uppercase tracking-widest text-slate-500",
  variantBadge: "px-4.5 py-2.5 bg-slate-100 border border-slate-200/60 hover:bg-slate-200/40 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600",
  variantEmpty: "py-4 text-center border border-dashed border-slate-200 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-slate-400",

  // Drawer Footer & CTA
  ctaBanner: "p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6",
  ctaTitle: "text-[10px] font-black text-slate-800 uppercase tracking-widest",
  ctaDesc: "text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-normal",
  ctaBtn: "px-6 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer whitespace-nowrap shadow-md shadow-teal-600/10",
};
