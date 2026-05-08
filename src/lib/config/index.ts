/**
 * Sawari Sadhan Desktop Configuration
 * Orchestrates API endpoints for local development and production environments.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const CONFIG = {
  AGENT: {
    NAME: "Sawari Sadhan Agent",
    API_URL: IS_PRODUCTION 
      ? "https://agent.sawarisadhan.com" 
      : "http://localhost:5125",
    VERSION: "v1",
  },
  LLM: {
    NAME: "Inference Engine",
    API_URL: IS_PRODUCTION
      ? "https://llm.sawarisadhan.com"
      : "http://localhost:5121",
  },
  GRAPH: {
    NAME: "Knowledge Graph",
    API_URL: IS_PRODUCTION
      ? "https://graph.sawarisadhan.com"
      : "http://localhost:5122",
    VERSION: "v1",
  },
  APP: {
    NAME: "Sawari Sadhan Desktop",
    VERSION: "0.1.0-alpha",
  }
};

export const AGENT_API = `${CONFIG.AGENT.API_URL}/${CONFIG.AGENT.VERSION}`;
export const GRAPH_API = `${CONFIG.GRAPH.API_URL}/${CONFIG.GRAPH.VERSION}`;
