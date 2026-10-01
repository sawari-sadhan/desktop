"use client";

import { PUBLIC_NAV_ITEMS } from "@lib/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 overflow-hidden z-50">
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Sawari Sadhan" width={120} height={40} className="object-contain h-10 w-auto" priority />
            </Link>
          </div>
            
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
    </header>
  );
};

export default Header;
