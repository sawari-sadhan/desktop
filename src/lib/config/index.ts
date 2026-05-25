/**
 * Sawari Sadhan Desktop Configuration
 * Orchestrates API endpoints for local development and production environments.
 */

import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "../gen/auth_pb";

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const CONFIG = {
  AUTH: {
    NAME: "Authentication Service",
    API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || (IS_PRODUCTION
      ? "https://auth.sawarisadhan.com"
      : "http://localhost:5101"),
  },
  CORE: {
    NAME: "Core Service",
    API_URL: process.env.NEXT_PUBLIC_CORE_API_URL || (IS_PRODUCTION
      ? "https://core.sawarisadhan.com"
      : "http://localhost:5102"),
  },
  MEDIA: {
    NAME: "Media Service",
    API_URL: process.env.NEXT_PUBLIC_MEDIA_API_URL || (IS_PRODUCTION
      ? "https://media.sawarisadhan.com"
      : "http://localhost:5100"),
  },
  APP: {
    NAME: "Sawari Sadhan Desktop",
    VERSION: "0.1.0-alpha",
  }
};

const authTransport = createConnectTransport({
  baseUrl: CONFIG.AUTH.API_URL,
});

export const authClient = createClient(AuthService, authTransport);
export { AccountContext } from "../gen/auth_pb";
