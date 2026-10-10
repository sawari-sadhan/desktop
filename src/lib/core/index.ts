/**
 * @SawariSadhan-Oracle-Audit
 * Source of Truth: [oracle/config/services.yml]
 * Service: Core
 * Module: Graph & OBD Client
 */

import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CONFIG } from "../config";
import { AutoService } from "../gen/graph_auto_pb";
import { OBDService } from "../gen/graph_obd_pb";
import { FocusService } from "../gen/focus_pb";

const coreTransport = createConnectTransport({
  baseUrl: CONFIG.CORE.API_URL,
});

export const graphClient = createClient(AutoService, coreTransport);
export const obdClient = createClient(OBDService, coreTransport);
export const focusClient = createClient(FocusService, coreTransport);

export interface EntityNode {
  id: string;
  type: string;
  slug: string;
  name: Record<string, any>;
  description: Record<string, any>;
  tags: string[];
  metadata: Record<string, any>;
  data: Record<string, any>;
  media?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface TypeBlueprint {
  code: string;
  name: string;
  blueprint: Record<string, any>;
  metadata: Record<string, any>;
}


// Re-export request/response types for convenience
export type {
  GetNodeRequest,
  GetNodeResponse,
  CreateNodeRequest,
  CreateNodeResponse,
  UpdateNodeRequest,
  UpdateNodeResponse,
  DeleteNodeRequest,
  DeleteNodeResponse,
  GetNodeTypeRequest,
  GetNodeTypeResponse,
  CreateNodeTypeRequest,
  CreateNodeTypeResponse,
  AddLinkRequest,
  AddLinkResponse,
  RemoveLinkRequest,
  RemoveLinkResponse,
  GetNeighborsRequest,
  GetNeighborsResponse,
  SearchNodesRequest,
  SearchNodesResponse,
  ListNodeTypesRequest,
  ListNodeTypesResponse,
  NodeType,
  Node,
  Link,
  BrandProfile,
} from "../gen/graph_auto_pb";

export type {
  GetObdCodeRequest,
  GetObdCodeResponse,
  SearchObdCodesRequest,
  SearchObdCodesResponse,
} from "../gen/graph_obd_pb";

export type {
  GetHighlightRequest,
  GetHighlightResponse,
  ListHighlightsRequest,
  ListHighlightsResponse,
  SaveHighlightRequest,
  SaveHighlightResponse,
  DeleteHighlightRequest,
  DeleteHighlightResponse,
  Highlight
} from "../gen/focus_pb";
