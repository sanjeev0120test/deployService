import { FastifyInstance, FastifyPluginCallback } from "fastify";
import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

const metricsPlugin: FastifyPluginCallback = (
  fastify: FastifyInstance,
  _opts,
  done
) => {
  fastify.addHook("onResponse", (request, reply, hookDone) => {
    const route = request.routeOptions?.url || request.url;
    if (route === "/metrics") {
      hookDone();
      return;
    }
    const duration = reply.elapsedTime / 1000;
    const labels = {
      method: request.method,
      route,
      status_code: reply.statusCode.toString(),
    };
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    hookDone();
  });

  fastify.get("/metrics", async (_request, reply) => {
    const metrics = await register.metrics();
    reply.header("Content-Type", register.contentType);
    return metrics;
  });

  done();
};

export default metricsPlugin;
