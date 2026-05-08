"use client";

import { PUBLIC_NAV_ITEMS } from "$lib/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden z-50">
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-white text-sm font-bold tracking-tight">
              SAWARI SADHAN
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    pathname === item.href ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/console" 
              className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Console
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
