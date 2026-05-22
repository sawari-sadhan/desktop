/**
 * @SawariSadhan-Oracle-Audit
 * Source of Truth: [oracle/config/services.yml]
 * Service: Core
 * Module: Graph & OBD Client
 */

import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { CONFIG } from "../config";
import { GraphService } from "../gen/graph_auto_pb";
import { OBDService } from "../gen/graph_obd_pb";

const coreTransport = createConnectTransport({
  baseUrl: CONFIG.CORE.API_URL,
});

export const graphClient = createClient(GraphService, coreTransport);
export const obdClient = createClient(OBDService, coreTransport);

export interface EntityNode {
  id: string;
  type: string;
  slug: string;
  name: Record<string, any>;
  description: Record<string, any>;
  tags: string[];
  metadata: Record<string, any>;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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
} from "../gen/graph_auto_pb";

export type {
  GetObdCodeRequest,
  GetObdCodeResponse,
  SearchObdCodesRequest,
  SearchObdCodesResponse,
} from "../gen/graph_obd_pb";
