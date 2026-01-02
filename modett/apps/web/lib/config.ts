const isServer = typeof window === "undefined";

export const config = {
  // Server-side needs absolute URL (internal docker/localhost)
  // Client-side uses relative URL to leverage Next.js Rewrite Proxy (avoids CORS & Mixed Content)
  apiUrl: isServer
    ? process.env.API_URL || "http://localhost:3001/api/v1"
    : "/api/v1",
  apiTimeout: 60000,
} as const;
