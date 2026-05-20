/**
 * Sawari Sadhan Desktop Configuration
 * Orchestrates API endpoints for local development and production environments.
 */

import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "../gen/auth_connect";

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const CONFIG = {
  AGENT: {
    NAME: "Sawari Sadhan Agent",
    API_URL: process.env.NEXT_PUBLIC_AGENT_API_URL || (IS_PRODUCTION 
      ? "https://agent.sawarisadhan.com" 
      : "http://localhost:5125"),
    VERSION: "v1",
  },
  LLM: {
    NAME: "Inference Engine",
    API_URL: process.env.NEXT_PUBLIC_LLM_API_URL || (IS_PRODUCTION
      ? "https://llm.sawarisadhan.com"
      : "http://localhost:5121"),
  },
  GRAPH: {
    NAME: "Knowledge Graph",
    API_URL: process.env.NEXT_PUBLIC_GRAPH_API_URL || (IS_PRODUCTION
      ? "https://graph.sawarisadhan.com"
      : "http://localhost:5122"),
    VERSION: "v1",
  },
  AUTH: {
    NAME: "Authentication Service",
    API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || (IS_PRODUCTION
      ? "https://auth.sawarisadhan.com"
      : "http://localhost:5101"),
  },
  APP: {
    NAME: "Sawari Sadhan Desktop",
    VERSION: "0.1.0-alpha",
  }
};

export const AGENT_API = `${CONFIG.AGENT.API_URL}/${CONFIG.AGENT.VERSION}`;
export const GRAPH_API = `${CONFIG.GRAPH.API_URL}/${CONFIG.GRAPH.VERSION}`;

const authTransport = createConnectTransport({
  baseUrl: CONFIG.AUTH.API_URL,
});

export const authClient = createPromiseClient(AuthService, authTransport);
export { AccountContext } from "../gen/auth_pb";
