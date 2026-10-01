"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { 
  ChevronRight, 
  Share, 
  Layers, 
  ShieldAlert 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `http://localhost:5051/${url}`;
};

function unwrapStruct(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if ("stringValue" in obj) return obj.stringValue;
  if ("numberValue" in obj) return obj.numberValue;
  if ("boolValue" in obj) return obj.boolValue;
  if ("nullValue" in obj) return null;
  if ("listValue" in obj) return (obj.listValue?.values || []).map(unwrapStruct);
  if ("structValue" in obj) return unwrapStruct(obj.structValue);
  if ("fields" in obj && typeof obj.fields === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj.fields as Record<string, any>)) {
      result[k] = unwrapStruct(v);
    }
    return result;
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = unwrapStruct(v);
  }
  return result;
}

const SPEC_TABS_CONFIG: Record<string, string[]> = {
  Engines: [
    "Engine Type", "Engine Displacement", "Displacement",
    "No. of Cylinders", "Valve Configuration", "Valves Per Cylinder",
    "Fuel Supply System", "Turbo Charger",
    "Max Power", "Max Torque",
    "Transmission Type", "Gearbox", "Drive Type", "Drive Modes", "Drive Mode Types",
    "Top Speed", "Acceleration 0-100kmph", "Acceleration 0-60kmph",
    "Braking (100-0kmph)", "Braking (80-0 kmph)",
    "Emission Norm Compliance", "Emission Control System",
    "Idle Start-Stop System", "Drag Coefficient",
    "Motor Type", "Motor Power", "Battery Capacity", "Battery Type",
    "Range", "Range - Tested", "Regenerative Braking", "Regenerative Braking Levels",
    "Hybrid Type",
  ],
  Fuel: [
    "Fuel Type", "Secondary Fuel Type",
    "Fuel Tank Capacity", "Petrol Fuel Tank Capacity", "Diesel Fuel Tank Capacity",
    "CNG Fuel Tank Capacity", "Electric Fuel Tank Capacity",
    "Petrol Mileage ARAI", "Diesel Mileage ARAI", "CNG Mileage ARAI",
    "Electric Mileage ARAI", "LPG Mileage ARAI",
    "Petrol Highway Mileage", "Diesel Highway Mileage", "CNG Highway Mileage",
    "Petrol Mileage WLTP", "Diesel Mileage WLTP",
    "Charging Time", "Charging Time (A.C)", "Charging Time (D.C)",
    "Charging Time (15 A Plug Point)", "Charging Time (50 kW DC Fast Charger)",
    "Charging Time (7.2 kW AC Fast Charger)",
    "Charging Options", "Charger Type", "Charging Port",
    "Fast Charging", "Super Charge",
    "Battery Warranty", "Running Cost",
  ],
  Safety: [
    "No. of Airbags", "Driver Airbag", "Passenger Airbag",
    "Side Airbag", "Side Airbag-Rear", "Curtain Airbag", "Knee Airbags",
    "Anti-lock Braking System (ABS)", "Electronic Brakeforce Distribution (EBD)", "EBD",
    "Electronic Stability Control (ESC)", "Brake Assist", "Traction Control",
    "Hill Assist", "Hill Descent Control",
    "Pretensioners & Force Limiter Seatbelts", "Rear Seat Belts",
    "Seat Belt Warning", "Height Adjustable Front Seat Belts",
    "Child Safety Locks", "ISOFIX Child Seat Mounts",
    "Engine Immobilizer", "Anti-Theft Alarm", "Anti-Theft Device",
    "Crash Sensor", "Crash Notification",
    "SOS Button", "SOS / Emergency Assistance",
    "Blind Spot Monitor", "Blind Spot Collision Avoidance Assist",
    "Lane Departure Warning", "Lane Keep Assist", "Lane Departure Prevention Assist",
    "Forward Collision Warning", "Automatic Emergency Braking",
    "Rear Cross Traffic Alert", "Rear Cross Traffic Collision-Avoidance Assist",
    "Traffic Sign Recognition", "Road Departure Mitigation System",
    "Driver Attention Warning", "Oncoming Lane Mitigation",
    "Tyre Pressure Monitoring System (TPMS)",
    "Speed Alert", "Over Speeding Alert", "Speed Assist System",
    "Global NCAP Safety Rating", "Global NCAP Child Safety Rating",
    "Bharat NCAP Safety Rating", "Bharat NCAP Child Safety Rating",
    "EURO NCAP Safety Rating", "Front Impact Beams", "Side Impact Beams",
  ],
  Interior: [
    "Seating Capacity", "Upholstery", "Leather Seats", "Fabric Upholstery",
    "Adjustable Headrest", "Rear Seat Headrest",
    "Lumbar Support", "Ventilated Seats", "Heated Seats",
    "Electric Adjustable Seats", "Adjustable Seats", "Height Adjustable Driver Seat",
    "Foldable Rear Seat", "Folding Table in The Rear",
    "Rear Seat Centre Arm Rest", "Central Console Armrest", "Cup Holders",
    "Glove Box", "Glove Box light",
    "Digital Cluster", "Digital Cluster Size", "Tachometer",
    "Digital Odometer", "Electronic Multi-Tripmeter", "Digital Clock",
    "Rear Reading Lamp", "Trunk Light", "Puddle Lamps",
    "Day & Night Rear View Mirror",
    "Ambient Light Colour (numbers)",
    "Dual Tone Dashboard",
  ],
  Comfort: [
    "Air Conditioner", "Automatic Climate Control", "Rear AC Vents",
    "Air Quality Control", "Heater", "Cooled Glovebox",
    "Sunroof", "Sun Roof", "Roof Carrier",
    "Power Windows", "Anti-Pinch Power Windows",
    "Power Door Locks", "Central Locking",
    "Keyless Entry", "Smart Access Card Entry", "Smart Key Band", "Digital Car Key",
    "Engine Start/Stop Button",
    "Remote Boot Open", "Hands-Free Tailgate", "Power Boot",
    "Cruise Control", "Adaptive Cruise Control",
    "Rain Sensing Wiper", "Rear Window Wiper", "Rear Window Washer", "Rear Window Defogger",
    "Automatic Headlamps", "Follow Me Home Headlamps",
    "Vanity Mirror", "Luggage Hook & Net",
    "E-Manual",
  ],
  Steering: [
    "Power Steering", "Steering Type", "Steering Gear Type", "Steering Column",
    "Adjustable Steering", "Leather Wrapped Steering Wheel",
    "Paddle Shifters",
    "Front Suspension", "Rear Suspension", "Shock Absorbers Type",
    "Front Brake Type", "Rear Brake Type",
    "Turning Radius", "Approach Angle", "Departure Angle", "Break-over Angle",
  ],
  Exterior: [
    "Body Type", "No. of Doors",
    "Length", "Width", "Height", "Wheel Base",
    "Ground Clearance Unladen", "Reported Ground Clearance (Unladen)",
    "Ground Clearance (Laden)",
    "Kerb Weight", "Gross Weight",
    "Tyre Size", "Tyre Type",
    "Alloy Wheels", "Alloy Wheel Size",
    "Wheel Covers",
    "LED Headlamps", "LED Taillights", "LED DRLs",
    "Projector Headlamps", "Halogen Headlamps", "Xenon Headlamps",
    "Fog Lights", "Fog Lights - Front", "Fog Lights - Rear",
    "LED Fog Lamps", "Cornering Headlamps", "Cornering Foglamps",
    "Adaptive High Beam Assist",
    "Outside Rear View Mirror (ORVM)", "Heated Outside Rear View Mirror",
    "Outside Rear View Mirror Turn Indicators",
    "Dual Tone Body Colour", "Chrome Grille", "Chrome Garnish",
    "Rear Spoiler", "Tinted Glass",
    "Boot Opening", "Boot Space",
    "Roof Rails", "Side Stepper",
    "Front Tread", "Rear Tread",
  ],
  Capacity: [
    "Seating Capacity",
    "Boot Space", "Boot Space Rear Seat Folding", "Reported Boot Space",
    "Fuel Tank Capacity", "Petrol Fuel Tank Capacity", "Diesel Fuel Tank Capacity",
    "CNG Fuel Tank Capacity", "Electric Fuel Tank Capacity",
    "Kerb Weight", "Gross Weight",
    "Towing Capacity",
    "Ground Clearance Unladen", "Ground Clearance (Laden)",
    "Front Tread", "Rear Tread",
  ],
  Communication: [
    "Touchscreen", "Touchscreen Size",
    "Android Auto", "Apple CarPlay", "MirrorLink",
    "Bluetooth Connectivity", "Wi-Fi Connectivity",
    "USB & Auxiliary input", "USB Charger", "Usb Ports",
    "Wireless Charging", "Wireless Phone Charging",
    "Navigation System", "Navigation with Live Traffic",
    "Google / Alexa Connectivity", "Inbuilt Assistant",
    "Voice Commands", "Hinglish Voice Commands", "Voice Controlled Ambient Lighting",
    "No. of Speakers", "Speakers", "Subwoofer", "Tweeters",
    "Radio", "Dolby Atmos",
    "Rear Touchscreen", "Rear Touch Screen size", "Rear Entertainment System",
    "Heads-Up Display (HUD)",
    "Inbuilt Apps", "Connectivity", "Internal Storage",
    "Antenna", "Integrated Antenna", "Power Antenna",
    "Audio System Remote Control",
  ],
};

