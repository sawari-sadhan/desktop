import { GRAPH_API } from "$lib/config";

/**
 * Category Taxonomy API Client
 * Specialized for fetching hierarchical market categories.
 */

export interface CategoryNode {
  id: string;
  slug: string;
  description: Record<string, string>;
  icon: string;
  level: number;
  parent_slug?: string;
  children?: CategoryNode[];
}

export interface CategoryTree {
  categories: CategoryNode[];
}

export const categoryApi = {
  /**
   * Fetch the full nested market taxonomy tree
   */
  async getTree(): Promise<CategoryTree> {
    const response = await fetch(`${GRAPH_API}/types/category`);
    if (!response.ok) throw new Error("Failed to fetch market taxonomy");
    return response.json();
  }
};
