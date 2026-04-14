import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import itemRoutes from "../src/routes/items";
import healthRoutes from "../src/routes/health";

let app: FastifyInstance;

beforeAll(async () => {
  app = Fastify();
  await app.register(healthRoutes);
  await app.register(itemRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Health endpoints", () => {
  it("GET /health returns 200", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("ok");
  });

  it("GET /ready returns 503 when not ready", async () => {
    const res = await app.inject({ method: "GET", url: "/ready" });
    expect(res.statusCode).toBe(503);
  });
});

describe("Items endpoints", () => {
  it("GET /api/items returns seeded items", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.total).toBe(body.data.length);
  });

  it("GET /api/items/:id returns a single item", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items/1" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe("1");
  });

  it("GET /api/items/:id returns 404 for unknown id", async () => {
    const res = await app.inject({ method: "GET", url: "/api/items/999" });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/items creates a new item", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/items",
      payload: { name: "Test Item", description: "Created in test" },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.name).toBe("Test Item");
    expect(body.data.id).toBeDefined();
  });

  it("POST /api/items returns 400 for missing name", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/items",
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });
});
