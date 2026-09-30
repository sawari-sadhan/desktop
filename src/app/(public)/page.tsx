"use client";

import React from "react";
import Image from "next/image";
import { Search, MapPin, ChevronRight, Fuel, Calendar, Settings } from "lucide-react";
import { theme } from "./theme";

const DUMMY_CARS = [
  {
    id: 1,
    name: "Volvo 2024",
    price: "Rs.1,20,548",
    fuel: "Petrol",
    mileage: "250 Miles",
    transmission: "Manual",
    year: "2024",
    image: "/1.png"
  },
  {
    id: 2,
    name: "Ford 2024",
    price: "Rs.1,20,548",
    fuel: "Petrol",
    mileage: "250 Miles",
    transmission: "Manual",
    year: "2024",
    image: "/2.png"
  },
  {
    id: 3,
    name: "AMG 2024",
    price: "Rs.1,20,548",
    fuel: "Petrol",
    mileage: "250 Miles",
    transmission: "Manual",
    year: "2024",
    image: "/4.png"
  },
  {
    id: 4,
    name: "Sedan 2024",
    price: "Rs.1,20,548",
    fuel: "Petrol",
    mileage: "250 Miles",
    transmission: "Manual",
    year: "2024",
    image: "/1.png"
  }
];

export default function Home() {
  return (
    <div className={`flex-1 flex flex-col ${theme.pageBg} bg-white min-h-screen`}>
      
      {/* Hero / Header Section */}
      <section className="relative py-20 px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Perfect Ride
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-md">
              Discover a wide range of premium vehicles tailored to your lifestyle. Book your test drive today.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl">
                Explore Cars
              </button>
              <button className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full font-bold transition-all">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-[400px] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl">
            {/* Dummy Hero Image Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-2xl">
              [ Hero Image ]
            </div>
          </div>
        </div>
      </section>

      {/* Car Listings Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto w-full bg-slate-50/50 rounded-[3rem] my-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Featured Vehicles</h2>
            <p className="text-slate-500 mt-2">Latest additions to our inventory</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DUMMY_CARS.map((car) => (
            <div key={car.id} className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group border border-slate-100">
              {/* Car Image Placeholder */}
              <div className="w-full h-48 bg-slate-100 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                <span className="text-slate-300 font-bold tracking-widest">{car.image}</span>
              </div>
              
              <div className="px-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{car.name}</h3>
                </div>
                <p className="text-lg font-black text-blue-600 mb-6">{car.price}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                    <Fuel className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">{car.fuel}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                    <Settings className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">{car.year}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
