"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, ChevronRight, Fuel, Calendar, Settings, ArrowRight, ShieldCheck, Banknote, PenTool, CheckCircle, ChevronLeft } from "lucide-react";
import { theme } from "./theme";

import { SearchBar, HeroSlider, FeaturedVehicles } from "./components";
import { SmartImage } from "@components";

const DUMMY_LATEST = [
  { id: 1, name: "Toyota Corolla 2019", price: "Rs.1,20,548", mileage: "30,000 Miles", fuel: "Hybrid", trans: "Auto", year: "2019", image: "/images/auto/corolla.jpg" },
  { id: 2, name: "Ford Mustang GT 2019", price: "Rs.90,000", mileage: "30,000 Miles", fuel: "Petrol", trans: "Manual", year: "2019", image: "/images/auto/mustang.jpg" },
];


const DUMMY_BLOGS = [
  { id: 1, cat: "Tips & Tricks", title: "Top 5 Tips for Maintaining Your Car's Value", image: "/images/auto/2018-bmw-m5.webp", date: "August 15, 2026" },
  { id: 2, cat: "Reviews", title: "2026 SUV Showdown: Which is Best for Your Family?", image: "/images/auto/audi.jpg", date: "August 12, 2026" },
  { id: 3, cat: "News", title: "Electric Vehicles: Are They Worth the Investment?", image: "/images/auto/corolla.jpg", date: "August 10, 2026" },
  { id: 4, cat: "Guides", title: "A Beginner's Guide to Buying a Used Car", image: "/images/auto/mustang.jpg", date: "August 5, 2026" }
];

const BRANDS = [
  { name: "Audi", image: "/images/brands/audi.jpg" },
  { name: "BMW", image: "/images/brands/bmw.jpg" },
  { name: "Ferrari", image: "/images/brands/ferrari.jpg" },
  { name: "Honda", image: "/images/brands/honda.jpg" },
  { name: "Hyundai", image: "/images/brands/hyundai.jpg" },
  { name: "Jaguar", image: "/images/brands/jaguar.jpg" }
];

export default function Home() {

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      
      {/* 1. Hero Section Slider */}
      <section className="relative w-full h-[600px] md:h-[700px] bg-slate-900">
        <HeroSlider />
      </section>

      {/* Search Bar Wrapper in Normal Flow */}
      <div className="relative z-30 -mt-10">
        <SearchBar />
      </div>

      {/* 2. Popular Deals (Featured Vehicles from backend focusClient) */}
      <FeaturedVehicles />

      {/* 3. Our Services */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20] mb-12 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#B40003] mb-2 hover:bg-[#B40003] hover:text-white transition-all cursor-pointer shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#050B20]">Trusted Dealership</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We provide the best vehicles and customer service. You can trust us completely.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#B40003] mb-2 hover:bg-[#B40003] hover:text-white transition-all cursor-pointer shadow-sm">
              <Banknote className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#050B20]">Financing Options</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Flexible financing options that fit your budget and make buying easy.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#B40003] mb-2 hover:bg-[#B40003] hover:text-white transition-all cursor-pointer shadow-sm">
              <PenTool className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#050B20]">Transparent Pricing</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              No hidden fees. We provide complete transparency in our pricing structure.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#B40003] mb-2 hover:bg-[#B40003] hover:text-white transition-all cursor-pointer shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#050B20]">Expert Service</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Our expert mechanics ensure your car runs smoothly for years to come.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Latest Vehicles */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16 bg-slate-50 rounded-3xl mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20]">Latest Vehicles</h2>
          <button className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#B40003] transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button className="pb-4 border-b-2 border-[#B40003] text-[#B40003] font-bold">New Car</button>
          <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-[#050B20] font-bold transition-colors">Used Car</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_LATEST.map((car) => (
            <div key={car.id} className="flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 group">
              <div className="w-full sm:w-1/2 h-64 sm:h-auto bg-gray-100 relative">
                <SmartImage src={car.image} alt={car.name} variant="large" fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="w-full sm:w-1/2 bg-[#050B20] p-8 flex flex-col justify-between text-white">
                <div>
                  <h3 className="font-['Clash_Display'] font-bold text-2xl mb-4">{car.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                    <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> {car.mileage}</div>
                    <div className="flex items-center gap-2"><Fuel className="w-4 h-4"/> {car.fuel}</div>
                    <div className="flex items-center gap-2"><Settings className="w-4 h-4"/> {car.trans}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-auto">
                  <div className="font-bold text-xl">{car.price}</div>
                  <button className="flex items-center gap-2 text-sm font-bold text-[#B40003] hover:text-white transition-colors">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Explore Our Premium Brands */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20] mb-12 text-center md:text-left">Explore Our Premium Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BRANDS.map((brand, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#B40003] transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden p-2 relative">
                <SmartImage src={brand.image} alt={brand.name} variant="thumbnail" fill className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-bold text-sm text-[#050B20] group-hover:text-[#B40003] transition-colors">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA Cards */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#050B20] rounded-3xl p-10 flex items-center justify-between relative overflow-hidden text-white shadow-xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-['Clash_Display'] font-bold mb-2">Are You Looking For a Car?</h3>
              <p className="text-gray-400 mb-6 max-w-xs text-sm">We have a huge inventory of cars waiting for you. Get the best prices today.</p>
              <button className="px-6 py-3 bg-[#B40003] text-white rounded-full font-bold hover:bg-[#8A0002] transition-colors shadow-lg">
                Inventory
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <ShieldCheck className="w-48 h-48 text-white" />
            </div>
          </div>

          <div className="bg-[#B40003] rounded-3xl p-10 flex items-center justify-between relative overflow-hidden text-white shadow-xl">
            <div className="relative z-10">
              <h3 className="text-2xl font-['Clash_Display'] font-bold mb-2">Do You Want to Sell a Car?</h3>
              <p className="text-white/80 mb-6 max-w-xs text-sm">Get the best value for your car from trusted buyers in our network.</p>
              <button className="px-6 py-3 bg-[#050B20] text-white rounded-full font-bold hover:bg-black transition-colors shadow-lg">
                Sell your Car
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Banknote className="w-48 h-48 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Questions Banner */}
      <section className="py-12 border-y border-gray-100 my-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-8 text-center flex items-center justify-center gap-4">
          <p className="font-bold text-lg text-[#050B20] tracking-wide">
            QUESTIONS? CALL US ANYTIME
          </p>
          <a href="tel:+9779845672165" className="text-[#B40003] text-xl font-bold hover:underline bg-red-50 px-6 py-2 rounded-full border border-red-100 shadow-sm">+977 9845672165</a>
        </div>
      </section>

      {/* 9. Latest Blog Posts */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-['Clash_Display'] font-bold text-[#050B20]">Latest Blog Posts</h2>
          <button className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#B40003] transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DUMMY_BLOGS.map((blog) => (
            <div key={blog.id} className="group cursor-pointer">
              <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden mb-4 relative">
                <SmartImage src={blog.image} alt={blog.title} variant="medium" fill className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold text-[#B40003] bg-red-50 px-2 py-1 rounded-md">{blog.cat}</span>
                <span>{blog.date}</span>
              </div>
              <h3 className="font-bold text-[#050B20] group-hover:text-[#B40003] transition-colors line-clamp-2 mt-2">
                {blog.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
