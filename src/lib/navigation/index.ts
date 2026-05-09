import { 
  LayoutDashboard, 
  Database, 
  Network, 
  Cpu, 
  Terminal,
  Home,
  Info,
  Search,
  Shield
} from "lucide-react";

/**
 * Console Environment Navigation
 * Defines the primary sidebar links for the administrative console.
 */
export const CONSOLE_NAV_ITEMS = [
  { 
    name: "Dashboard", 
    href: "/console", 
    icon: LayoutDashboard,
    description: "System overview and registry metrics"
  },
  { 
    name: "Graph Forge", 
    href: "/console/ingest", 
    icon: Database,
    description: "Ingest new vehicle nodes and relationships"
  },
  { 
    name: "Brands", 
    href: "/console/brands", 
    icon: Shield,
    description: "Vehicle manufacturer registry"
  },
  { 
    name: "Attributes", 
    href: "/console/attribute", 
    icon: Terminal,
    description: "Technical feature registry"
  },
];

/**
 * Public Environment Navigation
 * Defines the links for the public-facing application header.
 */
export const PUBLIC_NAV_ITEMS = [
  { 
    name: "Home", 
    href: "/", 
    icon: Home 
  },
  { 
    name: "Explore Graph", 
    href: "/graph", 
    icon: Search 
  },
  { 
    name: "About", 
    href: "/about", 
    icon: Info 
  },
];
