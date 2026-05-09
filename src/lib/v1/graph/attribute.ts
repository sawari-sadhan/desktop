import { GRAPH_API } from "$lib/config";

/**
 * Attribute API Client
 * Interfaces with the Knowledge Graph technical attributes.
 */

export interface AttributeNode {
  code: string;
  name: string;
  data_types: Record<string, any>;
  node_count: number;
}

export const attributeApi = {
  /**
   * Fetch a single attribute by its unique code
   */
  async getByCode(code: string): Promise<AttributeNode> {
    const response = await fetch(`${GRAPH_API}/types/attribute/${code}`);
    if (!response.ok) throw new Error("Attribute not found in registry");
    return response.json();
  },

  /**
   * List all technical attributes in the registry
   */
  async listAll(): Promise<AttributeNode[]> {
    const response = await fetch(`${GRAPH_API}/types/attributes`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[GraphAPI Error] status: ${response.status}, message:`, errorData);
      throw new Error(`Failed to fetch attributes: ${response.status}`);
    }
    return response.json();
  }
};
