import { 
  Zap, 
  Fuel, 
  ShieldCheck, 
  Armchair, 
  Sparkles, 
  Compass, 
  Car, 
  Scale, 
  Radio, 
  SlidersHorizontal 
} from "lucide-react";

export interface SpecGroupDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  keys: string[];
}

export const SPEC_GROUPS: SpecGroupDefinition[] = [
  {
    id: "engines",
    name: "Engines & Performance",
    description: "Powertrain, motor, battery capacity, power and speed metrics",
    icon: Zap,
    keys: [
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
      "Hybrid Type"
    ]
  },
  {
    id: "fuel",
    name: "Fuel & Charging",
    description: "Fuel efficiency, tank capacity, charging times and ports",
    icon: Fuel,
    keys: [
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
      "Battery Warranty", "Running Cost"
    ]
  },
  {
    id: "safety",
    name: "Safety & Security",
    description: "Airbags, braking systems, active driver assistance and NCAP ratings",
    icon: ShieldCheck,
    keys: [
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
      "EURO NCAP Safety Rating", "Front Impact Beams", "Side Impact Beams"
    ]
  },
  {
    id: "interior",
    name: "Interior & Seats",
    description: "Cabin aesthetics, upholstery, seat adjustment and instrument cluster",
    icon: Armchair,
    keys: [
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
      "Dual Tone Dashboard"
    ]
  },
  {
    id: "comfort",
    name: "Comfort & Convenience",
    description: "Climate control, sunroof, power features, keys and wipers",
    icon: Sparkles,
    keys: [
      "Air Conditioner", "Automatic Climate Control", "Rear AC Vents",
      "Air Quality Control", "Heater", "Cooled Glovebox",
      "Sunroof", "Sun Roof", "Roof Carrier",
      "Power Windows", "Anti-Pinch Power Windows",
      "Power Door Locks", "Central Locking",
      "Keyless Entry", "KeyLess Entry", "Smart Access Card Entry", "Smart Key Band", "Digital Car Key",
      "Engine Start/Stop Button",
      "Remote Boot Open", "Hands-Free Tailgate", "Power Boot",
      "Cruise Control", "Adaptive Cruise Control",
      "Rain Sensing Wiper", "Rear Window Wiper", "Rear Window Washer", "Rear Window Defogger",
      "Automatic Headlamps", "Follow Me Home Headlamps",
      "Vanity Mirror", "Luggage Hook & Net", "Accessory Power Outlet",
      "E-Manual"
    ]
  },
  {
    id: "steering",
    name: "Steering & Suspension",
    description: "Steering geometry, brakes, front and rear suspension setups",
    icon: Compass,
    keys: [
      "Power Steering", "Steering Type", "Steering Gear Type", "Steering Column",
      "Adjustable Steering", "Leather Wrapped Steering Wheel",
      "Paddle Shifters",
      "Front Suspension", "Rear Suspension", "Shock Absorbers Type",
      "Front Brake Type", "Rear Brake Type",
      "Turning Radius", "Approach Angle", "Departure Angle", "Break-over Angle"
    ]
  },
  {
    id: "exterior",
    name: "Exterior & Lighting",
    description: "Lighting, body styling, wheels, tyres, mirrors and dimensions",
    icon: Car,
    keys: [
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
      "Front Tread", "Rear Tread"
    ]
  },
  {
    id: "capacity",
    name: "Capacity & Dimensions",
    description: "Weight, passenger capacity, boot space and load limits",
    icon: Scale,
    keys: [
      "Seating Capacity",
      "Boot Space", "Boot Space Rear Seat Folding", "Reported Boot Space",
      "Fuel Tank Capacity", "Petrol Fuel Tank Capacity", "Diesel Fuel Tank Capacity",
      "CNG Fuel Tank Capacity", "Electric Fuel Tank Capacity",
      "Kerb Weight", "Gross Weight",
      "Towing Capacity",
      "Ground Clearance Unladen", "Ground Clearance (Laden)",
      "Front Tread", "Rear Tread"
    ]
  },
  {
    id: "communication",
    name: "Entertainment & Connectivity",
    description: "Infotainment, smartphone pairing, sound system and digital assist",
    icon: Radio,
    keys: [
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
      "Audio System Remote Control"
    ]
  }
];

export function normalizeSpecKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

export function parseSpecValue(raw: any): { 
  display: string; 
  unit?: string; 
  rawValue: any; 
  isBoolean: boolean; 
  isObject: boolean;
} {
  if (raw === null || raw === undefined) {
    return { display: "", rawValue: "", isBoolean: false, isObject: false };
  }
  
  if (typeof raw === "object" && raw !== null && "value" in raw) {
    return {
      display: String(raw.value ?? ""),
      unit: raw.unit || "",
      rawValue: raw,
      isBoolean: typeof raw.value === "boolean",
      isObject: true,
    };
  }

  if (typeof raw === "boolean") {
    return {
      display: raw ? "Yes" : "No",
      rawValue: raw,
      isBoolean: true,
      isObject: false,
    };
  }

  const str = String(raw).trim();
  const lower = str.toLowerCase();
  const isBool = lower === "yes" || lower === "no" || lower === "true" || lower === "false";

  return {
    display: str,
    rawValue: raw,
    isBoolean: isBool,
    isObject: false,
  };
}
