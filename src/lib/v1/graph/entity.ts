import { GRAPH_API } from "$lib/config";

/**
 * Entity API Client
 * Interfaces with the Knowledge Graph technical nodes.
 */

export interface EntityNode {
  id: string;
  type: string;
  slug: string;
  name: Record<string, any>;
  description: Record<string, any>;
  tags: string[];
  metadata: Record<string, any>;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const entityApi = {
  /**
   * Fetch a single entity by its unique slug
   */
  async getBySlug(slug: string): Promise<EntityNode> {
    const response = await fetch(`${GRAPH_API}/entity/${slug}`);
    if (!response.ok) throw new Error("Entity not found in graph");
    return response.json();
  },

  /**
   * List entities by technical type (e.g., 'brand', 'model')
   */
  async listByType(type: string): Promise<EntityNode[]> {
    const response = await fetch(`${GRAPH_API}/entity?type=${type}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[GraphAPI Error] status: ${response.status}, message:`, errorData);
      throw new Error(`Failed to fetch entities: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Specialized helper for fetching all vehicle brands
   */
  async getBrands(): Promise<EntityNode[]> {
    return this.listByType('brand');
  },
  
  /**
   * Create a new entity in the Knowledge Graph
   */
  async create(entity: Partial<EntityNode>): Promise<EntityNode> {
    const response = await fetch(`${GRAPH_API}/entity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create entity: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Update an existing entity in the Knowledge Graph
   */
  async update(id: string, entity: Partial<EntityNode>): Promise<EntityNode> {
    const response = await fetch(`${GRAPH_API}/entity/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    });
    if (!response.ok) throw new Error("Failed to update entity");
    return response.json();
  }
};
