import { useEffect, useRef, useState } from "react";

type Locale = "zh" | "en";
type HealthStatus = "idle" | "checking" | "online" | "degraded" | "offline";

interface HealthResult {
  status: HealthStatus;
  statusCode?: number;
  responseTime?: number;
}

// ── Cache (24 h TTL — daily refresh, mirrors server-side) ────────

const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map<string, { result: HealthResult; ts: number }>();

// ── Concurrency limiter (max 3 parallel checks) ──────────────────

const MAX_CONCURRENT = 3;
let active = 0;
const waitQueue: Array<() => void> = [];

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waitQueue.push(resolve));
}

function release() {
  active--;
  const next = waitQueue.shift();
  if (next) {
    active++;
    next();
  }
}

// ── Core check logic ─────────────────────────────────────────────

const FETCH_TIMEOUT = 8000;

async function checkViaApi(url: string): Promise<HealthResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const t0 = performance.now();

  try {
    const res = await fetch(`/api/health?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return {
      status: data.status as HealthStatus,
      statusCode: data.statusCode,
      responseTime: data.responseTime ?? Math.round(performance.now() - t0),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkViaNoCors(url: string): Promise<HealthResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const t0 = performance.now();

  try {
    await fetch(url, {
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return {
      status: "online",
      responseTime: Math.round(performance.now() - t0),
    };
  } catch {
    return {
      status: "offline",
      responseTime: Math.round(performance.now() - t0),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url: string): Promise<HealthResult> {
  // Return cached if fresh
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.result;
  }

  let result: HealthResult;

  // Try server-side API first (more accurate), fall back to client-side no-cors
  try {
    result = await checkViaApi(url);
  } catch {
    result = await checkViaNoCors(url);
  }

  cache.set(url, { result, ts: Date.now() });
  return result;
}

// ── Visual config ────────────────────────────────────────────────

const statusConfig: Record<
  Locale,
  Record<HealthStatus, { dot: string; text: string; label: string }>
> = {
  zh: {
    idle: { dot: "bg-gray-300", text: "text-gray-400", label: "待检测" },
    checking: { dot: "bg-gray-300 animate-pulse", text: "text-gray-400", label: "检测中…" },
    online: { dot: "bg-green-500", text: "text-green-600", label: "在线" },
    degraded: { dot: "bg-yellow-500", text: "text-yellow-600", label: "异常" },
    offline: { dot: "bg-red-500", text: "text-red-500", label: "离线" },
  },
  en: {
    idle: { dot: "bg-gray-300", text: "text-gray-400", label: "Pending" },
    checking: { dot: "bg-gray-300 animate-pulse", text: "text-gray-400", label: "Checking…" },
    online: { dot: "bg-green-500", text: "text-green-600", label: "Online" },
    degraded: { dot: "bg-yellow-500", text: "text-yellow-600", label: "Degraded" },
    offline: { dot: "bg-red-500", text: "text-red-500", label: "Offline" },
  },
};

// ── Component ────────────────────────────────────────────────────

export function HealthBadge({ url, locale }: { url: string; locale: Locale }) {
  const cachedResult = cache.get(url)?.result;

  const [status, setStatus] = useState<HealthStatus>(cachedResult?.status ?? "idle");
  const [responseTime, setResponseTime] = useState<number | undefined>(
    cachedResult?.responseTime,
  );
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Lazy trigger via IntersectionObserver
  useEffect(() => {
    if (triggered) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  // Run health check when visible
  useEffect(() => {
    if (!triggered) return;

    let cancelled = false;

    (async () => {
      await acquire();
      if (cancelled) {
        release();
        return;
      }

      setStatus("checking");

      try {
        const result = await checkUrl(url);
        if (cancelled) return;
        setStatus(result.status);
        setResponseTime(result.responseTime);
      } catch {
        if (!cancelled) {
          setStatus("offline");
        }
      } finally {
        release();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [triggered, url]);

  const cfg = statusConfig[locale][status];
  const showTime =
    responseTime !== undefined && status !== "idle" && status !== "checking";

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
      {showTime && (
        <span className="text-xs text-gray-400">{responseTime}ms</span>
      )}
    </div>
  );
}
