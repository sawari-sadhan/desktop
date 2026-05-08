import { GRAPH_API } from "$lib/config";

/**
 * Public Graph API Client
 * Interfaces with the layered visualization and discovery endpoints.
 */

export interface PublicNode {
  id: string;
  type: string;
  slug: string;
  name: { [key: string]: any };
  description: { [key: string]: any };
  data: { [key: string]: any };
  created_at: string;
}

export interface PublicLink {
  source_id: string;
  target_id: string;
  type: string;
  data: { [key: string]: any };
}

export interface GraphResponse {
  nodes: PublicNode[];
  links: PublicLink[];
}

export const publicApi = {
  /**
   * Fetch the initial layer of the graph (Brands)
   */
  getInitialGraph: async (): Promise<GraphResponse> => {
    const response = await fetch(`${GRAPH_API}/public/graph/initial`);
    if (!response.ok) throw new Error("Failed to fetch initial graph layer");
    return response.json();
  },

  /**
   * Expand a node to reveal its immediate neighbors
   */
  expandNode: async (nodeId: string): Promise<GraphResponse> => {
    const response = await fetch(`${GRAPH_API}/public/graph/node/${nodeId}/expand`);
    if (!response.ok) throw new Error("Failed to expand node");
    return response.json();
  },
};
