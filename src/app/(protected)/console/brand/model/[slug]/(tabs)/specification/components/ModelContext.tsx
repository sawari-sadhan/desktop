"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams } from "next/navigation";
import { graphClient, EntityNode } from "@lib/core";
import { toJson } from "@bufbuild/protobuf";
import { ListValueSchema } from "@bufbuild/protobuf/wkt";

interface ModelContextType {
  model: EntityNode | null;
  setModel: React.Dispatch<React.SetStateAction<EntityNode | null>>;
  brand: EntityNode | null;
  variants: EntityNode[];
  isLoading: boolean;
  isUpdating: boolean;
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  loadData: () => Promise<void>;
  slug: string;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;

  const [model, setModel] = useState<EntityNode | null>(null);
  const [brand, setBrand] = useState<EntityNode | null>(null);
  const [variants, setVariants] = useState<EntityNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    console.log("ModelContext -> loadData called with slug:", slug, "All params:", params);
    if (!slug) return;
    setIsLoading(true);
    try {
      const modelRes = await graphClient.getNode({ id: "", slug: slug });
      console.log("ModelContext -> getNode response:", modelRes);
      if (!modelRes.node) {
        console.error(`Model not found for slug: ${slug}`);
        setIsLoading(false);
        return;
      }

      const mappedModel: EntityNode = {
        id: modelRes.node.id,
        type: modelRes.node.type,
        slug: modelRes.node.slug,
        name: modelRes.node.name || {},
        description: modelRes.node.description || {},
        tags: modelRes.node.tags || [],
        metadata: modelRes.node.metadata || {},
        data: modelRes.node.data || {},
        media: modelRes.node.media ? (toJson(ListValueSchema, modelRes.node.media) as any[]) : [],
        created_at: "",
        updated_at: modelRes.node.updatedAt
      };
      setModel(mappedModel);

      const brandNeighbors = await graphClient.getNeighbors({
        nodeId: modelRes.node.id,
        linkTypes: ["has_model"]
      });
      const brandNode = (brandNeighbors.nodes || []).find(n => n.type === "brand");
      if (brandNode) {
        setBrand({
          id: brandNode.id,
          type: brandNode.type,
          slug: brandNode.slug,
          name: brandNode.name || {},
          description: brandNode.description || {},
          tags: brandNode.tags || [],
          metadata: brandNode.metadata || {},
          data: brandNode.data || {},
          media: brandNode.media ? (toJson(ListValueSchema, brandNode.media) as any[]) : [],
          created_at: "",
          updated_at: brandNode.updatedAt
        });
      }

      const variantNeighbors = await graphClient.getNeighbors({
        nodeId: modelRes.node.id,
        linkTypes: ["has_variant"]
      });
      const mappedVariants: EntityNode[] = (variantNeighbors.nodes || [])
        .filter(n => n.type === "variant")
        .map(n => ({
          id: n.id,
          type: n.type,
          slug: n.slug,
          name: n.name || {},
          description: n.description || {},
          tags: n.tags || [],
          metadata: n.metadata || {},
          data: n.data || {},
          media: n.media ? (toJson(ListValueSchema, n.media) as any[]) : [],
          created_at: "",
          updated_at: n.updatedAt
        }));
      setVariants(mappedVariants);
    } catch (err) {
      console.error("Failed to load model details for slug:", slug, err);
      // Debug helper
      graphClient.searchNodes({ query: "", types: ["model"], limit: 50, vector: [] })
        .then(res => {
          console.log("Available models in DB:", (res.nodes || []).map(n => n.slug));
        })
        .catch(e => console.error("Debug search failed:", e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  return (
    <ModelContext.Provider value={{ model, setModel, brand, variants, isLoading, isUpdating, setIsUpdating, loadData, slug }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModelContext() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
}
