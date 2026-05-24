"use client";

import React from "react";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 relative z-10 overflow-hidden">
      {/* Header stays locked at the top, outside the scroll context */}
      <Header />
      
      {/* Scrollable area for page content and footer */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
