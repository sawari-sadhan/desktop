import { AGENT_API } from '$lib/config';
import type { OntologyIndex, OntologyResponse } from './types';

export class OntologyClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${AGENT_API}/ontology`;
  }

  /**
   * Fetch the complete ontology index (Types, Link Rules, Tables)
   */
  async fetchIndex(): Promise<OntologyIndex> {
    const response = await fetch(`${this.baseUrl}/index`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ontology: ${response.statusText}`);
    }

    const result: OntologyResponse<OntologyIndex> = await response.json();
    
    if (result.status === 'error' || !result.data) {
      throw new Error(result.message || 'Unknown error fetching ontology');
    }

    return result.data;
  }

  /**
   * Trigger the Agent to re-sync its brain with the Graph Microservice
   */
  async refresh(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh ontology: ${response.statusText}`);
    }

    const result: OntologyResponse<any> = await response.json();
    return result.status === 'success';
  }
}

// Export singleton instance
export const ontologyClient = new OntologyClient();
