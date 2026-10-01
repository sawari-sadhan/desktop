"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full mt-24">
      {/* Top Half: White Background */}
      <div className="bg-white py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Brand & App Download */}
          <div>
            <h3 className="font-['Clash_Display'] font-bold text-2xl tracking-wide mb-4">
              <span className="text-[#B40003]">SAWARI</span>SADHAN
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Discover the best vehicles tailored to your lifestyle. Find, buy, and sell with ease.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-xs text-left">
                  <span className="block text-gray-500 text-[10px]">GET IT ON</span>
                  <span className="font-bold text-[#050B20]">Google Play</span>
                </span>
              </button>
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-xs text-left">
                  <span className="block text-gray-500 text-[10px]">Download on the</span>
                  <span className="font-bold text-[#050B20]">App Store</span>
                </span>
              </button>
            </div>
          </div>

          {/* Right: Newsletter */}
          <div className="flex flex-col md:items-end">
            <div className="w-full max-w-md">
              <h3 className="font-['Clash_Display'] font-bold text-xl text-[#050B20] mb-2">Join Sawari Sadhan</h3>
              <p className="text-gray-500 text-sm mb-4">Subscribe to our newsletter to get latest updates.</p>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B40003] transition-colors"
                  required
                />
                <button type="submit" className="w-full py-3 bg-[#B40003] text-white font-bold rounded-lg hover:bg-[#8A0002] transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Half: Red Background */}
      <div className="bg-[#B40003] text-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-8 flex flex-col items-center gap-8">
          
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#B40003] transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#B40003] transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#B40003] transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium tracking-wide">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <Link href="/vehicles" className="hover:text-white/80 transition-colors">Vehicles</Link>
            <Link href="/blog" className="hover:text-white/80 transition-colors">Blog</Link>
            <Link href="/about" className="hover:text-white/80 transition-colors">About</Link>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-8 mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/80">
          <div>© {new Date().getFullYear()} Sawari Sadhan. All rights reserved.</div>
          <div>sawarisadhan11@gmail.com</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
