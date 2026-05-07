import { AGENT_API } from '@/lib/config';

/**
 * Agent V1 SDK
 * Provides a structured interface to interact with the Agent microservice.
 * Paths are mapped to match the Backend Route Group: /v1/agent-weaver
 */
export const AgentV1 = {
  // Director / Orchestrator — main entry point for all user messages.
  // Routes through: intent detection → KG stats fetch → LLM reasoning.
  director: {
    message: async (message: string, sessionId?: string) => {
      // Endpoint: POST /v1/agent-weaver/message
      const res = await fetch(`${AGENT_API}/agent-weaver/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<{ reply: string; thought_process?: string[]; status: string }>;
    }
  },

  // Thinker — direct LLM access, bypasses RAG/Director pipeline.
  thinker: {
    query: async (prompt: string) => {
      // Endpoint: POST /v1/agent-weaver/think
      const res = await fetch(`${AGENT_API}/agent-weaver/think`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<{ content: string }>;
    }
  },

  // Guard & Safety
  guard: {
    check: async (input: string) => {
      const res = await fetch(`${AGENT_API}/agent-weaver/guard/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      return res.json();
    }
  },

  // Driver status
  driver: {
    status: async () => {
      const res = await fetch(`${AGENT_API}/agent-weaver/driver/status`);
      return res.json();
    }
  },

  // System Metrics
  metrics: {
    all: async () => {
      const res = await fetch(`${AGENT_API}/metrics`);
      return res.json();
    }
  },

  // Ingest — Handles data population, updates, and two-phase confirmation flows.
  ingest: {
    process: async (text: string, confirmed: boolean = false, data?: any) => {
      // Endpoint: POST /v1/ingest/process
      const res = await fetch(`${AGENT_API}/ingest/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, confirmed, data }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<{ status: string; message: string; data?: any }>;
    }
  },

  // Monitoring
  observer: {
    logs: async () => {
      const res = await fetch(`${AGENT_API}/observer/logs`);
      return res.json();
    }
  }
};

export default AgentV1;
