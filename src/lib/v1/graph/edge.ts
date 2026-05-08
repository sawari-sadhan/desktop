import { GRAPH_API } from "$lib/config";

/**
 * Edge API Client
 * Interfaces with the Graph Connectivity and Performance Engine.
 */

export interface GraphLink {
  source_id: string;
  target_id: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

export interface Measurement {
  entity_id: string;
  key: string;
  value: number;
  unit: string;
}

export const edgeApi = {
  /**
   * Fetch all outgoing links for a specific node
   */
  async getLinks(entityId: string): Promise<GraphLink[]> {
    const response = await fetch(`${GRAPH_API}/edge/links/${entityId}`);
    if (!response.ok) throw new Error("Failed to fetch graph links");
    return response.json();
  },

  /**
   * Create a new graph relationship between two nodes
   */
  async createLink(link: Partial<GraphLink>): Promise<void> {
    const response = await fetch(`${GRAPH_API}/edge/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to establish link: ${response.status}`);
    }
  },

  /**
   * Fetch technical performance metrics (e.g., price, battery_kwh) for a node
   */
  async getMeasurements(entityId: string): Promise<Measurement[]> {
    const response = await fetch(`${GRAPH_API}/edge/measurements/${entityId}`);
    if (!response.ok) throw new Error("Failed to fetch technical measurements");
    return response.json();
  }
};
