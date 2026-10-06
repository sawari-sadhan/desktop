export const DUMMY_AI_RESPONSE = `Based on your query, I've found a few excellent options that fit your criteria perfectly. Electric SUVs in the mid-range segment offer phenomenal value right now. The BYD Atto 3 provides great range and cutting-edge battery technology, while the MG ZS EV gives a very premium interior feel. I've highlighted the top matches below for you to compare.`;

export const DUMMY_REFERENCES = Array.from({ length: 4 }).map((_, i) => ({
  id: `ask-dummy-${i}`,
  name: `BYD Atto ${i + 1} Premium`,
  price: `Rs. ${45 + i},00,000`,
  fuel: "Electric",
  trans: "Automatic",
  image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=400&auto=format&fit=crop",
  url: "#"
}));
