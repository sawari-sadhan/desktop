import KnowledgeGraph from "./components/KG";

export const metadata = {
  title: "Graph Explorer | Sawari Sadhan",
  description: "Interactive visual explorer for the Sawari Sadhan knowledge graph ontology.",
};

export default function GraphPage() {
  return (
    <main className="fixed inset-0 bg-[#121218] overflow-hidden z-[100]">
      <div className="w-full h-full">
        <KnowledgeGraph />
      </div>
    </main>
  );
}