const SPEC_TABS = Object.keys(SPEC_TABS_CONFIG);

export function ModelView({ node, brandName, brandSlug }: { node: EntityNode; brandName: string | null; brandSlug: string | null }) {
  const rawData = (node.data as any) || {};
  const nodeData: Record<string, any> = rawData?.fields ? unwrapStruct(rawData) : rawData;

  const nameObj = unwrapStruct(node.name) || {};
  const modelName = typeof nameObj === "string" 
    ? nameObj 
    : nameObj.en || nameObj.np || nameObj.default || node.slug;

  const [activeTab, setActiveTab] = useState(SPEC_TABS[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  let images: string[] = [];
  if (node.media) {
    try {
      const mediaArr = (toJson(ListValueSchema, node.media as any) as any[]) || [];
      images = mediaArr.map((m: any) => getImageUrl(m.url)).filter((url): url is string => Boolean(url));
    } catch {
      // ignore
    }
  }

  const pricing = nodeData?.pricing;
  const price = pricing?.price ?? pricing?.mrp ?? null;
  const discountedPrice = pricing?.discounted_price ?? pricing?.offer_price ?? null;

  const specsForTab = React.useMemo(() => {
    const keysForTab = SPEC_TABS_CONFIG[activeTab] || [];
    const rawSpecs = nodeData?.specifications || nodeData?.specs || nodeData || {};

    const flattenedSpecs: Record<string, any> = {};
    const traverse = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && !("value" in v)) {
          traverse(v);
        } else {
          flattenedSpecs[k.toLowerCase().trim()] = { originalKey: k, value: v };
        }
      }
    };
    traverse(rawSpecs);

    const matched: Array<{ label: string; value: string; isBoolean: boolean; isTrue: boolean }> = [];
    for (const targetLabel of keysForTab) {
      const entry = flattenedSpecs[targetLabel.toLowerCase().trim()];
      if (entry) {
        let rawVal = entry.value;
        if (rawVal !== null && rawVal !== undefined && rawVal !== "") {
          if (typeof rawVal === "object" && rawVal.value !== undefined) {
            const formatted = `${rawVal.value}${rawVal.unit ? " " + rawVal.unit : ""}`;
            matched.push({ label: targetLabel, value: formatted, isBoolean: false, isTrue: false });
          } else if (typeof rawVal === "boolean") {
            matched.push({ label: targetLabel, value: rawVal ? "Yes" : "No", isBoolean: true, isTrue: rawVal });
          } else {
            const strVal = String(rawVal);
            const lowerStr = strVal.toLowerCase();
            const isBool = lowerStr === "true" || lowerStr === "false" || lowerStr === "yes" || lowerStr === "no";
            const isT = lowerStr === "true" || lowerStr === "yes";
            matched.push({ label: targetLabel, value: strVal, isBoolean: isBool, isTrue: isT });
          }
        }
      }
    }
    return matched;
  }, [activeTab, nodeData]);

  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const rawSpecs = nodeData?.specifications || nodeData?.specs || nodeData || {};
    const flattenedKeys = new Set<string>();
    const traverse = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && !("value" in v)) {
          traverse(v);
        } else if (v !== null && v !== undefined && v !== "") {
          flattenedKeys.add(k.toLowerCase().trim());
        }
      }
    };
    traverse(rawSpecs);

    for (const [tab, labels] of Object.entries(SPEC_TABS_CONFIG)) {
      let count = 0;
      for (const label of labels) {
        if (flattenedKeys.has(label.toLowerCase().trim())) {
          count++;
        }
      }
      counts[tab] = count;
    }
    return counts;
  }, [nodeData]);

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-widest gap-2">
            <Link href="/" className="hover:text-[#C61B1E] transition-colors">Home</Link>
            {brandName && brandSlug && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/${brandSlug}`} className="hover:text-[#C61B1E] transition-colors text-slate-600">
                  {brandName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#C61B1E]">{modelName}</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#C61B1E] transition-colors group">
              Share <Share className="w-4 h-4 text-slate-400 group-hover:text-[#C61B1E] transition-colors" />
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#C61B1E] transition-colors group">
              Compare <Layers className="w-4 h-4 text-slate-400 group-hover:text-[#C61B1E] transition-colors" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">{modelName}</h1>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left: Images */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-slate-50 rounded-[2rem] overflow-hidden relative aspect-[4/3] md:aspect-auto flex items-center justify-center">
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={images[activeImageIndex]}
                    alt={modelName}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </AnimatePresence>
              ) : (
                <div className="text-slate-300 text-sm font-medium">No images available</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible custom-scrollbar pb-2 md:pb-0 md:w-32 shrink-0">
                {images.slice(0, 4).map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-24 md:w-32 md:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border-2 transition-all relative ${activeImageIndex === idx ? 'border-[#C61B1E] ring-4 ring-[#C61B1E]/10' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Pricing Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-[2rem] border border-slate-200 shadow-sm bg-white relative overflow-hidden group">
              <p className="text-sm font-semibold text-slate-500 mb-2">Our Price</p>
              {price ? (
                <>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-3xl font-black text-[#C61B1E]">
                      Rs. {Number(price).toLocaleString()}
                    </span>
                    {discountedPrice && (
                      <span className="text-sm font-bold text-slate-400 line-through mb-1">
                        Rs. {Number(discountedPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Ex-Showroom Price</p>
                </>
              ) : (
                <p className="text-xl font-bold text-slate-700">Price on Request</p>
              )}

              <div className="mt-8 space-y-3">
                <button className="w-full py-4 bg-[#C61B1E] hover:bg-[#a61518] text-white font-bold rounded-2xl shadow-lg shadow-[#C61B1E]/20 transition-all transform active:scale-[0.98]">
                  Get Best Offer
                </button>
                <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl transition-all">
                  Book Test Drive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">
            Specifications
          </h2>

          <div className="flex flex-wrap gap-2.5 mb-6 border-b border-slate-200/80 pb-4">
            {SPEC_TABS.map(tab => {
              const count = tabCounts[tab] || 0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={count === 0}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-rose-50 text-[#C61B1E] border border-rose-200 shadow-xs'
                      : count > 0
                      ? 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/40'
                      : 'bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                  }`}
                >
                  {tab}
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-[#C61B1E]/10 text-[#C61B1E]' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {specsForTab.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white divide-y divide-slate-100 shadow-xs">
                {specsForTab.slice(0, Math.ceil(specsForTab.length / 2)).map((spec, i) => (
                  <div 
                    key={spec.label} 
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <span className="text-[15px] font-medium text-slate-600">
                      {spec.label}
                    </span>
                    <span className="text-[15px] font-semibold text-slate-900 text-right">
                      {spec.isBoolean ? (
                        spec.isTrue ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            ✓ Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                            ✕ No
                          </span>
                        )
                      ) : (
                        spec.value
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white divide-y divide-slate-100 shadow-xs">
                {specsForTab.slice(Math.ceil(specsForTab.length / 2)).map((spec, i) => (
                  <div 
                    key={spec.label} 
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <span className="text-[15px] font-medium text-slate-600">
                      {spec.label}
                    </span>
                    <span className="text-[15px] font-semibold text-slate-900 text-right">
                      {spec.isBoolean ? (
                        spec.isTrue ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            ✓ Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
                            ✕ No
                          </span>
                        )
                      ) : (
                        spec.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-xl p-8 text-center text-slate-400 text-base font-medium bg-white shadow-xs">
              No specification attributes recorded under <span className="font-bold text-slate-600">{activeTab}</span> for this vehicle.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ModelDetailsPage() {
  const params = useParams();
  const modelSlug = params.model as string;

  const [modelNode, setModelNode] = useState<EntityNode | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!modelSlug) return;
      setIsLoading(true);
      try {
        const res = await graphClient.getNode({ id: "", slug: modelSlug });
        if (!res.node) {
          setNotFoundState(true);
          return;
        }

        const rawData = (res.node.data as any) || {};
        const data: Record<string, any> = rawData?.fields ? unwrapStruct(rawData) : rawData;

        setModelNode({
          id: res.node.id,
          type: res.node.type,
          slug: res.node.slug,
          name: res.node.name || {},
          description: res.node.description || {},
          tags: res.node.tags || [],
          metadata: res.node.metadata || {},
          data: data,
          media: (res.node.media as any) || null,
          created_at: "",
          updated_at: res.node.updatedAt
        });

        try {
          const neighbors = await graphClient.getNeighbors({
            nodeId: res.node.id,
            linkTypes: ["has_model"]
          });
          const bNode = (neighbors.nodes || []).find((n: any) => n.type === "brand");
          if (bNode) {
            const bNameObj = unwrapStruct(bNode.name) || {};
            setBrandName(bNameObj.en || bNameObj.np || bNameObj.default || bNode.slug);
            setBrandSlug(bNode.slug);
          }
        } catch {
          // ignore
        }
      } catch {
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [modelSlug]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse"><div className="h-64 bg-slate-200 rounded-[2rem]" /></div>;
  }

  if (notFoundState || !modelNode) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-[#C61B1E] mb-4" />
        <h1 className="text-2xl font-black text-slate-900 uppercase">Model Not Found</h1>
        <p className="text-slate-500 text-sm mt-2 mb-6">Could not locate model "{modelSlug}".</p>
        <Link href="/" className="px-5 py-2.5 bg-[#C61B1E] text-white font-bold text-xs rounded-xl">Back to Home</Link>
      </div>
    );
  }

  return <ModelView node={modelNode} brandName={brandName} brandSlug={brandSlug} />;
}
