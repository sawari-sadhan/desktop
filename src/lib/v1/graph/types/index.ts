import { GRAPH_API } from "$lib/config";

/**
 * Technical Blueprint API Client
 */

export interface TypeBlueprint {
  code: string;
  name: string;
  blueprint: Record<string, any>;
}

export const typesApi = {
  /**
   * Fetch a technical blueprint by its code (e.g., '2w-ice', '4w-electric')
   */
  async getBlueprint(code: string): Promise<TypeBlueprint> {
    const response = await fetch(`${GRAPH_API}/types/${code}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch blueprint: ${response.status}`);
    }
    return response.json();
  }
};
