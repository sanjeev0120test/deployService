import { FastifyInstance, FastifyPluginCallback } from "fastify";

let isReady = false;

export function setReady(ready: boolean): void {
  isReady = ready;
}

const healthRoutes: FastifyPluginCallback = (
  fastify: FastifyInstance,
  _opts,
  done
) => {
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  fastify.get("/ready", async (_request, reply) => {
    if (isReady) {
      return { status: "ready", timestamp: new Date().toISOString() };
    }
    reply.status(503);
    return { status: "not_ready", timestamp: new Date().toISOString() };
  });

  done();
};

export default healthRoutes;
