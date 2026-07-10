import { serve } from "bun";
import index from "./index.html";

// ── Health Check API ──────────────────────────────────────────────
// Results are cached in process memory for 24 hours (daily refresh).
// The first request after expiry triggers a fresh check.

const healthCache = new Map<string, { body: object; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h — refresh once per day
const FETCH_TIMEOUT = 8000; // 8 s

async function handleHealthCheck(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return Response.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  try {
    new URL(target);
  } catch {
    return Response.json({ error: "Invalid url" }, { status: 400 });
  }

  const cached = healthCache.get(target);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Response.json(cached.body, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const t0 = performance.now();

  try {
    const res = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "DesignSystems-HealthCheck/1.0" },
    });
    const ms = Math.round(performance.now() - t0);
    const body = {
      status: res.ok ? "online" : "degraded",
      statusCode: res.status,
      responseTime: ms,
      checkedAt: new Date().toISOString(),
    };
    healthCache.set(target, { body, ts: Date.now() });
    return Response.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    const ms = Math.round(performance.now() - t0);
    const body = {
      status: "offline",
      statusCode: 0,
      responseTime: ms,
      checkedAt: new Date().toISOString(),
    };
    healthCache.set(target, { body, ts: Date.now() });
    return Response.json(body, { headers: { "Cache-Control": "public, max-age=86400" } });
  } finally {
    clearTimeout(timer);
  }
}

// ── Server ────────────────────────────────────────────────────────

const server = serve({
  routes: {
    "/api/health": handleHealthCheck,
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
