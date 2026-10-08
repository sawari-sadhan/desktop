"use client";

import { PUBLIC_NAV_ITEMS } from "@lib/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WheelOptionSwitcher } from "@/app/(public)/components/ui/switcher/wheel-option";

const Header = () => {
  const pathname = usePathname();
  const [wheelType, setWheelType] = useState<"4w" | "2w">("4w");

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 overflow-hidden z-50">
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo */}
          <div className="flex items-center w-1/3">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Sawari Sadhan" width={120} height={40} className="object-contain h-10 w-auto" priority />
            </Link>
          </div>

          {/* Center: Vehicle Type Switcher */}
          <div className="flex items-center justify-center w-1/3 hidden md:flex">
            <WheelOptionSwitcher value={wheelType} onChange={setWheelType} />
          </div>
            
          {/* Right: Navigation */}
          <div className="flex items-center justify-end w-1/3">
            <nav className="hidden md:flex items-center gap-8">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    pathname === item.href ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
