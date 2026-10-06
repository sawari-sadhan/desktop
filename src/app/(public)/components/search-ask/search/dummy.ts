export const DUMMY_RESULTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `dummy-${i}`,
  name: `BYD Atto ${i + 1} Superior`,
  price: `Rs. ${40 + i},00,000`,
  fuel: "Electric",
  trans: "Automatic",
  image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop",
  url: "#"
}));
