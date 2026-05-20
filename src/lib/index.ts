// 1. Auth Module
export { authClient, AccountContext } from "./config";
export {
  consoleLoginAction,
  consoleLogoutAction,
  memberLoginAction,
  memberLogoutAction,
  registerAction
} from "./auth";

// 2. Config Module
export { CONFIG, AGENT_API, GRAPH_API } from "./config";

// 3. Navigation / Route Guard Module
export { middleware as authMiddleware, config as middlewareConfig } from "./navigation/guard";

// 4. Agent V1 SDK
export { default as AgentV1 } from "./v1/agent-weaver";

// 5. Knowledge Graph API Clients & Interfaces
export { publicApi } from "./v1/graph/public";
export type { PublicNode, PublicLink, GraphResponse } from "./v1/graph/public";

export { entityApi } from "./v1/graph/entity";
export type { EntityNode } from "./v1/graph/entity";

export { attributeApi } from "./v1/graph/attribute";
export type { AttributeNode } from "./v1/graph/attribute";

export { edgeApi } from "./v1/graph/edge";
export type { GraphLink, Measurement } from "./v1/graph/edge";
