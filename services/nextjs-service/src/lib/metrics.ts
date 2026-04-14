import client from "prom-client";

const globalForMetrics = globalThis as unknown as {
  _metricsRegistry?: client.Registry;
};

function getRegistry(): client.Registry {
  if (!globalForMetrics._metricsRegistry) {
    const register = new client.Registry();
    client.collectDefaultMetrics({ register });
    globalForMetrics._metricsRegistry = register;
  }
  return globalForMetrics._metricsRegistry;
}

export const register = getRegistry();

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});
